import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './navigation/StackNavigator';
import { AuthProvider } from './AuthContext';
import { initializeDatabase} from './database/db';
import { useEffect } from 'react';

export default function App() {
  useEffect(()=> {
    initializeDatabase();
  })
  return (
    <AuthProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}