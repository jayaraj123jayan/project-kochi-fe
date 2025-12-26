const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const { loginUser } = require('./services/authService');
const { getProfile, updateProfile } = require('./services/userService');
const { getTrainer, assignTrainer, updateTrainer, createTrainerProfile, updateTrainerProfile, getAllTrainers, followTrainer, unfollowTrainer, addTrainerReview, getTrainerReviews, checkAssignedTrainer, getTrainees } = require('./services/trainerService');
const { getWorkouts, updateWorkouts, getWorkoutPlan } = require('./services/workoutService');
const { saveMessage, getMessages, getConversations, createConversation, findConversation, searchUsers, getConversationParticipants } = require('./services/messageService');
const { createTenant, getTenants, getTenantById, createUser, getUsersByTenant, getAllUsers } = require('./services/adminService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../build')));

// Database connection is handled in services/db.js

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware to check roles
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// Authentication routes
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await loginUser(email, password);
    if (user.role === 'admin' || user.role === 'tenant_admin') {
      return res.status(403).json({ message: 'Please login using the admin page' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, tenantId: user.tenantId }, process.env.JWT_SECRET);
    res.json({ ...user, token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Admin login
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await loginUser(email, password);
    if (user.role !== 'admin' && user.role !== 'tenant_admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, tenantId: user.tenantId }, process.env.JWT_SECRET);
    res.json({ ...user, token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Admin routes
app.post('/admin/tenants', verifyToken, checkRole(['admin']), async (req, res) => {
  const { name } = req.body;
  try {
    const tenant = await createTenant(name);
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/admin/tenants', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const tenants = await getTenants();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/admin/users', verifyToken, async (req, res) => {
  const { email, password, username, role, tenantId } = req.body;
  // Check permissions
  if (req.user.role === 'admin') {
    // Admin can create any role
  } else if (req.user.role === 'tenant_admin' && req.user.tenantId === tenantId && (role === 'customer' || role === 'trainer')) {
    // Tenant admin can create customers and trainers in their tenant
  } else {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  try {
    const user = await createUser(email, password, username, role, tenantId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/admin/users/:tenantId', verifyToken, async (req, res) => {
  const { tenantId } = req.params;
  if (req.user.role === 'admin' || (req.user.role === 'tenant_admin' && req.user.tenantId == tenantId)) {
    try {
      const users = await getUsersByTenant(tenantId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(403).json({ message: 'Insufficient permissions' });
  }
});

app.get('/admin/all-users', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get('/profile', verifyToken, async (req, res) => {
  try {
    const profile = await getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/profile', verifyToken, async (req, res) => {
  const { goal, height, weight } = req.body;
  try {
    await updateProfile(req.user.id, { goal, height, weight });
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/tenant', verifyToken, async (req, res) => {
  try {
    const tenant = await getTenantById(req.user.tenantId);
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/workout-plans', verifyToken, async (req, res) => {
  const { goal } = req.query;
  try {
    const plan = getWorkoutPlan(goal);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trainer routes
app.get('/trainer', verifyToken, async (req, res) => {
  try {
    const trainer = await getTrainer(req.user.id);
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/trainer', verifyToken, async (req, res) => {
  const { trainerId } = req.body;
  try {
    await assignTrainer(req.user.id, trainerId);
    res.json({ message: 'Trainer assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/trainer', verifyToken, async (req, res) => {
  const { instructions } = req.body;
  try {
    await updateTrainer(req.user.id, instructions);
    res.json({ message: 'Trainer updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/trainer/profile', verifyToken, checkRole(['trainer']), async (req, res) => {
  try {
    const profile = await createTrainerProfile(req.user.id, req.body);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/trainer/profile', verifyToken, checkRole(['trainer']), async (req, res) => {
  try {
    await updateTrainerProfile(req.user.id, req.body);
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/trainers', verifyToken, async (req, res) => {
  try {
    const trainers = await getAllTrainers(req.user.tenantId);
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/trainer/follow/:trainerId', verifyToken, async (req, res) => {
  const { trainerId } = req.params;
  try {
    await followTrainer(trainerId, req.user.id);
    res.json({ message: 'Followed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/trainer/follow/:trainerId', verifyToken, async (req, res) => {
  const { trainerId } = req.params;
  try {
    await unfollowTrainer(trainerId, req.user.id);
    res.json({ message: 'Unfollowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/trainer/review/:trainerId', verifyToken, async (req, res) => {
  const { trainerId } = req.params;
  const { rating, comment } = req.body;
  try {
    const review = await addTrainerReview(trainerId, req.user.id, rating, comment);
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/trainer/reviews/:trainerId', verifyToken, async (req, res) => {
  const { trainerId } = req.params;
  try {
    const reviews = await getTrainerReviews(trainerId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Workout routes
app.get('/workouts', verifyToken, async (req, res) => {
  try {
    const workouts = await getWorkouts(req.user.id);
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/workouts', verifyToken, async (req, res) => {
  const { plans } = req.body;
  try {
    await updateWorkouts(req.user.id, plans);
    res.json({ message: 'Workouts updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/trainer/workouts/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { plans } = req.body;
  try {
    const assigned = await checkAssignedTrainer(userId, req.user.id);
    if (!assigned) {
      return res.status(403).json({ message: 'You are not the assigned trainer for this user' });
    }
    await updateWorkouts(userId, plans);
    res.json({ message: 'Workouts updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/trainer/workouts/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const assigned = await checkAssignedTrainer(userId, req.user.id);
    if (!assigned) {
      return res.status(403).json({ message: 'You are not the assigned trainer for this user' });
    }
    const workouts = await getWorkouts(userId);
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/trainer/reviews', verifyToken, async (req, res) => {
  try {
    const reviews = await getTrainerReviews(req.user.id);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Conversation routes
app.get('/conversations', verifyToken, async (req, res) => {
  try {
    const conversations = await getConversations(req.user.id);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/conversations/:id/messages', verifyToken, async (req, res) => {
  const { id } = req.params;
  // Check if user is participant
  try {
    const messages = await getMessages(id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/conversations', verifyToken, async (req, res) => {
  const { participantId } = req.body;
  try {
    let conversationId = await findConversation(req.user.id, participantId);
    if (!conversationId) {
      conversationId = await createConversation([req.user.id, participantId]);
    }
    res.json({ conversationId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/users/search', verifyToken, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const users = await searchUsers(q, req.user.id, req.user.tenantId);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Socket.io for real-time messaging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Authenticate socket connection
  const token = socket.handshake.auth?.token;
  if (!token) {
    socket.disconnect();
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      socket.disconnect();
      return;
    }
    socket.user = user;
    socket.join(`user_${user.id}`); // Join user-specific room
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { conversationId, text, type, filename, senderId } = data;
      // Verify the sender is authenticated and matches the token
      if (!socket.user || socket.user.id !== senderId) {
        return;
      }

      // Save the message and get the full message object
      const message = await saveMessage(conversationId, senderId, text, type, filename);

      // Get conversation participants
      const participants = await getConversationParticipants(conversationId);

      // Send message to all participants in the conversation (including sender)
      participants.forEach(participant => {
        io.to(`user_${participant.id}`).emit('receiveMessage', {
          ...message,
          timestamp: message.timestamp
        });
      });

    } catch (error) {
      console.error('Message save error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});