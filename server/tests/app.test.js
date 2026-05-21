import assert from 'node:assert/strict'
import test from 'node:test'
import request from 'supertest'

process.env.NODE_ENV = 'test'
process.env.MONGO_URI ||= 'mongodb://localhost:27017/secure-task-manager-test'
process.env.ACCESS_TOKEN_SECRET ||= 'a'.repeat(32)
process.env.REFRESH_TOKEN_SECRET ||= 'b'.repeat(32)

const { default: app } = await import('../src/app.js')

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
