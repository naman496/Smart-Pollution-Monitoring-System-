import React from 'react';
import { useNavigate } from 'react-router';
import { Car, Bell, FileText, AlertTriangle, Send, FileCheck } from 'lucide-react';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { VehicleMap } from '../components/VehicleMap';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { vehicles, alerts, challans, sendAlert, generateChallan } = useAppContext();

  const totalVehicles = vehicles.length;
  const exceedThreshold = vehicles.filter(v => v.status === 'high').length;
  const alertsToday = alerts.filter(a => {
    const today = new Date();
    const alertDate = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
    return alertDate.toDateString() === today.toDateString();
  }).length;
  const challansGenerated = challans.length;

  const violatingVehicles = vehicles.filter(v => v.status === 'high');

  const handleSendAlert = async (vehicleId: string, vehicleNumber: string) => {
    try {
      await sendAlert(vehicleId);
      toast.success(`SMS alert sent to ${vehicleNumber}`);
    } catch (error) {
      toast.error('Failed to send alert');
    }
  };

  const handleGenerateChallan = async (vehicleId: string, vehicleNumber: string) => {
    try {
      await generateChallan(vehicleId);
      toast.success(`Challan generated for ${vehicleNumber}`);
    } catch (error) {
      toast.error('Failed to generate challan');
    }
  };

  return (
    <div className="p-8">
      <Header title="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Vehicles Monitored"
          value={totalVehicles}
          icon={Car}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Exceed Threshold Today"
          value={exceedThreshold}
          icon={AlertTriangle}
          gradient="from-red-500 to-orange-500"
        />
        <StatCard
          title="Alerts Sent Today"
          value={alertsToday}
          icon={Bell}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Challans Generated"
          value={challansGenerated}
          icon={FileText}
          gradient="from-green-500 to-teal-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Live Vehicle Map</h2>
            <VehicleMap
              vehicles={vehicles}
              height="400px"
              zoom={12}
              onVehicleClick={(vehicleId) => navigate(`/vehicle/${vehicleId}`)}
            />
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-white/70">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-white/70">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-white/70">High</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Vehicles Exceeding Threshold</h2>
              <button
                onClick={() => navigate('/alerts')}
                className="text-blue-400 text-sm hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {violatingVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => navigate(`/vehicle/${vehicle.id || vehicle._id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-white">{vehicle.number}</div>
                      <div className="text-white/60 text-sm">{vehicle.owner}</div>
                    </div>
                    <StatusBadge status={vehicle.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-white/80 text-sm">
                      Emission: <span className="font-bold text-red-400">{vehicle.currentEmission} ppm</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const vehicleId = vehicle.id || vehicle._id || '';
                          handleSendAlert(vehicleId, vehicle.number);
                        }}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all"
                        title="Send SMS"
                      >
                        <Send className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const vehicleId = vehicle.id || vehicle._id || '';
                          handleGenerateChallan(vehicleId, vehicle.number);
                        }}
                        className="p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-all"
                        title="Generate Challan"
                      >
                        <FileCheck className="w-4 h-4 text-purple-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
