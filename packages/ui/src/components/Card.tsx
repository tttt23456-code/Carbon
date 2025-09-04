import React from 'react';
import { clsx } from 'clsx';

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className,
  padding = 'md',
  shadow = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };
  
  return (
    <div className={clsx('bg-white rounded-lg', shadowClasses[shadow], className)}>
      {title && (
        <div className={clsx('border-b border-gray-200', padding !== 'none' ? 'px-6 py-4' : 'p-4')}>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className={clsx(paddingClasses[padding])}>
        {children}
      </div>
    </div>
  );
};