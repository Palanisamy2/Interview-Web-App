const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const seed = require('../src/seeders');

describe('Backend API Integration Tests', () => {
  let server;
  let baseUrl;

  before(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    await seed();

    await new Promise(resolve => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  function fetchJson(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const req = http.request(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });
      req.on('error', reject);
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      req.end();
    });
  }

  it('GET /health returns status ok', async () => {
    const res = await fetchJson('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
  });

  it('GET /roles returns list of active roles and stacks', async () => {
    const res = await fetchJson('/roles');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.ok(res.data.length >= 2);
  });

  it('POST /auth/candidate/start creates a candidate session token', async () => {
    const res = await fetchJson('/auth/candidate/start', {
      method: 'POST',
      body: {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        experienceYears: 3.5
      }
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.candidate.email, 'jane.doe@example.com');
  });

  it('POST /auth/admin/login logs in admin user', async () => {
    const res = await fetchJson('/auth/admin/login', {
      method: 'POST',
      body: {
        email: 'admin@skillassessment.com',
        password: 'admin123'
      }
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.user.role, 'ADMIN');
  });
});

