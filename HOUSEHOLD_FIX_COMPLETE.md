# Hướng dẫn hoàn tất fix Household Data

## 🎯 Tóm tắt vấn đề đã fix:

### 1. ✅ Số liệu hiển thị sai
- **Vấn đề**: "Cư dân đã có hộ" đếm 7 thay vì 5
- **Nguyên nhân**: Đếm cả heads + members
- **Giải pháp**: Chỉ đếm members (heads đã được đếm trong "Tổng số hộ")

### 2. ✅ Quan hệ hiển thị sai
- **Vấn đề**: Chủ hộ có relationship
- **Nguyên nhân**: Chủ hộ trong `household_members`
- **Giải pháp**: Loại bỏ head khỏi relationships trước khi submit

### 3. ⚠️ Lỗi 400 khi update
- **Vấn đề**: Không update được relationship
- **Nguyên nhân**: Có thể thiếu cột `relationship`
- **Giải pháp**: Thêm cột vào database

## 🔧 Các bước còn lại:

### Bước 1: Kiểm tra schema
Chạy: `check_household_members_schema.sql`
- Xem có cột `relationship` không

### Bước 2: Thêm cột (nếu thiếu)
Chạy: `add_relationship_column.sql`
- Script tự động kiểm tra và thêm cột

### Bước 3: Fix dữ liệu cũ
Chạy theo thứ tự:
1. `fix_household_relationships.sql` - Xóa head khỏi members
2. `fix_duplicate_members_simple.sql` - Xóa duplicates (nếu có)

### Bước 4: Verify
Chạy: `show_household_details.sql`
- Kiểm tra dữ liệu đã đúng

### Bước 5: Test app
- Refresh browser: `Ctrl + Shift + R`
- Kiểm tra số liệu hiển thị
- Tạo/sửa hộ gia đình mới

## 📊 Kết quả mong đợi:

```
Tổng số hộ: 2
Cư dân đã có hộ: 5 (chỉ members)
Cư dân chưa có hộ: (tổng residents - 7)
```

## 📁 Các file quan trọng:

**Migration:**
- `add_relationship_column.sql` ⭐ Chạy đầu tiên

**Fix data:**
- `fix_household_relationships.sql`
- `fix_duplicate_members_simple.sql`

**Verify:**
- `check_household_members_schema.sql`
- `show_household_details.sql`
