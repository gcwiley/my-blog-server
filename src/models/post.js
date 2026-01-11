import { DataTypes } from 'sequelize';
import { sequelize } from '../db/connect_to_sqldb.js';

// define the post model
const Post = sequelize.define(
   'Post',
   {
      // id - unique identifier (UUID)
      id: {
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
         primaryKey: true,
      },
      // title of post
      title: {
         type: DataTypes.STRING,
         allowNull: false,
         validate: {
            notEmpty: true,
            len: [5, 255],
         },
      },
      // author of post
      author: {
         type: DataTypes.STRING,
         allowNull: false,
         validate: {
            notEmpty: true,
         },
      },
      // body of post
      body: {
         type: DataTypes.STRING,
         allowNull: false,
         validate: {
            len: [0, 5000],
         },
      },
      // category - for PostgreSQL only
      category: {
         type: DataTypes.ARRAY(DataTypes.STRING), // array
         allowNull: false,
         validate: { notEmpty: true },
      },
      // favorite
      favorite: {
         type: DataTypes.BOOLEAN,
         defaultValue: false, // provide a default value of false
      },
      // tags
      tags: {
         type: DataTypes.ARRAY(DataTypes.STRING), // array
         allowNull: true,
      },
      // excerpt
      excerpt: {
         type: DataTypes.STRING,
         allowNull: true,
         validate: {
            len: [0, 255],
         },
      },
      // date of post
      date: {
         type: DataTypes.DATE,
         allowNull: false, // ensures the date is not null
         defaultValue: DataTypes.NOW, // set the default date to now
         validate: {
            isDate: true, // ensures a valid date is given
         },
      },
   },
   {
      timestamps: true,
      indexes: [
         {
            fields: ['author', 'category'], // adds a composite index on the 'author' column
         },
         {
            fields: ['date'], // index on date for efficient querying by date
         },
         {
            fields: ['favorite'],
         },
         {
            fields: ['tags'],
         },
      ],
   }
);

export { Post };
