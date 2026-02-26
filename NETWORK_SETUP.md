# Network/WiFi Configuration Guide

This guide explains how to update your project when your network or WiFi connection changes.

## 📡 Finding Your Server IP Address

When your network changes, you need to find the new IP address of your server (the computer running the backend).

### Method 1: Check Server Terminal Output

When you start the backend server with `npm run dev` or `npm run server`, the terminal will display:

```
====================================
🚀 Server is running!
====================================
📍 Local:    http://localhost:5000
📍 Network:  http://172.18.2.106:5000
====================================
📡 Sensor API: http://172.18.2.106:5000/api/sensors/device-data
💚 Health Check: http://172.18.2.106:5000/api/health
====================================
```

**Copy the Network IP address** (e.g., `172.18.2.106` in the example above).

### Method 2: Manual IP Check (Windows)

1. Open Command Prompt or PowerShell
2. Run: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter (usually "Wireless LAN adapter Wi-Fi" or "Ethernet adapter")
4. Copy the IP address (e.g., `192.168.1.100`)

### Method 3: Manual IP Check (Mac/Linux)

1. Open Terminal
2. Run: `ifconfig` or `ip addr`
3. Look for your active network interface (usually `wlan0` for WiFi or `eth0` for Ethernet)
4. Find the `inet` address (e.g., `192.168.1.100`)

---

## 🔧 Required Changes

### 1. Arduino/ESP32 Code Update

You need to update the server URL in your Arduino code to point to the new IP address.

#### Find Your Arduino Code File

Look for your Arduino sketch file (usually `.ino` file) that contains the HTTP POST request to send sensor data.

#### Update the Server URL

Find this line in your Arduino code:

```cpp
// OLD - Replace with your new IP
const char* serverUrl = "http://172.18.2.106:5000/api/sensors/device-data";
```

Replace it with:

```cpp
// NEW - Use your current network IP
const char* serverUrl = "http://YOUR_NEW_IP:5000/api/sensors/device-data";
```

**Example:**
- If your new IP is `192.168.1.100`, the URL should be:
  ```cpp
  const char* serverUrl = "http://192.168.1.100:5000/api/sensors/device-data";
  ```

#### Complete Arduino Code Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server configuration - UPDATE THIS WHEN NETWORK CHANGES
const char* serverUrl = "http://YOUR_NEW_IP:5000/api/sensors/device-data";

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Your sensor data
    String jsonData = "{\"device_id\":\"DEV001\",\"lat\":25.341248,\"lng\":81.902824,\"ppm\":225}";
    
    int httpResponseCode = http.POST(jsonData);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error: " + String(httpResponseCode));
    }
    
    http.end();
  }
  
  delay(5000); // Send data every 5 seconds
}
```

---

### 2. Verify Server is Accessible

Before updating Arduino code, verify that your server is accessible from the network:

1. **Check if server is running:**
   ```bash
   npm run dev
   ```
   Or:
   ```bash
   npm run server
   ```

2. **Test from another device on the same network:**
   - Open a browser on your phone or another computer
   - Navigate to: `http://YOUR_NEW_IP:5000/api/health`
   - You should see: `{"status":"OK","message":"Server is running"}`

3. **If connection fails:**
   - Make sure both devices are on the same WiFi network
   - Check Windows Firewall settings (may need to allow port 5000)
   - Verify the server is listening on `0.0.0.0` (which it does by default)

---

### 3. Windows Firewall Configuration (If Needed)

If your Arduino device cannot connect to the server:

1. Open **Windows Defender Firewall**
2. Click **Advanced settings**
3. Click **Inbound Rules** → **New Rule**
4. Select **Port** → **Next**
5. Select **TCP** and enter port **5000** → **Next**
6. Select **Allow the connection** → **Next**
7. Check all profiles → **Next**
8. Name it "Node.js Server" → **Finish**

---

## 🔄 Quick Checklist

When your network/WiFi changes:

- [ ] Find new server IP address (check terminal output or use `ipconfig`)
- [ ] Update Arduino code with new IP address
- [ ] Update WiFi SSID and password in Arduino code (if WiFi changed)
- [ ] Verify server is running and accessible
- [ ] Test connection from Arduino device
- [ ] Check firewall settings if connection fails

---

## 📝 Important Notes

1. **Port Number**: The port `5000` should remain the same unless you change it in `.env` file
2. **Same Network**: Arduino device and server must be on the same WiFi network
3. **Dynamic IP**: If your router assigns dynamic IPs, the server IP may change when you reconnect. Always check the terminal output after restarting the server.
4. **Static IP (Optional)**: To avoid frequent changes, you can configure a static IP for your server computer in your router settings.

---

## 🆘 Troubleshooting

### Arduino cannot connect to server

1. **Check server is running:**
   ```bash
   npm run server
   ```

2. **Verify IP address:**
   - Check terminal output for current IP
   - Make sure Arduino code uses the correct IP

3. **Check network:**
   - Ensure both devices are on the same WiFi network
   - Try pinging the server IP from another device

4. **Check firewall:**
   - Windows Firewall may be blocking port 5000
   - Add firewall rule as described above

### Server shows different IP than expected

- The IP address shown in terminal is your current network IP
- If you're on a different network, the IP will be different
- Always use the IP shown in the terminal output

### Connection works on localhost but not from Arduino

- `localhost` or `127.0.0.1` only works on the same computer
- Arduino devices need the network IP address (e.g., `192.168.1.100`)
- Use the "Network" IP address shown in the terminal, not "Local"

---

## 📞 API Endpoints Reference

Once you have the correct IP address, these are the endpoints your Arduino device will use:

- **Sensor Data**: `http://YOUR_IP:5000/api/sensors/device-data`
- **Health Check**: `http://YOUR_IP:5000/api/health`
- **Latest Data**: `http://YOUR_IP:5000/api/sensors/latest-data/DEVICE_ID`

---

## 🔐 Environment Variables

If you need to change the server port, update the `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Then restart the server for changes to take effect.

---

**Last Updated**: This guide covers network configuration for the Emission Monitoring System with Arduino integration.

