import express from 'express';
import EmissionRecord from '../models/EmissionRecord.js';

const router = express.Router();

// Get emission records by vehicle ID
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const records = await EmissionRecord.find({ vehicleId: req.params.vehicleId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new emission record
router.post('/', async (req, res) => {
  try {
    const emissionRecord = new EmissionRecord(req.body);
    const savedRecord = await emissionRecord.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all emission records
router.get('/', async (req, res) => {
  try {
    const records = await EmissionRecord.find()
      .populate('vehicleId', 'number')
      .sort({ timestamp: -1 })
      .limit(1000);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

