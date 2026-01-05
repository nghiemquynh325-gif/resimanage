import React from 'react';
import { Globe } from 'lucide-react';

interface EthnicityData {
    ethnicity: string;
    count: number;
}

interface EthnicityPieChartProps {
    data: EthnicityData[];
}

// Color palette for ethnicities - using distinct colors
const ETHNICITY_COLORS = [
    '#8b5cf6', // Purple - Kinh
    '#ec4899', // Pink - Tày
    '#f59e0b', // Amber - Mường
    '#06b6d4', // Cyan - Nùng
    '#10b981', // Emerald - Ê đê
    '#f97316', // Orange
    '#3b82f6', // Blue
    '#14b8a6', // Teal
];

const EthnicityPieChart: React.FC<EthnicityPieChartProps> = ({ data }) => {
    // Transform data for Recharts
    const chartData = data.map((item, index) => ({
        name: item.ethnicity,
        value: item.count,
        color: ETHNICITY_COLORS[index % ETHNICITY_COLORS.length]
    }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    // Custom label to show percentage
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200"> {/* Reduced padding */}
            {/* Header */}
            <div className="flex items-center gap-2 mb-4"> {/* Reduced gap and mb */}
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Globe size={18} /> {/* Reduced size */}
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-800">Phân bố Dân tộc</h3> {/* Reduced from lg */}
                    <p className="text-xs text-slate-500">Thống kê theo dân tộc</p> {/* Reduced from sm */}
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

export default EthnicityPieChart;
