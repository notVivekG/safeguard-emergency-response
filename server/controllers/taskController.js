import Task from '../models/Task.js';
import Incident from '../models/Incident.js';
import Volunteer from '../models/Volunteer.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, incidentId, assignedTo } = req.body;

    if (!title || !incidentId || !assignedTo || assignedTo.length === 0) {
      return res.status(400).json({ message: 'Title, incidentId, and at least one volunteer are required' });
    }

    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      incidentId,
      assignedTo,
      assignedBy: req.user._id,
      status: 'assigned'
    });

    const populated = await Task.findById(task._id)
      .populate('incidentId', 'title type severity address')
      .populate('assignedBy', 'name');

    // Emit task:assigned to each assigned volunteer's private socket room
    for (const userId of assignedTo) {
      req.io.to(`user_${userId}`).emit('task:assigned', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVolunteerTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('incidentId', 'title type severity address')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['assigned', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // FIX 4: Ownership check - verify that req.user._id is in task.assignedTo
    if (!task.assignedTo.includes(req.user._id)) {
      return res.status(403).json({ message: 'You are not assigned to this task' });
    }

    // FIX 4: Only allow status transitions: assigned → in-progress → completed (not backwards)
    const statusOrder = ['assigned', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(task.status);
    const newIndex = statusOrder.indexOf(status);
    if (newIndex < currentIndex) {
      return res.status(400).json({ message: 'Cannot revert task status' });
    }

    task.status = status;
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('incidentId', 'title type severity address')
      .populate('assignedBy', 'name');

    // Notify all assigned volunteers of status change
    for (const userId of task.assignedTo) {
      req.io.to(`user_${userId}`).emit('task:statusUpdated', { taskId: task._id, status });
    }

    // FIX 4 & 5: Emit to admin room with volunteer info
    req.io.to('admin_room').emit('task:statusUpdated', {
      taskId: task._id,
      incidentId: task.incidentId,
      volunteerId: req.user._id,
      volunteerName: req.user.name,
      newStatus: status
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
