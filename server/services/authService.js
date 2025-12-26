const db = require('./db');
const bcrypt = require('bcrypt');

const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return reject(new Error('Invalid credentials'));

      const user = results[0];
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return reject(new Error('Invalid credentials'));

      resolve({
        id: user.id,
        email: user.email,
        username: user.username,
        goal: user.goal,
        tenantId: user.tenantId,
        role: user.role
      });
    });
  });
};

module.exports = { loginUser };