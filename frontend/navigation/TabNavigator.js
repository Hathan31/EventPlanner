import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import EventsScreen from '../screens/EventsScreen';
import DayScreen from '../screens/DayScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsNavigator from '../screens/Settings/SettingsNavigator';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#2ecc71', 
        tabBarInactiveTintColor: '#bdc3c7',
        tabBarStyle: {
          backgroundColor: '#ecf8f4',
          borderTopWidth: 0, 
          elevation: 5, 
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused }) => {
          let iconName;

          if (route.name === 'Events') {
            iconName = focused ? 'albums' : 'albums-outline';
          } else if (route.name === 'Day') {
            iconName = focused ? 'sunny' : 'sunny-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return (
            <Ionicons
              name={iconName}
              size={24}
              color={focused ? '#2ecc71' : '#bdc3c7'}
            />
          );
        },
        headerShown: false, 
      })}
    >
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Day" component={DayScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Settings" component={SettingsNavigator} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
