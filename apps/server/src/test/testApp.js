import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/authRoutes.js';
import conversationRoutes from '../routes/conversationRoutes.js';
import userRoutes from '../routes/userRoutes.js';
import { errorHandler } from '../middleware/errorHandler.js';

export const createTestApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.use('/api/auth', authRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/users', userRoutes);

  app.use(errorHandler);

  return app;
};
