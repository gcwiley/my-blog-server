import jwt from 'jsonwebtoken';

// throw an error if the JWT_SECRET is missing to prevent insecure defaults in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

export const authenticateToken = (req, res, next) => {
  // reg.get() is the express-preferred way to read headers case-insensitively
  const authHeader = req.get('Authorization');

  // ensure the header exists and explicitly starts with 'Bearer '
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (error, user) => {
    if (error) {
      // differentiate between expired and invalid tokens
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired.' }); // often 401 triggers a client refresh
      }
      return res.status(403).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  });
};
