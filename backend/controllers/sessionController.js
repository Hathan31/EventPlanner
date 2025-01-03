import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  
    try {
      const decoded = jwt.verify(token, 'secret'); 
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Invalid token:', error);
      res.status(400).json({ error: 'Invalid token.' });
    }
  };
  
export const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
