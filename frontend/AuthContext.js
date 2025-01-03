import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { checkBackendStatus, getNotificationPreference, updateNotificationPreference } from './services/api';
import { insertUser, findUserByEmail} from './database/db';
import { scheduleLocalNotification } from './services/notifications';

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isBackendActive, setIsBackendActive] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const verifyBackend = async () => {
      const status = await checkBackendStatus();
      setIsBackendActive(status);
    };
    verifyBackend();
  }, []);

  useEffect(() => {
    if (user && isBackendActive) {
      const fetchNotificationPreference = async () => {
        try {
          const preference = await getNotificationPreference();
          console.log('Notification preference fetched:', preference);
          setNotificationsEnabled(preference);
        } catch (error) {
          console.log('Error fetching notification preference:', error);
        }
      };

      fetchNotificationPreference();
    }
  }, [user, isBackendActive]);

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/users/register', {
        name,
        email,
        password,
      });

      const userId = response.data?._id;
      await insertUser(email, password, name, userId);
      console.log('User registered and stored locally.');

      return true;
    } catch (error) {
      console.log('Error during registration:', error);
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const isBackendActive = await checkBackendStatus();
      if (isBackendActive) {
        try {
          const response = await api.post('/users/login', { email, password });
          const { token, user: userData } = response.data;
          console.log(response.data)
  
          await AsyncStorage.setItem('token', token);
  
          setUser({
            user_id: userData.id,
            name: userData.name,
            email: userData.email,
          });
          console.log('Online login successfull');
          return true;
        } catch (error) {
          console.log('Error login in with backend', error);
        }
      }
  
      const localUser = await findUserByEmail(email);
  
      if (localUser) {
        console.log('User not found in local database:', localUser);
  
        if (localUser.password === password) {
          setUser({
            user_id: localUser.user_id,
            name: localUser.name,
            email: localUser.email,
          });
          console.log('Offline login successful');
          return true;
        } else {
          console.log('Wrong password');
          return false;
        }
      } else {
        console.log('No user was found with the provided email');
        return false; 
      }
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };
  
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  const updateUserName = async (name) => {
    try {
      const isBackendActive = await checkBackendStatus();
      if (isBackendActive) {
        const response = await api.put('/users/update-name', { name });
        await scheduleLocalNotification(
          'Name updated sucessfully!',
          'What a nice name you got friend',
        );
        const updatedUser = response.data.user;
        setUser(updatedUser);
        return true;
      } else {
        throw new Error('You can only update your name while online.');
      }
    } catch (error) {
      console.log('Update name error:', error);
      return false;
    }
  };

  const toggleNotifications = async () => {
    try {
      const newNotificationStatus = !notificationsEnabled;
      console.log('Attempting to update notification preference to:', newNotificationStatus);

      if (user && user.user_id) {
        // Actualizar la preferencia en el backend
        const updatedStatus = await updateNotificationPreference(newNotificationStatus);
        console.log('Backend confirmed new notification status:', updatedStatus);

        setNotificationsEnabled(updatedStatus);
        console.log('Notification preference updated successfully:', updatedStatus);
      } else {
        console.log('No user logged in or no valid user ID found');
      }
    } catch (error) {
      console.error('Error updating notification preference on backend:', error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, register, login, logout, getToken, isBackendActive, updateUserName, notificationsEnabled, toggleNotifications}}>
      {children}
    </AuthContext.Provider>
  );
};