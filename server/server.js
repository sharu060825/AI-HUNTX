const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const registerRoutes = require('./routes/register');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/register', registerRoutes);
app.use('/api/admin', adminRoutes);

// Serve the static site (index.html, admin.html, assets/) from the project root.
app.use(express.static(path.join(__dirname, '..')));

// JSON parse error handler — return JSON instead of Express default HTML error page
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  return next(err);
});

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[Shark Event] Server listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('[Shark Event] Failed to connect to MongoDB:', err);
    process.exit(1);
  });
