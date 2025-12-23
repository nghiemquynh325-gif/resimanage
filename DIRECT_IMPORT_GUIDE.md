# Hướng dẫn Import trực tiếp vào Database

## Script Import Trực Tiếp

Script `direct-import.js` cho phép import dữ liệu từ Excel trực tiếp vào Supabase database, bỏ qua UI.

## Cách sử dụng

### 1. Chuẩn bị file Excel

File Excel cần có các cột sau (tên cột tiếng Việt hoặc tiếng Anh đều được):

**Bắt buộc:**
- Họ và Tên / Full Name
- Ngày sinh / DOB (DD/MM/YYYY hoặc YYYY-MM-DD)
- Số điện thoại / Phone Number

**Tùy chọn:**
- Giới tính / Gender
- Email
- CCCD/CMND / Identity Card
- Địa chỉ / Address
- Tổ / Unit
- Xã/Phường / Ward
- Tỉnh/Thành phố / Province
- Dân tộc / Ethnicity
- Tôn giáo / Religion
- Trình độ / Education
- Nghề nghiệp / Profession
- Quê quán / Hometown
- Loại cư trú / Residence Type (Thường trú, Tạm trú, Tạm vắng, Tạm trú có nhà)

### 2. Chạy script

```bash
# Cú pháp
node scripts/direct-import.js <đường-dẫn-file-excel>

# Ví dụ
node scripts/direct-import.js data/danh-sach-cu-dan.xlsx
node scripts/direct-import.js C:\Users\Admin\Downloads\residents.xlsx
```

### 3. Kết quả

Script sẽ:
- ✅ Đọc file Excel
- ✅ Validate dữ liệu
- ✅ Transform sang format database
- ✅ Insert trực tiếp vào Supabase (batch 50 records)
- ✅ Hiển thị báo cáo chi tiết

## Ưu điểm

1. **Nhanh hơn**: Import trực tiếp, không qua UI
2. **Batch processing**: Xử lý 50 records/lần
3. **Error handling**: Báo lỗi chi tiết từng dòng
4. **Auto-format**: Tự động format ngày tháng, địa chỉ
5. **Default values**: Tự động set giá trị mặc định

## Lưu ý

- Script cần file `.env` với Supabase credentials
- Dữ liệu sẽ được set `status = 'active'` mặc định
- Nếu không có "Loại cư trú", mặc định là "Thường trú"
- Avatar tự động generate từ tên

## Troubleshooting

### Lỗi: Missing Supabase credentials
```bash
# Kiểm tra file .env có đầy đủ:
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

### Lỗi: Cannot find module
```bash
# Cài đặt dependencies
npm install
```

### Lỗi: Duplicate phone number
- Database có constraint unique cho phone_number
- Xóa hoặc sửa số điện thoại trùng trong Excel

## So sánh với UI Import

| Tính năng | UI Import | Direct Import |
|-----------|-----------|---------------|
| Tốc độ | Chậm hơn | Nhanh hơn |
| Batch size | 10 | 50 |
| AI parsing | Có | Không |
| User interaction | Cần | Không cần |
| Phù hợp cho | < 100 records | > 100 records |
