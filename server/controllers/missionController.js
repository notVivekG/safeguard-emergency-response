import Mission from '../models/Mission.js';
import SOSAlert from '../models/SOSAlert.js';

export const getMyMissions = async (req, res) => {
  try {
    const missions = await Mission.find({
      'assignedVolunteers.volunteer': req.user._id
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone')
      .populate('assignedVolunteers.volunteer', 'name email phone profilePhoto');

    res.json(missions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMissionById = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedVolunteers.volunteer', 'name email phone profilePhoto');

    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    res.json(mission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMissionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['assigned', 'accepted', 'travelling', 'reached', 'helping', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // Update the volunteer's status within assignedVolunteers
    const volEntry = mission.assignedVolunteers.find(
      v => v.volunteer.toString() === req.user._id.toString()
    );

    if (volEntry) {
      volEntry.status = status;
    }

    // If any volunteer is active, mission is in-progress
    const hasActive = mission.assignedVolunteers.some(
      v => ['accepted', 'travelling', 'reached', 'helping'].includes(v.status)
    );
    const allCompleted = mission.assignedVolunteers.length > 0 &&
      mission.assignedVolunteers.every(v => v.status === 'completed');

    if (allCompleted) {
      mission.status = 'resolved';
      mission.resolvedAt = new Date();
      mission.resolvedBy = req.user._id;
    } else if (hasActive) {
      mission.status = 'in-progress';
    }

    await mission.save();

    // Also update the linked SOS alert's acceptedBy
    if (mission.sosAlert) {
      const alert = await SOSAlert.findById(mission.sosAlert);
      if (alert) {
        const sosVolEntry = alert.acceptedBy.find(
          v => v.volunteer.toString() === req.user._id.toString()
        );
        if (sosVolEntry) {
          sosVolEntry.status = status;
          await alert.save();
        }
      }
    }

    const populatedMission = await Mission.findById(mission._id)
      .populate('user', 'name email phone')
      .populate('assignedVolunteers.volunteer', 'name email phone profilePhoto');

    req.io.emit('mission:status-changed', {
      missionId: mission._id,
      status: mission.status,
      updatedBy: req.user._id
    });
    req.io.emit('mission:updated', { mission: populatedMission });

    // Emit to admin room for SOS tracking
    req.io.to('admin_room').emit('sos:volunteer-status-updated', {
      sosId: mission.sosAlert,
      volunteerId: req.user._id,
      status,
      timestamp: new Date()
    });

    res.json(populatedMission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
