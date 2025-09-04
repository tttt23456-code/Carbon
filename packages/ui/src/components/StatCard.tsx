import React from 'react';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  change,
  icon,
  className,
}) => {
  const formatNumber = (num: string | number): string => {
    if (typeof num === 'string') return num;
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral'): string => {
    switch (trend) {
      case 'up': return 'text-red-600 bg-red-100';
      case 'down': return 'text-green-600 bg-green-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral'): React.ReactNode => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'neutral':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={clsx('bg-white rounded-lg shadow p-6', className)}>
      <div className="flex items-center">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className={clsx('flex-1', icon && 'ml-4')}>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {formatNumber(value)}
            </p>
            {unit && (
              <span className="ml-2 text-sm text-gray-500">{unit}</span>
            )}
            {change && (
              <span className={clsx(
                'ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                getTrendColor(change.trend)
              )}>
                {getTrendIcon(change.trend)}
                <span className="ml-1">
                  {change.value > 0 ? '+' : ''}{change.value}%
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};