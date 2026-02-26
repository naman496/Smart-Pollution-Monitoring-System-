import mongoose from 'mongoose';

const challanSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
  issuedDate: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['paid', 'due'],
    default: 'due',
  },
  type: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Challan = mongoose.model('Challan', challanSchema);

export default Challan;

