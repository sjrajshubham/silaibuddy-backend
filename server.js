require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketio = require('socket.io');
const authRoutes = require('./routes/auth');
const tailorRoutes = require('./routes/tailor');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/order');
const authExtraRoutes = require('./routes/authExtra');
const uploadRoutes = require('./routes/upload');
const reviewRoutes = require('./routes/review');

const seedAdmin = require('./seed/adminSeed');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tailors', tailorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// Socket.io for real-time notifications
const tailorSockets = {}; // tailorId -> socketId
io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('registerTailor', (tailorId) => {
    tailorSockets[tailorId] = socket.id;
  });
  socket.on('disconnect', () => {
    for (const k in tailorSockets) if (tailorSockets[k] === socket.id) delete tailorSockets[k];
  });
});

// expose emit function via app.locals
app.locals.io = io;
app.locals.tailorSockets = tailorSockets;

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/silaibuddy', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected');
    await seedAdmin(); // seed admin users
    server.listen(PORT, () => console.log('Server running on port', PORT));
  })
  .catch(err => console.error(err));
