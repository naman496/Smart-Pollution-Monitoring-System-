# Arduino/ESP32 Sensor Integration Guide

This document explains how the Arduino/ESP32 sensor integration works and how to use it.

## Overview

The system integrates with Arduino/ESP32 devices that send sensor data (PPM, GPS coordinates) to the backend. The device ID from Arduino is used as the vehicle number, and all sensor data is automatically stored in the database and displayed in real-time on the frontend.

## Architecture

### Data Flow

1. **Arduino/ESP32 Device** → Sends sensor data via POST `/api/sensors/device-data`
2. **Backend Server** → Processes data, stores in MongoDB, updates vehicle records
3. **Frontend** → Polls for updates every 5 seconds to display real-time data

### Key Components

- **Sensor Route** (`server/routes/sensors.js`): Handles incoming sensor data
- **SMS Queue** (`server/utils/smsQueue.js`): Manages pending SMS commands
- **Real-time Polling**: Frontend automatically refreshes data every 5 seconds

## API Endpoints

### 1. Receive Sensor Data (Arduino → Backend)

**Endpoint:** `POST /api/sensors/device-data`

**Request Body:**
```json
{
  "device_id": "ESP32-001",
  "lat": 28.6139,
  "lng": 77.2090,
  "ppm": 185
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "command": "NONE" | "SEND_SMS",
  "vehicleId": "...",
  "message": "Data received and stored successfully"
}
```

**If SMS is pending:**
```json
{
  "command": "SEND_SMS",
  "phone": "+91 98765 43210",
  "message": "Your alert message with location and PPM data"
}
```

### 2. Queue Manual SMS

**Endpoint:** `POST /api/sensors/manual-sms`

**Request Body:**
```json
{
  "device_id": "ESP32-001",
  "phone": "+91 98765 43210",
  "message": "Your custom message"
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "SMS command queued. Will be sent when device sends next data."
}
```

### 3. Get Latest Sensor Data

**Endpoint:** `GET /api/sensors/latest-data/:device_id`

**Response:**
```json
{
  "lat": 28.6139,
  "lng": 77.2090,
  "ppm": 185,
  "status": "high",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 4. Get All Devices

**Endpoint:** `GET /api/sensors/devices`

**Response:**
```json
{
  "status": "SUCCESS",
  "devices": [
    {
      "device_id": "ESP32-001",
      "lat": 28.6139,
      "lng": 77.2090,
      "ppm": 185,
      "status": "high",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

## How It Works

### 1. Vehicle Creation

When sensor data is received for a new `device_id`:
- A new vehicle is automatically created
- `device_id` becomes the vehicle number
- Default values are set (can be updated later via UI)

### 2. Data Storage

For each sensor reading:
- Vehicle's `currentEmission` is updated
- Vehicle's `location` (lat/lng) is updated
- Vehicle's `status` is recalculated (low/moderate/high)
- New `EmissionRecord` is created and linked to vehicle's ObjectId
- If emission > 150 ppm, an alert is automatically created

### 3. SMS Integration

When an alert is sent or SMS is queued:
- SMS command is stored in memory queue
- When device sends next sensor data, it receives the SMS command
- Device can then send the SMS via its GSM module
- SMS includes current location and PPM values

### 4. Real-time Updates

- Frontend polls backend every 5 seconds
- Vehicle data, alerts, and challans are automatically refreshed
- Changes in emission, location, or status are immediately visible

## Arduino/ESP32 Code Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";
const char* serverURL = "http://your-server-ip:5000/api/sensors/device-data";

String device_id = "ESP32-001"; // This becomes the vehicle number

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  Serial.println("WiFi connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    // Read sensor values (replace with actual sensor readings)
    float lat = 28.6139;  // GPS latitude
    float lng = 77.2090;  // GPS longitude
    int ppm = analogRead(A0); // Gas sensor reading
    
    // Create JSON payload
    String jsonPayload = "{";
    jsonPayload += "\"device_id\":\"" + device_id + "\",";
    jsonPayload += "\"lat\":" + String(lat, 6) + ",";
    jsonPayload += "\"lng\":" + String(lng, 6) + ",";
    jsonPayload += "\"ppm\":" + String(ppm);
    jsonPayload += "}";
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
      
      // Check if SMS command received
      if (response.indexOf("SEND_SMS") != -1) {
        // Parse and send SMS via GSM module
        // Implementation depends on your GSM module
      }
    }
    
    http.end();
  }
  
  delay(10000); // Send data every 10 seconds
}
```

## Testing

### Test with cURL

```bash
# Send sensor data
curl -X POST http://localhost:5000/api/sensors/device-data \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "TEST-001",
    "lat": 28.6139,
    "lng": 77.2090,
    "ppm": 185
  }'

# Queue SMS
curl -X POST http://localhost:5000/api/sensors/manual-sms \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "TEST-001",
    "phone": "+91 98765 43210",
    "message": "Test alert message"
  }'

# Get latest data
curl http://localhost:5000/api/sensors/latest-data/TEST-001
```

## Frontend Integration

The frontend automatically:
- Polls for vehicle updates every 5 seconds
- Displays real-time emission values
- Updates vehicle locations on maps
- Shows new alerts as they are created
- Reflects status changes (low/moderate/high)

## Notes

- Device ID must be unique (used as vehicle number)
- SMS commands are queued in memory (lost on server restart)
- High emission alerts are created automatically when PPM > 150
- Vehicle phone numbers can be updated via the Settings page
- All emission records are stored with vehicle ObjectId reference

