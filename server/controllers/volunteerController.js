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
      skills: skills || []
    });

    await User.findByIdAndUpdate(req.user._id, { role: 'volunteer' });

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
      { status },
      { new: true }
    );
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
