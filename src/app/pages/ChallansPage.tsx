import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Download } from 'lucide-react';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const ChallansPage: React.FC = () => {
  const navigate = useNavigate();
  const { challans } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredChallans = challans.filter((challan) => {
    const matchesSearch = challan.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || challan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = (challanId: string, vehicleNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Challan report for ${vehicleNumber} exported`);
  };

  return (
    <div className="p-8">
      <Header title="Challans Dashboard" showSearch={false} />

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
                  placeholder="Search by vehicle number..."
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
              <option value="paid">Paid</option>
              <option value="due">Due</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Vehicle Number</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Challan Type</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Issued Date</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChallans.map((challan, index) => (
                  <motion.tr
                    key={challan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all"
                    onClick={() => navigate(`/vehicle/${challan.vehicleId}`)}
                  >
                    <td className="py-4 px-4 text-white font-medium">{challan.vehicleNumber}</td>
                    <td className="py-4 px-4 text-white/80">{challan.type}</td>
                    <td className="py-4 px-4 text-white/80">
                      {challan.issuedDate.toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-green-400">
                        ₹{challan.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={challan.status} />
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={(e) => handleExport(challan.id, challan.vehicleNumber, e)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredChallans.length === 0 && (
            <div className="text-center py-12 text-white/60">
              No challans found matching your filters.
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-wrap gap-6 justify-center text-center">
              <div>
                <div className="text-2xl font-bold text-white">{challans.length}</div>
                <div className="text-white/60 text-sm">Total Challans</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {challans.filter((c) => c.status === 'paid').length}
                </div>
                <div className="text-white/60 text-sm">Paid</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {challans.filter((c) => c.status === 'due').length}
                </div>
                <div className="text-white/60 text-sm">Due</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  ₹{challans.reduce((sum, c) => sum + c.amount, 0).toLocaleString('en-IN')}
                </div>
                <div className="text-white/60 text-sm">Total Amount</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
