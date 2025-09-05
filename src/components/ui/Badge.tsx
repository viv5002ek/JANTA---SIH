import React from 'react';
import { STATUS_COLORS } from '../../constants';

interface BadgeProps {
  status: keyof typeof STATUS_COLORS;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ status, children }) => {
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${STATUS_COLORS[status]}
    `}>
      {children}
    </span>
  );
};