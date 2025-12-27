import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ChevronRight, AlertCircle } from 'lucide-react';
import { CalendarEvent } from '../../types';
import { fetchMock } from '../../utils/mockApi';
import { useNavigate } from 'react-router-dom';
import EventDetailModal from '../events/EventDetailModal';
import { useAuthStore } from '../../stores/authStore';

const UpcomingEventsWidget: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        loadUpcomingEvents();
    }, []);

    const loadUpcomingEvents = async () => {
        try {
            const response = await fetchMock('/api/events');
            if (response && response.data) {
                const allEvents = response.data as unknown as CalendarEvent[];

                // Filter upcoming events (from now to next 7 days)
                const now = new Date();
                const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

                const upcoming = allEvents
                    .filter(event => {
                        const eventDate = new Date(event.start);
                        return eventDate >= now && eventDate <= nextWeek;
                    })
                    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                    .slice(0, 5); // Show max 5 events

                setEvents(upcoming);
            }
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatEventDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Check if today
        if (date.toDateString() === now.toDateString()) {
            return 'Hôm nay';
        }

        // Check if tomorrow
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'Ngày mai';
        }

        // Otherwise show date
        return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: 'numeric',
            month: 'numeric',
        });
    };

    const formatEventTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getEventTypeColor = (type?: string) => {
        switch (type) {
            case 'Họp':
                return 'bg-blue-100 text-blue-700';
            case 'Sự kiện':
                return 'bg-green-100 text-green-700';
            case 'Hoạt động':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedEvent(event);
        setIsDetailModalOpen(true);
    };

    const handleViewAllClick = () => {
        navigate('/admin/events');
    };

    const handleEditEvent = () => {
        setIsDetailModalOpen(false);
        navigate('/admin/events');
    };

    const handleDeleteEvent = async () => {
        setIsDetailModalOpen(false);
        await loadUpcomingEvents();
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Calendar size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Sự kiện sắp tới</h3>
                    </div>
                    <button
                        onClick={handleViewAllClick}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                        Xem tất cả
                        <ChevronRight size={16} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="h-16 bg-gray-100 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Không có sự kiện nào trong 7 ngày tới</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {events.map(event => (
                            <div
                                key={event.id}
                                onClick={(e) => handleEventClick(event, e)}
                                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 text-center min-w-[60px]">
                                        <div className="text-xs font-semibold text-gray-600">
                                            {formatEventDate(event.start)}
                                        </div>
                                        {!event.allDay && (
                                            <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                                                <Clock size={12} />
                                                {formatEventTime(event.start)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                                                {event.title}
                                            </h4>
                                            {event.extendedProps?.type && (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getEventTypeColor(event.extendedProps.type)}`}>
                                                    {event.extendedProps.type}
                                                </span>
                                            )}
                                        </div>

                                        {event.extendedProps?.location && (
                                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                                                <MapPin size={12} />
                                                <span className="truncate">{event.extendedProps.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Event Detail Modal */}
            <EventDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                event={selectedEvent}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                isAdmin={isAdmin}
            />
        </>
    );
};

export default UpcomingEventsWidget;
