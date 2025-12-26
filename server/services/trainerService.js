const db = require('./db');

const getTrainer = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(`
      SELECT u.id, u.username, u.email, tp.bio, tp.experience_years, tp.specializations, tp.price_per_session, tp.availability
      FROM users u 
      LEFT JOIN trainer_profiles tp ON u.id = tp.userId 
      WHERE u.id = (SELECT assignedTrainerId FROM users WHERE id = ?)
    `, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0 ? results[0] : null);
    });
  });
};

const assignTrainer = (userId, trainerId) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE users SET assignedTrainerId = ? WHERE id = ?', [trainerId, userId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const updateTrainer = (userId, instructions) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE trainers SET instructions = ? WHERE userId = ?', [instructions, userId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const createTrainerProfile = (userId, profileData) => {
  return new Promise((resolve, reject) => {
    const { bio, experience_years, specializations, price_per_session, availability } = profileData;
    db.query('INSERT INTO trainer_profiles (userId, bio, experience_years, specializations, price_per_session, availability) VALUES (?, ?, ?, ?, ?, ?)', 
      [userId, bio, experience_years, specializations, price_per_session, availability], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, ...profileData });
    });
  });
};

const updateTrainerProfile = (userId, profileData) => {
  return new Promise((resolve, reject) => {
    const { bio, experience_years, specializations, price_per_session, availability } = profileData;
    db.query('UPDATE trainer_profiles SET bio = ?, experience_years = ?, specializations = ?, price_per_session = ?, availability = ? WHERE userId = ?', 
      [bio, experience_years, specializations, price_per_session, availability, userId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const getAllTrainers = (tenantId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT u.id, u.username, u.email, tp.bio, tp.experience_years, tp.specializations, tp.price_per_session, tp.availability,
             COUNT(tf.id) as followers_count,
             AVG(tr.rating) as average_rating,
             COUNT(tr.id) as reviews_count
      FROM users u
      LEFT JOIN trainer_profiles tp ON u.id = tp.userId
      LEFT JOIN trainer_followers tf ON u.id = tf.trainerId
      LEFT JOIN trainer_reviews tr ON u.id = tr.trainerId
      WHERE u.role = 'trainer' AND u.tenantId = ?
      GROUP BY u.id
    `;
    db.query(query, [tenantId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const followTrainer = (trainerId, followerId) => {
  return new Promise((resolve, reject) => {
    db.query('INSERT IGNORE INTO trainer_followers (trainerId, followerId) VALUES (?, ?)', [trainerId, followerId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const unfollowTrainer = (trainerId, followerId) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM trainer_followers WHERE trainerId = ? AND followerId = ?', [trainerId, followerId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const addTrainerReview = (trainerId, reviewerId, rating, comment) => {
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO trainer_reviews (trainerId, reviewerId, rating, comment) VALUES (?, ?, ?, ?)', [trainerId, reviewerId, rating, comment], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId });
    });
  });
};

const getTrainerReviews = (trainerId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT tr.*, u.username FROM trainer_reviews tr JOIN users u ON tr.reviewerId = u.id WHERE tr.trainerId = ? ORDER BY tr.created_at DESC', [trainerId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const checkAssignedTrainer = (userId, trainerId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id FROM users WHERE id = ? AND assignedTrainerId = ?', [userId, trainerId], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });
};

const getTrainees = (trainerId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, username, email FROM users WHERE assignedTrainerId = ?', [trainerId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = { getTrainer, assignTrainer, updateTrainer, createTrainerProfile, updateTrainerProfile, getAllTrainers, followTrainer, unfollowTrainer, addTrainerReview, getTrainerReviews, checkAssignedTrainer, getTrainees };