import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import passport from './services/passport.js';

import { errorHandler } from './middleware/errorHandler.js';
import setupSocketHandlers from './socket/socketHandlers.js';

// Routes
import authRoutes from './routes/auth.js';
import incidentRoutes from './routes/incidents.js';
import userRoutes from './routes/users.js';
import volunteerRoutes from './routes/volunteers.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';
import notificationRoutes from './routes/notifications.js';
import sosRoutes from './routes/sos.js';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

const io = new Server(httpServer, {
  cors: corsOptions
});

// Pass IO to req for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmet());
app.use(passport.initialize());

// Rate Limiting (Global)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth', globalLimiter);

// Health check route
app.get('/', (req, res) => res.json({ status: 'SafeGuard API is running' }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/volunteers', volunteerRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/sos', sosRoutes);

// Error Handling
app.use(errorHandler);

// Socket.IO
setupSocketHandlers(io);

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} busy. Run: npx kill-port ${PORT}`);
    process.exit(1);
  }
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
