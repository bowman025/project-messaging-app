import 'dotenv/config';
import { env } from './config/env.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocket } from './config/socket.js';
import { authLimiter, apiLimiter, uploadLimiter } from './config/rateLimiter.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.CLIENT_URL },
});
const PORT = env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: [
        "'self'",
        "https://api.cloudinary.com",
        "wss:",
        "ws:",
        ...(env.NODE_ENV === 'production'
          ? [env.CLIENT_URL]
          : ["http://localhost:5173", "ws://localhost:5173"]
        ),
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https://res.cloudinary.com"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/upload', uploadLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

initSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
