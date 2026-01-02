import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Home } from 'lucide-react';

interface ResidenceTypePieChartProps {
    data: Record<string, number>;
}

// Define colors for each residence type
const RESIDENCE_TYPE_COLORS: Record<string, string> = {
    'Thường trú': '#3b82f6',      // Blue
    'Tạm trú': '#22c55e',          // Green
    'Tạm trú có nhà': '#a855f7',   // Purple
    'Tạm vắng': '#f97316',         // Orange
};

const ResidenceTypePieChart: React.FC<ResidenceTypePieChartProps> = ({ data }) => {
    // Convert Record to array for Recharts, maintaining color mapping
    const chartData: Array<{ name: string; value: number; color: string }> = Object.entries(data).map(([type, count]) => ({
        name: type,
        value: count,
        color: RESIDENCE_TYPE_COLORS[type] || '#94a3b8' // Default gray if not found
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
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Home size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Loại hình Cư trú</h3>
                    <p className="text-sm text-slate-500">Phân bổ theo loại hình</p>
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

export default ResidenceTypePieChart;
