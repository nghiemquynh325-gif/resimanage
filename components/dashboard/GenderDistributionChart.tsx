import React from 'react';
import { Users, User } from 'lucide-react';

interface GenderData {
  name: string;
  value: number;
}

interface GenderDistributionChartProps {
  data: GenderData[];
}

const GENDER_CONFIG: Record<string, { color: string; bgColor: string; icon: any }> = {
  'Nam': { color: '#2563EB', bgColor: 'bg-blue-50', icon: User },
  'Nữ': { color: '#F97316', bgColor: 'bg-orange-50', icon: User },
};

const GenderDistributionChart: React.FC<GenderDistributionChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Users size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Phân bố Giới tính</h3>
          <p className="text-xs text-slate-500">Thống kê theo giới tính</p>
        </div>
      </div>

      {/* Gender Stats with Progress Bars */}
      <div className="space-y-4">
        {data.map((item) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          const config = GENDER_CONFIG[item.name] || { color: '#8B5CF6', bgColor: 'bg-purple-50', icon: User };
          const Icon = config.icon;

          return (
            <div key={item.name} className={`${config.bgColor} rounded - lg p - 3 border border - slate - 200`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={16} style={{ color: config.color }} />
                  <span className="font-semibold text-slate-700 text-sm">{item.name}</span>
                </div>
                <span className="text-xs font-medium text-slate-600">{percentage}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}% `,
                      backgroundColor: config.color
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-800 min-w-[60px] text-right">
                  {item.value.toLocaleString()} người
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-600 text-center">
          Tổng số: <span className="font-semibold text-slate-800">{total} người</span>
        </p>
      </div>
    </div>
  );
};

export default GenderDistributionChart;
