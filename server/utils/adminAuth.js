async function verifyAdminPassword(password) {
  return password === process.env.ADMIN_PASSWORD;
}

module.exports = { verifyAdminPassword };
