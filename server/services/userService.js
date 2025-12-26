const db = require('./db');

const getProfile = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT u.*, tp.* FROM users u left join trainer_profiles tp on tp.userId=u.id WHERE u.id = ?', [userId], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return reject(new Error('User not found'));
      resolve(results[0]);
    });
  });
};

const updateProfile = (userId, { goal, height, weight }) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE users SET goal = ?, height = ?, weight = ? WHERE id = ?', [goal, height, weight, userId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

module.exports = { getProfile, updateProfile };