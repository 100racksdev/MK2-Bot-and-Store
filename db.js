const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[DATABASE] Connected to MongoDB successfully.');
  } catch (err) {
    console.error('[DATABASE] Failed to connect to MongoDB:');
    console.error(err.message);
    process.exit(1); // stop the bot rather than run with a broken DB connection
  }
}

module.exports = { connectDB };
