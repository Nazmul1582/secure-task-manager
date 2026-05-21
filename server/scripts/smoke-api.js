process.env.NODE_ENV = 'test';
process.env.MONGO_URI ||= 'mongodb://localhost:27017/secure-task-manager-smoke';
process.env.ACCESS_TOKEN_SECRET ||= 'a'.repeat(32);
process.env.REFRESH_TOKEN_SECRET ||= 'b'.repeat(32);

const { default: app } = await import('../src/app.js');

const server = app.listen(0);
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

try {
  await expectJson('GET', '/api/health', 200);
  await expectJson('GET', '/api/tasks', 401);
  await expectJson('POST', '/api/auth/register', 400, {});
  console.log('API smoke checks passed');
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function expectJson(method, path, expectedStatus, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status !== expectedStatus) {
    throw new Error(`${method} ${path} expected ${expectedStatus}, received ${response.status}`);
  }

  const payload = await response.json();

  if (typeof payload.success !== 'boolean') {
    throw new Error(`${method} ${path} did not return the standard API envelope`);
  }
}

