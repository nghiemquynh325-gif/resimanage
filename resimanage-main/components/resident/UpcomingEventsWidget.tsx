import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { CalendarEvent } from '../../types';
import { fetchMock } from '../../utils/mockApi';

const UpcomingEventsWidget: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetchMock('/api/events/upcoming');
        if (response && response.data) {
          setEvents(response.data as unknown as CalendarEvent[]);
        }
      } catch (err) {
        setError('Không thể tải sự kiện');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: `Tháng ${date.getMonth() + 1}`,
      time: new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(date)
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
        <h3 className="text-lg font-bold text-slate-800">Sự kiện sắp tới</h3>
        <Calendar size={18} className="text-blue-600" />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Skeleton Loading
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-lg shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                <div className="h-2 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-2">{error}</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Không có sự kiện nào sắp diễn ra.</p>
        ) : (
          events.map(event => {
            const dateInfo = formatDate(event.start);
            return (
              <div key={event.id} className="flex gap-3 group cursor-pointer">
                <div className="bg-blue-50 text-blue-700 rounded-lg p-2 text-center w-14 shrink-0 flex flex-col items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <span className="text-[10px] font-bold uppercase leading-none mb-1">{dateInfo.month}</span>
                  <span className="text-xl font-bold leading-none">{dateInfo.day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors" title={event.title}>
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={12} />
                      <span>{dateInfo.time}</span>
                    </div>
                    {event.extendedProps?.location && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                        <MapPin size={12} />
                        <span className="truncate">{event.extendedProps.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UpcomingEventsWidget;