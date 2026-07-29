import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional for global broadcasts
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['broadcast', 'incident', 'system'], default: 'system' },
  isGlobal: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  link: { type: String },
  relatedSOS: { type: mongoose.Schema.Types.ObjectId, ref: 'SOSAlert' },
  relatedMission: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission' },
  dismissedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
