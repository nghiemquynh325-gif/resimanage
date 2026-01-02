import React from 'react';
import { X } from 'lucide-react';

interface VotingOverviewProps {
    isOpen: boolean;
    onClose: () => void;
    votingStats: Record<string, { total: number; voted: number; percentage: number }>;
}

/**
 * VotingOverview Modal Component
 * 
 * Displays comprehensive voting statistics for all groups (Tổ) in a visual format.
 * Features:
 * - Overall summary statistics
 * - Individual group cards with progress bars
 * - Color-coded percentage indicators
 * - Responsive grid layout
 */
const VotingOverview: React.FC<VotingOverviewProps> = ({ isOpen, onClose, votingStats }) => {
    if (!isOpen) return null;

    // Calculate overall statistics
    const totalVoted = Object.values(votingStats).reduce((acc, s) => acc + (s as any).voted, 0);
    const totalResidents = Object.values(votingStats).reduce((acc, s) => acc + (s as any).total, 0);
    const overallPercentage = totalResidents > 0 ? Math.round((totalVoted / totalResidents) * 100) : 0;
    const totalNotVoted = totalResidents - totalVoted;

    // Filter and sort groups numerically
    const sortedGroups = Object.entries(votingStats)
        .filter(([group, stats]) => group !== 'Không có tổ' && (stats as any).total > 0)
        .sort(([a], [b]) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
        });

    // Get color based on percentage
    const getPercentageColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-700 bg-green-100';
        if (percentage >= 50) return 'text-yellow-700 bg-yellow-100';
        return 'text-red-700 bg-red-100';
    };

    // Get progress bar color
    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Tổng hợp Bỏ phiếu theo Tổ</h2>
                        <p className="text-blue-100 text-sm mt-1">Thống kê chi tiết tình hình bỏ phiếu của các Tổ dân phố</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                        aria-label="Đóng"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Overall Summary */}
                <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                            <div className="text-sm font-medium text-slate-600 mb-1">Tổng số cử tri</div>
                            <div className="text-3xl font-bold text-blue-600">{totalResidents.toLocaleString()}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
                            <div className="text-sm font-medium text-slate-600 mb-1">Đã bỏ phiếu</div>
                            <div className="text-3xl font-bold text-green-600">{totalVoted.toLocaleString()}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                            <div className="text-sm font-medium text-slate-600 mb-1">Chưa bỏ phiếu</div>
                            <div className="text-3xl font-bold text-orange-600">{totalNotVoted.toLocaleString()}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                            <div className="text-sm font-medium text-slate-600 mb-1">Tỷ lệ tham gia</div>
                            <div className="text-3xl font-bold text-indigo-600">{overallPercentage}%</div>
                        </div>
                    </div>
                </div>

                {/* Groups Grid */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sortedGroups.map(([group, stats]) => {
                            const groupStats = stats as { total: number; voted: number; percentage: number };
                            const displayName = group.toLowerCase().startsWith('tổ') ? group : `Tổ ${group}`;
                            const notVoted = groupStats.total - groupStats.voted;

                            return (
                                <div
                                    key={group}
                                    className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow"
                                >
                                    {/* Group Name */}
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-slate-800">{displayName}</h3>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPercentageColor(groupStats.percentage)}`}>
                                            {groupStats.percentage}%
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-3">
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className={`h-full ${getProgressColor(groupStats.percentage)} transition-all duration-500 rounded-full`}
                                                style={{ width: `${groupStats.percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Statistics */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Tổng số:</span>
                                            <span className="font-semibold text-slate-800">{groupStats.total}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-green-600">Đã bỏ:</span>
                                            <span className="font-semibold text-green-700">{groupStats.voted}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-orange-600">Chưa bỏ:</span>
                                            <span className="font-semibold text-orange-700">{notVoted}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {sortedGroups.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-500 text-lg">Không có dữ liệu thống kê</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VotingOverview;
