const mongoose = require('mongoose');

let localMode = false;

async function connectDB() {
  const uri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

  if (!uri || uri.includes('<user>') || uri.includes('<password>')) {
    console.log('[Shark Event] Notice: MONGO_URI not configured or contains placeholder in server/.env.');
    console.log('[Shark Event] Running in Local Mode with persistence at server/data/local_db.json.');
    localMode = true;
    return;
  }

  try {
    mongoose.connection.on('error', (err) => console.error('[Mongo] connection error:', err));
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Mongo] Connected to MongoDB Atlas successfully.');
    localMode = false;
  } catch (err) {
    console.warn(`[Mongo] Could not connect to MongoDB Atlas (${err.message}).`);
    console.log('[Shark Event] Falling back to Local Mode with persistence at server/data/local_db.json.');
    localMode = true;
  }
}

function isLocalMode() {
  return localMode;
}

module.exports = { connectDB, isLocalMode };

