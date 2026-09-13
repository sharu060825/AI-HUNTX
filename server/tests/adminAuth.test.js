const test = require('node:test');
const assert = require('node:assert/strict');
const { verifyAdminPassword } = require('../utils/adminAuth');

test('accepts the plain ADMIN_PASSWORD value', async () => {
  const previousPassword = process.env.ADMIN_PASSWORD;
  process.env.ADMIN_PASSWORD = 'new-secret';

  try {
    assert.equal(await verifyAdminPassword('new-secret'), true);
    assert.equal(await verifyAdminPassword('wrong-secret'), false);
  } finally {
    if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = previousPassword;
  }
});
