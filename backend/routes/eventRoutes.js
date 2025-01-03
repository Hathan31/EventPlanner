import express from 'express';
import { verifyToken } from '../controllers/sessionController.js';
import {createEvent, 
    getEvents, updateEvent, deleteEvent,
    addParticipants, getParticipants, removeParticipant, 
    uploadImage, deleteImage,
    uploadFile, deleteFile, getMedia} 
    from '../controllers/eventController.js';
import { upload } from '../middlewares/imageUpload.js';
import { uploadFile as uploadMiddleware} from '../middlewares/fileupload.js';

const router = express.Router();

// Events
router.post('/', verifyToken, createEvent); 
router.get('/', verifyToken, getEvents); 
router.put('/:id', verifyToken, updateEvent); 
router.delete('/:id', verifyToken, deleteEvent);

// Participants
router.post('/:eventId/participants', verifyToken, addParticipants);
router.get('/:eventId/participants', verifyToken, getParticipants);
router.delete('/:eventId/participants', verifyToken, removeParticipant);

// Images
router.post('/:eventId/images', verifyToken, upload.single('image'), uploadImage);
router.delete('/:eventId/images', verifyToken, deleteImage);

// Files
router.post('/:eventId/files', verifyToken, uploadMiddleware.single('file'), uploadFile);
router.delete('/:eventId/files', verifyToken, deleteFile);

// Get media
router.get('/:eventId/media', verifyToken, getMedia);

export default router;
