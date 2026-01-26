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
      // title
      title: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      // author
      author: {
         type: DataTypes.STRING,
         allowNull: false,
         validate: {
            notEmpty: true,
         },
      },
      // body
      body: {
         type: DataTypes.TEXT,
         allowNull: false,
      },
      // category 
      category: {
         type: DataTypes.STRING,
         allowNull: false,
         validate: { notEmpty: true },
      },
      // favorite
      favorite: {
         type: DataTypes.BOOLEAN,
         defaultValue: false, // provide a default value of false
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
      ],
   }
);

export { Post };
