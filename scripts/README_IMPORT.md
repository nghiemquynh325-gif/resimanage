# Excel to Supabase Import Tool

Script để import dữ liệu từ Excel vào Supabase database.

## 📋 Yêu cầu

- Node.js đã cài đặt
- File Excel với dữ liệu cần import

## 🚀 Cài đặt

### Bước 1: Cài đặt dependencies

```bash
npm install xlsx @supabase/supabase-js
```

### Bước 2: Cấu hình script

Mở file `scripts/import-excel.js` và thay đổi:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Thay bằng URL Supabase của bạn
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Thay bằng anon key
const EXCEL_FILE = 'residents_data.xlsx'; // Tên file Excel
const TABLE_NAME = 'residents'; // Tên table trong database
```

**Lấy Supabase credentials**:
1. Vào Supabase Dashboard
2. Settings → API
3. Copy `Project URL` và `anon/public key`

## 📊 Chuẩn bị file Excel

### Template Excel

Tạo file Excel với các cột sau (có thể tùy chỉnh):

| Họ và tên | Ngày sinh | Giới tính | Số điện thoại | Email | CCCD/CMND | Dân tộc | Tôn giáo | Địa chỉ | Loại cư trú |
|-----------|-----------|-----------|---------------|-------|-----------|---------|----------|---------|-------------|
| Nguyễn Văn A | 1990-01-15 | Nam | 0123456789 | a@example.com | 001234567890 | Kinh | Không | 123 ABC | Thường trú |
| Trần Thị B | 1995-05-20 | Nữ | 0987654321 | b@example.com | 009876543210 | Kinh | Phật giáo | 456 XYZ | Tạm trú |

### Lưu ý

- **Ngày sinh**: Format `YYYY-MM-DD` (ví dụ: `1990-01-15`)
- **Giới tính**: `Nam` hoặc `Nữ`
- **Loại cư trú**: `Thường trú`, `Tạm trú`, `Tạm vắng`, hoặc `Tạm trú có nhà`

## ▶️ Chạy script

### Bước 1: Đặt file Excel

Đặt file Excel vào thư mục project hoặc chỉ định đường dẫn đầy đủ:

```javascript
const EXCEL_FILE = 'residents_data.xlsx'; // Trong thư mục project
// hoặc
const EXCEL_FILE = 'C:/Users/Admin/Documents/data.xlsx'; // Đường dẫn đầy đủ
```

### Bước 2: Chạy import

```bash
node scripts/import-excel.js
```

### Kết quả mong đợi

```
==================================================
📥 EXCEL TO SUPABASE IMPORT TOOL
==================================================

🔌 Verifying Supabase connection...
✅ Supabase connection successful

📂 Reading Excel file: residents_data.xlsx
📊 Reading sheet: Sheet1
✅ Found 100 rows in Excel file

📋 Sample data (first row):
{
  "Họ và tên": "Nguyễn Văn A",
  "Ngày sinh": "1990-01-15",
  ...
}

🔄 Transformed 100 records
⏳ Inserting batch 1/1 (100 records)...
✅ Batch 1 inserted successfully

==================================================
📊 IMPORT SUMMARY
==================================================
Total rows in Excel: 100
Successfully inserted: 100
Failed: 0
==================================================

✅ Import completed successfully!
```

## 🔧 Tùy chỉnh

### Thay đổi mapping columns

Sửa function `transformRow` trong `import-excel.js`:

```javascript
function transformRow(row) {
  return {
    // Thay đổi tên cột Excel theo file của bạn
    full_name: row['Tên cư dân'], // Thay 'Họ và tên' thành 'Tên cư dân'
    dob: row['Sinh nhật'],        // Thay 'Ngày sinh' thành 'Sinh nhật'
    // ... các cột khác
  };
}
```

### Import table khác

Thay đổi `TABLE_NAME` và `transformRow`:

```javascript
const TABLE_NAME = 'households'; // Import vào table households

function transformRow(row) {
  return {
    household_code: row['Mã hộ'],
    head_name: row['Chủ hộ'],
    address: row['Địa chỉ'],
    // ...
  };
}
```

## ⚠️ Xử lý lỗi

### Lỗi: "File not found"

- Kiểm tra đường dẫn file Excel
- Đảm bảo file tồn tại

### Lỗi: "Connection failed"

- Kiểm tra `SUPABASE_URL` và `SUPABASE_KEY`
- Kiểm tra internet connection
- Verify table name đúng

### Lỗi: "RLS policy"

- Vào Supabase → Table Editor → RLS policies
- Tạm thời disable RLS hoặc thêm policy cho phép insert

### Lỗi: "Duplicate key"

- Có record trùng email hoặc identity_card
- Xóa duplicates trong Excel hoặc database

## 📝 Tips

1. **Test với ít data trước**: Import 5-10 rows để test
2. **Backup database**: Export data hiện tại trước khi import
3. **Check data quality**: Verify Excel data trước khi import
4. **Batch size**: Mặc định 100 rows/batch, có thể thay đổi nếu cần

## 🎯 Ví dụ sử dụng

### Import residents

```bash
# 1. Chuẩn bị file residents_data.xlsx
# 2. Cấu hình script
# 3. Chạy
node scripts/import-excel.js
```

### Import households

```javascript
// Trong import-excel.js
const TABLE_NAME = 'households';
const EXCEL_FILE = 'households_data.xlsx';
```

```bash
node scripts/import-excel.js
```

## 🔒 Security

- **KHÔNG** commit file chứa `SUPABASE_KEY` lên Git
- Sử dụng environment variables cho production
- Xóa file Excel sau khi import (nếu chứa thông tin nhạy cảm)
