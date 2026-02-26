import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, Car, Bell, FileText, Settings } from 'lucide-react';
import { cn } from '../components/ui/utils';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Car, label: 'Vehicles', path: '/vehicles' },
    { icon: Bell, label: 'Alerts', path: '/alerts' },
    { icon: FileText, label: 'Challans', path: '/challans' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white/5 backdrop-blur-lg border-r border-white/10 p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
          <div className="text-white font-bold text-xl">EPM</div>
        </div>
        <div>
          <div className="text-white font-bold">Pollution Monitor</div>
          <div className="text-white/60 text-xs">Authority System</div>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
