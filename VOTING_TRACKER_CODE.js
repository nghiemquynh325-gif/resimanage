// =====================================================
// VOTING TRACKER - CODE TO ADD TO ResidentsPage
// =====================================================
// File: pages/admin/residents/index.tsx
// =====================================================

// ===== 1. ADD AFTER LINE 58 (after votingStats state) =====

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


// ===== 2. ADD AFTER handleDelete function (around line 264) =====

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


// ===== 3. ADD VOTING STATS DISPLAY =====
// Find the search box section (around line 450-500)
// Add this BEFORE the search input:

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


// ===== 4. UPDATE TABLE HEADERS =====
// Find the table header section (around line 600)
// Add new column header AFTER "Tổ" column:

<th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
    Đã bỏ phiếu
</th>


// ===== 5. UPDATE TABLE BODY =====
// Find the table body section where resident data is rendered
// Add new column AFTER the Tổ column:

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
// ALTERNATIVE: COMPLETE TABLE ROW EXAMPLE
// =====================================================
// If you want to see the complete table row structure:

<tr key={resident.id} className="hover:bg-slate-50 transition-colors">
  {/* Họ và tên */}
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
      {resident.specialCharacteristics || '-'}
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

  {/* ... rest of columns ... */}
</tr>
