# Hướng Dẫn Import Hàng Loạt Cư Dân

## 📋 Giới thiệu

Script này cho phép import hàng loạt dữ liệu cư dân (12,000+ bản ghi) từ file Excel trực tiếp vào Supabase database, nhanh chóng và ổn định hơn so với import qua giao diện web.

## ✨ Tính năng

- ✅ Import hàng nghìn bản ghi trong vài phút
- ✅ Progress bar hiển thị tiến độ real-time
- ✅ Tự động retry khi gặp lỗi
- ✅ Resume từ điểm dừng nếu bị gián đoạn
- ✅ Validation dữ liệu tự động
- ✅ Log chi tiết các lỗi
- ✅ Tự động map tên cột tiếng Việt

## 📦 Yêu cầu

- Node.js đã cài đặt
- File `.env` đã cấu hình với Supabase credentials
- File Excel chứa dữ liệu cư dân

## 🚀 Cách sử dụng

### Bước 1: Chuẩn bị file Excel

File Excel cần có các cột sau (tên cột có thể viết hoa/thường, có dấu hoặc không dấu):

**Bắt buộc:**
- `HỌ TÊN` - Họ và tên đầy đủ
- `NGÀY SINH` - Định dạng: DD/MM/YYYY (ví dụ: 15/05/1985)
- `GIỚI TÍNH` - Nam/Nữ/Khác
- `SỐ ĐIỆN THOẠI` - 10 chữ số
- `ĐỊA CHỈ` - Địa chỉ thường trú

**Tùy chọn:**
- `EMAIL`
- `CCCD` - Số căn cước công dân
- `NGHỀ NGHIỆP`
- `HỌC VẤN`
- `QUÊ QUÁN`
- `DÂN TỘC`
- `TÔN GIÁO`
- `TỔ DÂN PHỐ`
- `TỈNH/THÀNH PHỐ`
- `PHƯỜNG/XÃ`
- `ĐẢNG VIÊN` - Có/Không
- `NGÀY VÀO ĐẢNG` - DD/MM/YYYY
- `ĐẶC ĐIỂM`

### Bước 2: Chạy script

```bash
node scripts/bulk-import-residents.js <đường-dẫn-file-excel>
```

**Ví dụ:**

```bash
# Import từ file trong thư mục data
node scripts/bulk-import-residents.js ./data/residents.xlsx

# Import từ file ở Desktop
node scripts/bulk-import-residents.js "C:\Users\Admin\Desktop\danh-sach-cu-dan.xlsx"
```

### Bước 3: Theo dõi tiến độ

Script sẽ hiển thị:

```
📖 Reading Excel file: ./data/residents.xlsx
✅ Found 12000 rows with 15 columns
📋 Headers: HỌ TÊN, NGÀY SINH, GIỚI TÍNH, ...

🗺️  Field Mapping:
   HỌ TÊN → full_name
   NGÀY SINH → dob
   GIỚI TÍNH → gender
   ...

🔄 Transforming and validating data...

✅ Valid records: 11950
⚠️  Skipped records: 50

🚀 Starting import (100 records per batch)...

[████████████████████████████████████████] 100% | 11950/11950 | ✅ 11900 | ❌ 50

╔════════════════════════════════════════════════════════════╗
║                    IMPORT SUMMARY                          ║
╚════════════════════════════════════════════════════════════╝

📊 Total records:     12000
✅ Successfully imported: 11900
❌ Failed:            50
⚠️  Skipped:          50
⏱️  Duration:         245.32s
⚡ Speed:            48.52 records/sec

📝 Error log saved to: logs/import-log.json
```

## 🔄 Resume khi bị gián đoạn

Nếu script bị dừng giữa chừng (Ctrl+C, mất mạng, v.v.), chỉ cần chạy lại lệnh:

```bash
node scripts/bulk-import-residents.js ./data/residents.xlsx
```

Script sẽ tự động phát hiện và hỏi có muốn resume không:

```
⚠️  Found previous import progress (batch 45)
Do you want to resume? (Press Ctrl+C to cancel, or wait 5 seconds to resume)
```

Đợi 5 giây hoặc nhấn Enter để tiếp tục từ batch cuối cùng.

## 📝 Kiểm tra lỗi

Sau khi import, nếu có lỗi, kiểm tra file log:

```bash
# Xem file log
cat logs/import-log.json
```

File log chứa:
- Tổng quan kết quả import
- Danh sách các dòng bị lỗi
- Lý do lỗi cụ thể

**Ví dụ log:**

```json
{
  "summary": {
    "total": 12000,
    "success": 11900,
    "failed": 50,
    "skipped": 50,
    "duration": "245.32s"
  },
  "errors": [
    {
      "row": 125,
      "resident": "Nguyễn Văn A",
      "errors": ["Thiếu số điện thoại"]
    },
    {
      "row": 456,
      "resident": "Trần Thị B",
      "errors": ["Số điện thoại không hợp lệ (phải có 10 chữ số)"]
    }
  ]
}
```

## ⚙️ Cấu hình nâng cao

Mở file `scripts/bulk-import-residents.js` và chỉnh sửa:

```javascript
const CONFIG = {
    BATCH_SIZE: 100,              // Số bản ghi mỗi batch (tăng để nhanh hơn)
    DELAY_BETWEEN_BATCHES: 200,   // Delay giữa các batch (ms)
    MAX_RETRIES: 3,               // Số lần retry khi lỗi
};
```

**Khuyến nghị:**
- `BATCH_SIZE`: 50-200 (tùy tốc độ mạng)
- `DELAY_BETWEEN_BATCHES`: 100-500ms
- `MAX_RETRIES`: 2-5

## 🐛 Xử lý sự cố

### Lỗi: "Missing Supabase credentials"

**Nguyên nhân:** File `.env` chưa có hoặc thiếu thông tin Supabase

**Giải pháp:**
1. Kiểm tra file `.env` có tồn tại không
2. Đảm bảo có 2 dòng:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Lỗi: "File not found"

**Nguyên nhân:** Đường dẫn file Excel không đúng

**Giải pháp:**
- Sử dụng đường dẫn tuyệt đối: `C:\Users\Admin\Desktop\file.xlsx`
- Hoặc đường dẫn tương đối từ thư mục project: `./data/file.xlsx`

### Lỗi: "Excel file is empty"

**Nguyên nhân:** File Excel không có dữ liệu hoặc sheet đầu tiên trống

**Giải pháp:**
- Đảm bảo dữ liệu ở sheet đầu tiên
- Dòng đầu tiên phải là header (tên cột)
- Dữ liệu bắt đầu từ dòng 2

### Import chậm

**Nguyên nhân:** Mạng chậm hoặc batch size nhỏ

**Giải pháp:**
- Tăng `BATCH_SIZE` lên 200-300
- Giảm `DELAY_BETWEEN_BATCHES` xuống 100ms
- Kiểm tra kết nối internet

### Nhiều bản ghi bị skip

**Nguyên nhân:** Dữ liệu không hợp lệ

**Giải pháp:**
1. Kiểm tra file log để xem lỗi cụ thể
2. Sửa dữ liệu trong Excel theo yêu cầu:
   - Ngày sinh: DD/MM/YYYY
   - Giới tính: Nam/Nữ/Khác
   - Số điện thoại: 10 chữ số
3. Import lại

## 💡 Tips

1. **Test với file nhỏ trước**: Tạo file Excel với 10-20 dòng để test trước khi import toàn bộ

2. **Backup dữ liệu**: Export dữ liệu hiện tại từ Supabase trước khi import

3. **Kiểm tra duplicate**: Script không tự động kiểm tra trùng lặp. Nên kiểm tra số điện thoại/CCCD trùng trong Excel trước

4. **Chia nhỏ file**: Nếu file quá lớn (>20,000 dòng), chia thành nhiều file nhỏ hơn

5. **Import ngoài giờ cao điểm**: Import vào lúc ít người dùng để tránh ảnh hưởng performance

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra file log: `logs/import-log.json`
2. Xem lại hướng dẫn ở trên
3. Liên hệ admin hệ thống
