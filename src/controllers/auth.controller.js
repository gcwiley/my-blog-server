import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// REGISTER NEW USER
export const registerNewUser = async (req, res) => {
  // extract email alongside username and password
  const { username, email, password } = req.body;

  // basic input validation
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Username, email, and password are required.' });
  }

  try {
    // checks if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // pass email to the creation method
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      success: true,
      message: 'User account created successfully.',
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('Error registering new user:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering new user.',
      error: error.message,
    });
  }
};

// SIGN IN USER
export const signInUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.scope('withPassword').findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({
      success: false,
      message: 'Error signing in.',
      error: error.message,
    });
  }
};

// SIGN OUT USER
export const signOutUser = (_req, res) => {
  // JWT is stateless — client discards the token
  // If you add a token blocklist later, handle it here
  res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
};