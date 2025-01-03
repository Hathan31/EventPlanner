import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const SettingsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('Account')}
      >
        <View style={styles.rowContent}>
          <Ionicons name="person" size={24} color="#2ecc71" style={styles.icon} />
          <Text style={styles.rowText}>Account</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('Notifications')}
      >
        <View style={styles.rowContent}>
          <Ionicons name="notifications" size={24} color="#2ecc71" style={styles.icon} />
          <Text style={styles.rowText}>Notifications</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginTop: 30, 
    marginBottom: 30,
    textAlign: 'left',
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

export default SettingsScreen;