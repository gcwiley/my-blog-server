import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import admin from 'firebase-admin';
import express from 'express';
import logger from 'morgan';

// import database connection and helper
import { sequelize, connectToDatabase } from './db/connect_to_sqldb.js';

// import models ( ensure they are registered with sequelize)
// import index.js to load models AND their associations
import './models/index.js';

// import the routers
import { postRouter } from './routes/post.js';

// import the credentials
import {} from '../credentials/service-account.js';

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000;
const angularDistPath = path.join(__dirname, './dist/my-blog-client/browser');

// --- FIREBASE INIT ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`,
});

const bucket = admin.storage().bucket();

// --- EXPRESS SETUP
const app = express();

const post = process.env.PORT || 3000;

// allow static files to angular client-side folder
const clientDistPath = path.join(__dirname, './dist/my-blog-client/browser');
app.use(express.static(clientDistPath));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

// --- ROUTES ---
app.use('/api/posts', postRouter);

// --- STATIC FILES ---
app.get('*', (req, res) => {
  res.sendFile(path.resolve(clientDistPath, 'index.html'));
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

    // 2. sync models (create tables if missing)
    // note: in production, use Migrations instead of sync()
    await sequelize.sync({ alter: true });
    console.log(chalk.green('Database models synced successfully.'));

    // 3. start listening
    const server = app.listen(port, () => {
      console.log(chalk.blueBright(`\n Server running on port ${port}\n`));
    });

    // 4. graceful shutdown
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('Gracefully shutting down...'));
      await sequelize.close();
      server.close(() => {
        console.log(chalk.green('Server closed'));
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(chalk.red('Failed to start server:', error));
    process.exit(1);
  }
};

startServer();
