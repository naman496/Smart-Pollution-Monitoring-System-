const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API Request:', url, options.method || 'GET');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      console.log('API Response status:', response.status, response.statusText);
      
      // Check if response is JSON
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          const text = await response.text();
          throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}`);
        }
      } else {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response (${contentType}): ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        const errorMessage = data.message || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      // Handle network errors (backend not running, CORS, etc.)
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        console.error('Network Error - Backend server might not be running:', error);
        throw new Error('Cannot connect to server. Please make sure the backend server is running on http://localhost:5000. Run "npm run dev" to start both frontend and backend.');
      }
      
      // Handle JSON parsing errors
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('JSON Parse Error:', error);
        throw new Error('Server returned invalid response. Please check if the backend server is running correctly.');
      }
      
      // Re-throw if it's already our custom error
      if (error.message && !error.message.includes('Cannot connect')) {
        throw error;
      }
      
      console.error('API Error:', error);
      throw error;
    }
  }

  // Vehicle endpoints
  async getVehicles() {
    return this.request('/vehicles');
  }

  async getVehicle(id) {
    return this.request(`/vehicles/${id}`);
  }

  async createVehicle(vehicle) {
    return this.request('/vehicles', {
      method: 'POST',
      body: vehicle,
    });
  }

  async updateVehicle(id, updates) {
    return this.request(`/vehicles/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteVehicle(id) {
    return this.request(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  async updateVehicleEmission(id, currentEmission) {
    return this.request(`/vehicles/${id}/emission`, {
      method: 'PATCH',
      body: { currentEmission },
    });
  }

  async markVehicleInspected(id) {
    return this.request(`/vehicles/${id}/inspect`, {
      method: 'PATCH',
    });
  }

  // Alert endpoints
  async getAlerts() {
    return this.request('/alerts');
  }

  async getAlert(id) {
    return this.request(`/alerts/${id}`);
  }

  async getAlertsByVehicle(vehicleId) {
    return this.request(`/alerts/vehicle/${vehicleId}`);
  }

  async createAlert(alert) {
    return this.request('/alerts', {
      method: 'POST',
      body: alert,
    });
  }

  async deleteAlert(id) {
    return this.request(`/alerts/${id}`, {
      method: 'DELETE',
    });
  }

  // Challan endpoints
  async getChallans() {
    return this.request('/challans');
  }

  async getChallan(id) {
    return this.request(`/challans/${id}`);
  }

  async getChallansByVehicle(vehicleId) {
    return this.request(`/challans/vehicle/${vehicleId}`);
  }

  async createChallan(challan) {
    return this.request('/challans', {
      method: 'POST',
      body: challan,
    });
  }

  async updateChallanStatus(id, status) {
    return this.request(`/challans/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async deleteChallan(id) {
    return this.request(`/challans/${id}`, {
      method: 'DELETE',
    });
  }

  // Emission endpoints
  async getEmissionRecords(vehicleId, limit = 100) {
    return this.request(`/emissions/vehicle/${vehicleId}?limit=${limit}`);
  }

  async createEmissionRecord(record) {
    return this.request('/emissions', {
      method: 'POST',
      body: record,
    });
  }

  // Admin endpoints
  async getAdmins() {
    return this.request('/admins');
  }

  async getAdmin(id) {
    return this.request(`/admins/${id}`);
  }

  async createAdmin(admin) {
    return this.request('/admins', {
      method: 'POST',
      body: admin,
    });
  }

  async updateAdmin(id, updates) {
    return this.request(`/admins/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteAdmin(id) {
    return this.request(`/admins/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth endpoints
  async login(username, password, role) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { username, password, role },
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  // Sensor endpoints
  async sendSensorData(device_id, lat, lng, ppm) {
    return this.request('/sensors/device-data', {
      method: 'POST',
      body: { device_id, lat, lng, ppm },
    });
  }

  async getLatestSensorData(device_id) {
    return this.request(`/sensors/latest-data/${device_id}`);
  }

  async getAllDevices() {
    return this.request('/sensors/devices');
  }

  async queueSMS(device_id, phone, message) {
    return this.request('/sensors/manual-sms', {
      method: 'POST',
      body: { device_id, phone, message },
    });
  }
}

export default new ApiService();

