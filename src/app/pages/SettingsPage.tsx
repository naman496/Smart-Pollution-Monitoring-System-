import React, { useState } from 'react';
import { Settings, Users, Bell, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { useAppContext, AdminUser } from '../context/AppContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { adminUsers, addAdminUser, updateAdminUser, removeAdminUser } = useAppContext();
  const [activeTab, setActiveTab] = useState('users');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
  });

  const handleAddUser = () => {
    if (formData.name && formData.role && formData.email && formData.phone) {
      addAdminUser(formData);
      toast.success('Admin user added successfully');
      setShowAddModal(false);
      setFormData({ name: '', role: '', email: '', phone: '' });
    } else {
      toast.error('Please fill all fields');
    }
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      updateAdminUser(editingUser.id, formData);
      toast.success('Admin user updated successfully');
      setEditingUser(null);
      setFormData({ name: '', role: '', email: '', phone: '' });
    }
  };

  const handleRemoveUser = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      removeAdminUser(id);
      toast.success('Admin user removed successfully');
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone,
    });
  };

  return (
    <div className="p-8">
      <Header title="Settings & Administration" showSearch={false} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex gap-4 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-4 py-3 transition-all ${
                activeTab === 'general'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              General
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-3 transition-all ${
                activeTab === 'users'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              Admin Users
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-4 py-3 transition-all ${
                activeTab === 'notifications'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-4 py-3 transition-all ${
                activeTab === 'logs'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" />
              System Logs
            </button>
          </div>

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="text-white text-sm mb-2 block">Emission Threshold (ppm)</label>
                <input
                  type="number"
                  defaultValue="150"
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Alert Frequency (hours)</label>
                <input
                  type="number"
                  defaultValue="24"
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Auto Challan Generation</label>
                <select className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Enabled</option>
                  <option>Disabled</option>
                </select>
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                Save Settings
              </button>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Admin Users</h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add User
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleRemoveUser(user.id, user.name)}
                            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="font-bold text-white mb-1">{user.name}</div>
                      <div className="text-white/60 text-sm mb-2">{user.role}</div>
                      <div className="text-white/60 text-xs space-y-1">
                        <div>{user.email}</div>
                        <div>{user.phone}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <div>
                  <div className="text-white font-medium">Email Notifications</div>
                  <div className="text-white/60 text-sm">Receive alerts via email</div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <div>
                  <div className="text-white font-medium">SMS Notifications</div>
                  <div className="text-white/60 text-sm">Send SMS to vehicle owners</div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <div>
                  <div className="text-white font-medium">Push Notifications</div>
                  <div className="text-white/60 text-sm">Browser push notifications</div>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[
                { time: '2 hours ago', message: 'Challan generated for DL-01-AB-1234', type: 'info' },
                { time: '4 hours ago', message: 'Alert sent to vehicle TN-04-GH-3456', type: 'warning' },
                { time: '6 hours ago', message: 'System threshold updated to 150 ppm', type: 'success' },
                { time: '8 hours ago', message: 'New admin user added: Ms. Neha Kapoor', type: 'info' },
                { time: '1 day ago', message: 'Database backup completed successfully', type: 'success' },
              ].map((log, index) => (
                <div
                  key={index}
                  className="p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-white text-sm">{log.message}</div>
                    <div className="text-white/60 text-xs whitespace-nowrap ml-4">{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard className="p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingUser ? 'Edit Admin User' : 'Add Admin User'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Monitoring Officer"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@authority.gov.in"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 99887 76655"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={editingUser ? handleUpdateUser : handleAddUser}
                    className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                  >
                    {editingUser ? 'Update' : 'Add'} User
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingUser(null);
                      setFormData({ name: '', role: '', email: '', phone: '' });
                    }}
                    className="flex-1 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
};
