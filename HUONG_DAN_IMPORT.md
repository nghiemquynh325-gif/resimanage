# HƯỚNG DẪN SỬ DỤNG FILE MẪU IMPORT CƯ DÂN

## File mẫu đã tạo
- **File CSV**: `mau_import_cu_dan.csv` (có thể mở bằng Excel)

## Cách sử dụng

### Bước 1: Mở file CSV bằng Excel
1. Mở Microsoft Excel
2. File → Open → Chọn `mau_import_cu_dan.csv`
3. Hoặc: Click đúp vào file CSV (sẽ tự động mở bằng Excel)

### Bước 2: Lưu thành file Excel (.xlsx)
1. File → Save As
2. Chọn định dạng: **Excel Workbook (*.xlsx)**
3. Đặt tên: `danh_sach_cu_dan.xlsx`
4. Click **Save**

### Bước 3: Nhập dữ liệu
- **Không xóa dòng header** (dòng đầu tiên)
- Nhập dữ liệu từ dòng 2 trở đi
- Có thể xóa các dòng mẫu và nhập dữ liệu thực

## Mô tả các cột

### Cột BẮT BUỘC (*)
1. **HỌ TÊN** (*) - Họ và tên đầy đủ
   - Ví dụ: `NGUYỄN VĂN A`

2. **NGÀY SINH** (*) - Định dạng: DD/MM/YYYY
   - Ví dụ: `15/05/1985`

3. **GIỚI TÍNH** (*) - Nam/Nữ/Khác
   - Ví dụ: `Nam`, `Nữ`

4. **ĐỊA CHỈ** (*) - Địa chỉ thường trú
   - Ví dụ: `40/03 Khu phố 3, Phường An Phú, Thành phố Hồ Chí Minh`

5. **SỐ ĐIỆN THOẠI** (*) - 10 chữ số
   - Ví dụ: `0901234567`

### Cột TÙY CHỌN
6. **CCCD** - Số căn cước công dân (9-12 số)
   - Ví dụ: `001085012345`

7. **EMAIL** - Địa chỉ email
   - Ví dụ: `nguyenvana@email.com`

8. **TỔ DÂN PHỐ** - Số tổ
   - Ví dụ: `1`, `2`, `3`

9. **NGHỀ NGHIỆP** - Công việc hiện tại
   - Ví dụ: `Kỹ sư`, `Giáo viên`, `Bác sĩ`

10. **HỌC VẤN** - Trình độ học vấn
    - Ví dụ: `Đại học`, `Thạc sĩ`, `Cao đẳng`, `Trung cấp`

11. **QUÊ QUÁN** - Nơi sinh
    - Ví dụ: `Hà Nội`, `TP.HCM`, `Đà Nẵng`

12. **DÂN TỘC** - Dân tộc
    - Ví dụ: `Kinh`, `Tày`, `Thái`, `Mường`

13. **TÔN GIÁO** - Tôn giáo
    - Ví dụ: `Không`, `Phật giáo`, `Công giáo`, `Tin lành`

14. **ĐẢNG VIÊN** - Có/Không
    - Ví dụ: `Có`, `Không`

15. **NGÀY VÀO ĐẢNG** - Định dạng: DD/MM/YYYY (nếu là đảng viên)
    - Ví dụ: `01/01/2010`

16. **ĐẶC ĐIỂM** - Ghi chú đặc biệt
    - Ví dụ: `Gia đình chính sách`, `Thương binh`, `Liệt sĩ`

## Lưu ý quan trọng

### ✅ Nên làm:
- Giữ nguyên tên cột ở dòng đầu tiên
- Nhập đầy đủ các trường bắt buộc (*)
- Sử dụng định dạng ngày: DD/MM/YYYY
- Số điện thoại: 10 chữ số, bắt đầu bằng 0
- CCCD: 9-12 chữ số

### ❌ Không nên:
- Xóa hoặc đổi tên cột header
- Để trống các trường bắt buộc
- Sử dụng ký tự đặc biệt trong tên
- Nhập sai định dạng ngày tháng

## Ví dụ dữ liệu hợp lệ

```
HỌ TÊN: NGUYỄN VĂN A
NGÀY SINH: 15/05/1985
GIỚI TÍNH: Nam
CCCD: 001085012345
ĐỊA CHỈ: 40/03 Khu phố 3, Phường An Phú, TP.HCM
SỐ ĐIỆN THOẠI: 0901234567
EMAIL: nguyenvana@email.com
TỔ DÂN PHỐ: 1
```

## Sau khi hoàn tất

1. **Lưu file** Excel (.xlsx)
2. Vào trang **Quản lý Cư dân**
3. Click nút **"Import Excel"** (màu xanh lá)
4. Upload file vừa tạo
5. Kiểm tra mapping tự động
6. Click **"Import"**

## Hỗ trợ

Nếu gặp lỗi khi import:
- Kiểm tra lại định dạng dữ liệu
- Đảm bảo các trường bắt buộc không để trống
- Xem thông báo lỗi chi tiết để biết dòng nào bị lỗi
