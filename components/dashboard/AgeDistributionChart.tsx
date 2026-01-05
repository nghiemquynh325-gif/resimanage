import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Calendar } from 'lucide-react';

interface AgeData {
  name: string;
  count: number;
}

interface AgeDistributionChartProps {
  data: AgeData[];
}

const AGE_COLORS = ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF'];

const AgeDistributionChart: React.FC<AgeDistributionChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.count));
  const yAxisMax = Math.ceil(maxValue * 1.2 / 1000) * 1000;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
          <Calendar size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Phân bố Độ tuổi</h3>
          <p className="text-xs text-slate-500">Thống kê theo nhóm tuổi</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
              domain={[0, yAxisMax]}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              cursor={{ fill: '#F1F5F9' }}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`${value.toLocaleString()} người`, 'Số lượng']}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            >
              {data.map((entry, index) => (
                <Cell key={`cell - ${index} `} fill={AGE_COLORS[index % AGE_COLORS.length]} />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                style={{ fill: '#475569', fontSize: '11px', fontWeight: 600 }}
                formatter={(value: number) => value.toLocaleString()}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-600 text-center">
          Tổng số: <span className="font-semibold text-slate-800">
            {data.reduce((sum, item) => sum + item.count, 0).toLocaleString()} người
          </span>
        </p>
      </div>
    </div>
  );
};

export default AgeDistributionChart;
