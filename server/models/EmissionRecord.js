import mongoose from 'mongoose';

const emissionRecordSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  value: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

emissionRecordSchema.index({ vehicleId: 1, timestamp: -1 });

const EmissionRecord = mongoose.model('EmissionRecord', emissionRecordSchema);

export default EmissionRecord;

