import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Filter, Search, Send } from 'lucide-react';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const VehicleListPage: React.FC = () => {
  const navigate = useNavigate();
  const { vehicles, sendAlert } = useAppContext();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesSearch =
      vehicle.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSendAlert = async (vehicleId: string, vehicleNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await sendAlert(vehicleId);
      toast.success(`SMS alert sent to ${vehicleNumber}`);
    } catch (error) {
      toast.error('Failed to send alert');
    }
  };

  return (
    <div className="p-8">
      <Header title="Vehicle List" showSearch={false} />

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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Vehicle Number</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Owner</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Last Emission</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Alerts Sent</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle, index) => (
                  <motion.tr
                    key={vehicle.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all"
                    onClick={() => navigate(`/vehicle/${vehicle.id || vehicle._id}`)}
                  >
                    <td className="py-4 px-4 text-white font-medium">{vehicle.number}</td>
                    <td className="py-4 px-4 text-white/80">{vehicle.owner}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-bold ${
                          vehicle.status === 'high'
                            ? 'text-red-400'
                            : vehicle.status === 'moderate'
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}
                      >
                        {vehicle.currentEmission} ppm
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={vehicle.status} />
                    </td>
                    <td className="py-4 px-4 text-white/80">{vehicle.alertsCount}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={(e) => handleSendAlert(vehicle.id, vehicle.number, e)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-all"
                      >
                        <Send className="w-4 h-4" />
                        Send SMS
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredVehicles.length === 0 && (
            <div className="text-center py-12 text-white/60">
              No vehicles found matching your filters.
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};
