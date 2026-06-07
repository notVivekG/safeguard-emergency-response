import Incident from '../models/Incident.js';
import Task from '../models/Task.js';
import { sendTopicNotification } from '../services/firebase.js';

export const createIncident = async (req, res) => {
  try {
    const { title, description, type, severity, location, address, aiPrediction } = req.body;

    const savedIncident = await Incident.create({
      title,
      description,
      type,
      severity,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      address,
      reportedBy: req.user._id,
      aiPrediction,
      timeline: [{ action: 'Incident Reported', performedBy: req.user._id }]
    });

    // Emit socket event
    req.io.emit('incident:new', savedIncident);

    // Send Firebase notification to "alerts" topic (or could be nearby based on geo)
    await sendTopicNotification('alerts', `New ${severity.toUpperCase()} Severity Alert`, `${type} reported at ${address}`);

    res.status(201).json(savedIncident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllIncidents = async (req, res) => {
  try {
    const { type, severity, status, lat, lng, radius } = req.query;
    let query = {};
    
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    if (lat && lng) {
      // radius in query is in km, convert to meters (default 10km if not provided)
      const radMeters = radius ? parseFloat(radius) * 1000 : 10000;
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radMeters
        }
      };
    }

    let queryBuilder = Incident.find(query).populate('reportedBy', 'name email');
    
    if (!lat || !lng) {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    const incidents = await queryBuilder;

    // FIX 3: Fetch tasks for each incident with populated assignedTo
    const incidentsWithTasks = await Promise.all(
      incidents.map(async (incident) => {
        const tasks = await Task.find({ incidentId: incident._id })
          .populate('assignedTo', 'name email')
          .sort({ createdAt: -1 });
        return {
          ...incident.toObject(),
          tasks
        };
      })
    );

    res.json(incidentsWithTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('timeline.performedBy', 'name');
      
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIncident = async (req, res) => {
  try {
    const { status } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    incident.status = status || incident.status;
    incident.timeline.push({
      action: `Status updated to ${status}`,
      performedBy: req.user._id
    });

    const updatedIncident = await incident.save();

    req.io.emit('incident:updated', updatedIncident);

    res.json(updatedIncident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyIncidents = async (req, res) => {
  try {
    const { lng, lat, radius = 10000 } = req.query; // radius in meters

    const incidents = await Incident.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    });

    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Not found' });

    if (incident.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
       return res.status(403).json({ message: 'Not authorized' });
    }

    await Incident.deleteOne({ _id: incident._id });
    req.io.emit('incident:deleted', { _id: req.params.id });
    res.json({ message: 'Incident removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upvoteIncident = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if(!incident) return res.status(404).json({ message: 'Not found' });
        
        if(!incident.upvotes.includes(req.user._id)) {
            incident.upvotes.push(req.user._id);
            await incident.save();
        }
        res.json(incident);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
