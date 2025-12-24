
import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Ban, CheckCircle2, AlertCircle, Loader2, Filter, FileSpreadsheet, Download } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Resident } from '../../../types';
import ResidentFormModal from '../../../components/residents/ResidentFormModal';
import ResidentDetailModal from '../../../components/residents/ResidentDetailModal';
import AIExcelImportModal from '../../../components/residents/AIExcelImportModal';
import { updateResident, getResidents, deleteResident, getAllResidents } from '../../../utils/mockApi';
import Table from '../../../components/ui/Table';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';
import * as XLSX from 'xlsx';

/**
 * Residents Management Page.
 * Features:
 * - List residents with server-side pagination, searching, and status filtering.
 * - NEW: Age range filtering (From - To).
 * - NEW: Special status/characteristics filtering.
 * - NEW: Ethnicity and Religion filtering.
 * - Create and Edit residents via Modal.
 * - Optimistic UI updates for status toggling (Activate/Deactivate).
 */
const ResidentsPage: React.FC = () => {
  // State for data
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // New Filters
  const [filterAgeFrom, setFilterAgeFrom] = useState<string>('');
  const [filterAgeTo, setFilterAgeTo] = useState<string>('');
  const [filterSpecial, setFilterSpecial] = useState('all');
  const [filterEthnicity, setFilterEthnicity] = useState('all');
  const [filterReligion, setFilterReligion] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | undefined>(undefined);

  // Feedback State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Helper: Show Toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch Residents
  const fetchResidents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getResidents({
        search: searchQuery,
        status: filterStatus,
        ageFrom: filterAgeFrom ? parseInt(filterAgeFrom) : undefined,
        ageTo: filterAgeTo ? parseInt(filterAgeTo) : undefined,
        specialFilter: filterSpecial,
        ethnicity: filterEthnicity,
        religion: filterReligion,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      });

      setResidents(response.data);
      setTotalPages(response.totalPages);
      setTotalRecords(response.total);
    } catch (err: any) {
      setError('Có lỗi xảy ra khi tải dữ liệu cư dân.');
      setResidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced Effect for Search & Filter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchResidents();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterStatus, filterAgeFrom, filterAgeTo, filterSpecial, filterEthnicity, filterReligion, currentPage]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Reset to page 1 on filter
  };

  const handleAgeFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterAgeFrom(e.target.value);
    setCurrentPage(1);
  };

  const handleAgeToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterAgeTo(e.target.value);
    setCurrentPage(1);
  };

  const handleSpecialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterSpecial(e.target.value);
    setCurrentPage(1);
  };

  const handleEthnicityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterEthnicity(e.target.value);
    setCurrentPage(1);
  };

  const handleReligionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterReligion(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCreate = () => {
    setSelectedResident(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = (resident: Resident) => {
    setSelectedResident(resident);
    setIsFormModalOpen(true);
  };

  const handleView = (resident: Resident) => {
    setSelectedResident(resident);
    setIsDetailModalOpen(true);
  };

  /**
   * Handles user deactivation/activation using Optimistic UI pattern.
   * 1. Updates state immediately for instant feedback.
   * 2. Calls API in background.
   * 3. Reverts state if API fails.
   */
  const handleDeactivate = async (resident: Resident) => {
    const isInactive = resident.status === 'inactive';
    const actionLabel = isInactive ? 'Kích hoạt' : 'Vô hiệu hóa';
    const confirmMessage = isInactive
      ? `Bạn có chắc muốn kích hoạt lại cư dân ${resident.fullName}?`
      : `Bạn có chắc muốn vô hiệu hóa cư dân ${resident.fullName}?`;

    if (window.confirm(confirmMessage)) {
      // 1. Snapshot previous state
      const previousResidents = [...residents];

      // 2. Optimistic Update (Immediate Feedback)
      const newStatus = isInactive ? 'active' : 'inactive';
      setResidents(current =>
        current.map(r => r.id === resident.id ? { ...r, status: newStatus as any } : r)
      );

      try {
        // 3. Call API
        await updateResident(resident.id, {
          status: newStatus as any
        });
        showToast(`Đã ${actionLabel.toLowerCase()} cư dân thành công`, 'success');
      } catch (error) {
        // 4. Revert on Error
        setResidents(previousResidents);
        showToast(`Lỗi: Không thể ${actionLabel.toLowerCase()} cư dân`, 'error');
      }
    }
  };

  /**
   * Handles permanent deletion of a resident.
   */
  const handleDelete = async (resident: Resident) => {
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN cư dân "${resident.fullName}" không?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
      return;
    }

    const previousResidents = [...residents];
    setResidents(residents.filter(r => r.id !== resident.id));

    try {
      await deleteResident(resident.id);
      showToast('Đã xóa cư dân thành công', 'success');
      fetchResidents();
    } catch (error) {
      setResidents(previousResidents);
      showToast('Lỗi khi xóa cư dân', 'error');
    }
  };

  const handleFormSuccess = () => {
    showToast(selectedResident ? 'Cập nhật cư dân thành công' : 'Thêm cư dân mới thành công', 'success');
    fetchResidents();
  };

  const handleExportExcel = async () => {
    try {
      showToast('Đang xuất dữ liệu...', 'success');

      // Fetch all residents (not paginated)
      const allResidents = await getAllResidents();

      if (allResidents.length === 0) {
        showToast('Không có dữ liệu để xuất', 'error');
        return;
      }

      // Map data to Excel format with Vietnamese headers
      const excelData = allResidents.map((resident, index) => ({
        'STT': index + 1,
        'Họ và tên': resident.fullName,
        'Email': resident.email || '',
        'Ngày sinh': resident.dob ? new Date(resident.dob).toLocaleDateString('vi-VN') : '',
        'Giới tính': resident.gender,
        'Số điện thoại': resident.phoneNumber,
        'Địa chỉ': resident.address,
        'Trạng thái': resident.status,
        'Đảng viên': resident.isPartyMember ? 'Có' : 'Không',
        'Ngày vào đảng': resident.partyJoinDate ? new Date(resident.partyJoinDate).toLocaleDateString('vi-VN') : '',
        'CMND/CCCD': resident.identityCard || '',
        'Học vấn': resident.education || '',
        'Quê quán': resident.hometown || '',
        'Nghề nghiệp': resident.profession || '',
        'Dân tộc': resident.ethnicity || '',
        'Tôn giáo': resident.religion || '',
        'Tổ dân phố': resident.unit || '',
        'Tỉnh/Thành phố': resident.province || '',
        'Phường/Xã': resident.ward || '',
        'Ghi chú đặc biệt': resident.specialNotes || '',
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 5 },  // STT
        { wch: 25 }, // Họ và tên
        { wch: 30 }, // Email
        { wch: 12 }, // Ngày sinh
        { wch: 10 }, // Giới tính
        { wch: 15 }, // Số điện thoại
        { wch: 40 }, // Địa chỉ
        { wch: 15 }, // Trạng thái
        { wch: 10 }, // Đảng viên
        { wch: 15 }, // Ngày vào đảng
        { wch: 15 }, // CMND/CCCD
        { wch: 20 }, // Học vấn
        { wch: 30 }, // Quê quán
        { wch: 20 }, // Nghề nghiệp
        { wch: 15 }, // Dân tộc
        { wch: 15 }, // Tôn giáo
        { wch: 12 }, // Tổ dân phố
        { wch: 20 }, // Tỉnh/Thành phố
        { wch: 20 }, // Phường/Xã
        { wch: 30 }, // Ghi chú
      ];
      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách cư dân');

      // Generate filename with timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `Danh_sach_cu_dan_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      showToast(`Đã xuất ${allResidents.length} cư dân thành công`, 'success');
    } catch (error) {
      showToast('Lỗi khi xuất file Excel', 'error');
    }
  };

  // Status Badge Helper (for approval status)
  const getStatusBadge = (status: string) => {
    let classes = "bg-gray-100 text-gray-800";
    let label = status;

    if (status === 'active') {
      classes = "bg-green-100 text-green-800";
      label = 'Hoạt động';
    } else if (status === 'pending_approval') {
      classes = "bg-yellow-100 text-yellow-800";
      label = 'Chờ duyệt';
    } else if (status === 'inactive') {
      classes = "bg-red-100 text-red-800";
      label = 'Vô hiệu hóa';
    } else if (status === 'rejected') {
      classes = "bg-red-100 text-red-800";
      label = 'Từ chối';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
        {label}
      </span>
    );
  };

  // Residence Type Badge Helper
  const getResidenceTypeBadge = (residenceType?: string) => {
    if (!residenceType) {
      return <span className="text-xs text-gray-400">N/A</span>;
    }

    let classes = "bg-gray-100 text-gray-800";

    if (residenceType === 'Thường trú') {
      classes = "bg-blue-100 text-blue-800";
    } else if (residenceType === 'Tạm trú') {
      classes = "bg-green-100 text-green-800";
    } else if (residenceType === 'Tạm vắng') {
      classes = "bg-orange-100 text-orange-800";
    } else if (residenceType === 'Tạm trú có nhà') {
      classes = "bg-purple-100 text-purple-800";
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
        {residenceType}
      </span>
    );
  };

  const columns = [
    "Họ và Tên",
    "Tổ",
    "Email",
    "Số điện thoại",
    "Địa chỉ",
    "Loại cư trú",
    "Trạng thái",
    "Hành động"
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Cư dân</h1>
        <p className="text-slate-500">Quản lý thông tin và trạng thái của cư dân trong hệ thống</p>
      </div>

      {/* Toolbar - Updated with Age and Special Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-4">

        {/* Row 1: Search and Main Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm tên, SĐT, địa chỉ..."
              className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleExportExcel}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Download size={18} />
              Xuất Excel
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-95 whitespace-nowrap"
            >
              <FileSpreadsheet size={18} />
              Import Excel
            </button>

            <button
              onClick={handleCreate}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} />
              Thêm Cư dân
            </button>
          </div>
        </div>

        {/* Row 2: Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center pt-2 border-t border-slate-50">
          <div className="flex items-center gap-2 text-sm text-slate-500 min-w-fit">
            <Filter size={16} />
            <span className="font-medium">Bộ lọc:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            {/* Status Filter */}
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filterStatus}
              onChange={handleStatusChange}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động (Thường/Tạm trú)</option>
              <option value="pending_approval">Chờ duyệt</option>
              <option value="inactive">Vô hiệu hóa</option>
            </select>

            {/* Special Filter */}
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filterSpecial}
              onChange={handleSpecialChange}
            >
              <option value="all">Tất cả đặc điểm</option>
              <option value="party_member">Đảng viên</option>
              <option value="Người cao tuổi">Người cao tuổi</option>
              <option value="Cựu chiến binh">Cựu chiến binh</option>
              <option value="Người có công">Người có công</option>
              <option value="Hộ nghèo">Hộ nghèo</option>
              <option value="special_notes">Có ghi chú đặc biệt</option>
            </select>

            {/* Ethnicity Filter */}
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filterEthnicity}
              onChange={handleEthnicityChange}
            >
              <option value="all">Tất cả dân tộc</option>
              <option value="Kinh">Kinh</option>
              <option value="Tày">Tày</option>
              <option value="Thái">Thái</option>
              <option value="Hoa">Hoa</option>
              <option value="Khơ Me">Khơ Me</option>
              <option value="Mường">Mường</option>
              <option value="Nùng">Nùng</option>
              <option value="H'Mông">H'Mông</option>
            </select>

            {/* Religion Filter */}
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filterReligion}
              onChange={handleReligionChange}
            >
              <option value="all">Tất cả tôn giáo</option>
              <option value="Không">Không</option>
              <option value="Phật giáo">Phật giáo</option>
              <option value="Công giáo">Công giáo</option>
              <option value="Tin Lành">Tin Lành</option>
              <option value="Hòa Hảo">Hòa Hảo</option>
              <option value="Cao Đài">Cao Đài</option>
              <option value="Hồi giáo">Hồi giáo</option>
            </select>

            {/* Age Range - Span 2 columns on large screens to fit better */}
            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4 xl:col-span-2">
              <span className="text-sm text-slate-600 whitespace-nowrap">Độ tuổi:</span>
              <input
                type="number"
                placeholder="Từ"
                min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterAgeFrom}
                onChange={handleAgeFromChange}
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Đến"
                min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterAgeTo}
                onChange={handleAgeToChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <Table headers={columns}>
          {isLoading ? (
            // Skeleton Loading State
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4"><SkeletonLoader className="h-4 w-32" /></td>
                <td className="px-6 py-4"><SkeletonLoader className="h-4 w-16" /></td>
                <td className="px-6 py-4"><SkeletonLoader className="h-4 w-40" /></td>
                <td className="px-6 py-4"><SkeletonLoader className="h-4 w-24" /></td>
                <td className="px-6 py-4"><SkeletonLoader className="h-4 w-48" /></td>
                <td className="px-6 py-4"><SkeletonLoader className="h-6 w-20 rounded-full" /></td>
                <td className="px-6 py-4"><SkeletonLoader className="h-6 w-20 rounded-full" /></td>
                <td className="px-6 py-4 text-right"><SkeletonLoader className="h-4 w-16 ml-auto" /></td>
              </tr>
            ))
          ) : error ? (
            <tr>
              <td colSpan={8} className="px-6 py-10 text-center text-red-500">
                {error}
              </td>
            </tr>
          ) : residents.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                Không tìm thấy dữ liệu phù hợp.
              </td>
            </tr>
          ) : (
            residents.map((resident) => (
              <tr key={resident.id} className="hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-0 group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        src={resident.avatar}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${resident.fullName}&background=random`;
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{resident.fullName}</div>
                      <div className="text-xs text-slate-500">
                        {new Date().getFullYear() - new Date(resident.dob).getFullYear()} tuổi
                        {resident.isPartyMember && <span className="ml-1 text-red-600 font-bold">• Đảng viên</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {resident.unit || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resident.email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resident.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs" title={resident.address}>
                  {resident.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getResidenceTypeBadge(resident.residenceType)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(resident.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleView(resident)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(resident)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                      title="Chỉnh sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeactivate(resident)}
                      className={`${resident.status === 'inactive' ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'
                        } transition-colors p-1`}
                      title={resident.status === 'inactive' ? 'Kích hoạt' : 'Vô hiệu hóa'}
                    >
                      {resident.status === 'inactive' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(resident)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                      title="Xóa vĩnh viễn"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </Table>

        {/* Pagination */}
        {!isLoading && !error && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-medium">{residents.length}</span> / <span className="font-medium">{totalRecords}</span> kết quả
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p =>
                totalPages <= 5 || p === 1 || p === totalPages || Math.abs(currentPage - p) <= 1
              ).map((page, index, array) => {
                const prev = array[index - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${currentPage === page
                        ? 'bg-blue-600 text-white border border-blue-600'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <ResidentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        initialData={selectedResident}
      />

      {/* Detail Modal */}
      <ResidentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        resident={selectedResident}
      />

      {/* AI Excel Import Modal */}
      <AIExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          showToast('Import dữ liệu thành công', 'success');
          fetchResidents();
        }}
      />

      {/* Toast Portal */}
      {toast && createPortal(
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white font-medium animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ResidentsPage;
