import { Router } from 'express';
import { registerNewUser, signInUser, signOutUser } from '../controllers/auth.controller.js';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', registerNewUser);

// POST /api/auth/signin
authRouter.post('/signin', signInUser);

// POST /api/auth/signout
authRouter.post('/signout', signOutUser);