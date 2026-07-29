import Incident from '../models/Incident.js';
import SOSAlert from '../models/SOSAlert.js';
import Mission from '../models/Mission.js';

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

    // ── SOS & Mission Socket Handlers ──────────────────────────────

    socket.on('sos:volunteer-location', async (data) => {
      // data: { sosId, volunteerId, lat, lng }
      try {
        const alert = await SOSAlert.findById(data.sosId);
        if (alert) {
          const entry = alert.acceptedBy.find(
            v => v.volunteer.toString() === data.volunteerId
          );
          if (entry) {
            entry.currentLocation = {
              lat: data.lat,
              lng: data.lng,
              updatedAt: new Date()
            };
            await alert.save();
          }
        }

        io.to('admin_room').emit('sos:location-updated', {
          sosId: data.sosId,
          volunteerId: data.volunteerId,
          location: { lat: data.lat, lng: data.lng },
          timestamp: new Date()
        });
      } catch (error) {
        console.error('sos:volunteer-location error:', error);
      }
    });

    socket.on('mission:accept', async (data) => {
      // data: { sosId, userId (optional — derived from socket context if needed) }
      try {
        const alert = await SOSAlert.findById(data.sosId);
        if (!alert) return;

        // Check if volunteer already in acceptedBy
        const existing = alert.acceptedBy.find(
          v => v.volunteer.toString() === data.userId
        );

        if (!existing) {
          alert.acceptedBy.push({
            volunteer: data.userId,
            acceptedAt: new Date(),
            status: 'accepted'
          });

          // Also add to legacy assignedVolunteers if not present
          if (!alert.assignedVolunteers.some(v => v.toString() === data.userId)) {
            alert.assignedVolunteers.push(data.userId);
          }

          await alert.save();
        } else {
          existing.status = 'accepted';
          existing.acceptedAt = new Date();
          await alert.save();
        }

        // Update linked mission
        const mission = await Mission.findOne({ sosAlert: data.sosId });
        if (mission) {
          const missionVol = mission.assignedVolunteers.find(
            v => v.volunteer.toString() === data.userId
          );
          if (missionVol) {
            missionVol.status = 'accepted';
          } else {
            mission.assignedVolunteers.push({
              volunteer: data.userId,
              assignedAt: new Date(),
              status: 'accepted'
            });
          }
          if (mission.status === 'active') {
            mission.status = 'in-progress';
          }
          await mission.save();

          const populatedMission = await Mission.findById(mission._id)
            .populate('user', 'name email phone')
            .populate('assignedVolunteers.volunteer', 'name email phone profilePhoto');

          io.emit('mission:updated', { mission: populatedMission });
        }

        io.to('admin_room').emit('sos:volunteer-status-updated', {
          sosId: data.sosId,
          volunteerId: data.userId,
          status: 'accepted',
          timestamp: new Date()
        });
      } catch (error) {
        console.error('mission:accept error:', error);
      }
    });

    socket.on('mission:status-update', async (data) => {
      // data: { missionId, userId, status }
      try {
        const mission = await Mission.findById(data.missionId);
        if (!mission) return;

        const volEntry = mission.assignedVolunteers.find(
          v => v.volunteer.toString() === data.userId
        );

        if (volEntry) {
          volEntry.status = data.status;
        }

        // Update mission-level status
        const hasActive = mission.assignedVolunteers.some(
          v => ['accepted', 'travelling', 'reached', 'helping'].includes(v.status)
        );
        const allCompleted = mission.assignedVolunteers.length > 0 &&
          mission.assignedVolunteers.every(v => v.status === 'completed');

        if (allCompleted) {
          mission.status = 'resolved';
          mission.resolvedAt = new Date();
          mission.resolvedBy = data.userId;
        } else if (hasActive) {
          mission.status = 'in-progress';
        }

        await mission.save();

        // Also update linked SOS alert
        if (mission.sosAlert) {
          const alert = await SOSAlert.findById(mission.sosAlert);
          if (alert) {
            const sosVolEntry = alert.acceptedBy.find(
              v => v.volunteer.toString() === data.userId
            );
            if (sosVolEntry) {
              sosVolEntry.status = data.status;
              await alert.save();
            }
          }
        }

        const populatedMission = await Mission.findById(mission._id)
          .populate('user', 'name email phone')
          .populate('assignedVolunteers.volunteer', 'name email phone profilePhoto');

        io.emit('mission:updated', { mission: populatedMission });
        io.emit('mission:status-changed', {
          missionId: mission._id,
          status: mission.status,
          updatedBy: data.userId
        });

        io.to('admin_room').emit('sos:volunteer-status-updated', {
          sosId: mission.sosAlert,
          volunteerId: data.userId,
          status: data.status,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('mission:status-update error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
