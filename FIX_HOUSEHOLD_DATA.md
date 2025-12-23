# Hướng dẫn Fix Dữ liệu Hộ gia đình

## 🔍 Vấn đề phát hiện:
1. ❌ Chủ hộ xuất hiện trong `household_members` (không nên có)
2. ❌ Một số cư dân xuất hiện trong nhiều hộ (duplicate)
3. ❌ Số liệu "Cư dân đã có hộ" hiển thị sai

## 🔧 Các bước fix (theo thứ tự):

### Bước 1: Kiểm tra dữ liệu hiện tại
Chạy file: `find_duplicate_members.sql`
- Xem có bao nhiêu người bị duplicate
- Xem chủ hộ có trong members không

### Bước 2: Xóa chủ hộ khỏi household_members
Chạy file: `fix_household_relationships.sql`
```sql
DELETE FROM public.household_members hm
USING public.households h
WHERE hm.household_id = h.id
  AND hm.resident_id = h.head_of_household_id;
```

### Bước 3: Xóa duplicate members
Chạy file: `fix_duplicate_members.sql`
- Giữ lại bản ghi mới nhất cho mỗi người
- Xóa các bản ghi cũ

### Bước 4: Kiểm tra kết quả
Chạy file: `debug_household_data.sql`
- Xác nhận không còn duplicate
- Xác nhận chủ hộ không trong members
- Đếm số liệu đúng

### Bước 5: Refresh ứng dụng
- Hard refresh browser: `Ctrl + Shift + R`
- Kiểm tra số liệu hiển thị

## 📊 Kết quả mong đợi:

**Trước fix:**
- Cư dân đã có hộ: 7 (sai)
- Thực tế: 5 người

**Sau fix:**
- Cư dân đã có hộ: 5 (đúng)
- Không còn duplicate
- Chủ hộ không trong members

## 🎯 Các file cần chạy (theo thứ tự):

1. ✅ `find_duplicate_members.sql` - Kiểm tra
2. ✅ `fix_household_relationships.sql` - Xóa head khỏi members
3. ✅ `fix_duplicate_members.sql` - Xóa duplicates
4. ✅ `debug_household_data.sql` - Verify kết quả

## ⚠️ Lưu ý:
- Chạy từng script một, theo thứ tự
- Kiểm tra kết quả sau mỗi bước
- Backup dữ liệu trước khi chạy (nếu cần)
