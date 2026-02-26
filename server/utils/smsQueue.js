// SMS Queue utility for managing pending SMS commands
// This is shared between sensor routes and alert routes

const pendingSMS = new Map();

export const queueSMSForDevice = (device_id, phone, message) => {
  pendingSMS.set(device_id, {
    phone,
    message,
    timestamp: new Date(),
  });
  console.log(`📩 SMS queued for device: ${device_id}`);
};

export const getPendingSMS = (device_id) => {
  return pendingSMS.get(device_id);
};

export const clearPendingSMS = (device_id) => {
  pendingSMS.delete(device_id);
};

export default {
  queueSMSForDevice,
  getPendingSMS,
  clearPendingSMS,
};

