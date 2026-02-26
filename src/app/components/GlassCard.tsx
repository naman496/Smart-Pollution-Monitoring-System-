import React from 'react';
import { cn } from '../components/ui/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, onClick }) => {
  return (
    <div
      className={cn(
        'bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl',
        onClick && 'cursor-pointer hover:bg-white/15 transition-all',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
