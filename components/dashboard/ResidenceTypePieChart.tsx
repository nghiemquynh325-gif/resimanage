import React from 'react';
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

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200"> {/* Reduced padding from 6 to 4 */}
            {/* Header */}
            <div className="flex items-center gap-2 mb-4"> {/* Reduced gap from 3 to 2, mb from 6 to 4 */}
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Home size={18} /> {/* Reduced from 20 to 18 */}
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-800">Loại hình Cư trú</h3> {/* Reduced from lg to base */}
                    <p className="text-xs text-slate-500">Phân bổ theo loại hình</p> {/* Reduced from sm to xs */}
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
            <div className="mt-3 pt-3 border-t border-slate-100"> {/* Reduced mt and pt from 4 */}
                <p className="text-xs text-slate-600 text-center"> {/* Reduced from sm to xs */}
                    Tổng số: <span className="font-semibold text-slate-800">{total} người</span>
                </p>
            </div>
        </div>
    );
};

export default ResidenceTypePieChart;
