import * as SQLite from 'expo-sqlite';

const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('planner.db');
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

export const initializeDatabase = async () => {
  try {
    const db = await openDatabase();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        event_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        user_id TEXT NOT NULL,
        participants TEXT,
        images TEXT,
        files TEXT
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const insertUser = async (email, password, name, userId) => {
  try {
    const db = await openDatabase();
    const result = await db.runAsync(
      `INSERT INTO users (user_id, email, password, name) VALUES (?, ?, ?, ?)`,
      [userId, email, password, name] 
    );
    console.log('User inserted locally with user ID:', userId);
    return result.lastInsertRowId;
  } catch (error) {
    if (error.code === 19) {
      console.error('Error: User already exists');
    } else {
      console.error('Error inserting user locally:', error);
    }
    throw error;
  }
};

export const findUserByEmail = async (email) => {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    if (result && result.length > 0) {
      const user = result[0];
      console.log('User found:', user);
      return user;
    } else {
      console.log('No user found with that email');
      return null;
    }
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

export const updateUserNameLocal = async (userId, newName) => {
  try {
    const db = await openDatabase();
    await db.runAsync(
      `UPDATE users SET name = ? WHERE user_id = ?`,
      [newName, userId]
    );
    console.log(`User name updated locally for user ID: ${userId}`);
  } catch (error) {
    console.error('Error updating user name locally:', error);
    throw error;
  }
};

export const insertEvent = async (event) => {
  try {
    const db = await openDatabase();
    const { event_id, title, description, start_date, end_date, user, participants, images, files } = event;
    const participantsString = JSON.stringify(participants);
    const imagesString = JSON.stringify(images);
    const filesString = JSON.stringify(files);
    const result = await db.runAsync(
      `INSERT INTO events (event_id, title, description, start_date, end_date, user_id, participants, images, files)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [event_id, title, description, start_date, end_date, user, participantsString, imagesString, filesString]
    );
    console.log('Event inserted locally with event ID:', event_id);
    return result.lastInsertRowId;
  } catch (error) {
    if (error.code === 19) {
      console.error('Error: Event already exists');
    } else {
      console.error('Error inserting event:', error);
    }
    throw error;
  }
};

export const getAllEvents = async () => {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync(`SELECT * FROM events`);

    if (result && result.length > 0) {
      const events = [];
      for (const row of result) {
        const userResult = await db.getAllAsync(
          `SELECT name FROM users WHERE user_id = ?`,
          [row.user_id]
        );

        let userName = 'Unknown';
        if (userResult && userResult.length > 0) {
          userName = userResult[0].name;
        }

        events.push({
          _id: row.event_id,
          title: row.title,
          description: row.description,
          start_date: row.start_date,
          end_date: row.end_date,
          user: { _id: row.user_id, name: userName },
          participants: JSON.parse(row.participants),
          images: JSON.parse(row.images),
          files: JSON.parse(row.files),
        });
      }
      return events;
    } else {
      console.log('No events found in local database.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching local events:', error);
    throw error;
  }
};


export const updateEventLocal = async (eventId, title, description, startDate, endDate) => {
  try {
    const db = await openDatabase();
    const result = await db.runAsync(
      `UPDATE events SET title = ?, description = ?, start_date = ?, end_date = ? WHERE event_id = ?`,
      [title, description, startDate, endDate, eventId]
    );
    console.log('Event updated locally with event ID:', eventId);
    return result;
  } catch (error) {
    console.error('Error updating event locally:', error);
    throw error;
  }
};

export const deleteEventLocal = async (eventId) => {
  try {
    const db = await openDatabase();
    const result = await db.runAsync(
      `DELETE FROM events WHERE event_id = ?`,
      [eventId]
    );
    console.log('Event deleted locally with event ID:', eventId);
    return result;
  } catch (error) {
    console.error('Error deleting event locally:', error);
    throw error;
  }
};

export const addParticipantLocal = async (eventId, participantEmail) => {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync(
      `SELECT participants FROM events WHERE event_id = ?`,
      [eventId]
    );
    if (result?.length > 0) {
      let currentParticipants = result[0]?.participants;
      currentParticipants = currentParticipants ? JSON.parse(currentParticipants) : [];
      currentParticipants.push(participantEmail);
      await db.runAsync(
        `UPDATE events SET participants = ? WHERE event_id = ?`,
        [JSON.stringify(currentParticipants), eventId]
      );
      console.log('Participant added locally to event:', eventId);
    }
  } catch (error) {
    console.error('Error adding participant locally:', error);
    throw error;
  }
};

export const getParticipantsLocal = async (eventId) => {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync(
      `SELECT participants FROM events WHERE event_id = ?`,
      [eventId]
    );
    if (result?.length > 0) {
      const participantsString = result[0]?.participants;
      const participantsArray = participantsString ? JSON.parse(participantsString) : [];
      return participantsArray.map(email => ({ email }));
    } else {
      console.log('No participants found');
      return [];
    }
  } catch (error) {
    console.error('Error getting participants from local database:', error);
    throw error;
  }
};

export const removeParticipantLocal = async (eventId, participantEmail) => {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync(
      `SELECT participants FROM events WHERE event_id = ?`,
      [eventId]
    );
    if (result?.length > 0) {
      let currentParticipants = result[0]?.participants;
      currentParticipants = currentParticipants ? JSON.parse(currentParticipants) : [];
      const updatedParticipants = currentParticipants.filter(
        participant => participant !== participantEmail
      );
      if (updatedParticipants.length !== currentParticipants.length) {
        await db.runAsync(
          `UPDATE events SET participants = ? WHERE event_id = ?`,
          [JSON.stringify(updatedParticipants), eventId]
        );
        console.log('Participant removed locally from event:', eventId);
      }
    }
  } catch (error) {
    console.error('Error removing participant locally:', error);
    throw error;
  }
};

export const addImageLocal = async (eventId, imageUri, backendId) => {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync(
      `SELECT images FROM events WHERE event_id = ?`,
      [eventId]
    );

    let currentImages = [];
    if (result?.length > 0 && result[0].images) {
      currentImages = JSON.parse(result[0].images);
    }
    currentImages.push({ uri: imageUri, backendId });

    await db.runAsync(
      `UPDATE events SET images = ? WHERE event_id = ?`,
      [JSON.stringify(currentImages), eventId]
    );
    console.log('Image added locally:', imageUri);
  } catch (error) {
    console.error('Error adding image locally:', error);
    throw error;
  }
};

export const getImagesLocal = async (eventId) => {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync(
      `SELECT images FROM events WHERE event_id = ?`,
      [eventId]
    );

    if (result?.length > 0) {
      const imagesString = result[0].images;
      const imagesArray = imagesString ? JSON.parse(imagesString) : [];

      console.log('Images retrieved locally for event:', eventId, imagesArray);
      return imagesArray;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting images from local database:', error);
    throw error;
  }
};

export const deleteImageLocal = async (eventId, backendId) => {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync(
      `SELECT images FROM events WHERE event_id = ?`,
      [eventId]
    );
    if (result?.length > 0 && result[0].images) {
      let currentImages = JSON.parse(result[0].images);

      const updatedImages = currentImages.filter((img) => img.backendId !== backendId);

      await db.runAsync(
        `UPDATE events SET images = ? WHERE event_id = ?`,
        [JSON.stringify(updatedImages), eventId]
      );
      console.log('Image removed locally for event:', eventId);
    } else {
      console.log('No images found for the provided event ID');
    }
  } catch (error) {
    console.error('Error deleting image from local database:', error);
    throw error;
  }
};

export const addFileLocal = async (eventId, fileUri) => {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync(
      `SELECT files FROM events WHERE event_id = ?`,
      [eventId]
    );

    if (result?.length > 0) {
      let currentFiles = result[0]?.files;
      currentFiles = currentFiles ? JSON.parse(currentFiles) : [];
      currentFiles.push(fileUri);

      await db.runAsync(
        `UPDATE events SET files = ? WHERE event_id = ?`,
        [JSON.stringify(currentFiles), eventId]
      );
      console.log('File added locally to event:', eventId);
    }
  } catch (error) {
    console.error('Error adding file locally:', error);
    throw error;
  }
};

export const getFilesLocal = async (eventId) => {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync(
      `SELECT files FROM events WHERE event_id = ?`,
      [eventId]
    );

    if (result?.length > 0) {
      const filesString = result[0]?.files;

      const filesArray = filesString ? JSON.parse(filesString) : [];

      console.log('Files retrieved from local database for event:', eventId, filesArray);
      return filesArray;
    } else {
      console.log('No se encontraron archivos para el evento con el ID proporcionado');
      return [];
    }
  } catch (error) {
    console.error('Error getting files from local database:', error);
    throw error;
  }
};

export const deleteFileLocal = async (eventId, filePath) => {
  try {
    const db = await openDatabase();

    const result = await db.getAllAsync(
      `SELECT files FROM events WHERE event_id = ?`,
      [eventId]
    );

    if (result?.length > 0) {
      let currentFiles = result[0]?.files;
      currentFiles = currentFiles ? JSON.parse(currentFiles) : [];
      const updatedFiles = currentFiles.filter(file => file !== filePath);

      await db.runAsync(
        `UPDATE events SET files = ? WHERE event_id = ?`,
        [JSON.stringify(updatedFiles), eventId]
      );

      console.log('File removed locally from event:', eventId);
    } else {
      console.log('No files found for the event in the local database.');
    }
  } catch (error) {
    console.error('Error removing file locally:', error);
    throw error;
  }
};
