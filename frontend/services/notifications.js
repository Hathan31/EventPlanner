import * as Notifications from 'expo-notifications';
import { getNotificationPreference } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleLocalNotification = async (title, body, trigger) => {
  try {
    const notificationsEnabled = await getNotificationPreference();

    if (notificationsEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: trigger ? trigger : null,
      });
      console.log('Notification scheduled:', { title, body });
    } else {
      console.log('Notification not scheduled as notifications are disabled.');
    }
  } catch (error) {
    console.log('Error scheduling notification:', error);
  }
};