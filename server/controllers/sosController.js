import SOSAlert from '../models/SOSAlert.js';
import Mission from '../models/Mission.js';
import Notification from '../models/Notification.js';

export const sendSOS = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location coordinates are required' });
    }

    const missionId = `MISSION-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const alert = await SOSAlert.create({
      userId: req.user._id,
      userName: req.user.name,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      address: address || 'Location not available',
      status: 'active',
      missionId
    });

    // Create linked Mission document
    const mission = await Mission.create({
      missionId,
      sosAlert: alert._id,
      user: req.user._id,
      userName: req.user.name,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      address: address || 'Location not available',
      status: 'active'
    });

    // Create persistent notification
    await Notification.create({
      title: '🚨 Emergency SOS',
      body: `${req.user.name} needs immediate help`,
      type: 'incident',
      isGlobal: true,
      relatedSOS: alert._id,
      relatedMission: mission._id,
      link: `/dashboard?sos=${alert._id}`
    });

    const payload = {
      _id: alert._id,
      userId: req.user._id,
      userName: req.user.name,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      address: alert.address,
      timestamp: alert.createdAt,
      missionId
    };

    // Emit to ALL connected clients (volunteers, admins, etc.)
    req.io.emit('sos:alert', payload);
    // Also target admin room specifically
    req.io.to('admin_room').emit('sos:alert', payload);
    // Emit mission created event
    req.io.emit('mission:created', { mission });

    res.status(200).json({ message: 'SOS alert sent successfully', alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSOSAlerts = async (req, res) => {
  try {
    const alerts = await SOSAlert.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .populate('assignedVolunteers', 'name email');
    
    // FIX 2: Filter out nulls from populated fields
    const filteredAlerts = alerts.map(alert => ({
      ...alert.toObject(),
      assignedVolunteers: (alert.assignedVolunteers ?? []).filter(v => v !== null)
    }));
    
    res.json(filteredAlerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolveSOS = async (req, res) => {
  try {
    const alert = await SOSAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }
    alert.status = 'resolved';
    await alert.save();

    // Update related notifications
    await Notification.updateMany(
      { relatedSOS: alert._id },
      { read: true }
    );

    // Notify all clients that this SOS was resolved
    req.io.emit('sos:resolved', { _id: alert._id });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignVolunteersToSOS = async (req, res) => {
  try {
    const { volunteerIds } = req.body;
    const alert = await SOSAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }
    if (!volunteerIds || volunteerIds.length === 0) {
      return res.status(400).json({ message: 'At least one volunteer ID is required' });
    }

    // Add volunteers to assignedVolunteers using $addToSet to avoid duplicates
    alert.assignedVolunteers = [...new Set([...alert.assignedVolunteers, ...volunteerIds])];
    await alert.save();

    // Populate assignedVolunteers with name and email before returning
    const populated = await SOSAlert.findById(alert._id)
      .populate('assignedVolunteers', 'name email')
      .populate('userId', 'name email');

    // FIX 2: Filter out nulls from populated fields
    populated.assignedVolunteers = (populated.assignedVolunteers ?? []).filter(v => v !== null);

    // FIX 2: Verify user exists before emitting socket event
    const User = (await import('../models/User.js')).default;
    for (const volunteerId of volunteerIds) {
      const userExists = await User.findById(volunteerId);
      if (userExists) {
        req.io.to(`user_${volunteerId}`).emit('sos:assigned', {
          sosId: alert._id,
          address: alert.address,
          location: alert.location,
          message: 'You have been assigned to an SOS emergency.'
        });
      }
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearSOS = async (req, res) => {
  try {
    const alert = await SOSAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }
    alert.status = 'resolved';
    alert.clearedBy = req.user._id;
    alert.clearedAt = new Date();
    await alert.save();

    // Update related mission
    await Mission.findOneAndUpdate(
      { sosAlert: alert._id },
      { status: 'resolved', resolvedAt: new Date(), resolvedBy: req.user._id }
    );

    // Update related notifications
    await Notification.updateMany(
      { relatedSOS: alert._id },
      { read: true }
    );

    req.io.emit('sos:cleared', { sosId: alert._id, clearedBy: req.user._id });
    res.json({ message: 'SOS alert cleared', alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkClearSOS = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: 'No SOS IDs provided' });
    }

    await SOSAlert.updateMany(
      { _id: { $in: ids } },
      { status: 'resolved', clearedBy: req.user._id, clearedAt: new Date() }
    );

    // Update related missions
    await Mission.updateMany(
      { sosAlert: { $in: ids } },
      { status: 'resolved', resolvedAt: new Date(), resolvedBy: req.user._id }
    );

    // Update related notifications
    await Notification.updateMany(
      { relatedSOS: { $in: ids } },
      { read: true }
    );

    req.io.emit('sos:bulk-cleared', { ids });
    res.json({ message: `${ids.length} SOS alerts cleared` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSOS = async (req, res) => {
  try {
    const alert = await SOSAlert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }

    // Delete related mission and notifications
    await Mission.deleteMany({ sosAlert: req.params.id });
    await Notification.deleteMany({ relatedSOS: req.params.id });

    req.io.emit('sos:deleted', { sosId: req.params.id });
    res.json({ message: 'SOS alert deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVolunteerStatus = async (req, res) => {
  try {
    const { status, location } = req.body;
    const validStatuses = ['assigned', 'accepted', 'travelling', 'reached', 'helping', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const alert = await SOSAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }

    const volunteerEntry = alert.acceptedBy.find(
      v => v.volunteer.toString() === req.user._id.toString()
    );

    if (volunteerEntry) {
      volunteerEntry.status = status;
      if (location) {
        volunteerEntry.currentLocation = {
          lat: location.lat,
          lng: location.lng,
          updatedAt: new Date()
        };
      }
    } else {
      // Add new entry if volunteer not yet in acceptedBy
      alert.acceptedBy.push({
        volunteer: req.user._id,
        acceptedAt: new Date(),
        status,
        currentLocation: location ? { lat: location.lat, lng: location.lng, updatedAt: new Date() } : undefined
      });
    }

    await alert.save();

    // Update mission too
    await Mission.findOneAndUpdate(
      { sosAlert: alert._id, 'assignedVolunteers.volunteer': req.user._id },
      { $set: { 'assignedVolunteers.$.status': status } }
    );

    const eventPayload = {
      sosId: alert._id,
      volunteerId: req.user._id,
      status,
      timestamp: new Date()
    };

    req.io.to('admin_room').emit('sos:volunteer-status-updated', eventPayload);
    req.io.to(`user_${req.user._id}`).emit('sos:volunteer-status-updated', eventPayload);

    res.json({ message: 'Volunteer status updated', alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMissionBySOS = async (req, res) => {
  try {
    let mission = await Mission.findOne({ sosAlert: req.params.id })
      .populate('user', 'name email phone')
      .populate('assignedVolunteers.volunteer', 'name email phone profilePhoto');

    if (!mission) {
      // Create mission if it doesn't exist (for legacy SOS alerts)
      const alert = await SOSAlert.findById(req.params.id).populate('userId', 'name');
      if (!alert) {
        return res.status(404).json({ message: 'SOS alert not found' });
      }

      const missionId = `MISSION-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      mission = await Mission.create({
        missionId,
        sosAlert: alert._id,
        user: alert.userId._id || alert.userId,
        userName: alert.userName,
        location: alert.location,
        address: alert.address,
        status: alert.status === 'resolved' ? 'resolved' : 'active'
      });

      alert.missionId = missionId;
      await alert.save();

      mission = await Mission.findById(mission._id)
        .populate('user', 'name email phone')
        .populate('assignedVolunteers.volunteer', 'name email phone profilePhoto');
    }

    res.json(mission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVolunteerLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location coordinates required' });
    }

    const alert = await SOSAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }

    const volunteerEntry = alert.acceptedBy.find(
      v => v.volunteer.toString() === req.user._id.toString()
    );

    if (volunteerEntry) {
      volunteerEntry.currentLocation = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        updatedAt: new Date()
      };
      await alert.save();
    }

    req.io.to('admin_room').emit('sos:location-updated', {
      sosId: alert._id,
      volunteerId: req.user._id,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      timestamp: new Date()
    });

    res.json({ message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
