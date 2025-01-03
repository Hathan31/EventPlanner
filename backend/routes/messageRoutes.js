import express from 'express';
import { verifyToken } from '../controllers/sessionController.js';
import { saveMessage, getMessages } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', verifyToken, saveMessage);
router.get('/:eventId/messages', verifyToken, getMessages);

export default router;
