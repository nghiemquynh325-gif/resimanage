// =====================================================
// VOTING TRACKER - COMPLETE UI CODE
// =====================================================
// File: pages/admin/residents/index.tsx
// Hướng dẫn: Copy từng đoạn code vào đúng vị trí
// =====================================================

// ===== BƯỚC 1: ADD useEffect (SAU LINE ~103) =====
// Tìm dòng: }, [searchQuery, filterStatus, filterAgeFrom, filterAgeTo, filterSpecial, filterEthnicity, filterReligion, filterGender, currentPage]);
// Thêm NGAY SAU dòng đó:

// Load voting statistics
useEffect(() => {
    const loadVotingStats = async () => {
        try {
            const stats = await getVotingStats();
            setVotingStats(stats);
        } catch (error) {
            console.error('Failed to load voting stats:', error);
        }
    };

    if (residents.length > 0) {
        loadVotingStats();
    }
}, [residents]); // Reload when residents change


// ===== BƯỚC 2: ADD handleToggleVote (SAU handleDelete, ~LINE 267) =====
// Tìm function handleFormSuccess (line ~268)
// Thêm TRƯỚC handleFormSuccess:

// Toggle voting status
const handleToggleVote = async (residentId: string, currentStatus: boolean) => {
    try {
        const newStatus = !currentStatus;

        // Optimistic update
        setResidents(residents.map(r =>
            r.id === residentId ? { ...r, hasVoted: newStatus } : r
        ));

        // API call
        await toggleVote(residentId, newStatus);

        // Reload stats
        const stats = await getVotingStats();
        setVotingStats(stats);

        showToast(
            newStatus ? 'Đã đánh dấu bỏ phiếu' : 'Đã bỏ đánh dấu',
            'success'
        );

    } catch (error) {
        // Revert on error
        setResidents(residents.map(r =>
            r.id === residentId ? { ...r, hasVoted: currentStatus } : r
        ));
        showToast('Lỗi khi cập nhật trạng thái bỏ phiếu', 'error');
    }
};


// ===== BƯỚC 3: ADD VOTING STATS DISPLAY (TRƯỚC SEARCH BOX, ~LINE 430) =====
// Tìm phần search box (có text "Tìm kiếm theo họ tên")
// Thêm TRƯỚC search box:

{/* Voting Statistics */ }
{
    Object.keys(votingStats).length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm font-semibold text-slate-700">Thống kê bỏ phiếu:</span>
            {Object.entries(votingStats)
                .filter(([group]) => group !== 'Không có tổ')
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([group, stats]) => (
                    <div
                        key={group}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200"
                    >
                        <span className="font-semibold text-blue-900">{group}:</span>
                        <span className="text-blue-700">
                            {stats.voted}/{stats.total}
                            <span className="ml-1 text-blue-600 font-medium">({stats.percentage}%)</span>
                        </span>
                    </div>
                ))}
        </div>
    )
}


// ===== BƯỚC 4: UPDATE TABLE HEADERS (~LINE 600-620) =====
// Tìm table headers section
// Tìm dòng có text "Tổ"
// Thêm NGAY SAU header "Tổ":

<th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
    Đã bỏ phiếu
</th>


// ===== BƯỚC 5: UPDATE TABLE BODY (~LINE 650-750) =====
// Tìm table body section
// Tìm đoạn code hiển thị resident.unit hoặc cột "Tổ"
// Thêm NGAY SAU cột Tổ:

{/* Voting Toggle */ }
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleVote(resident.id, resident.hasVoted || false)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        resident.hasVoted ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      aria-label={resident.hasVoted ? 'Đã bỏ phiếu' : 'Chưa bỏ phiếu'}
                      title={resident.hasVoted ? 'Click để bỏ đánh dấu' : 'Click để đánh dấu đã bỏ phiếu'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          resident.hasVoted ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>


// =====================================================
// HOẶC: NẾU MUỐN XEM COMPLETE TABLE ROW
// =====================================================
// Đây là ví dụ HOÀN CHỈNH của một table row với voting column:

                <tr key={resident.id} className="hover:bg-slate-50 transition-colors">
                  {/* Avatar + Name */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          src={resident.avatar}
                          alt={resident.fullName}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{resident.fullName}</div>
                        <div className="text-xs text-slate-500">{resident.identityCard || 'N/A'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Tổ */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-slate-700">
                      {resident.unit || '-'}
                    </span>
                  </td>

                  {/* ĐÃ BỎ PHIẾU - NEW COLUMN */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleVote(resident.id, resident.hasVoted || false)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        resident.hasVoted ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      aria-label={resident.hasVoted ? 'Đã bỏ phiếu' : 'Chưa bỏ phiếu'}
                      title={resident.hasVoted ? 'Click để bỏ đánh dấu' : 'Click để đánh dấu đã bỏ phiếu'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          resident.hasVoted ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-slate-700">{resident.email || '-'}</span>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-slate-700">{resident.phoneNumber || '-'}</span>
                  </td>

                  {/* Address */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-700">{resident.address || '-'}</span>
                  </td>

                  {/* Residence Type */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getResidenceTypeBadge(resident.residenceType)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(resident)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(resident)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(resident)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>


// =====================================================
// TÓM TẮT CÁC VỊ TRÍ CẦN THÊM CODE
// =====================================================
/*
1. Line ~103: useEffect load voting stats
2. Line ~267: handleToggleVote function
3. Line ~430: Voting statistics display
4. Line ~600: Table header "Đã bỏ phiếu"
5. Line ~650: Table body toggle switch column

Sau khi thêm xong, save file và reload browser để thấy:
- Toggle switches màu xanh/xám
- Statistics hiển thị "Tổ X: Y/Z - %"
- Click toggle để đánh dấu bỏ phiếu
*/
