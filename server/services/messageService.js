const db = require('./db');

const saveMessage = (conversationId, senderId, text, type, filename) => {
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO messages (conversationId, senderId, text, type, filename) VALUES (?, ?, ?, ?, ?)', [conversationId, senderId, text, type, filename], (err, result) => {
      if (err) return reject(err);
      // Get the saved message with username
      db.query('SELECT m.*, u.username FROM messages m JOIN users u ON m.senderId = u.id WHERE m.id = ?', [result.insertId], (err, messageResult) => {
        if (err) return reject(err);
        resolve(messageResult[0]);
      });
    });
  });
};

const getMessages = (conversationId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT m.*, u.username FROM messages m JOIN users u ON m.senderId = u.id WHERE m.conversationId = ? ORDER BY m.timestamp ASC', [conversationId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getConversations = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.id, c.created_at, 
             GROUP_CONCAT(u.username) as participants,
             (SELECT text FROM messages WHERE conversationId = c.id ORDER BY timestamp DESC LIMIT 1) as lastMessage,
             (SELECT timestamp FROM messages WHERE conversationId = c.id ORDER BY timestamp DESC LIMIT 1) as lastMessageTime
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversationId
      JOIN users u ON cp.userId = u.id
      WHERE c.id IN (SELECT conversationId FROM conversation_participants WHERE userId = ?)
      GROUP BY c.id
      ORDER BY lastMessageTime DESC
    `;
    db.query(query, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const createConversation = (participants) => {
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO conversations () VALUES ()', (err, result) => {
      if (err) return reject(err);
      const conversationId = result.insertId;
      const values = participants.map(userId => [conversationId, userId]);
      db.query('INSERT INTO conversation_participants (conversationId, userId) VALUES ?', [values], (err) => {
        if (err) return reject(err);
        resolve(conversationId);
      });
    });
  });
};

const findConversation = (userId1, userId2) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.id FROM conversations c
      WHERE (SELECT COUNT(*) FROM conversation_participants cp WHERE cp.conversationId = c.id AND cp.userId IN (?, ?)) = 2
      AND (SELECT COUNT(*) FROM conversation_participants cp WHERE cp.conversationId = c.id) = 2
    `;
    db.query(query, [userId1, userId2], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0 ? results[0].id : null);
    });
  });
};

const searchUsers = (query, currentUserId, tenantId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, username, email FROM users WHERE (username LIKE ? OR email LIKE ?) AND id != ? AND tenantId = ? AND role IN ("customer", "trainer")', [`%${query}%`, `%${query}%`, currentUserId, tenantId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getConversationParticipants = (conversationId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT u.id, u.username FROM conversation_participants cp JOIN users u ON cp.userId = u.id WHERE cp.conversationId = ?', [conversationId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = { saveMessage, getMessages, getConversations, createConversation, findConversation, searchUsers, getConversationParticipants };