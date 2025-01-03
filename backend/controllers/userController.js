import User from '../models/User.js';

export const updateUserName = async (req, res) => {
  const { name } = req.body;

  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name;
    await user.save();

    res.status(200).json({ message: 'Name updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateNotificationPreference = async (req, res) => {
  const userId = req.user.id;
  const { notificationsEnabled } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.notificationsEnabled = notificationsEnabled;
    await user.save();

    res.status(200).json({ message: 'Notification preference updated successfully', notificationsEnabled });
  } catch (error) {
    console.error('Error updating notification preference:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getNotificationPreference = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ notificationsEnabled: user.notificationsEnabled });
  } catch (error) {
    console.error('Error fetching notification preference:', error);
    res.status(500).json({ error: 'Server error' });
  }
};