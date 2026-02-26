import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  owner: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  registration: {
    type: String,
    required: true,
  },
  currentEmission: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    required: true,
    default: 'low',
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  alertsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;

