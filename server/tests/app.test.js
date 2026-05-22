import assert from 'node:assert/strict'
import test from 'node:test'
import mongoose from 'mongoose'
import request from 'supertest'

process.env.NODE_ENV = 'test'
process.env.MONGO_URI ||= 'mongodb://localhost:27017/secure-task-manager-test'
process.env.ACCESS_TOKEN_SECRET ||= 'a'.repeat(32)
process.env.REFRESH_TOKEN_SECRET ||= 'b'.repeat(32)

const { default: app } = await import('../src/app.js')
const { listTasksForUser } = await import('../src/services/taskService.js')
const { updateTaskSchema } = await import('../src/validators/taskValidators.js')
const { TASK_STATUSES, Task } = await import('../src/models/Task.js')
const { USER_ROLES, User } = await import('../src/models/User.js')

test('GET /api/health returns the standard success envelope', async () => {
  const response = await request(app).get('/api/health').expect(200)

  assert.equal(response.body.success, true)
  assert.equal(response.body.message, 'API is healthy')
  assert.equal(response.body.data.service, 'secure-task-manager-api')
})

test('GET /api/tasks rejects requests without an access token', async () => {
  const response = await request(app).get('/api/tasks').expect(401)

  assert.equal(response.body.success, false)
  assert.equal(response.body.message, 'Access token is required')
})

test('POST /api/auth/register validates required fields before database work', async () => {
  const response = await request(app).post('/api/auth/register').send({}).expect(400)

  assert.equal(response.body.success, false)
  assert.equal(response.body.message, 'Validation failed')
  assert.ok(response.body.errors.length > 0)
})

test('User save hook hashes passwords without requiring a next callback', async () => {
  const originalReadyState = mongoose.connection.readyState
  const originalInsertOne = User.collection.insertOne

  mongoose.connection.readyState = 1
  User.collection.insertOne = async (doc) => ({
    acknowledged: true,
    insertedId: doc._id,
  })

  const user = new User({
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
  })

  try {
    await user.save()

    assert.notEqual(user.password, 'password123')
    assert.equal(await user.comparePassword('password123'), true)
  } finally {
    User.collection.insertOne = originalInsertOne
    mongoose.connection.readyState = originalReadyState
  }
})

test('Task text search disables sanitizeFilter only for the trusted server-built query', async () => {
  const originalFind = Task.find
  const originalCountDocuments = Task.countDocuments
  const userId = new mongoose.Types.ObjectId()
  const query = {
    limit: 10,
    page: 1,
    search: 'complete',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }
  const user = {
    _id: userId,
    id: userId.toString(),
    role: USER_ROLES.MEMBER,
  }
  let findFilter
  let findProjection
  let findOptions
  let countFilter
  let countOptions

  const findQuery = {
    lean() {
      return Promise.resolve([])
    },
    limit() {
      return this
    },
    populate() {
      return this
    },
    setOptions(options) {
      findOptions = options
      return this
    },
    skip() {
      return this
    },
    sort() {
      return this
    },
  }
  const countQuery = {
    setOptions(options) {
      countOptions = options
      return this
    },
    then(resolve, reject) {
      return Promise.resolve(0).then(resolve, reject)
    },
  }

  Task.find = (filter, projection) => {
    findFilter = filter
    findProjection = projection
    return findQuery
  }
  Task.countDocuments = (filter) => {
    countFilter = filter
    return countQuery
  }

  try {
    const result = await listTasksForUser(user, query)

    assert.deepEqual(result.tasks, [])
    assert.deepEqual(findFilter.$text, { $search: 'complete' })
    assert.deepEqual(countFilter.$text, { $search: 'complete' })
    assert.deepEqual(findProjection, { score: { $meta: 'textScore' } })
    assert.equal(findOptions.sanitizeFilter, false)
    assert.equal(countOptions.sanitizeFilter, false)
    assert.deepEqual(findFilter.$or, [{ createdBy: userId }, { assignedTo: userId }])
  } finally {
    Task.find = originalFind
    Task.countDocuments = originalCountDocuments
  }
})

test('Task update validation accepts persisted board position updates', () => {
  const id = new mongoose.Types.ObjectId().toString()
  const result = updateTaskSchema.safeParse({
    body: { position: 1500, status: TASK_STATUSES.TODO },
    params: { id },
  })

  assert.equal(result.success, true)
  assert.equal(result.data.body.position, 1500)
})
