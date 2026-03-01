import { Router } from 'express';

// user controller functions
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from '../controllers/user.controller.js';

// auth middleware
import { authenticateToken } from '../middleware/auth.middleware.js';

export const userRouter = Router();

// all routes below are now protected
userRouter.use(authenticateToken);

// GET    /api/users/profile
userRouter.get('/profile', getUserProfile);

// PATCH  /api/users/profile
userRouter.patch('/profile', updateUserProfile);

// DELETE /api/users/profile
userRouter.delete('/profile', deleteUserProfile);
