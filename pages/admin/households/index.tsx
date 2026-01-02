

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Users, Home, Loader2, CheckCircle2, AlertCircle, Edit, Trash2, Eye } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Household, Resident } from '../../../types';
import { getHouseholds, deleteHousehold } from '../../../utils/api/households';
import { getAllResidents } from '../../../utils/api/residents';
import Table from '../../../components/ui/Table';
import HouseholdFormModal from '../../../components/households/HouseholdFormModal';
import HouseholdDetailModal from '../../../components/households/HouseholdDetailModal';

const HouseholdsPage: React.FC = () => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [viewingHousehold, setViewingHousehold] = useState<Household | null>(null);

  // Filter states
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [filterHeadName, setFilterHeadName] = useState<string>('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedHouseholds, fetchedResidents] = await Promise.all([
        getHouseholds(),
        getAllResidents()
      ]);
      setHouseholds(fetchedHouseholds);
      setResidents(fetchedResidents);
    } catch (error) {
      showToast('Không thể tải dữ liệu.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to show toast - Memoized
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Get residents available for selection (not in household OR already in the currently edited household)
  const availableResidents = residents.filter(r => !r.householdId || (selectedHousehold && selectedHousehold.memberIds.includes(r.id)));

  // Helper to find resident name by ID - Memoized
  const getResidentName = useCallback((id: string) => {
    const resident = residents.find(r => r.id === id);
    return resident ? resident.fullName : 'Không xác định';
  }, [residents]);

  // Helper to format unit display: "2" -> "Tổ 2", "tổ 3" -> "Tổ 3" - Memoized
  const formatUnit = useCallback((unit: string) => {
    if (!unit) return '—';
    const trimmed = unit.trim();
    // If already starts with "tổ" (any case), normalize to "Tổ"
    if (trimmed.toLowerCase().startsWith('tổ')) {
      // Extract the number part after "tổ"
      const numberPart = trimmed.substring(2).trim();
      return numberPart ? `Tổ ${numberPart} ` : 'Tổ';
    }
    // Otherwise, add "Tổ " prefix
    return `Tổ ${trimmed} `;
  }, []);

  // Get unique units for filter dropdown - Memoized
  const uniqueUnits = useMemo(() =>
    Array.from(new Set(households.map(h => h.unit).filter(Boolean))),
    [households]
  );

  // Filter households - Memoized to prevent recalculation
  const filteredHouseholds = useMemo(() => {
    return households.filter(household => {
      // Filter by unit
      if (filterUnit !== 'all' && household.unit !== filterUnit) {
        return false;
      }

      // Filter by head of household name
      if (filterHeadName.trim()) {
        const resident = residents.find(r => r.id === household.headOfHouseholdId);
        if (!resident) {
          return false; // Skip if head not found
        }

        const searchTerm = filterHeadName.toLowerCase().trim();
        const residentName = resident.fullName.toLowerCase();

        // Check if name contains search term
        if (!residentName.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [households, residents, filterUnit, filterHeadName]);

  const handleCreate = () => {
    setSelectedHousehold(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (household: Household) => {
    setSelectedHousehold(household);
    setIsFormModalOpen(true);
  };

  const handleView = (household: Household) => {
    setViewingHousehold(household);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (household: Household) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hộ gia đình "${household.name}" không ? `)) {
      // Optimistic Update
      const previousHouseholds = [...households];
      setHouseholds(households.filter(h => h.id !== household.id));

      try {
        await deleteHousehold(household.id);
        showToast('Đã xóa hộ gia đình thành công', 'success');
        // Refresh full data to ensure resident statuses are synced
        fetchData();
      } catch (error) {
        // Revert if failed
        setHouseholds(previousHouseholds);
        showToast('Lỗi khi xóa hộ gia đình', 'error');
      }
    }
  };

  const columns = [
    "Tên Hộ gia đình",
    "Tổ",
    "Địa chỉ",
    "Loại hộ",
    "Số thành viên",
    "Hành động"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Hộ gia đình</h1>
          <p className="text-slate-500">Quản lý thông tin hộ khẩu và thành viên trong hộ</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm active:scale-95"
        >
          <Plus size={20} />
          Tạo Hộ gia đình mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Unit Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo Tổ</label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
            >
              <option value="all">Tất cả các tổ</option>
              {uniqueUnits.sort().map(unit => (
                <option key={unit} value={unit}>{formatUnit(unit)}</option>
              ))}
            </select>
          </div>

          {/* Head of Household Name Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm theo tên chủ hộ</label>
            <input
              type="text"
              placeholder="Nhập tên chủ hộ..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterHeadName}
              onChange={(e) => setFilterHeadName(e.target.value)}
            />
          </div>

          {/* Clear Filters */}
          {(filterUnit !== 'all' || filterHeadName) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterUnit('all');
                  setFilterHeadName('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards (Optional Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Home size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Tổng số hộ</p>
            <p className="text-xl font-bold text-slate-800">{filteredHouseholds.length} / {households.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Cư dân đã có hộ</p>
            <p className="text-xl font-bold text-slate-800">
              {(() => {
                // Count only MEMBERS (not heads)
                // Heads are already counted in "Tổng số hộ"
                const allMemberIds = new Set<string>();
                households.forEach(h => {
                  h.memberIds?.forEach(id => allMemberIds.add(id));
                });
                return allMemberIds.size;
              })()}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Cư dân chưa có hộ</p>
            <p className="text-xl font-bold text-slate-800">
              {(() => {
                // Get all unique resident IDs from all households
                const residentsInHouseholds = new Set<string>();
                households.forEach(h => {
                  h.memberIds?.forEach(id => residentsInHouseholds.add(id));
                  if (h.headOfHouseholdId) residentsInHouseholds.add(h.headOfHouseholdId);
                });
                // Count residents NOT in any household
                return residents.filter(r => !residentsInHouseholds.has(r.id)).length;
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <Table headers={columns}>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse"></div></td>
              </tr>
            ))
          ) : filteredHouseholds.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                {households.length === 0 ? 'Chưa có hộ gia đình nào. Hãy tạo mới.' : 'Không tìm thấy hộ gia đình phù hợp với bộ lọc.'}
              </td>
            </tr>
          ) : (
            filteredHouseholds.map((household) => (
              <tr key={household.id} className="hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-0 group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleView(household)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                  >
                    {household.name}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatUnit(household.unit)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={household.address}>
                  {household.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {household.isBusiness && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M7 7h.01" />
                          <path d="M17 7h.01" />
                          <path d="M7 17h.01" />
                          <path d="M17 17h.01" />
                        </svg>
                        Hộ kinh doanh
                      </span>
                    )}
                    {household.isPoorHousehold && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                          <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                          <path d="M12 3v6" />
                        </svg>
                        Hộ nghèo/cận nghèo
                      </span>
                    )}
                    {household.isPolicyHousehold && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5" />
                          <path d="M2 12l10 5 10-5" />
                        </svg>
                        Hộ chính sách
                      </span>
                    )}
                    {!household.isBusiness && !household.isPoorHousehold && !household.isPolicyHousehold && (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {household.memberIds?.length || 0} thành viên
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleView(household)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(household)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                      title="Chỉnh sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(household)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </Table>
      </div>

      <HouseholdFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => {
          fetchData();
          showToast(selectedHousehold ? 'Cập nhật hộ gia đình thành công!' : 'Tạo hộ gia đình thành công!', 'success');
        }}
        availableResidents={availableResidents}
        initialData={selectedHousehold}
      />

      <HouseholdDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        household={viewingHousehold}
        members={residents.filter(r =>
          viewingHousehold?.memberIds.includes(r.id) ||
          r.id === viewingHousehold?.headOfHouseholdId
        )}
      />

      {/* Toast Portal */}
      {toast && createPortal(
        <div className={`fixed top - 4 right - 4 z - [100] px - 4 py - 3 rounded - lg shadow - lg flex items - center gap - 3 text - white font - medium animate -in slide -in -from - right duration - 300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } `}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HouseholdsPage;
