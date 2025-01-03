import React, { useEffect, useState, useRef } from 'react';
import {Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { socket, connectSocket, disconnectSocket } from '../services/socket';
import { fetchEventMessages, sendEventMessage } from '../services/api';

const ChatModal = ({ visible, onClose, eventId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (visible) {
      connectSocket(eventId);

      const loadMessages = async () => {
        try {
          const data = await fetchEventMessages(eventId);
          setMessages(data);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      };

      loadMessages();

      socket.on('messageReceived', (message) => {
        if (message) {
          setMessages((prevMessages) => [...prevMessages, message]);
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } else {
          console.log('Wrong message properties:', message);
        }
      });
    }
    return () => {
      disconnectSocket(eventId);
      socket.off('messageReceived');
    };
  }, [visible, eventId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      eventId: eventId,
      author: userId,
      text: newMessage,
    };
    try {
      const response = await sendEventMessage(messageData);
      if (response.messageData) {
        setMessages((prevMessages) => [...prevMessages, response.messageData]);
        setNewMessage('');
        scrollViewRef.current?.scrollToEnd({ animated: true });
      } else {
        console.log('Wrong message properties:', response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
        <View style={styles.modalContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Chat</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <AntDesign name="close" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  msg.author._id === userId ? styles.myMessage : styles.theirMessage,
                ]}
              >
                <Text style={styles.messageAuthor}>
                  {msg.author._id === userId ? 'You' : msg.author.name}
                </Text>
                <Text style={styles.messageText}>{msg.text}</Text>
                <Text style={styles.messageTimestamp}>
                  {new Date(msg.timestamp).toLocaleString()}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              placeholderTextColor={'gray'}
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
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
  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    marginTop: 10,
    fontWeight: 'bold',
    color: '#6c63ff',
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  messageBubble: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  myMessage: {
    backgroundColor: '#d4f1f4',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#f4d4d4',
    alignSelf: 'flex-start',
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#6c63ff',
    borderRadius: 5,
    padding: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
    marginTop: 0
  },
});

export default ChatModal;
