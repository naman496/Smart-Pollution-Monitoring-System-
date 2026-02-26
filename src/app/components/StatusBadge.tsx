import React from 'react';
import { cn } from '../components/ui/utils';

interface StatusBadgeProps {
  status: 'low' | 'moderate' | 'high' | 'paid' | 'due';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'moderate':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'paid':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'due':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm',
        getStatusStyles(),
        className
      )}
    >
      {status.toUpperCase()}
    </span>
  );
};
