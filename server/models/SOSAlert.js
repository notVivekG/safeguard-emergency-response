import mongoose from 'mongoose';

const sosAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: { type: String, default: '' },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  },
  assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }]
}, { timestamps: true });

sosAlertSchema.index({ location: '2dsphere' });

export default mongoose.model('SOSAlert', sosAlertSchema);
