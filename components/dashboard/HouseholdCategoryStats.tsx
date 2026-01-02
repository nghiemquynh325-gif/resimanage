import React from 'react';
import { Building2, Flag, Heart } from 'lucide-react';

interface HouseholdCategoryStatsProps {
    data: {
        businessHouseholds: number;
        policyHouseholds: number;
        poorHouseholds: number;
        totalHouseholds: number;
    };
}

const HouseholdCategoryStats: React.FC<HouseholdCategoryStatsProps> = ({ data }) => {
    const getPercentage = (count: number) => {
        return data.totalHouseholds > 0 ? Math.round((count / data.totalHouseholds) * 100) : 0;
    };

    const categories = [
        {
            label: 'Hộ kinh doanh',
            count: data.businessHouseholds,
            icon: Building2,
            bgColor: 'bg-blue-50',
            iconBgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-700',
            borderColor: 'border-blue-200'
        },
        {
            label: 'Hộ chính sách',
            count: data.policyHouseholds,
            icon: Flag,
            bgColor: 'bg-purple-50',
            iconBgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
            textColor: 'text-purple-700',
            borderColor: 'border-purple-200'
        },
        {
            label: 'Hộ nghèo/cận nghèo',
            count: data.poorHouseholds,
            icon: Heart,
            bgColor: 'bg-amber-50',
            iconBgColor: 'bg-amber-100',
            iconColor: 'text-amber-600',
            textColor: 'text-amber-700',
            borderColor: 'border-amber-200'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => {
                const Icon = category.icon;
                const percentage = getPercentage(category.count);

                return (
                    <div
                        key={category.label}
                        className={`${category.bgColor} rounded-xl p-6 border ${category.borderColor} shadow-sm hover:shadow-md transition-shadow`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 ${category.iconBgColor} rounded-lg`}>
                                <Icon size={24} className={category.iconColor} />
                            </div>
                            <span className={`text-sm font-semibold ${category.textColor}`}>
                                {percentage}%
                            </span>
                        </div>

                        <h4 className="text-sm font-medium text-slate-600 mb-2">{category.label}</h4>
                        <div className="text-3xl font-bold text-slate-800 mb-3">
                            {category.count.toLocaleString()}
                        </div>

                        <div className="text-xs text-slate-500">
                            Trên tổng số {data.totalHouseholds.toLocaleString()} hộ
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default HouseholdCategoryStats;
