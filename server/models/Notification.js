import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String },
  read: { type: Boolean, default: false },
  link: { type: String }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
