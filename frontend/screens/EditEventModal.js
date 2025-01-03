import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import api from '../services/api';
import { updateEventLocal } from '../database/db';
import { AuthContext } from '../AuthContext';
import { scheduleLocalNotification } from '../services/notifications';

const EditEventModal = ({ visible, onClose, eventId, userId, title, description, startDate, endDate, onSave }) => {
  const { isBackendActive } = useContext(AuthContext);
  const [start, setStart] = useState(startDate ? new Date(startDate) : new Date());
  const [end, setEnd] = useState(endDate ? new Date(endDate) : new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: title || '',
      description: description || '',
    },
  });

  useEffect(() => {
    if (visible) {
      setValue('title', title || '');
      setValue('description', description || '');
      setStart(startDate ? new Date(startDate) : new Date());
      setEnd(endDate ? new Date(endDate) : new Date());
    }
  }, [visible, eventId, userId, title, description, startDate, endDate, setValue]);

  const onFormSubmit = async (data) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is missing.');
      }

      if (isBackendActive) {
        const response = await api.put(`/events/${eventId}`, {
          title: data.title,
          description: data.description,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
        });
        await scheduleLocalNotification(
          'The event has been updated!',
          'Check out the new information now!',
        );
        console.log('Event updated successfully in backend:', response.data);
      }

      await updateEventLocal(eventId, data.title, data.description, start.toISOString(), end.toISOString());
      console.log('Event updated locally with event ID:', eventId);

      onSave();
      onClose();
    } catch (error) {
      console.log('Error updating event:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Event</Text>

          {/* Title */}
          <Text style={styles.label}>Title</Text>
          <Controller
            control={control}
            name="title"
            rules={{ required: 'Title is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Enter event title"
                placeholderTextColor="grey"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <Controller
            control={control}
            name="description"
            rules={{ required: 'Description is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.description && styles.inputError]}
                placeholder="Enter event description"
                placeholderTextColor="grey"
                multiline
                numberOfLines={3}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.description && <Text style={styles.error}>{errors.description.message}</Text>}

          {/* Start Date */}
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text>{start.toDateString()}</Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={start}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);
                if (selectedDate) setStart(selectedDate);
              }}
            />
          )}

          {/* End Date */}
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text>{end.toDateString()}</Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={end}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false);
                if (selectedDate) setEnd(selectedDate);
              }}
            />
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit(onFormSubmit)}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  error: {
    color: '#e74c3c',
    marginBottom: 10,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#ecf8f4',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default EditEventModal;