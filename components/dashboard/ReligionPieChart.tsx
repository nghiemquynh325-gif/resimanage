import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Church } from 'lucide-react';

interface ReligionData {
    religion: string;
    count: number;
}

interface ReligionPieChartProps {
    data: ReligionData[];
}

// Color palette for religions - using distinct colors
const RELIGION_COLORS = [
    '#8b5cf6', // Purple - Không
    '#ec4899', // Pink - Thiên chúa
    '#f59e0b', // Amber - Phật Giáo
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f97316', // Orange
    '#3b82f6', // Blue
    '#14b8a6', // Teal
];

const ReligionPieChart: React.FC<ReligionPieChartProps> = ({ data }) => {
    // Transform data for Recharts
    const chartData = data.map((item, index) => ({
        name: item.religion,
        value: item.count,
        color: RELIGION_COLORS[index % RELIGION_COLORS.length]
    }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    // Custom label to show percentage
    const renderLabel = (entry: any) => {
        const percent = ((entry.value / total) * 100).toFixed(1);
        return `${percent}%`;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                    <Church size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Phân bố Tôn giáo</h3>
                    <p className="text-sm text-slate-500">Thống kê theo tôn giáo</p>
                </div>
            </div>

            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [`${value} người`, 'Số lượng']}
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px 12px'
                        }}
                    />
                    <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconType="circle"
                        formatter={(value, entry: any) => {
                            const count = entry.payload.value;
                            const percent = ((count / total) * 100).toFixed(1);
                            return `${value}: ${count} người (${percent}%)`;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-600">
                    Tổng số: <span className="font-semibold text-slate-800">{total} người</span>
                </p>
            </div>
        </div>
    );
};

export default ReligionPieChart;
