import Incident from '../models/Incident.js';

export default function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join:admin', () => {
      socket.join('admin_room');
      console.log(`Socket ${socket.id} joined admin_room`);
    });

    socket.on('join:user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined user_${userId}`);
    });

    socket.on('join:incident', (incidentId) => {
      socket.join(`incident_${incidentId}`);
      console.log(`Socket ${socket.id} joined incident_${incidentId}`);
    });

    socket.on('location:update', (data) => {
      // data: { userId, role, location: { lat, lng } }
      // Broadcast to admin room for tracking
      io.to('admin_room').emit('location:updated', data);
    });

    socket.on('chat:send', (data) => {
      // data: { incidentId, message, sender }
      // Emit to incident room
      io.to(`incident_${data.incidentId}`).emit('chat:received', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
