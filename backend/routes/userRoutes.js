import express from 'express';
import { register, login} from '../controllers/authController.js';
import { updateUserName, updateNotificationPreference, getNotificationPreference}  from '../controllers/userController.js';
import { verifyToken, getUserData } from '../controllers/sessionController.js';

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getUserData);

// Update user's name
router.put('/update-name', verifyToken, updateUserName);
router.get('/health', (req, res) => {
    res.status(200).json({ message: 'Backend is running' });
  });

// Notifications
router.put('/notifications', verifyToken, updateNotificationPreference);
router.get('/notifications', verifyToken, getNotificationPreference);


export default router;
