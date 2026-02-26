import React from 'react';
import { Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showSearch = true }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAppContext();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
          <div className="text-white font-bold text-xl">EPM</div>
        </div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search vehicles..."
              className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-white text-sm font-medium">{currentUser.name}</div>
              <div className="text-white/60 text-xs">{currentUser.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg hover:bg-white/20 transition-all"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
