import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['assigned', 'in-progress', 'completed'],
    default: 'assigned'
  }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
