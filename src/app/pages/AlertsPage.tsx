import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Send, Clock } from 'lucide-react';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, sendAlert, vehicles } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [alertFilter, setAlertFilter] = useState<string>('all');

  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      alertFilter === 'all' ||
      (alertFilter === 'high' && alert.emissionValue > 150) ||
      (alertFilter === 'moderate' && alert.emissionValue > 80 && alert.emissionValue <= 150) ||
      (alertFilter === 'low' && alert.emissionValue <= 80);
    
    return matchesSearch && matchesFilter;
  });

  const handleSendAlert = (vehicleId: string, vehicleNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sendAlert(vehicleId);
    toast.success(`SMS alert sent to ${vehicleNumber}`);
  };

  return (
    <div className="p-8">
      <Header title="Alerts Dashboard" showSearch={false} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by vehicle number or owner..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="high">High ({'>'}150 ppm)</option>
              <option value="moderate">Moderate (80-150 ppm)</option>
              <option value="low">Low ({'<'}80 ppm)</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Vehicle Number</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Owner</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Emission Value</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Time Since Alert</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert, index) => {
                  const vehicle = vehicles.find(v => v.id === alert.vehicleId);
                  const status = alert.emissionValue > 150 ? 'high' : alert.emissionValue > 80 ? 'moderate' : 'low';
                  
                  return (
                    <motion.tr
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all"
                      onClick={() => navigate(`/vehicle/${alert.vehicleId}`)}
                    >
                      <td className="py-4 px-4 text-white font-medium">{alert.vehicleNumber}</td>
                      <td className="py-4 px-4 text-white/80">{alert.owner}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-bold ${
                            status === 'high'
                              ? 'text-red-400'
                              : status === 'moderate'
                              ? 'text-yellow-400'
                              : 'text-green-400'
                          }`}
                        >
                          {alert.emissionValue} ppm
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-white/60">
                          <Clock className="w-4 h-4" />
                          <span>{getTimeSince(alert.timestamp)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-4 px-4">
                        {vehicle && (
                          <button
                            onClick={(e) => handleSendAlert(vehicle.id, vehicle.number, e)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-all"
                          >
                            <Send className="w-4 h-4" />
                            Send SMS
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12 text-white/60">
              No alerts found matching your filters.
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};