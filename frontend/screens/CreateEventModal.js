import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import EventForm from './EventForm';
import AntDesign from '@expo/vector-icons/AntDesign';

const CreateEventModal = ({ visible, onClose, onEventCreated }) => {
  const handleEventCreated = () => {
    if (onEventCreated) {
      onEventCreated();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* Closing Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="close" size={24} color="#e74c3c" />
          </TouchableOpacity>

          {/* Form */}
          <EventForm onEventCreated={handleEventCreated} onCancel={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default CreateEventModal;
