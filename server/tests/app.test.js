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
const { loginUser, rotateRefreshSession } = await import('../src/services/authService.js')
const { updateUserRoleForAdmin } = await import('../src/services/userService.js')
const { seedAdmin } = await import('../scripts/seed-admin.js')
const { updateTaskSchema } = await import('../src/validators/taskValidators.js')
const { TASK_STATUSES, Task } = await import('../src/models/Task.js')
const { USER_ROLES, User } = await import('../src/models/User.js')
const { signRefreshToken } = await import('../src/utils/tokens.js')

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

test('New users default to member role', () => {
  const user = new User({
    name: 'Role Test',
    email: `role-${Date.now()}@example.com`,
    password: 'password123',
  })

  assert.equal(user.role, USER_ROLES.MEMBER)
})

test('Deleted users cannot login', async () => {
  const originalFindOne = User.findOne

  User.findOne = (filter) => {
    assert.deepEqual(filter, {
      deletedAt: null,
      email: 'deleted@example.com',
    })

    return {
      select() {
        return Promise.resolve(null)
      },
    }
  }

  try {
    await assert.rejects(
      () =>
        loginUser(
          {
            email: 'deleted@example.com',
            password: 'password123',
          },
          {},
        ),
      /Invalid email or password/,
    )
  } finally {
    User.findOne = originalFindOne
  }
})

test('Deleted users cannot refresh sessions', async () => {
  const originalFindOne = User.findOne
  const refreshToken = signRefreshToken({
    email: 'deleted@example.com',
    id: new mongoose.Types.ObjectId().toString(),
    role: USER_ROLES.MEMBER,
  })

  User.findOne = (filter) => {
    assert.equal(filter.deletedAt, null)

    return {
      select() {
        return Promise.resolve(null)
      },
    }
  }

  try {
    await assert.rejects(
      () =>
        rotateRefreshSession(refreshToken, {
          get() {
            return ''
          },
          ip: '',
        }),
      /Refresh token is invalid or expired/,
    )
  } finally {
    User.findOne = originalFindOne
  }
})

test('Task list disables sanitizeFilter for trusted server-built filters', async () => {
  const originalFind = Task.find
  const originalCountDocuments = Task.countDocuments
  const originalUserCollectionDistinct = User.collection.distinct
  const userId = new mongoose.Types.ObjectId()
  const deletedUserId = new mongoose.Types.ObjectId()
  const query = {
    limit: 10,
    page: 1,
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
  User.collection.distinct = (field, filter) => {
    assert.equal(field, '_id')
    assert.deepEqual(filter, { deletedAt: { $ne: null } })
    return Promise.resolve([deletedUserId])
  }

  try {
    const result = await listTasksForUser(user, query)

    assert.deepEqual(result.tasks, [])
    assert.equal(findProjection, undefined)
    assert.equal(findOptions.sanitizeFilter, false)
    assert.equal(countOptions.sanitizeFilter, false)
    assert.deepEqual(findFilter.$and, [
      { $or: [{ createdBy: userId }, { assignedTo: userId }] },
      {
        assignedTo: { $nin: [deletedUserId] },
        createdBy: { $nin: [deletedUserId] },
      },
    ])
    assert.deepEqual(countFilter, findFilter)
  } finally {
    Task.find = originalFind
    Task.countDocuments = originalCountDocuments
    User.collection.distinct = originalUserCollectionDistinct
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

test('Admin role service updates an active user role', async () => {
  const originalFindOne = User.findOne
  const targetUser = {
    role: USER_ROLES.MEMBER,
    save: async () => {},
    toJSON() {
      return {
        role: this.role,
      }
    },
  }

  User.findOne = (filter) => {
    assert.equal(filter.deletedAt, null)
    return Promise.resolve(targetUser)
  }

  try {
    const user = await updateUserRoleForAdmin(new mongoose.Types.ObjectId().toString(), USER_ROLES.ADMIN)

    assert.equal(user.role, USER_ROLES.ADMIN)
  } finally {
    User.findOne = originalFindOne
  }
})

test('Admin seed creates a new admin user', async () => {
  let createdInput
  const UserModel = {
    findOne(filter) {
      assert.deepEqual(filter, { email: 'admin@todo.com' })
      return {
        select() {
          return Promise.resolve(null)
        },
      }
    },
    async create(input) {
      createdInput = input
      return {
        toJSON() {
          return {
            email: input.email,
            role: input.role,
          }
        },
      }
    },
  }

  const result = await seedAdmin({
    UserModel,
    email: 'Admin@Todo.com',
    name: 'Admin',
    password: 'adminTodo123',
  })

  assert.equal(result.action, 'created')
  assert.equal(createdInput.email, 'admin@todo.com')
  assert.equal(createdInput.password, 'adminTodo123')
  assert.equal(createdInput.role, USER_ROLES.ADMIN)
})

test('Admin seed promotes and restores an existing user', async () => {
  const existingUser = {
    deletedAt: new Date(),
    email: 'admin@todo.com',
    name: '',
    refreshTokens: [{ tokenHash: 'old' }],
    role: USER_ROLES.MEMBER,
    async save(options) {
      assert.deepEqual(options, { validateBeforeSave: false })
    },
    toJSON() {
      return {
        deletedAt: this.deletedAt,
        email: this.email,
        name: this.name,
        role: this.role,
      }
    },
  }
  const UserModel = {
    findOne() {
      return {
        select() {
          return Promise.resolve(existingUser)
        },
      }
    },
  }

  const result = await seedAdmin({
    UserModel,
    email: 'admin@todo.com',
    name: 'Admin',
  })

  assert.equal(result.action, 'promoted')
  assert.equal(existingUser.deletedAt, null)
  assert.equal(existingUser.name, 'Admin')
  assert.deepEqual(existingUser.refreshTokens, [])
  assert.equal(existingUser.role, USER_ROLES.ADMIN)
})
