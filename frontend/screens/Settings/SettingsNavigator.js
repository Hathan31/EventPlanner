import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from './SettingsScreen';
import AccountScreen from './AccountScreen';
import NotificationsScreen from './NotificationsScreen';

const Stack = createStackNavigator();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator initialRouteName='SettingsHome'>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Account" component={AccountScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
