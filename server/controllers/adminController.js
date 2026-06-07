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
    const activeVolunteers = await Volunteer.countDocuments({ status: 'approved', activityStatus: 'available' });

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
    req.io.emit('broadcast:new', notification);
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

export const getAllVolunteersAdmin = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().populate('user', 'name email phone');
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer application not found' });
    }
    volunteer.status = 'approved';
    await volunteer.save();

    await User.findByIdAndUpdate(volunteer.user, { role: 'volunteer' });

    // Emit socket events
    req.io.to(`user_${volunteer.user}`).emit('volunteer:statusUpdated', { status: 'approved' });
    req.io.emit('user:roleUpdated', { userId: volunteer.user, role: 'volunteer' });

    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer application not found' });
    }
    volunteer.status = 'rejected';
    await volunteer.save();

    await User.findByIdAndUpdate(volunteer.user, { role: 'user' });

    // Emit socket events
    req.io.to(`user_${volunteer.user}`).emit('volunteer:statusUpdated', { status: 'rejected' });
    req.io.emit('user:roleUpdated', { userId: volunteer.user, role: 'user' });

    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
