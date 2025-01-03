import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { AuthContext } from '../../AuthContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import { updateUserNameLocal } from '../../database/db';

const AccountScreen = ({ navigation }) => {
  const { user, logout, updateUserName, isBackendActive } = useContext(AuthContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [canEdit, setCanEdit] = useState(isBackendActive);
  
  useEffect(() => {
    setCanEdit(isBackendActive);
    console.log(user.user_id)
  }, [isBackendActive]);

  const handleSave = async () => {
    const success = await updateUserName(newName);
    if (success) {      
      try {
        await updateUserNameLocal(user?.user_id, newName);
        console.log('Name updated locally');
      } catch (error) {
        console.error('Error updating user name locally:', error);
      }
      setModalVisible(false);
    } else {
      Alert.alert('Error', 'You can only update your name while online.');
    }
  };
  
  const handleLogout = () => {
    logout();
    navigation.navigate('Login'); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("SettingsHome")}>
          <AntDesign name="back" size={30} color="#2ecc71" />
        </TouchableOpacity>

        <Text style={styles.title}>Account</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user?.name || 'Not available'}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email || 'Not available'}</Text>
      </View>

      <TouchableOpacity
        style={[styles.editButton, !canEdit && styles.disabledButton]} 
        onPress={() => setModalVisible(true)}
        disabled={!canEdit}
      >
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your new name"
              placeholderTextColor="#bdc3c7"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ecf8f4',
  },
  titleContainer:{
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 20,
  },
  backButton:{
    marginTop: 5,
    marginRight: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  value: {
    fontSize: 18,
    marginLeft: 5,
    color: '#34495e',
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: { 
    backgroundColor: '#95a5a6' 
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 18,
    color: '#34495e',
    marginBottom: 10,
  },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
});

export default AccountScreen;