import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
  missionId: { type: String, required: true, unique: true },
  sosAlert: { type: mongoose.Schema.Types.ObjectId, ref: 'SOSAlert', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [lng, lat]
  },
  address: String,
  status: {
    type: String,
    enum: ['active', 'in-progress', 'resolved', 'cancelled'],
    default: 'active'
  },
  assignedVolunteers: [{
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['assigned', 'accepted', 'travelling', 'reached', 'helping', 'completed'],
      default: 'assigned'
    },
    currentLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date
    },
    eta: String
  }],
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

missionSchema.index({ location: '2dsphere' });

export default mongoose.model('Mission', missionSchema);
