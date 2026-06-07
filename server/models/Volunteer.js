import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  activityStatus: {
    type: String,
    enum: ['available', 'assigned', 'en-route', 'on-site', 'completed'],
    default: 'available'
  },
  assignedIncidents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Incident' }],
  completedCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  availability: { type: Boolean, default: true },
  preferredContact: {
    type: String,
    enum: ['phone', 'email', 'whatsapp'],
    default: 'email'
  },
  emergencyContactName: {
    type: String,
    default: ''
  },
  emergencyContactPhone: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxLength: 200,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Volunteer', volunteerSchema);
