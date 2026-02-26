import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Send, FileCheck, MapPin, Phone, Calendar } from 'lucide-react';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { VehicleMap } from '../components/VehicleMap';
import { useAppContext } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicles, emissionHistory, alerts, challans, sendAlert, generateChallan } = useAppContext();

  const vehicle = vehicles.find((v) => (v.id || v._id) === id);
  const history = emissionHistory[id || ''] || [];
  const vehicleAlerts = alerts.filter((a) => (a.vehicleId === id) || (a.vehicleId === vehicle?._id));
  const vehicleChallans = challans.filter((c) => (c.vehicleId === id) || (c.vehicleId === vehicle?._id));

  if (!vehicle) {
    return (
      <div className="p-8">
        <Header title="Vehicle Not Found" showSearch={false} />
        <GlassCard className="p-6">
          <p className="text-white text-center">Vehicle not found.</p>
        </GlassCard>
      </div>
    );
  }

  const chartData = history.map((record) => {
    const timestamp = record.timestamp instanceof Date ? record.timestamp : new Date(record.timestamp);
    return {
      date: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(record.value),
    };
  });

  const handleSendAlert = async () => {
    try {
      await sendAlert(vehicle.id || vehicle._id || '');
      toast.success(`SMS alert sent to ${vehicle.number}`);
    } catch (error) {
      toast.error('Failed to send alert');
    }
  };

  const handleGenerateChallan = async () => {
    try {
      await generateChallan(vehicle.id || vehicle._id || '');
      toast.success(`Challan generated for ${vehicle.number}`);
    } catch (error) {
      toast.error('Failed to generate challan');
    }
  };

  // Check if emission is high to enable buttons
  const isEmissionHigh = vehicle.status === 'high' || vehicle.currentEmission > 150;

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <Header title={`Vehicle Details - ${vehicle.number}`} showSearch={false} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Vehicle Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-white/60 text-sm">Vehicle Number</div>
                  <div className="text-white font-bold text-xl">{vehicle.number}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">Owner Name</div>
                  <div className="text-white">{vehicle.owner}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-white/60" />
                  <div className="text-white">{vehicle.phone}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/60" />
                  <div className="text-white/80 text-sm">Registered: {vehicle.registration}</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Current Emission</h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">{vehicle.currentEmission}</div>
                <div className="text-white/60 mb-4">ppm (parts per million)</div>
                <StatusBadge status={vehicle.status} className="text-base py-2 px-4" />
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-white/60 text-sm mb-1">Threshold Limit</div>
                  <div className="text-white font-bold">150 ppm</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">Live Location</h3>
              </div>
              <VehicleMap
                vehicles={[]}
                singleVehicle={vehicle}
                height="300px"
                zoom={15}
              />
              <div className="mt-3 text-white/60 text-sm text-center">
                Lat: {vehicle.location.lat.toFixed(4)}, Lng: {vehicle.location.lng.toFixed(4)}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Emission History</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Alerts History</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {vehicleAlerts.length > 0 ? (
                  vehicleAlerts.map((alert) => (
                    <div
                      key={alert.id || alert._id}
                      className="p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-white font-medium">{alert.message}</div>
                          <div className="text-white/60 text-sm">
                            Emission: {alert.emissionValue} ppm
                          </div>
                        </div>
                        <div className="text-white/60 text-xs">
                          {alert.timestamp instanceof Date 
                            ? alert.timestamp.toLocaleString() 
                            : new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-white/60 text-center py-4">No alerts sent yet</div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Challan History</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {vehicleChallans.length > 0 ? (
                  vehicleChallans.map((challan) => (
                    <div
                      key={challan.id || challan._id}
                      className="p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-white font-medium">{challan.type}</div>
                          <div className="text-white/60 text-sm">
                            Amount: ₹{challan.amount.toLocaleString()}
                          </div>
                          <div className="text-white/60 text-xs mt-1">
                            Issued: {challan.issuedDate instanceof Date 
                              ? challan.issuedDate.toLocaleDateString() 
                              : new Date(challan.issuedDate).toLocaleDateString()}
                          </div>
                        </div>
                        <StatusBadge status={challan.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-white/60 text-center py-4">No challans issued yet</div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mt-6"
      >
        <GlassCard className="p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleSendAlert}
              disabled={!isEmissionHigh}
              className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium transition-all ${
                isEmissionHigh
                  ? 'hover:shadow-lg hover:shadow-blue-500/50 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              title={isEmissionHigh ? 'Send SMS alert to vehicle owner' : 'Only available when emission is high (>150 ppm)'}
            >
              <Send className="w-5 h-5" />
              Send SMS Alert
            </button>
            <button
              onClick={handleGenerateChallan}
              disabled={!isEmissionHigh}
              className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium transition-all ${
                isEmissionHigh
                  ? 'hover:shadow-lg hover:shadow-purple-500/50 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              title={isEmissionHigh ? 'Generate challan for high emission' : 'Only available when emission is high (>150 ppm)'}
            >
              <FileCheck className="w-5 h-5" />
              Generate Challan
            </button>
          </div>
          {!isEmissionHigh && (
            <div className="mt-4 text-center text-white/60 text-sm">
              These actions are only available when vehicle emission is high (&gt;150 ppm)
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};
