import React from 'react';
import NewsFeed from '../../components/feed/NewsFeed';
import UpcomingEventsWidget from '../../components/resident/UpcomingEventsWidget';
import ContactInfoWidget from '../../components/resident/ContactInfoWidget';

const ResidentHomePage: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* Main Content Area - Left Column */}
      <div className="lg:flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Bảng tin Cộng đồng</h1>
          <p className="text-slate-500">Cập nhật tin tức và thông báo mới nhất từ Ban quản lý</p>
        </div>
        
        {/* Reuse the existing NewsFeed component */}
        <NewsFeed />
      </div>

      {/* Sidebar - Right Column */}
      <div className="lg:w-80 xl:w-96 space-y-6">
        {/* Sticky container for larger screens */}
        <div className="sticky top-24 space-y-6">
          <UpcomingEventsWidget />
          <ContactInfoWidget />
        </div>
      </div>
    </div>
  );
};

export default ResidentHomePage;
