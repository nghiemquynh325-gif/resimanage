
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface GenderData {
  name: string;
  value: number;
}

interface GenderDistributionChartProps {
  data: GenderData[];
}

const COLORS = ['#2563EB', '#F97316', '#8B5CF6']; // Blue, Orange, Purple

const GenderDistributionChart: React.FC<GenderDistributionChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-50 h-full flex flex-col">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
        Phân bố Giới tính
      </h3>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} người`, 'Số lượng']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GenderDistributionChart;
