
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, loading = false }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
  };

  const theme = colorMap[color] || colorMap.blue;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-50 flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-50 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div>
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${theme.bg} ${theme.text}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;
