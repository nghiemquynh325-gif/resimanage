import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchMock, updateEvent } from '../../utils/mockApi';
import { Loader2, Plus, Calendar as CalendarIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CalendarEvent } from '../../types';
import CreateEventModal from '../../components/events/CreateEventModal';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../../stores/authStore';

/**
 * Events Calendar Page
 * 
 * Features:
 * - Admin: Full access (View, Create, Edit, Delete, Drag & Drop).
 * - Resident: Read-only access (View only).
 */
const EventsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string } | null>(null);
  
  // Page-level Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadEvents = useCallback(async () => {
    // Only set loading on initial load to prevent flicker on refresh
    if (events.length === 0) setIsLoading(true);
    try {
      const response = await fetchMock('/api/events');
      if (response && response.data) {
        setEvents(response.data as unknown as CalendarEvent[]);
      }
    } catch (error) {
      showToast('Không thể tải dữ liệu lịch.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Handlers ---

  const handleDateSelect = (selectInfo: any) => {
    if (!isAdmin) return; // Residents cannot select dates to create events
    setSelectedEvent(null);
    setSelectedDate({
      start: selectInfo.startStr,
      end: selectInfo.endStr
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    // Extract plain data from FullCalendar event object to avoid cyclic structure issues
    const plainEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr || event.startStr, 
      allDay: event.allDay,
      backgroundColor: event.backgroundColor,
      extendedProps: {
        location: event.extendedProps.location,
        description: event.extendedProps.description,
        type: event.extendedProps.type,
      }
    };
    
    setSelectedEvent(plainEvent);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  /**
   * Handles dragging an event to a new date/time.
   */
  const handleEventDrop = async (dropInfo: any) => {
    if (!isAdmin) {
      dropInfo.revert();
      return;
    }

    const { event, revert } = dropInfo;
    const newStart = event.startStr;
    const newEnd = event.endStr || event.startStr;
    
    // 1. Optimistic Update (Local State)
    const originalEvents = [...events];
    const updatedEvents = events.map(e => 
      e.id === event.id 
        ? { ...e, start: newStart, end: newEnd } 
        : e
    );
    setEvents(updatedEvents);

    // 2. Call API
    try {
      await updateEvent(event.id, {
        start: newStart,
        end: newEnd,
      });
    } catch (error) {
      showToast('Không thể cập nhật thời gian. Đang hoàn tác...', 'error');
      
      // 3. Revert on Failure
      revert(); // Revert FullCalendar visual
      setEvents(originalEvents); // Revert React State
    }
  };

  const handleCreateButtonClick = () => {
    setSelectedEvent(null);
    // Default to today/now
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    setSelectedDate({
        start: now.toISOString(),
        end: oneHourLater.toISOString()
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  return (
    <div className="space-y-6 pb-8 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            Lịch Sự Kiện
            {isLoading && <Loader2 size={20} className="animate-spin text-blue-600" />}
          </h2>
          <p className="text-slate-500 mt-1">Quản lý các cuộc họp, sự kiện và hoạt động của khu dân cư</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={handleCreateButtonClick}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm transform active:scale-95"
          >
            <Plus size={20} />
            Tạo Sự kiện Mới
          </button>
        )}
      </div>

      {/* Calendar Container */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView='dayGridMonth'
          editable={isAdmin} // Disable editing for non-admins
          selectable={isAdmin} // Disable selection for non-admins
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events} // Pass the state array directly
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventContent={renderEventContent}
          height="100%"
          locale="vi"
          buttonText={{
            today: 'Hôm nay',
            month: 'Tháng',
            week: 'Tuần',
            day: 'Ngày',
            list: 'Danh sách'
          }}
          eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
        />
      </div>

      {isModalOpen && (
        <CreateEventModal 
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={loadEvents}
          eventData={selectedEvent}
          initialDate={selectedDate}
          readOnly={!isAdmin} 
        />
      )}

      {/* Page Toast Portal */}
      {toast && createPortal(
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white font-medium animate-in slide-in-from-right duration-300 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>,
        document.body
      )}
    </div>
  );
};

// Custom Event Render for better visuals
function renderEventContent(eventInfo: any) {
  const { event } = eventInfo;
  const isMeeting = event.extendedProps?.type === 'Họp';
  
  return (
    <div className="flex items-center gap-1 overflow-hidden px-1 w-full">
      {isMeeting && <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />}
      <div className="flex-1 truncate text-xs font-medium">
        <span className="mr-1 opacity-75">{eventInfo.timeText}</span>
        <span>{event.title}</span>
      </div>
    </div>
  );
}

export default EventsPage;