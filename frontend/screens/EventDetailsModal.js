import React, { useState, useRef, useContext} from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, ScrollView, Image} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useCameraPermissions,  } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import EditEventModal from './EditEventModal';
import { format } from 'date-fns';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ChatModal from './ChatModal';
import {deleteEventById, addParticipantsByEmail, getParticipants, removeParticipantByEmail, uploadEventImage, getEventMedia, 
  uploadEventFile, deleteEventImage, deleteEventFile} from '../services/api';
import { deleteEventLocal, addParticipantLocal, getParticipantsLocal, removeParticipantLocal, addImageLocal, getImagesLocal, deleteImageLocal, addFileLocal, getFilesLocal, deleteFileLocal} from '../database/db';
import { AuthContext } from '../AuthContext';

const EventDetailsModal = ({ visible, onClose, event, onUpdate, userId }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const { isBackendActive } = useContext(AuthContext);
  const [participants, setParticipants] = useState([]);
  const [email, setEmail] = useState('');
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const isEventOwner = userId === event?.user?._id;
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const cameraRef = useRef(null);     

  const handleRestrictedAction = (actionName) => {
    if (!isEventOwner) {
      Alert.alert('Permission Denied', `Only the event owner can ${actionName}.`);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      await onUpdate();
      setEditModalVisible(false);
      setTimeout(() => onClose(), 200);
    } catch (error) {
      console.log('Error while saving event:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!handleRestrictedAction('delete this event')) return;

    Alert.alert('Delete Event', 'Are you sure?', [
      { text: 'Cancel'},
      {
        text: 'Delete',
        onPress: async () => {
          try {
            if (event._id) {
              await deleteEventById(event._id);
              console.log('Event deleted successfully in backend');
              await deleteEventLocal(event._id);
              console.log('Event deleted successfully in local database');
            }
            onUpdate();
            onClose();
          } catch (error) {
            console.log('Error deleting event:', error);
          }
        },
      },
    ]);
  };

  const fetchParticipants = async () => {
    try {
      if (isBackendActive) {
        const { participants } = await getParticipants(event._id);
        setParticipants(participants);
      } else {
        const localParticipants = await getParticipantsLocal(event._id);
        setParticipants(localParticipants);
      }
    } catch (error) {
      console.log('Error fetching participants:', error);
    }
  };
  
  const handleAddParticipant = async () => {
    if (!handleRestrictedAction('add participants')) return;
    try {
      if (!email.trim()) {
        Alert.alert('Error', 'Email is required');
        return;
      }
      await addParticipantsByEmail(event._id, [email]);
      Alert.alert('Success', `${email} has been added to the event!`);
  
      if (event._id) {
        await addParticipantLocal(event._id, email);
      }
      setEmail('');
      fetchParticipants();
    } catch (error) {
      Alert.alert('Wrong email', 'This user is not available.');
    }
  };

  const handleRemoveParticipant = async (participantEmail) => {
    if (!handleRestrictedAction('remove participants')) return;
    try {
      await removeParticipantByEmail(event._id, participantEmail);
      Alert.alert('Success', `${participantEmail} has been removed from the event!`);
      if (event._id) {
        await removeParticipantLocal(event._id, participantEmail);
      }
      fetchParticipants()
    } catch (error) {
      console.log('Error removing participant:', error);
    }
  };

  const openCamera = async () => {
    if (!cameraPermission?.granted || !mediaLibraryPermission?.granted) {
      Alert.alert(
        'Permissions Required',
        'Camera and Media Library permissions are required.',
        [
          { text: 'Grant Permissions', onPress: () => requestCameraPermission() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = await MediaLibrary.createAssetAsync(result.assets[0].uri);
        if (asset) {
          Alert.alert('Success', 'Image saved to gallery');
        }
      }
    } catch (error) {
      console.log('Error taking photo or saving it:', error);
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });
  
      if (!result.canceled && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        if (isBackendActive) {
          const uploadedImage = await uploadEventImage(event._id, imageUri);
          setImages((prevImages) => [...prevImages, uploadedImage.images[uploadedImage.images.length - 1]]);
          console.log('Image uploaded to backend');
        }
        if (event._id) {
          await addImageLocal(event._id, imageUri);
          setImages((prevImages) => [...prevImages, imageUri]);
          console.log('Image added locally');
        }
        fetchMedia();
        Alert.alert('Success', 'Image uploaded successfully!');
      }
    } catch (error) {
      console.log('Error uploading image:', error);
    }
  };
  
  const handleDeleteImage = async (imageUri, backendId) => {
    if (!isEventOwner) {
      Alert.alert('Permission Denied', 'Only the event owner can delete images.');
      return;
    }
    Alert.alert(
      'Delete Image',
      'Are you sure?',
      [
        { text: 'Cancel'},
        {
          text: 'Delete',
          onPress: async () => {
            try {
              if (isBackendActive) {
                const relativePath = imageUri.replace('http://172.19.4.8:5000', '');
                await deleteEventImage(event._id, relativePath);
                console.log('Image deleted successfully in backend');
              }
              if (event._id) {
                await deleteImageLocal(event._id, backendId);
                const updatedLocalImages = images.filter((img) => img.backendId !== backendId);
                setImages(updatedLocalImages);
                console.log('Image deleted successfully in local database');
              }
            } catch (error) {
              console.log('Error deleting image:', error);
            }
          },
        },
      ]
    );
  };

  const fetchMedia = async () => {
    try {
      if (isBackendActive) {
        const media = await getEventMedia(event._id);
        const formattedImages = media.images.map((img) => ({
          uri: img,
          backendId: null,
        }));
        setImages(formattedImages);
        setFiles(media.files);
      } else {
        const localImages = await getImagesLocal(event._id);
        const localFiles = await getFilesLocal(event._id);
        setImages(localImages);
        setFiles(localFiles);
        console.log({ images: localImages, files: localFiles });
      }
    } catch (error) {
      console.log('Error fetching media:', error);
    }
  };
  
  const uploadFile = async () => {
    console.log("File picker opened");
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
  
      if (result.type === 'success' || result.assets) {
        const fileUri = result.uri || result.assets[0]?.uri;
        const fileName = result.name || result.assets[0]?.name;
        const fileType = result.mimeType || result.assets[0]?.mimeType;
  
        console.log(`File info: uri=${fileUri}, name=${fileName}, type=${fileType}`);
  
        const uploadedFile = await uploadEventFile(event._id, fileUri, fileType);
        console.log("Uploaded file response:", uploadedFile);
  
        setFiles(uploadedFile.files);
        Alert.alert('Success', 'File uploaded successfully!');
  
        if (event._id) {
          await addFileLocal(event._id, fileUri);
          console.log('File added locally to event:', event._id);
        }
      }
    } catch (error) {
      console.log('Error selecting or uploading file:', error);
    }
  };
  
  const handleDeleteFile = async (filePath) => {
    if (!handleRestrictedAction('delete files')) return;
  
    const relativePath = filePath.replace('http://172.19.4.8:5000', '');
  
    Alert.alert(
      'Delete File',
      'Are you sure you want to delete this file?',
      [
        { text: 'Cancel'},
        {
          text: 'Delete',
          onPress: async () => {
            try {
              if (isBackendActive) {
                const updatedMedia = await deleteEventFile(event._id, relativePath);
                setFiles(updatedMedia.files);
                console.log('File deleted from backend:', relativePath);
              } else {
                await deleteFileLocal(event._id, filePath);
                console.log('File removed locally:', filePath);
              }
            } catch (error) {
              console.log('Error deleting file:', error);
            }
          },
        },
      ]
    );
  };
  
  const downloadAndShareFile = async (url, fileName) => {
    try {
      const baseUrl = 'http://172.19.4.8:5000';
      const completeUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const { uri } = await FileSystem.downloadAsync(completeUrl, fileUri);
  
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.log('Error downloading or sharing file:', error);
      Alert.alert('Error', 'Could not download or share the file.');
    }
  };
  
  if (!event) return null;

  const formattedStartDate = format(new Date(event.start_date), 'MM-dd-yyyy');
  const formattedEndDate = format(new Date(event.end_date), 'MM-dd-yyyy');

  return (
    <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
    onShow={() => {
      fetchMedia();
      fetchParticipants();
    }}
  >
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Event Details</Text>
          <TouchableOpacity onPress={onClose}>
            <AntDesign name="close" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
  
        {/* Event Details */}
        <ScrollView>
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Title</Text>
            <Text style={styles.text}>{event.title}</Text>
          </View>
  
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.text}>{event.description}</Text>
          </View>
  
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Dates</Text>
            <Text>Start: {formattedStartDate}</Text>
            <Text>End: {formattedEndDate}</Text>
          </View>
  
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Event Owner</Text>
            <Text style={styles.text}>{event.user?.name || 'Unknown'}</Text>
          </View>
  
          {/* Participants */}
          <View style={styles.participantsSection}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <View style={styles.addParticipantRow}>
                  <TextInput
                    style={styles.participantInput}
                    placeholder="Enter email"
                    placeholderTextColor={'gray'}
                    value={email}
                    onChangeText={setEmail}
                  />
                  <TouchableOpacity style={styles.addParticipantButton} onPress={handleAddParticipant}>
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                </View>
            {participants.map((participant, index) => (
              <View key={index} style={styles.participantRow}>
                <Text style={styles.text}>
                  {participant.name} [{participant.email}]
                </Text>
                {isEventOwner && (
                  <TouchableOpacity onPress={() => handleRemoveParticipant(participant.email)}>
                    <AntDesign name="delete" size={20} color="#e74c3c" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
  
          {/* Images */}
          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>Images</Text>
            <ScrollView horizontal style={styles.imageScroll}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  {isEventOwner && (
                    <TouchableOpacity
                      style={styles.deleteImageButton}
                      onPress={() => handleDeleteImage(image.uri, image.backendId)}
                    >
                      <AntDesign name="delete" size={16} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.actionButton, styles.cameraButton]} onPress={openCamera}>
                <Text style={styles.buttonText}>Take Picture</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.cameraButton]} onPress={openGallery}>
                <Text style={styles .buttonText}>Upload Image</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Files */}
          <View style={styles.filesSection}>
            <Text style={styles.sectionTitle}>Files</Text>
            <ScrollView style={styles.filesList}>
              {files.map((file, index) => {
                const fileName = file.split('/').pop(); 
                const baseUrl = 'http://172.19.4.8:5000';
                const completeUrl = file.startsWith('http') ? file : `${baseUrl}${file}`;

                return (
                  <View key={index} style={styles.fileItem}>
                    <TouchableOpacity
                      style={styles.fileLinkWrapper}
                      onPress={() => downloadAndShareFile(completeUrl, fileName)}
                    >
                      <Text style={styles.fileLink}>{fileName || `File ${index + 1}`}</Text>
                    </TouchableOpacity>
                    {isEventOwner && (
                      <TouchableOpacity
                        style={styles.deleteFileButton}
                        onPress={() => handleDeleteFile(file)}
                      >
                        <AntDesign name="delete" size={16} color="#e74c3c" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[styles.actionButton, styles.uploadButton]} onPress={uploadFile}>
              <Text style={styles.buttonText}>Upload File</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              if (!handleRestrictedAction('edit this event')) return;
              setEditModalVisible(true);
            }}
          >
            <Text style={styles.buttonText}>Edit Event</Text>
          </TouchableOpacity>
          {/* Chat button */}
          <TouchableOpacity style={[styles.actionButton, styles.chatButton]} onPress={() => setChatModalVisible(true)}>
            <Text style={styles.buttonText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteEvent}
            >
              <Text style={styles.buttonText}>Delete Event</Text>
          </TouchableOpacity>
        </View>
  
        <EditEventModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          eventId={event._id || event.id}
          userId={userId}
          title={event.title}
          description={event.description}
          startDate={event.start_date}
          endDate={event.end_date}
          onSave={handleSave}
        />
        {/* Chat Modal */}
        <ChatModal
            visible={chatModalVisible}
            onClose={() => setChatModalVisible(false)}
            eventId={event._id}
            userId={userId}
          />
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
  modalContainer: {
    width: '90%',
    height: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  content: {
    marginTop: 10,
  },
  detailSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    textAlign: 'left',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#34495e',
  },
  text: {
    fontSize: 14,
    color: '#2c3e50',
  },
  date: {
    fontSize: 14,
    color: '#34495e',
  },
  participantsSection: {
    marginTop: 15,
  },
  addParticipantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  participantInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 5,
    padding: 10,
  },
  addParticipantButton: {
    marginLeft: 10,
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 5,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 6,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#2ecc71', 
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cameraButton:{
    backgroundColor: '#008080'
  },
  imagesSection: {
    marginVertical: 20,
  },
  imageScroll: {
    marginTop: 10,
    flexDirection: 'row',
  },
  image: {
    width: 150,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  deleteImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    elevation: 2,
  },    
  uploadButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  filesSection: {
    marginTop: 20,
  },
  filesList: {
    marginVertical: 10,
  },
  fileLink: {
    color: '#3498db',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fileLinkWrapper: {
    flex: 1,
  },
  deleteFileButton: {
    marginLeft: 10,
  },
  chatButton: {
    backgroundColor: '#6c63ff',
  },
});

export default EventDetailsModal;