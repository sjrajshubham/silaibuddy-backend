require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketio = require('socket.io');

const authRoutes = require('./routes/auth');
const tailorRoutes = require('./routes/tailor');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/order');
const authExtraRoutes = require('./routes/authExtra');
const uploadRoutes = require('./routes/upload');
const reviewRoutes = require('./routes/review');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tailors', tailorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth-extra', authExtraRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);

// Socket.io for real-time notifications
const tailorSockets = {}; // tailorId -> socketId
io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);
    socket.on('registerTailor', (tailorId) => {
        tailorSockets[tailorId] = socket.id;
    });
    socket.on('disconnect', () => {
        for (const k in tailorSockets) {
            if (tailorSockets[k] === socket.id) delete tailorSockets[k];
        }
    });
});

// expose emit function via app.locals
app.locals.io = io;
app.locals.tailorSockets = tailorSockets;

// Start server without MongoDB
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running without MongoDB on port ${PORT}`);
});
