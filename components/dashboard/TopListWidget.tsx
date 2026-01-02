import React from 'react';

interface TopListWidgetProps {
    title: string;
    icon: React.ReactNode;
    data: Array<{ label: string; count: number }>;
    iconBgColor?: string;
    iconColor?: string;
    maxItems?: number;
}

const TopListWidget: React.FC<TopListWidgetProps> = ({
    title,
    icon,
    data,
    iconBgColor = 'bg-indigo-100',
    iconColor = 'text-indigo-600',
    maxItems = 8
}) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    const topItems = data.slice(0, maxItems);
    const othersCount = data.slice(maxItems).reduce((sum, item) => sum + item.count, 0);

    const getPercentage = (count: number) => {
        return total > 0 ? Math.round((count / total) * 100) : 0;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 ${iconBgColor} rounded-lg`}>
                    <div className={iconColor}>{icon}</div>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>

            <div className="space-y-3">
                {topItems.map((item, index) => {
                    const percentage = getPercentage(item.count);
                    return (
                        <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-700">{item.label}</span>
                                <span className="text-slate-600">
                                    {item.count.toLocaleString()} <span className="text-xs text-slate-500">({percentage}%)</span>
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}

                {othersCount > 0 && (
                    <div className="space-y-1 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-500 italic">Khác</span>
                            <span className="text-slate-600">
                                {othersCount.toLocaleString()} <span className="text-xs text-slate-500">({getPercentage(othersCount)}%)</span>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Tổng cộng</span>
                    <span className="font-bold text-slate-800">{total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default TopListWidget;
