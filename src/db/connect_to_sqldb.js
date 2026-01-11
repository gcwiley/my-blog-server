import path from 'path';
import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

// load the environmental variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const isProduction = process.env.NODE_ENV === 'production';

// configuration variables
const database = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

// checks for presence of required environment variables
if (!database || !username || !password || !host) {
  throw new Error(
    'Missing one or more required environment variables for database connection.'
  );
}

// ssl configuration: Google cloud SQL usually requires this in production
const dialectOptions = isProduction ? {
  ssl: {
    require: true,
    rejectUnauthorized: false, // often needed for self-signed cloud certs
  },
} : {
  ssl: false
};

// create the sequelize instance
const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: 'postgres',
  dialectOptions: dialectOptions,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // log sql queries in development, silent in production
  logging: isProduction ? false : (msg) => console.log(chalk.gray(msg))
});

// export a function to connect, rather than connecting immediately
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(chalk.magentaBright('\n', `Connection to PostgreSQL database '${database}' established successfully.`, '\n'));
  } catch (error) {
    console.error(chalk.red('\n', `Unable to connect to the database: ${error.message}`, '\n'));
    // exit process on DB failure, as the app cannot function without it
    process.exit(1);
  }
};

// export the sequelize instance AND the connection function
export { sequelize, connectToDatabase };