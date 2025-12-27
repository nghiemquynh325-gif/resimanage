import React from 'react';
import { X, Calendar, MapPin, FileText, Edit, Trash2, Clock, Tag } from 'lucide-react';
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

    const getEventTypeColor = (type?: string) => {
        switch (type) {
            case 'Họp':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Sự kiện':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Hoạt động':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa sự kiện "${event.title}" không?`)) {
            onDelete?.();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết Sự kiện">
            <div className="space-y-6">
                {/* Event Header */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
                            {event.extendedProps?.type && (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getEventTypeColor(event.extendedProps.type)}`}>
                                    <Tag size={14} />
                                    {event.extendedProps.type}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                    {/* Date & Time */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Calendar size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Thời gian</p>
                            {event.allDay ? (
                                <p className="text-gray-900">
                                    {formatDateTime(event.start).split(',')[1]} - Cả ngày
                                </p>
                            ) : (
                                <div className="text-gray-900">
                                    <p className="font-medium">{formatDateTime(event.start)}</p>
                                    {event.end && event.end !== event.start && (
                                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                            <Clock size={14} />
                                            Đến: {formatTime(event.end)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    {event.extendedProps?.location && (
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <MapPin size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Địa điểm</p>
                                <p className="text-gray-900">{event.extendedProps.location}</p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {event.extendedProps?.description && (
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Mô tả</p>
                                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    {event.extendedProps.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Attendees */}
                    {event.extendedProps?.attendees && (
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Thành phần tham dự</p>
                                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    {event.extendedProps.attendees}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {isAdmin && (
                        <>
                            <button
                                onClick={onEdit}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Edit size={18} />
                                Chỉnh sửa
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Trash2 size={18} />
                                Xóa
                            </button>
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className={`${isAdmin ? '' : 'flex-1'} px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors`}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EventDetailModal;
