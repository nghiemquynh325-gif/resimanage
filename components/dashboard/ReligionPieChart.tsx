import React from 'react';
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

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                    <Church size={18} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-800">Phân bố Tôn giáo</h3>
                    <p className="text-xs text-slate-500">Thống kê theo tôn giáo</p>
                </div>
            </div>

            {/* Horizontal Bar Chart with Stats */}
            <div className="space-y-3">
                {chartData.map((item) => {
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                        <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-700">{item.name}</span>
                                <span className="text-slate-600">{item.value} người ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: item.color
                                    }}
                                />
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

export default ReligionPieChart;
