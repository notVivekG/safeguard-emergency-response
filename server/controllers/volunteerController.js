import Volunteer from '../models/Volunteer.js';
import User from '../models/User.js';

export const registerAsVolunteer = async (req, res) => {
  try {
    const { skills } = req.body;
    
    let volunteer = await Volunteer.findOne({ user: req.user._id });
    
    if (volunteer) {
      return res.status(400).json({ message: 'Already registered as volunteer' });
    }

    volunteer = await Volunteer.create({
      user: req.user._id,
      skills: skills || [],
      status: 'pending'
    });

    // We do NOT update role to 'volunteer' until admin approved!

    res.status(201).json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().populate('user', 'name email phone location');
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVolunteerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const volunteer = await Volunteer.findOneAndUpdate(
      { user: req.user._id },
      { activityStatus: status },
      { new: true }
    );
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVolunteerMe = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVolunteerSettings = async (req, res) => {
  try {
    const { availability, skills, preferredContact, emergencyContactName, emergencyContactPhone, bio } = req.body;
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }
    if (volunteer.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    if (availability !== undefined) volunteer.availability = availability;
    if (skills !== undefined) volunteer.skills = skills;
    if (preferredContact !== undefined) volunteer.preferredContact = preferredContact;
    if (emergencyContactName !== undefined) volunteer.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) volunteer.emergencyContactPhone = emergencyContactPhone;
    if (bio !== undefined) volunteer.bio = bio;

    const updated = await volunteer.save();

    // Emit real-time availability change so admin panel updates live
    if (availability !== undefined && req.io) {
      req.io.emit('volunteer:availabilityUpdated', {
        volunteerId: updated._id,
        isAvailable: updated.availability
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
