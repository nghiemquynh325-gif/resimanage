import React from 'react';
import { Users, Home, Calendar, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CHART_DATA_AGE, CHART_DATA_GROWTH, MOCK_EVENTS, MOCK_POSTS } from '../constants';
import { DashboardStats } from '../types/dashboard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface DashboardProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, isLoading }) => {
  
  // Helper to render value or skeleton
  const renderValue = (value: number | undefined) => {
    if (isLoading) {
      return <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>;
    }
    return <p className="text-2xl font-bold text-slate-800">{value ?? 0}</p>;
  };

  const formatDate = (isoString: string) => {
     return new Intl.DateTimeFormat('vi-VN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString));
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Tổng quan</h2>
        <p className="text-slate-500">Thống kê tình hình dân cư và hoạt động trong khu vực</p>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Tổng cư dân</p>
            {renderValue(stats?.totalResidents)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Home size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Tổng hộ khẩu</p>
            {renderValue(stats?.totalHouseholds)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Sự kiện sắp tới</p>
            {renderValue(stats?.upcomingEvents)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Văn bản mới</p>
            {renderValue(stats?.newDocuments)}
          </div>
        </div>
      </div>

      {/* Charts - Stack on Tablet/Small Desktop, Grid on XL */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Cơ cấu độ tuổi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CHART_DATA_AGE}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CHART_DATA_AGE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2 flex-wrap">
              {CHART_DATA_AGE.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Cư dân mới theo tháng</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA_GROWTH}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ReTooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="resident" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Lists - Stack on Tablet/Small Desktop, Grid on XL */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Lịch sắp tới</h3>
          <div className="space-y-4">
            {MOCK_EVENTS.slice(0, 3).map(event => (
              <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('vi-VN', { month: 'short' })}</span>
                  <span className="text-lg font-bold">{new Date(event.date).getDate()}</span>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">{event.title}</h4>
                  <p className="text-sm text-slate-500">{event.time} - {event.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Thông báo mới nhất</h3>
          <div className="space-y-4">
            {MOCK_POSTS.filter(p => p.author.role === 'ADMIN').slice(0, 3).map(post => (
              <div key={post.id} className="p-3 rounded-lg hover:bg-slate-50 transition-colors border-l-4 border-blue-500 bg-slate-50">
                <h4 className="font-medium text-slate-800 line-clamp-1">{post.content}</h4>
                <p className="text-xs text-slate-500 mt-1">{formatDate(post.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
