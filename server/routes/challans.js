import express from 'express';
import Challan from '../models/Challan.js';
import Vehicle from '../models/Vehicle.js';
import { queueSMSForDevice } from '../utils/smsQueue.js';

const router = express.Router();

// Get all challans
router.get('/', async (req, res) => {
  try {
    const challans = await Challan.find()
      .populate('vehicleId', 'number owner')
      .sort({ issuedDate: -1 });
    
    // Normalize vehicleId to string for frontend
    const normalizedChallans = challans.map(challan => {
      const challanObj = challan.toObject();
      if (challanObj.vehicleId && typeof challanObj.vehicleId === 'object') {
        challanObj.vehicleId = challanObj.vehicleId._id.toString();
      } else if (challanObj.vehicleId) {
        challanObj.vehicleId = challanObj.vehicleId.toString();
      }
      return challanObj;
    });
    
    res.json(normalizedChallans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get challan by ID
router.get('/:id', async (req, res) => {
  try {
    const challan = await Challan.findById(req.params.id).populate('vehicleId');
    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }
    const challanObj = challan.toObject();
    if (challanObj.vehicleId && typeof challanObj.vehicleId === 'object') {
      challanObj.vehicleId = challanObj.vehicleId._id.toString();
    } else if (challanObj.vehicleId) {
      challanObj.vehicleId = challanObj.vehicleId.toString();
    }
    res.json(challanObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get challans by vehicle ID
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const challans = await Challan.find({ vehicleId: req.params.vehicleId })
      .sort({ issuedDate: -1 });
    
    // Normalize vehicleId to string
    const normalizedChallans = challans.map(challan => {
      const challanObj = challan.toObject();
      if (challanObj.vehicleId && typeof challanObj.vehicleId === 'object') {
        challanObj.vehicleId = challanObj.vehicleId._id.toString();
      } else if (challanObj.vehicleId) {
        challanObj.vehicleId = challanObj.vehicleId.toString();
      }
      return challanObj;
    });
    
    res.json(normalizedChallans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new challan
router.post('/', async (req, res) => {
  try {
    const { vehicleId } = req.body;
    
    // Get vehicle details
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const challanData = {
      ...req.body,
      vehicleNumber: vehicle.number,
    };

    const challan = new Challan(challanData);
    const savedChallan = await challan.save();

    // Queue SMS to be sent when device sends next data
    if (vehicle.phone && vehicle.phone !== '+91 00000 00000') {
      const message = `Challan issued for your vehicle ${vehicle.number}. Amount: ₹${savedChallan.amount}. Type: ${savedChallan.type}. Please pay the challan at your earliest convenience.`;
      queueSMSForDevice(vehicle.number, vehicle.phone, message);
      console.log(`📩 Challan SMS queued for vehicle ${vehicle.number} (${vehicle.phone})`);
    }

    // Normalize vehicleId to string
    const challanObj = savedChallan.toObject();
    if (challanObj.vehicleId && typeof challanObj.vehicleId === 'object') {
      challanObj.vehicleId = challanObj.vehicleId._id.toString();
    } else if (challanObj.vehicleId) {
      challanObj.vehicleId = challanObj.vehicleId.toString();
    }

    res.status(201).json(challanObj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update challan status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const challan = await Challan.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    res.json(challan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete challan
router.delete('/:id', async (req, res) => {
  try {
    const challan = await Challan.findByIdAndDelete(req.params.id);
    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }
    res.json({ message: 'Challan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

