import express from 'express';
import Vehicle from '../models/Vehicle.js';
import EmissionRecord from '../models/EmissionRecord.js';
import Alert from '../models/Alert.js';
import { getPendingSMS, clearPendingSMS, queueSMSForDevice } from '../utils/smsQueue.js';

const router = express.Router();

// Receive sensor data from Arduino/ESP32
router.post('/device-data', async (req, res) => {
  try {
    const { device_id, lat, lng, ppm } = req.body;

    // Validate required fields
    if (!device_id || lat === undefined || lng === undefined || ppm === undefined) {
      return res.status(400).json({
        status: 'FAILED',
        reason: 'device_id, lat, lng, and ppm are required'
      });
    }

    console.log('====================================');
    console.log('📡 Sensor Data Received');
    console.log('Device ID:', device_id);
    console.log('Latitude:', lat);
    console.log('Longitude:', lng);
    console.log('PPM:', ppm);
    console.log('Time:', new Date().toLocaleString());
    console.log('====================================');

    // Find or create vehicle using device_id as vehicle number
    let vehicle = await Vehicle.findOne({ number: device_id });

    if (!vehicle) {
      // Create new vehicle if it doesn't exist
      console.log(`Creating new vehicle with device_id: ${device_id}`);
      vehicle = new Vehicle({
        number: device_id,
        owner: `Device ${device_id}`,
        phone: '+91 00000 00000', // Default phone, can be updated later
        registration: new Date().toISOString().split('T')[0],
        currentEmission: ppm,
        status: ppm > 150 ? 'high' : ppm > 100 ? 'moderate' : 'low',
        location: { lat, lng },
        alertsCount: 0,
      });
      await vehicle.save();
      console.log(`✅ Vehicle created: ${device_id}`);
    } else {
      // Update existing vehicle
      // Determine status based on ppm
      let status = 'low';
      if (ppm > 150) {
        status = 'high';
      } else if (ppm > 100) {
        status = 'moderate';
      }

      vehicle.currentEmission = ppm;
      vehicle.status = status;
      vehicle.location = { lat, lng };
      await vehicle.save();
      console.log(`✅ Vehicle updated: ${device_id}`);
    }

    // Create emission record linked to vehicle ObjectId
    const emissionRecord = new EmissionRecord({
      vehicleId: vehicle._id,
      timestamp: new Date(),
      value: ppm,
    });
    await emissionRecord.save();
    console.log(`✅ Emission record saved for vehicle: ${vehicle._id}`);

    // Check if emission is high and create alert if needed
    if (ppm > 150) {
      // Check if alert was already sent recently (within last hour)
      const recentAlert = await Alert.findOne({
        vehicleId: vehicle._id,
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
      });

      if (!recentAlert) {
        const alert = new Alert({
          vehicleId: vehicle._id,
          vehicleNumber: vehicle.number,
          owner: vehicle.owner,
          timestamp: new Date(),
          emissionValue: ppm,
          message: `High emission detected: ${ppm} ppm. Please check your vehicle.`,
        });
        await alert.save();

        // Increment alerts count
        vehicle.alertsCount += 1;
        await vehicle.save();

        console.log(`⚠️ Alert created for high emission: ${ppm} ppm`);
      }
    }

    // Check if there's a pending SMS for this device
    const smsData = getPendingSMS(device_id);
    if (smsData) {
      // Construct final SMS message with current sensor data
      const finalMessage = `
${smsData.message}

Location:
Lat: ${lat}
Lng: ${lng}

PPM: ${ppm}
Time: ${new Date().toLocaleString()}
      `.trim();

      const response = {
        command: 'SEND_SMS',
        phone: smsData.phone,
        message: finalMessage,
      };

      // Clear pending SMS after sending
      clearPendingSMS(device_id);

      console.log(`📩 SMS command sent to device: ${device_id}`);
      return res.json(response);
    }

    // No pending SMS, return normal response
    res.json({
      status: 'SUCCESS',
      command: 'NONE',
      vehicleId: vehicle._id.toString(),
      message: 'Data received and stored successfully',
    });
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({
      status: 'FAILED',
      reason: error.message,
    });
  }
});

// Manual SMS route - queue SMS to be sent when device sends next data
router.post('/manual-sms', async (req, res) => {
  try {
    const { device_id, phone, message } = req.body;

    if (!device_id || !phone || !message) {
      return res.status(400).json({
        status: 'FAILED',
        reason: 'device_id, phone, and message are required',
      });
    }

    // Find vehicle by device_id
    const vehicle = await Vehicle.findOne({ number: device_id });
    if (!vehicle) {
      return res.status(404).json({
        status: 'FAILED',
        reason: `Vehicle with device_id ${device_id} not found`,
      });
    }

    // Store SMS command for this device
    queueSMSForDevice(device_id, phone, message);

    console.log('====================================');
    console.log('📩 Manual SMS Queued');
    console.log('Device ID:', device_id);
    console.log('Phone:', phone);
    console.log('Message:', message);
    console.log('====================================');

    res.json({
      status: 'SUCCESS',
      message: 'SMS command queued. Will be sent when device sends next data.',
    });
  } catch (error) {
    console.error('Error queueing SMS:', error);
    res.status(500).json({
      status: 'FAILED',
      reason: error.message,
    });
  }
});

// Get latest sensor data for a device
router.get('/latest-data/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;
    const vehicle = await Vehicle.findOne({ number: device_id });

    if (!vehicle) {
      return res.status(404).json({
        status: 'FAILED',
        reason: `Vehicle with device_id ${device_id} not found`,
      });
    }

    res.json({
      lat: vehicle.location.lat,
      lng: vehicle.location.lng,
      ppm: vehicle.currentEmission,
      status: vehicle.status,
      timestamp: vehicle.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching latest data:', error);
    res.status(500).json({
      status: 'FAILED',
      reason: error.message,
    });
  }
});

// Get all devices with latest data
router.get('/devices', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().select('number currentEmission location status updatedAt').sort({ updatedAt: -1 });
    
    const devices = vehicles.map(v => ({
      device_id: v.number,
      lat: v.location.lat,
      lng: v.location.lng,
      ppm: v.currentEmission,
      status: v.status,
      timestamp: v.updatedAt,
    }));

    res.json({
      status: 'SUCCESS',
      devices,
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      status: 'FAILED',
      reason: error.message,
    });
  }
});

export default router;

