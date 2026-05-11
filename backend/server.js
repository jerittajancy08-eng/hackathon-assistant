const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { config } = require('./config');
const { connectDb } = require('./config/db');
const { seedHackathons } = require('./utils/seedData');
const chatRoute = require('./routes/chat');
const authRoute = require('./routes/auth');
const hackathonRoute = require('./routes/hackathons');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Basic security and JSON parsing middleware
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: config.frontendOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// API routes
app.use('/api/chat', chatRoute);
app.use('/api/auth', authRoute);
app.use('/api/hackathons', hackathonRoute);

// Global error handling middleware
app.use(errorHandler);

async function startServer() {
  try {
    await connectDb();
    await seedHackathons();
    app.listen(config.port, () => {
      console.log(`Hackathon Assistant backend listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
