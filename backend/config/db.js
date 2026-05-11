const mongoose = require('mongoose');
const { config } = require('./index');

async function connectDb() {
  if (!config.mongoUri) {
    throw new Error('MONGO_URI is required in backend/.env to connect to the database.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('MongoDB connected');
}

module.exports = { connectDb };
