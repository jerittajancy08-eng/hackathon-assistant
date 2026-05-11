const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  port: process.env.PORT || 5000,
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hackathon-assistant',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-change-me',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
};

module.exports = { config };
