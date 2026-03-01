import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import express from 'express';
import logger from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { sequelize, connectToDatabase } from './db/connect_to_sqldb.js';

// explicit model imports guarantee associations load
import './models/index.js';

// IMPORT ROUTERS
import { postRouter } from './routes/post.routes.js';
import { userRouter } from './routes/user.routes.js';
import { authRouter } from './routes/auth.routes.js';

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';
const angularDistPath = path.join(
  __dirname,
  '../../dist/my-blog-client/browser',
);

// --- EXPRESS SETUP ---
const app = express();
app.set('trust proxy', 1);

// --- HELMET SETUP ---
app.use(
  helmet({
    // ✅ configure CSP rather than disable it
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  }),
);

// --- CORS SETUP ---
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(angularDistPath));

// --- API RATE LIMITING ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

// ✅ stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many auth attempts, please try again after 15 minutes.',
});

// apply the rate limiting middleware to API calls
app.use('/api', apiLimiter);

// --- ROUTES ---
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/posts', postRouter);
app.use('/api/users', userRouter);

app.get('{*splat}', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

// global error handler - express requires 4 args for error handlers
app.use((error, req, res, next) => {
  console.error(chalk.red('Server Error:', error.stack));
  // ensure we don't try to send a response if one was already sent
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(500)
    .json({ error: 'Internal Server Error', message: error.message });
});

// --- STARTUP SEQUENCE ---
const startServer = async () => {
  try {
    // 1. establish DB connection
    await connectToDatabase();

    // 2. sync models (create tables if missing) - ONLY IN DEVELOPMENT
    // note: in production, use Migrations instead of sync()
    await sequelize.sync({ force: true });
    console.log(chalk.green('Database models synced successfully.'));

    // 3. start listening
    const server = app.listen(port, () => {
      console.log(chalk.blueBright(`\nServer running on port ${port}\n`));
    });

    // 4. graceful shutdown — handle both SIGINT and SIGTERM
    const shutdown = async (signal) => {
      console.log(
        chalk.yellow(`${signal} received. Gracefully shutting down...`),
      );
      await sequelize.close();
      server.close(() => {
        console.log(chalk.green('Server closed.'));
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT')); // ✅ ctrl+c
    process.on('SIGTERM', () => shutdown('SIGTERM')); // ✅ cloud platform shutdown
  } catch (error) {
    console.error(chalk.red('Failed to start server:', error));
    process.exit(1);
  }
};

startServer();
