import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  emissionValue: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;

