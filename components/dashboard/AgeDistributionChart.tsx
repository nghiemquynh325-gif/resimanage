
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AgeData {
  name: string;
  count: number;
}

interface AgeDistributionChartProps {
  data: AgeData[];
}

const AgeDistributionChart: React.FC<AgeDistributionChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-50 h-full flex flex-col">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
        Phân bố Độ tuổi
      </h3>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }} 
            />
            <Tooltip 
              cursor={{ fill: '#F1F5F9' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [`${value} người`, 'Số lượng']}
            />
            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
            <Bar 
              dataKey="count" 
              name="Số lượng cư dân" 
              fill="#2563EB" 
              radius={[4, 4, 0, 0]} 
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AgeDistributionChart;
