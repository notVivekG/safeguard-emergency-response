import Incident from '../models/Incident.js';
import User from '../models/User.js';
import Volunteer from '../models/Volunteer.js';
import Notification from '../models/Notification.js';
import { sendTopicNotification } from '../services/firebase.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalIncidents = await Incident.countDocuments();
    const activeIncidents = await Incident.countDocuments({ status: 'active' });
    const resolvedIncidents = await Incident.countDocuments({ status: 'resolved' });
    const totalUsers = await User.countDocuments();
    const activeVolunteers = await Volunteer.countDocuments({ status: 'available' });

    res.json({
      totalIncidents,
      activeIncidents,
      resolvedIncidents,
      totalUsers,
      activeVolunteers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = req.body.role || user.role;
      const updatedUser = await user.save();
      // Notify affected client in real time
      req.io.emit('user:roleUpdated', { userId: updatedUser._id, role: updatedUser.role });
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const broadcastNotification = async (req, res) => {
  try {
    const { title, body, message } = req.body;
    const bodyText = body || message;
    if (!title || !bodyText) {
      return res.status(400).json({ message: 'Title and body are required' });
    }
    // Save to DB
    const notification = await Notification.create({
      title,
      body: bodyText,
      type: 'broadcast',
      isGlobal: true
    });
    // Emit to ALL connected socket clients instantly
    req.io.emit('broadcast:new', {
      id: notification._id,
      title,
      body: bodyText,
      createdAt: notification.createdAt
    });
    // Also send Firebase push
    await sendTopicNotification('alerts', title, bodyText).catch(() => {});
    res.status(201).json({ message: 'Broadcast sent', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const exportIncidentsCSV = async (req, res) => {
  try {
    const incidents = await Incident.find({}).populate('reportedBy', 'name');
    
    let csv = 'ID,Title,Type,Severity,Status,Reporter,Date\n';
    incidents.forEach(inc => {
      csv += `${inc._id},"${inc.title}",${inc.type},${inc.severity},${inc.status},"${inc.reportedBy?.name || 'Unknown'}",${inc.createdAt}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('incidents.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
