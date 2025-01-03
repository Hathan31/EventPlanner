import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleLocalNotification } from './notifications';

const api = axios.create({
  baseURL: 'http://172.19.4.8:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const checkBackendStatus = async () => {
  try {
    const response = await api.get('/users/health');
    return response.status === 200;
  } catch (error) {
    console.log('Backend is not running');
    return false;
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    await scheduleLocalNotification(
      'New event created!',
      'Go take a look a it!',
    );
    return response.data;
    
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const deleteEventById = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}`);
    await scheduleLocalNotification(
      'Event deleted!',
      'The event has been sucessfully deleted!',
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const getParticipants = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/participants`);
    return response.data;
  } catch (error) {
    console.error('Error fetching participants:', error);
    throw error;
  }
};

export const addParticipantsByEmail = async (eventId, emails) => {
  try {
    const response = await api.post(`/events/${eventId}/participants`, { emails });
    await scheduleLocalNotification(
      'Participant added',
      'A new participant has been added to your event!',
    );
    return response.data;
  } catch (error) {
    console.log('Error adding participants:', error);
    throw error;
  }
};

export const removeParticipantByEmail = async (eventId, participantEmail) => {
  try {
    const response = await api.delete(`/events/${eventId}/participants`, {
      data: { participantEmail },
    });
    return response.data;
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
};

export const uploadEventImage = async (eventId, imageUri) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: `image-${Date.now()}.jpg`,
      type: 'image/jpeg',
    });

    const response = await api.post(`/events/${eventId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const getEventMedia = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/media`);
    return response.data;
  } catch (error) {
    console.error('Error fetching media:', error);
    throw error;
  }
};

export const uploadEventFile = async (eventId, fileUri, fileType) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileUri.split('/').pop(),
      type: fileType,
    });

    const response = await api.post(`/events/${eventId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteEventImage = async (eventId, imagePath) => {
  try {
    const response = await api.delete(`/events/${eventId}/images`, {
      data: { imagePath },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const deleteEventFile = async (eventId, filePath) => {
  try {
    const response = await api.delete(`/events/${eventId}/files`, {
      data: { filePath }, 
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const fetchEventMessages = async (eventId) => {
  try {
    const response = await api.get(`/messages/${eventId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendEventMessage = async (messageData) => {
  try {
    const response = await api.post(`/messages`, messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const updateNotificationPreference = async (notificationsEnabled) => {
  try {
    const response = await api.put('users/notifications', { notificationsEnabled });
    return response.data.notificationsEnabled;
  } catch (error) {
    console.error('Error updating notification preference on backend:', error);
    throw error;
  }
};

export const getNotificationPreference = async () => {
  try {
    const response = await api.get('/users/notifications');
    return response.data.notificationsEnabled;
  } catch (error) {
    console.log('Error fetching notification preference:', error);
    throw error;
  }
};