import Event from '../models/Event.js';
import User from '../models/User.js'
import path from 'path';
import fs from 'fs';

export const createEvent = async (req, res) => {
  const { title, description, start_date, end_date } = req.body;

  try {
    const event = new Event({
      title,
      description,
      start_date,
      end_date,
      user: req.user.id,
      participants: [],
      images: [],
      files: []
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { user: req.user.id }, 
        { participants: req.user.id }, 
      ],
    })
      .populate('user', 'name email')
      .populate('participants', 'name email'); 
  
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
      
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, start_date, end_date } = req.body;

  try {
    const event = await Event.findById(id);

    if (!event || event.user.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.start_date = start_date || event.start_date;
    event.end_date = end_date || event.end_date;

    await event.save();
    res.status(200).json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);

    if (!event || event.user.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }
    await event.deleteOne();
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addParticipants = async (req, res) => {
  try {
    const { emails } = req.body;
    const eventId = req.params.eventId; 
  
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }
  
    const event = await Event.findById(eventId);
  
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
  
    if (req.user.id !== event.user.toString()) {
      return res.status(403).json({ error: 'Only the event creator can add participants' });
    }
  
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'No valid participants provided' });
    }
  
    const users = await User.find({ email: { $in: emails } });
  
    if (users.length === 0) {
      return res.status(400).json({ error: 'No users found with the provided emails' });
    }
  
    const userIds = users.map((user) => user._id.toString());
  
    const newParticipants = userIds.filter((id) => !event.participants.includes(id));
  
    if (newParticipants.length === 0) {
      return res.status(400).json({ error: 'All provided users are already participants' });
    }
  
    event.participants.push(...newParticipants);
    await event.save();
  
    res.status(200).json({
    message: 'Participants added successfully',
    participants: event.participants,
    });
  } catch (error) {
    console.error('Error adding participants:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
  
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }
  
    const event = await Event.findById(eventId)
      .populate('user', 'name email') 
      .populate('participants', 'name email');
  
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
  
    res.status(200).json({
      owner: {
        id: event.user._id,
        name: event.user.name,
        email: event.user.email,
      },
      participants: event.participants.map((participant) => ({
        id: participant._id,
        name: participant.name,
        email: participant.email,
      })),
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
  
export const removeParticipant = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { participantEmail } = req.body; 

    const event = await Event.findById(eventId).populate('participants', 'email');
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
  
    if (event.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the event owner can remove participants' });
    }
  
    const participantToRemove = event.participants.find(
      (participant) => participant.email === participantEmail
    );
    if (!participantToRemove) {
      return res.status(404).json({ error: 'Participant not found in this event' });
    }
  
    event.participants = event.participants.filter(
      (participant) => participant.email !== participantEmail
    );
    await event.save();
  
    res.status(200).json({
      message: 'Participant removed successfully',
      participants: event.participants,
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
  
export const uploadImage = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    const imagePath = `/uploads/images/${req.file.filename}`;
      
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
  
    event.images.push(imagePath);
    await event.save();
  
    res.status(200).json({
      message: 'Image uploaded successfully',
      images: event.images,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { imagePath } = req.body;
  
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
  
    const imageIndex = event.images.indexOf(imagePath);
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found in this event' });
    }
  
    event.images.splice(imageIndex, 1);
    await event.save();
  
    const fullImagePath = path.join(process.cwd(), imagePath);
    fs.unlink(fullImagePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
  
    res.status(200).json({
      message: 'Image deleted successfully',
      images: event.images,
    });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ error: 'Server error' });
    }
};

export const uploadFile = async (req, res) => {
  try {

    const { eventId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = `/uploads/files/${req.file.filename}`;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.files.push(filePath);
    await event.save();

    res.status(200).json({
      message: 'File uploaded successfully',
      files: event.files,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { filePath } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const fileIndex = event.files.indexOf(filePath);
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found in this event' });
    }

    event.files.splice(fileIndex, 1);
    await event.save();

    const fullFilePath = path.join(process.cwd(), filePath);
    fs.unlink(fullFilePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.status(200).json({
      message: 'File deleted successfully',
      files: event.files,
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMedia = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const images = event.images.map(imagePath => {
      return `${req.protocol}://${req.get('host')}${imagePath}`;
    });

    res.status(200).json({
      images,
      files: event.files,
    });
  } catch (error) {const onFormSubmit = async (data) => {
  if (!user?.id) {
    Alert.alert('Error', 'User is not logged in.');
    return;
  }

  try {
    if (!data.title || !startDate || !endDate) {
      Alert.alert('Error', 'Title, start date, and end date are required.');
      return;
    }
    const eventData = {
      title: data.title.trim(), 
      description: data.description || '',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      user_id: user.id,
    };

    await insertEvent(eventData);

    Alert.alert('Success', `Event "${data.title}" created successfully!`);
    if (onEventCreated) onEventCreated();
    reset();
  } catch (error) {
    console.error('Error creating event:', error);
    Alert.alert('Error', 'Could not create event. Please try again.');
  }
};
        console.error('Error fetching media:', error);
        res.status(500).json({ error: 'Server error' });
    }
};