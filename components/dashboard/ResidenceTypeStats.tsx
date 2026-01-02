import React from 'react';
import { Home, Users } from 'lucide-react';

interface ResidenceTypeStatsProps {
    data: Record<string, number>;
}

const ResidenceTypeStats: React.FC<ResidenceTypeStatsProps> = ({ data }) => {
    const total = Object.values(data).reduce((sum, count) => sum + count, 0);

    const getPercentage = (count: number) => {
        return total > 0 ? Math.round((count / total) * 100) : 0;
    };

    const residenceTypes = [
        { key: 'Thường trú', label: 'Thường trú', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
        { key: 'Tạm trú', label: 'Tạm trú', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
        { key: 'Tạm trú có nhà', label: 'Tạm trú có nhà', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
        { key: 'Tạm vắng', label: 'Tạm vắng', color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Home size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Loại hình cư trú</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {residenceTypes.map((type) => {
                    const count = data[type.key] || 0;
                    const percentage = getPercentage(count);

                    return (
                        <div key={type.key} className={`${type.bgColor} rounded-lg p-4 border border-slate-200`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-medium ${type.textColor}`}>{type.label}</span>
                                <span className={`text-xs font-semibold ${type.textColor}`}>{percentage}%</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800 mb-2">{count.toLocaleString()}</div>
                            <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full ${type.color} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                        <Users size={16} />
                        Tổng số cư dân
                    </span>
                    <span className="font-bold text-slate-800">{total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default ResidenceTypeStats;
