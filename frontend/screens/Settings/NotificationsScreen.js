import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Switch, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { AuthContext } from '../../AuthContext';
import { scheduleLocalNotification } from '../../services/notifications';

const NotificationsScreen = ({ navigation }) => {
  const { notificationsEnabled, toggleNotifications } = useContext(AuthContext);

  const toggleSwitch = async () => {
    try {
      await toggleNotifications();
      await scheduleLocalNotification(
        'Notifications are on!',
        'You will now receive notifications!',
      );
    } catch (error) {
      console.log('Error toggling notifications:', error);
      Alert.alert('Error', 'Could not update notification preference. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('SettingsHome')}>
          <AntDesign name="back" size={30} color="#2ecc71" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.rowContent}>
          <Ionicons
            name={notificationsEnabled ? 'notifications' : 'notifications-outline'}
            size={24}
            color="#2ecc71"
            style={styles.icon}
          />
          <Text style={styles.rowText}>Receive Notifications</Text>
        </View>
        <Switch
          trackColor={{ false: '#bdc3c7', true: '#2ecc71' }}
          thumbColor={notificationsEnabled ? '#ffffff' : '#ffffff'}
          ios_backgroundColor="#bdc3c7"
          onValueChange={toggleSwitch}
          value={notificationsEnabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 20,
  },
  backButton: {
    marginTop: 5,
    marginRight: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ecf8f4',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  rowText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#34495e',
  },
});

export default NotificationsScreen;
