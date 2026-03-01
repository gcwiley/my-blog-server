import { DataTypes } from 'sequelize';
import { sequelize } from '../db/connect_to_sqldb.js';

const User = sequelize.define(
  'User',
  {
    // ✅ UUID consistent with post.model.js
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    // ✅ modern pattern — excludes password from all queries by default
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    // ✅ unscoped() available when password IS needed e.g. sign in
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
    indexes: [
      { fields: ['username'] }, // ✅ fast username lookup on sign in
      { fields: ['email'] },    // ✅ fast email lookup on register
    ],
  }
);

export { User };
