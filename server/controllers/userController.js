import User from '../models/User.js';
import Incident from '../models/Incident.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      if (req.body.location) user.location = req.body.location;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const triggerSOS = async (req, res) => {
  try {
    const { location, address } = req.body;
    
    const incident = await Incident.create({
      title: 'SOS Emergency',
      description: 'Immediate help needed!',
      type: 'medical',
      severity: 'high',
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      address: address || 'Unknown Location',
      reportedBy: req.user._id,
      timeline: [{ action: 'SOS Triggered', performedBy: req.user._id }]
    });

    req.io.emit('sos:alert', incident);

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserReports = async (req, res) => {
  try {
    const reports = await Incident.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveEmergencyContact = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.savedContacts.push(req.body);
        await user.save();
        res.json(user.savedContacts);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}
