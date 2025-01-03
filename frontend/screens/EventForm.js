import React, { useState, useContext } from 'react';
import { createEvent } from '../services/api';
import { View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../AuthContext';
import { insertEvent } from '../database/db';

const EventForm = ({ onEventCreated, onCancel }) => {
  const { user } = useContext(AuthContext);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const onFormSubmit = async (data) => {
    if (!user) {
      console.log('Error', 'User is not logged in.');
      return;
    }
  
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        user: user.user_id,
        participants: [],
        images: [],
        files: []
      };
  
      const createdEvent = await createEvent(eventData);
      console.log('Event created in backend:', createdEvent);
  
      const eventToInsert = {
        event_id: createdEvent._id,
        ...createdEvent
      };

      await insertEvent(eventToInsert);
      console.log("Event created locally")
  
      if (onEventCreated) {
        onEventCreated();
      }
      reset(); 
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.label}>Event Title</Text>
      <Controller
        control={control}
        name="title"
        rules={{ required: 'Title is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Enter event title"
            placeholderTextColor="grey"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}

      {/* Description */}
      <Text style={styles.label}>Event Description</Text>
      <Controller
        control={control}
        name="description"
        rules={{ required: 'Description is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.description && styles.inputError]}
            placeholder="Enter event description"
            placeholderTextColor="grey"
            multiline
            numberOfLines={3}
            onBlur={onBlur}
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
        <Text>{startDate.toDateString()}</Text>
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      {/* End Date */}
      <Text style={styles.label}>End Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowEndDatePicker(true)}
      >
        <Text>{endDate.toDateString()}</Text>
      </TouchableOpacity>
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleSubmit(onFormSubmit)}
        >
          <Text style={styles.buttonText}>Create Event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20 
  },
  label: { 
    fontWeight: 'bold', 
    marginBottom: 5 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#bdc3c7', 
    borderRadius: 5, 
    padding: 10, 
    marginBottom: 10 
  },
  inputError: { 
    borderColor: '#e74c3c' 
  },
  error: { color: '#e74c3c', 
    marginBottom: 10 
  },
  dateButton: { 
    padding: 10, 
    backgroundColor: '#ecf8f4', 
    borderRadius: 5, 
    marginBottom: 10 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 20 
  },
  cancelButton: { 
    backgroundColor: '#e74c3c', 
    padding: 10, 
    borderRadius: 5, 
    flex: 1, 
    marginRight: 5 
  },
  createButton: { 
    backgroundColor: '#2ecc71', 
    padding: 10, 
    borderRadius: 5, 
    flex: 1, 
    marginLeft: 5 
  },
  buttonText: { 
    color: '#fff', 
    textAlign: 'center' 
  },
});

export default EventForm;
