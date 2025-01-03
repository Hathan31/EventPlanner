import Message from '../models/Message.js';

export const saveMessage = async (req, res) => {
    const { eventId, author, text } = req.body;
  
    try {
      const message = new Message({ event: eventId, author, text });
      const savedMessage = await message.save();
  
      await savedMessage.populate('author', 'name email');
  
      const io = req.app.get('socketio');
      if (io) {
        io.to(eventId).emit('messageReceived', savedMessage);
      }
  
      res.status(201).json({ message: 'Message sent successfully', messageData: savedMessage });
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  };

export const getMessages = async (req, res) => {
  const { eventId } = req.params;

  try {
    const messages = await Message.find({ event: eventId })
      .populate('author', 'name email') 
      .sort({ timestamp: 1 }); 
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
