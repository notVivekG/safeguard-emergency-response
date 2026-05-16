import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['fire', 'flood', 'earthquake', 'accident', 'medical', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'investigating', 'resolved'],
    default: 'active'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  media: [{
    url: String,
    publicId: String,
    type: { type: String }
  }],
  aiPrediction: {
    severity: String,
    confidence: Number,
    reasoning: String
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  timeline: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

incidentSchema.index({ location: '2dsphere' });

export default mongoose.model('Incident', incidentSchema);
