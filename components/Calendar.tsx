import React from 'react';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import { MOCK_EVENTS } from '../constants';

const CalendarView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lịch họp & Công tác</h2>
          <p className="text-slate-500">Theo dõi các sự kiện và hoạt động quan trọng của khu dân cư</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <CalendarIcon size={20} />
          Tạo sự kiện
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mock Calendar Widget */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           {/* Visual Mock of a Calendar Grid */}
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-slate-800">Tháng 11, 2023</h3>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-slate-100 rounded text-slate-600">&lt;</button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-600">&gt;</button>
              </div>
           </div>
           <div className="grid grid-cols-7 gap-4 mb-2 text-center text-sm font-semibold text-slate-400">
             <div>CN</div><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div>
           </div>
           <div className="grid grid-cols-7 gap-4 text-sm">
             {/* Empty prev month days */}
             <div className="h-24 p-2 bg-slate-50 rounded-lg border border-transparent"></div>
             <div className="h-24 p-2 bg-slate-50 rounded-lg border border-transparent"></div>
             <div className="h-24 p-2 bg-slate-50 rounded-lg border border-transparent"></div>
             
             {/* Days */}
             {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const eventsOnDay = MOCK_EVENTS.filter(e => new Date(e.date).getDate() === day);
                return (
                  <div key={day} className={`h-24 p-2 border rounded-lg hover:border-blue-300 transition-colors flex flex-col items-start justify-start ${eventsOnDay.length > 0 ? 'bg-blue-50/30 border-blue-100' : 'bg-white border-slate-100'}`}>
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${eventsOnDay.length > 0 ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>{day}</span>
                    <div className="mt-1 w-full space-y-1">
                      {eventsOnDay.map(ev => (
                        <div key={ev.id} className="text-[10px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded truncate w-full">
                          {ev.time}
                        </div>
                      ))}
                    </div>
                  </div>
                );
             })}
           </div>
        </div>

        {/* Upcoming List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Sự kiện sắp tới</h3>
          <div className="space-y-4">
            {MOCK_EVENTS.map(event => (
              <div key={event.id} className="relative pl-6 pb-6 border-l-2 border-slate-200 last:pb-0 last:border-l-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-sm"></div>
                <div className="bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                  <h4 className="font-bold text-slate-800">{event.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <Clock size={14} />
                    <span>{event.time}, {new Date(event.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                     <MapPin size={14} />
                     <span>{event.location}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;