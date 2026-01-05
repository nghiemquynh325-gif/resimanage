import React from 'react';
import { X, Calendar, MapPin, FileText, Edit, Trash2, Clock, Tag, Users } from 'lucide-react';
import Modal from '../ui/Modal';
import { CalendarEvent } from '../../types';

interface EventDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: CalendarEvent | null;
    onEdit?: () => void;
    onDelete?: () => void;
    isAdmin?: boolean;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
    isOpen,
    onClose,
    event,
    onEdit,
    onDelete,
    isAdmin = false,
}) => {
    if (!event) return null;

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getEventTypeConfig = (type?: string) => {
        switch (type) {
            case 'Họp':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-200',
                    badge: 'bg-blue-100 text-blue-700 border-blue-300'
                };
            case 'Sự kiện':
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-200',
                    badge: 'bg-green-100 text-green-700 border-green-300'
                };
            case 'Hoạt động':
                return {
                    bg: 'bg-purple-50',
                    text: 'text-purple-700',
                    border: 'border-purple-200',
                    badge: 'bg-purple-100 text-purple-700 border-purple-300'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                    badge: 'bg-gray-100 text-gray-700 border-gray-300'
                };
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa sự kiện "${event.title}" không ? `)) {
            onDelete?.();
        }
    };

    const typeConfig = getEventTypeConfig(event.extendedProps?.type);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết Sự kiện">
            <div className="space-y-4">
                {/* Event Header with gradient background */}
                <div className={`${typeConfig.bg} p - 5 rounded - xl border ${typeConfig.border} `}>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{event.title}</h3>
                    {event.extendedProps?.type && (
                        <span className={`inline - flex items - center gap - 1.5 px - 3 py - 1.5 rounded - full text - sm font - semibold border ${typeConfig.badge} `}>
                            <Tag size={14} />
                            {event.extendedProps.type}
                        </span>
                    )}
                </div>

                {/* Event Details in Cards */}
                <div className="space-y-3">
                    {/* Date & Time Card */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg flex-shrink-0">
                                <Calendar size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Thời gian</p>
                                {event.allDay ? (
                                    <p className="text-base font-medium text-slate-900">
                                        {formatDateTime(event.start).split(',')[1]} - Cả ngày
                                    </p>
                                ) : (
                                    <div>
                                        <p className="text-base font-medium text-slate-900">{formatDateTime(event.start)}</p>
                                        {event.end && event.end !== event.start && (
                                            <p className="text-sm text-slate-600 mt-1.5 flex items-center gap-1.5">
                                                <Clock size={14} />
                                                Đến: {formatTime(event.end)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    {event.extendedProps?.location && (
                        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg flex-shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Địa điểm</p>
                                    <p className="text-base font-medium text-slate-900">{event.extendedProps.location}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description Card */}
                    {event.extendedProps?.description && (
                        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-violet-100 text-violet-600 rounded-lg flex-shrink-0">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Mô tả</p>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {event.extendedProps.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attendees Card */}
                    {event.extendedProps?.attendees && (
                        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-lg flex-shrink-0">
                                    <Users size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Thành phần tham dự</p>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {event.extendedProps.attendees}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-4 border-t border-slate-200">
                    {isAdmin && (
                        <>
                            <button
                                onClick={onEdit}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-sm hover:shadow"
                            >
                                <Edit size={18} />
                                Chỉnh sửa
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors font-medium shadow-sm hover:shadow"
                            >
                                <Trash2 size={18} />
                                Xóa
                            </button>
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className={`${isAdmin ? '' : 'flex-1'} px - 4 py - 2.5 border - 2 border - slate - 300 text - slate - 700 rounded - lg hover: bg - slate - 50 active: bg - slate - 100 transition - colors font - medium`}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EventDetailModal;
