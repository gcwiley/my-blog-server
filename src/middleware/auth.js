import admin from 'firebase-admin';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // checks for the presence of the 'authorization' header
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // extracts the token
  const idToken = authHeader.split(' ')[1]; // extract the token after

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // attach the decoded user information to the request object
    next(); // proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
