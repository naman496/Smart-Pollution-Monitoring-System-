import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface Vehicle {
  _id?: string;
  id?: string;
  number: string;
  owner: string;
  phone: string;
  registration: string;
  currentEmission: number;
  status: 'low' | 'moderate' | 'high';
  location: { lat: number; lng: number };
  alertsCount: number;
}

export interface Alert {
  _id?: string;
  id?: string;
  vehicleId: string;
  vehicleNumber: string;
  owner: string;
  timestamp: Date | string;
  emissionValue: number;
  message: string;
}

export interface Challan {
  _id?: string;
  id?: string;
  vehicleId: string;
  vehicleNumber: string;
  issuedDate: Date | string;
  amount: number;
  status: 'paid' | 'due';
  type: string;
}

export interface EmissionRecord {
  _id?: string;
  timestamp: Date | string;
  value: number;
}

export interface AdminUser {
  _id?: string;
  id?: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface AppState {
  vehicles: Vehicle[];
  alerts: Alert[];
  challans: Challan[];
  emissionHistory: Record<string, EmissionRecord[]>;
  adminUsers: AdminUser[];
  currentUser: { name: string; role: string } | null;
  loading: boolean;
  sendAlert: (vehicleId: string) => Promise<void>;
  generateChallan: (vehicleId: string) => Promise<void>;
  markInspected: (vehicleId: string) => Promise<void>;
  login: (username: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  addAdminUser: (user: Omit<AdminUser, 'id' | '_id'> & { username: string; password: string }) => Promise<void>;
  updateAdminUser: (id: string, user: Partial<AdminUser>) => Promise<void>;
  removeAdminUser: (id: string) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [emissionHistory, setEmissionHistory] = useState<Record<string, EmissionRecord[]>>({});
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [vehiclesData, alertsData, challansData, adminsData] = await Promise.all([
          api.getVehicles(),
          api.getAlerts(),
          api.getChallans(),
          api.getAdmins(),
        ]);

        // Normalize vehicle IDs
        const normalizedVehicles = vehiclesData.map((v: any) => ({
          ...v,
          id: v._id || v.id,
        }));

        // Normalize alert IDs and timestamps
        const normalizedAlerts = alertsData.map((a: any) => ({
          ...a,
          id: a._id || a.id,
          vehicleId: a.vehicleId?._id ? a.vehicleId._id.toString() : (a.vehicleId?.toString() || a.vehicleId),
          timestamp: a.timestamp ? new Date(a.timestamp) : new Date(),
        }));

        // Normalize challan IDs and dates
        const normalizedChallans = challansData.map((c: any) => ({
          ...c,
          id: c._id || c.id,
          vehicleId: c.vehicleId?._id ? c.vehicleId._id.toString() : (c.vehicleId?.toString() || c.vehicleId),
          issuedDate: c.issuedDate ? new Date(c.issuedDate) : new Date(),
        }));

        // Normalize admin IDs
        const normalizedAdmins = adminsData.map((a: any) => ({
          ...a,
          id: a._id || a.id,
        }));

        setVehicles(normalizedVehicles);
        setAlerts(normalizedAlerts);
        setChallans(normalizedChallans);
        setAdminUsers(normalizedAdmins);

        // Load emission history for each vehicle
        const historyPromises = normalizedVehicles.map(async (vehicle: Vehicle) => {
          try {
            const records = await api.getEmissionRecords(vehicle.id || vehicle._id || '');
            return {
              vehicleId: vehicle.id || vehicle._id || '',
              records: records.map((r: any) => ({
                ...r,
                timestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
              })),
            };
          } catch (error) {
            console.error(`Error loading emission history for vehicle ${vehicle.id}:`, error);
            return { vehicleId: vehicle.id || vehicle._id || '', records: [] };
          }
        });

        const histories = await Promise.all(historyPromises);
        const historyMap: Record<string, EmissionRecord[]> = {};
        histories.forEach(({ vehicleId, records }) => {
          historyMap[vehicleId] = records;
        });
        setEmissionHistory(historyMap);
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to empty arrays on error
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up real-time polling for sensor data updates (every 5 seconds)
    const pollInterval = setInterval(async () => {
      try {
        // Refresh vehicles data to get latest sensor readings
        const vehiclesData = await api.getVehicles();
        const normalizedVehicles = vehiclesData.map((v: any) => ({
          ...v,
          id: v._id || v.id,
        }));

        // Update vehicles if there are changes
        setVehicles(prev => {
          const hasChanges = prev.length !== normalizedVehicles.length ||
            prev.some((v, i) => {
              const newV = normalizedVehicles[i];
              return !newV || 
                v.currentEmission !== newV.currentEmission ||
                v.location.lat !== newV.location.lat ||
                v.location.lng !== newV.location.lng ||
                v.status !== newV.status;
            });

          if (hasChanges) {
            return normalizedVehicles;
          }
          return prev;
        });

        // Refresh alerts and challans periodically
        const [alertsData, challansData] = await Promise.all([
          api.getAlerts(),
          api.getChallans(),
        ]);

        const normalizedAlerts = alertsData.map((a: any) => ({
          ...a,
          id: a._id || a.id,
          vehicleId: a.vehicleId?._id ? a.vehicleId._id.toString() : (a.vehicleId?.toString() || a.vehicleId),
          timestamp: a.timestamp ? new Date(a.timestamp) : new Date(),
        }));

        const normalizedChallans = challansData.map((c: any) => ({
          ...c,
          id: c._id || c.id,
          vehicleId: c.vehicleId?._id ? c.vehicleId._id.toString() : (c.vehicleId?.toString() || c.vehicleId),
          issuedDate: c.issuedDate ? new Date(c.issuedDate) : new Date(),
        }));

        setAlerts(normalizedAlerts);
        setChallans(normalizedChallans);

        // Update emission history for vehicles that have new data
        const historyPromises = normalizedVehicles.map(async (vehicle: Vehicle) => {
          try {
            const records = await api.getEmissionRecords(vehicle.id || vehicle._id || '', 50);
            return {
              vehicleId: vehicle.id || vehicle._id || '',
              records: records.map((r: any) => ({
                ...r,
                timestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
              })),
            };
          } catch (error) {
            return { vehicleId: vehicle.id || vehicle._id || '', records: [] };
          }
        });

        const histories = await Promise.all(historyPromises);
        const historyMap: Record<string, EmissionRecord[]> = {};
        histories.forEach(({ vehicleId, records }) => {
          historyMap[vehicleId] = records;
        });
        setEmissionHistory(historyMap);
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, []);

  const login = async (username: string, password: string, role: string): Promise<boolean> => {
    try {
      const response = await api.login(username, password, role);
      if (response.success && response.user) {
        setCurrentUser({ name: response.user.name, role: response.user.role });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      // Re-throw the error with message so it can be displayed to the user
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const sendAlert = async (vehicleId: string) => {
    try {
      const vehicle = vehicles.find(v => (v.id || v._id) === vehicleId);
      if (!vehicle) return;

      // Create alert in database (this will also queue SMS via the alerts route)
      const newAlert = await api.createAlert({
        vehicleId,
        message: 'SMS alert sent to vehicle owner',
      });

      const normalizedAlert = {
        ...newAlert,
        id: newAlert._id || newAlert.id,
        timestamp: newAlert.timestamp ? new Date(newAlert.timestamp) : new Date(),
      };

      setAlerts(prev => [normalizedAlert, ...prev]);
      
      // Also queue SMS directly if vehicle has a phone number
      if (vehicle.phone && vehicle.phone !== '+91 00000 00000') {
        try {
          await api.queueSMS(
            vehicle.number, // device_id
            vehicle.phone,
            `High emission alert! Your vehicle ${vehicle.number} has emission level of ${vehicle.currentEmission} ppm. Please check your vehicle immediately.`
          );
        } catch (smsError) {
          console.error('Error queueing SMS:', smsError);
        }
      }
      
      // Refresh vehicles to get updated alertsCount
      const updatedVehicles = await api.getVehicles();
      const normalizedVehicles = updatedVehicles.map((v: any) => ({
        ...v,
        id: v._id || v.id,
      }));
      setVehicles(normalizedVehicles);
    } catch (error) {
      console.error('Error sending alert:', error);
    }
  };

  const generateChallan = async (vehicleId: string) => {
    try {
      const vehicle = vehicles.find(v => (v.id || v._id) === vehicleId);
      if (!vehicle) return;

      const newChallan = await api.createChallan({
        vehicleId,
        amount: vehicle.currentEmission > 150 ? 5000 : 3000,
        status: 'due',
        type: vehicle.status === 'high' ? 'High Emission' : 'Moderate Emission',
      });

      const normalizedChallan = {
        ...newChallan,
        id: newChallan._id || newChallan.id,
        issuedDate: newChallan.issuedDate ? new Date(newChallan.issuedDate) : new Date(),
      };

      setChallans(prev => [normalizedChallan, ...prev]);
    } catch (error) {
      console.error('Error generating challan:', error);
    }
  };

  const markInspected = async (vehicleId: string) => {
    try {
      const updatedVehicle = await api.markVehicleInspected(vehicleId);
      const normalizedVehicle = {
        ...updatedVehicle,
        id: updatedVehicle._id || updatedVehicle.id,
      };
      setVehicles(prev => prev.map(v => 
        (v.id || v._id) === vehicleId ? normalizedVehicle : v
      ));
    } catch (error) {
      console.error('Error marking vehicle as inspected:', error);
    }
  };

  const addAdminUser = async (user: Omit<AdminUser, 'id' | '_id'> & { username: string; password: string }) => {
    try {
      const newUser = await api.createAdmin(user);
      const normalizedUser = {
        ...newUser,
        id: newUser._id || newUser.id,
      };
      setAdminUsers(prev => [...prev, normalizedUser]);
    } catch (error) {
      console.error('Error adding admin user:', error);
      throw error;
    }
  };

  const updateAdminUser = async (id: string, updates: Partial<AdminUser>) => {
    try {
      const updatedUser = await api.updateAdmin(id, updates);
      const normalizedUser = {
        ...updatedUser,
        id: updatedUser._id || updatedUser.id,
      };
      setAdminUsers(prev => prev.map(u => (u.id || u._id) === id ? normalizedUser : u));
    } catch (error) {
      console.error('Error updating admin user:', error);
      throw error;
    }
  };

  const removeAdminUser = async (id: string) => {
    try {
      await api.deleteAdmin(id);
      setAdminUsers(prev => prev.filter(u => (u.id || u._id) !== id));
    } catch (error) {
      console.error('Error removing admin user:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      vehicles,
      alerts,
      challans,
      emissionHistory,
      adminUsers,
      currentUser,
      loading,
      sendAlert,
      generateChallan,
      markInspected,
      login,
      logout,
      addAdminUser,
      updateAdminUser,
      removeAdminUser,
    }}>
      {children}
    </AppContext.Provider>
  );
};
