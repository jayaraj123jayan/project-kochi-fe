const db = require('./db');
const bcrypt = require('bcrypt');

const createTenant = (name) => {
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO tenants (name) VALUES (?)', [name], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, name });
    });
  });
};

const getTenants = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM tenants', (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getTenantById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM tenants WHERE id = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

const createUser = async (email, password, username, role, tenantId) => {
  return new Promise(async (resolve, reject) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (email, password, username, role, tenantId) VALUES (?, ?, ?, ?, ?)', [email, hashedPassword, username, role, tenantId], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, email, username, role, tenantId });
    });
  });
};

const getUsersByTenant = (tenantId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, email, username, role FROM users WHERE tenantId = ?', [tenantId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, email, username, role, tenantId FROM users', (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = { createTenant, getTenants, getTenantById, createUser, getUsersByTenant, getAllUsers };