-- Create database
CREATE DATABASE IF NOT EXISTS project_kochi;
USE project_kochi;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  goal TEXT,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  assignedTrainerId INT,
  tenantId INT,
  role ENUM('admin', 'tenant_admin', 'customer', 'trainer') DEFAULT 'customer',
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE SET NULL,
  FOREIGN KEY (assignedTrainerId) REFERENCES users(id) ON DELETE SET NULL
);

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trainer profiles
CREATE TABLE IF NOT EXISTS trainer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT UNIQUE NOT NULL,
  bio TEXT,
  experience_years INT,
  specializations TEXT,
  price_per_session DECIMAL(10,2),
  availability TEXT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Trainer followers
CREATE TABLE IF NOT EXISTS trainer_followers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trainerId INT NOT NULL,
  followerId INT NOT NULL,
  followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trainerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (trainerId, followerId)
);

-- Trainer reviews
CREATE TABLE IF NOT EXISTS trainer_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trainerId INT NOT NULL,
  reviewerId INT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trainerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewerId) REFERENCES users(id) ON DELETE CASCADE
);

-- Trainers table
CREATE TABLE IF NOT EXISTS trainers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  instructions TEXT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  day VARCHAR(50) NOT NULL,
  exercises TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages table for chat
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversationId INT NOT NULL,
  senderId INT NOT NULL,
  text TEXT,
  type ENUM('text', 'image') DEFAULT 'text',
  filename VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversationId INT NOT NULL,
  userId INT NOT NULL,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_participant (conversationId, userId)
);