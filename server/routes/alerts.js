import express from 'express';
import Alert from '../models/Alert.js';
import Vehicle from '../models/Vehicle.js';
import { queueSMSForDevice } from '../utils/smsQueue.js';

const router = express.Router();

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('vehicleId', 'number owner')
      .sort({ timestamp: -1 });
    
    // Normalize vehicleId to string for frontend
    const normalizedAlerts = alerts.map(alert => {
      const alertObj = alert.toObject();
      if (alertObj.vehicleId && typeof alertObj.vehicleId === 'object') {
        alertObj.vehicleId = alertObj.vehicleId._id.toString();
      } else if (alertObj.vehicleId) {
        alertObj.vehicleId = alertObj.vehicleId.toString();
      }
      return alertObj;
    });
    
    res.json(normalizedAlerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get alert by ID
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate('vehicleId');
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    const alertObj = alert.toObject();
    if (alertObj.vehicleId && typeof alertObj.vehicleId === 'object') {
      alertObj.vehicleId = alertObj.vehicleId._id.toString();
    } else if (alertObj.vehicleId) {
      alertObj.vehicleId = alertObj.vehicleId.toString();
    }
    res.json(alertObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get alerts by vehicle ID
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const alerts = await Alert.find({ vehicleId: req.params.vehicleId })
      .sort({ timestamp: -1 });
    
    // Normalize vehicleId to string
    const normalizedAlerts = alerts.map(alert => {
      const alertObj = alert.toObject();
      if (alertObj.vehicleId && typeof alertObj.vehicleId === 'object') {
        alertObj.vehicleId = alertObj.vehicleId._id.toString();
      } else if (alertObj.vehicleId) {
        alertObj.vehicleId = alertObj.vehicleId.toString();
      }
      return alertObj;
    });
    
    res.json(normalizedAlerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new alert
router.post('/', async (req, res) => {
  try {
    const { vehicleId } = req.body;
    
    // Get vehicle details
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const alertData = {
      ...req.body,
      vehicleNumber: vehicle.number,
      owner: vehicle.owner,
      emissionValue: vehicle.currentEmission,
    };

    const alert = new Alert(alertData);
    const savedAlert = await alert.save();

    // Increment alerts count on vehicle
    await Vehicle.findByIdAndUpdate(vehicleId, { $inc: { alertsCount: 1 } });

    // Queue SMS to be sent when device sends next data
    if (vehicle.phone && vehicle.phone !== '+91 00000 00000') {
      const message = `High emission alert! Your vehicle ${vehicle.number} has emission level of ${vehicle.currentEmission} ppm. Please check your vehicle immediately.`;
      queueSMSForDevice(vehicle.number, vehicle.phone, message);
      console.log(`📩 SMS queued for vehicle ${vehicle.number} (${vehicle.phone})`);
    }

    // Normalize vehicleId to string
    const alertObj = savedAlert.toObject();
    if (alertObj.vehicleId && typeof alertObj.vehicleId === 'object') {
      alertObj.vehicleId = alertObj.vehicleId._id.toString();
    } else if (alertObj.vehicleId) {
      alertObj.vehicleId = alertObj.vehicleId.toString();
    }

    res.status(201).json(alertObj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete alert
router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

