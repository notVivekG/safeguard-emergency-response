import SOSAlert from '../models/SOSAlert.js';

export const sendSOS = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location coordinates are required' });
    }

    const alert = await SOSAlert.create({
      userId: req.user._id,
      userName: req.user.name,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      address: address || 'Location not available',
      status: 'active'
    });

    const payload = {
      _id: alert._id,
      userId: req.user._id,
      userName: req.user.name,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      address: alert.address,
      timestamp: alert.createdAt
    };

    // Emit to ALL connected clients (volunteers, admins, etc.)
    req.io.emit('sos:alert', payload);
    // Also target admin room specifically
    req.io.to('admin_room').emit('sos:alert', payload);

    res.status(200).json({ message: 'SOS alert sent successfully', alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSOSAlerts = async (req, res) => {
  try {
    const alerts = await SOSAlert.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone');
    res.json(alerts);
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

    // Emit socket event to each assigned volunteer
    for (const volunteerId of volunteerIds) {
      req.io.to(`user_${volunteerId}`).emit('sos:assigned', {
        sosId: alert._id,
        address: alert.address,
        location: alert.location,
        message: 'You have been assigned to an SOS emergency.'
      });
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
