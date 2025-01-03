import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { format } from 'date-fns';
import { AuthContext } from '../AuthContext';
import api from '../services/api';
import CreateEventModal from './CreateEventModal';
import EventDetailsModal from './EventDetailsModal';
import { getAllEvents } from '../database/db';

const EventsScreen = ({ navigation }) => {
  const { user, isBackendActive } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!user) {
      return;
    }
    console.log(user)

    try {
      if (isBackendActive) {
        console.log('Fetching events from backend...');
        const response = await api.get('/events');
        setEvents(response.data);
      } else {
        console.log('Fetching events from local database...');
        const localEvents = await getAllEvents();
        setEvents(localEvents);
      }
    } catch (error) {
      console.log('Error fetching events:', error);
      Alert.alert('Error', 'Could not fetch events.');
    }
  }, [user, isBackendActive]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventPress = (event) => {
    console.log('Selected Event:', event);
    setSelectedEvent(event);
    setDetailsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Events</Text>
        <TouchableOpacity
          style={styles.accountButton}
          onPress={() => navigation.navigate('Settings', { screen: 'Account' })}
        >
          <MaterialIcons name="account-circle" size={32} color="#2ecc71" />
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item._id ? item._id.toString() : Math.random().toString()}
        renderItem={({ item }) => {
          const formattedStartDate = format(new Date(item.start_date), 'MM-dd-yyyy');
          const formattedEndDate = format(new Date(item.end_date), 'MM-dd-yyyy');

          return (
            <TouchableOpacity style={styles.eventCard} onPress={() => handleEventPress(item)}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
              <View style={styles.dateContainer}>
                <Text style={styles.eventDate}>Start: </Text>
                <Text>{formattedStartDate}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Text style={styles.eventDate}>End: </Text>
                <Text>{formattedEndDate}</Text>
              </View>
              <View style={styles.ownerContainer}>
                <Text style={styles.eventOwner}>
                  Event Owner: {item?.user?.name || 'Unknown'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Create Event Button */}
      <TouchableOpacity style={styles.addEventButton} onPress={() => setModalVisible(true)}>
        <AntDesign name="pluscircleo" size={45} color="#2ecc71" />
      </TouchableOpacity>

      {/* Create Event Modal */}
      <CreateEventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onEventCreated={() => {
          fetchEvents();
          setModalVisible(false);
        }}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        visible={detailsModalVisible}
        event={selectedEvent}
        userId={user?.user_id}
        onClose={() => setDetailsModalVisible(false)}
        onUpdate={fetchEvents}
      />
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
    marginRight: 10,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  accountButton: {
    marginTop: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  eventCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 5,
  },
  eventDescription: {
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'justify',
    color: '#033f63',
  },
  dateContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  eventDate: {
    fontWeight: '600',
    color: '#DC143C',
  },
  ownerContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  eventOwner: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
  },
  addEventButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
});

export default EventsScreen;
