"""
Script to add voting tracker feature to ResidentsPage
Automatically inserts code at correct positions
"""

import re

# Read the original file
with open('pages/admin/residents/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
content = content.replace(
    "import { updateResident, getResidents, deleteResident, getAllResidents } from '../../../utils/mockApi';",
    "import { updateResident, getResidents, deleteResident, getAllResidents, toggleVote, getVotingStats } from '../../../utils/mockApi';"
)

# 2. Add voting stats state after toast state
toast_state = "const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);"
voting_state = """const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Voting Statistics State
  const [votingStats, setVotingStats] = useState<Record<string, { total: number; voted: number; percentage: number }>>({});"""

content = content.replace(toast_state, voting_state)

# 3. Add useEffect for voting stats after debounced search effect
search_effect_end = "  }, [searchQuery, filterStatus, filterGender, filterAgeFrom, filterAgeTo, filterSpecial, filterEthnicity, filterReligion, currentPage]);"
voting_effect = """  }, [searchQuery, filterStatus, filterGender, filterAgeFrom, filterAgeTo, filterSpecial, filterEthnicity, filterReligion, currentPage]);

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
  }, [residents]);"""

content = content.replace(search_effect_end, voting_effect)

# 4. Add handleToggleVote after handleFormSuccess
form_success = """  const handleFormSuccess = () => {
    showToast(selectedResident ? 'Cập nhật cư dân thành công' : 'Thêm cư dân mới thành công', 'success');
    fetchResidents();
  };"""

toggle_vote = """  const handleFormSuccess = () => {
    showToast(selectedResident ? 'Cập nhật cư dân thành công' : 'Thêm cư dân mới thành công', 'success');
    fetchResidents();
  };

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
  };"""

content = content.replace(form_success, toggle_vote)

# 5. Add voting stats display before search box
search_box_start = """        {/* Row 1: Search and Main Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">"""

stats_display = """        {/* Voting Statistics */}
        {Object.keys(votingStats).length > 0 && (
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
        )}

        {/* Row 1: Search and Main Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">"""

content = content.replace(search_box_start, stats_display)

# 6. Update table columns
old_columns = '''  const columns = [
    "Họ và Tên",
    "Tổ",
    "Email",
    "Số điện thoại",
    "Địa chỉ",
    "Loại cư trú",
    "Trạng thái",
    "Hành động"
  ];'''

new_columns = '''  const columns = [
    "Họ và Tên",
    "Tổ",
    "Đã bỏ phiếu",
    "Email",
    "Số điện thoại",
    "Địa chỉ",
    "Loại cư trú",
    "Trạng thái",
    "Hành động"
  ];'''

content = content.replace(old_columns, new_columns)

# 7. Add toggle switch column in table body (after Tổ column)
to_column = """                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {resident.unit || 'N/A'}
                </td>"""

with_toggle = """                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {resident.unit || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                </td>"""

content = content.replace(to_column, with_toggle)

# 8. Update colSpan in empty/error states from 8 to 9
content = content.replace('colSpan={8}', 'colSpan={9}')

# Write the updated file
with open('pages/admin/residents/index_WITH_VOTING.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Created: pages/admin/residents/index_WITH_VOTING.tsx")
print("📝 Next step: Replace index.tsx with index_WITH_VOTING.tsx")
