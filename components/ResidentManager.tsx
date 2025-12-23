
import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, X, Edit, Trash2 } from 'lucide-react';
import { Resident } from '../types';

const ResidentManager: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  // Modal State
  const [activeTab, setActiveTab] = useState<'basic' | 'household' | 'party' | 'special'>('basic');

  const filteredResidents = residents.filter(r => {
    const matchesSearch = r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.phoneNumber.includes(searchTerm) || 
                          r.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa cư dân này?')) {
      setResidents(prev => prev.filter(r => r.id !== id));
    }
  };

  const openModal = (resident?: Resident) => {
    setEditingResident(resident || null);
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResident(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Cư dân</h2>
          <p className="text-slate-500">Danh sách và thông tin chi tiết cư dân trong khu vực</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Thêm mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, địa chỉ..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Thường trú">Thường trú</option>
              <option value="Tạm trú">Tạm trú</option>
              <option value="Tạm vắng">Tạm vắng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Cư dân</th>
                <th className="p-4">Thông tin liên hệ</th>
                <th className="p-4">Địa chỉ</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.map((resident) => (
                <tr key={resident.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={resident.avatar} alt={resident.fullName} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-slate-900">{resident.fullName}</p>
                        <p className="text-xs text-slate-500">{resident.gender} • {new Date(resident.dob).getFullYear()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-600">{resident.phoneNumber}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-600 max-w-xs truncate">{resident.address}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      resident.status === 'Thường trú' ? 'bg-green-100 text-green-800' :
                      resident.status === 'Tạm trú' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {resident.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openModal(resident)}
                        className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(resident.id)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredResidents.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Không tìm thấy cư dân nào phù hợp.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">
                {editingResident ? 'Cập nhật thông tin cư dân' : 'Thêm mới cư dân'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto">
              {[
                { id: 'basic', label: 'Thông tin cơ bản' },
                { id: 'household', label: 'Hộ khẩu' },
                { id: 'party', label: 'Đảng viên' },
                { id: 'special', label: 'Đặc thù' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 flex justify-center mb-4">
                     <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        {editingResident?.avatar ? <img src={editingResident.avatar} className="w-full h-full rounded-full object-cover"/> : <Plus size={32}/>}
                     </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Họ và tên</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" defaultValue={editingResident?.fullName} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Ngày sinh</label>
                    <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" defaultValue={editingResident?.dob} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Giới tính</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" defaultValue={editingResident?.gender}>
                      <option>Nam</option>
                      <option>Nữ</option>
                      <option>Khác</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                    <input type="tel" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" defaultValue={editingResident?.phoneNumber} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-medium text-slate-700">Địa chỉ hiện tại</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" defaultValue={editingResident?.address} />
                  </div>
                   <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Trạng thái cư trú</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" defaultValue={editingResident?.status}>
                      <option>Thường trú</option>
                      <option>Tạm trú</option>
                      <option>Tạm vắng</option>
                    </select>
                  </div>
                </div>
              )}
              {activeTab === 'household' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 mb-4">Thông tin về sổ hộ khẩu và quan hệ với chủ hộ.</p>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Số sổ hộ khẩu</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Nhập số sổ..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Quan hệ với chủ hộ</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ví dụ: Con, Vợ, Chồng..." />
                  </div>
                </div>
              )}
               {activeTab === 'party' && (
                <div className="space-y-4">
                   <div className="flex items-center gap-2 mb-4">
                      <input type="checkbox" id="isPartyMember" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" defaultChecked={editingResident?.isPartyMember} />
                      <label htmlFor="isPartyMember" className="text-sm font-medium text-slate-700">Là Đảng viên</label>
                   </div>
                   <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Ngày vào Đảng</label>
                    <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                   <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Nơi sinh hoạt</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </div>
              )}
               {activeTab === 'special' && (
                <div className="space-y-4">
                   <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Diện đặc biệt</label>
                     <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" defaultValue={editingResident?.specialStatus || ''}>
                      <option value="">Không có</option>
                      <option value="Người cao tuổi">Người cao tuổi</option>
                      <option value="Cựu chiến binh">Cựu chiến binh</option>
                      <option value="Người có công">Người có công với cách mạng</option>
                      <option value="Hộ nghèo">Hộ nghèo</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Ghi chú thêm</label>
                    <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"></textarea>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                Hủy bỏ
              </button>
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
                {editingResident ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentManager;
