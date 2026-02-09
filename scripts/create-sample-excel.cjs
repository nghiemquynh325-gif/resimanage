const XLSX = require('xlsx');

// Sample data with proper Vietnamese column names
const data = [
    // Header row
    [
        'HỌ VÀ TÊN',
        'EMAIL',
        'NGÀY SINH',
        'GIỚI TÍNH',
        'SỐ ĐIỆN THOẠI',
        'ĐỊA CHỈ',
        'LOẠI CƯ TRÚ',
        'CMND/CCCD',
        'HỌC VẤN',
        'QUÊ QUÁN',
        'NGHỀ NGHIỆP',
        'DÂN TỘC',
        'TÔN GIÁO',
        'TỔ DÂN PHỐ',
        'TỈNH/THÀNH PHỐ',
        'PHƯỜNG/XÃ',
        'GHI CHÚ ĐẶC BIỆT'
    ],
    // Data rows
    [
        'Nguyễn Văn An',
        'nguyenvanan@email.com',
        '15/03/1985',
        'Nam',
        '0901234567',
        '123 Đường Lê Lợi, Quận 1',
        'Thường trú',
        '079085001234',
        'Đại học',
        'Hà Nội',
        'Kỹ sư',
        'Kinh',
        'Không',
        'Tổ 1',
        'TP. Hồ Chí Minh',
        'Phường Bến Nghé',
        ''
    ],
    [
        'Trần Thị Bình',
        'tranthibinh@email.com',
        '22/07/1990',
        'Nữ',
        '0912345678',
        '456 Nguyễn Huệ, Quận 1',
        'Tạm trú',
        '079090002345',
        'Cao đẳng',
        'Đà Nẵng',
        'Giáo viên',
        'Kinh',
        'Phật giáo',
        'Tổ 2',
        'TP. Hồ Chí Minh',
        'Phường Bến Nghé',
        ''
    ],
    [
        'Lê Văn Cường',
        'levancuong@email.com',
        '10/11/1978',
        'Nam',
        '0923456789',
        '789 Pasteur, Quận 3',
        'Thường trú',
        '079078003456',
        'Trung cấp',
        'Huế',
        'Thợ điện',
        'Kinh',
        'Công giáo',
        'Tổ 3',
        'TP. Hồ Chí Minh',
        'Phường 6',
        ''
    ],
    [
        'Phạm Thị Dung',
        'phamthidung@email.com',
        '05/02/1995',
        'Nữ',
        '0934567890',
        '321 Võ Văn Tần, Quận 3',
        'Tạm trú có nhà',
        '079095004567',
        'Đại học',
        'Cần Thơ',
        'Nhân viên văn phòng',
        'Kinh',
        'Không',
        'Tổ 1',
        'TP. Hồ Chí Minh',
        'Phường 5',
        ''
    ],
    [
        'Hoàng Văn Em',
        'hoangvanem@email.com',
        '18/09/1960',
        'Nam',
        '0945678901',
        '654 Điện Biên Phủ, Quận Bình Thạnh',
        'Thường trú',
        '079060005678',
        'Phổ thông',
        'Bình Định',
        'Hưu trí',
        'Kinh',
        'Phật giáo',
        'Tổ 4',
        'TP. Hồ Chí Minh',
        'Phường 25',
        'Người cao tuổi'
    ],
    [
        'Võ Thị Phương',
        'vothiphuong@email.com',
        '30/12/1988',
        'Nữ',
        '0956789012',
        '987 Cách Mạng Tháng 8, Quận 10',
        'Tạm trú',
        '079088006789',
        'Đại học',
        'Nha Trang',
        'Bác sĩ',
        'Kinh',
        'Không',
        'Tổ 2',
        'TP. Hồ Chí Minh',
        'Phường 5',
        ''
    ],
    [
        'Đặng Văn Giang',
        'dangvangiang@email.com',
        '25/04/1982',
        'Nam',
        '0967890123',
        '147 Lý Thường Kiệt, Quận 11',
        'Thường trú',
        '079082007890',
        'Trung cấp',
        'Vũng Tàu',
        'Tài xế',
        'Kinh',
        'Công giáo',
        'Tổ 5',
        'TP. Hồ Chí Minh',
        'Phường 7',
        ''
    ],
    [
        'Bùi Thị Hoa',
        'buithihoa@email.com',
        '12/06/1992',
        'Nữ',
        '0978901234',
        '258 Trần Hưng Đạo, Quận 5',
        'Tạm vắng',
        '079092008901',
        'Cao đẳng',
        'Đồng Nai',
        'Y tá',
        'Kinh',
        'Phật giáo',
        'Tổ 3',
        'TP. Hồ Chí Minh',
        'Phường 2',
        'Đang công tác nước ngoài'
    ],
    [
        'Ngô Văn Ích',
        '',
        '08/08/1975',
        'Nam',
        '0989012345',
        '369 Nguyễn Thị Minh Khai, Quận 1',
        'Thường trú',
        '079075009012',
        'Đại học',
        'Bến Tre',
        'Doanh nhân',
        'Kinh',
        'Không',
        'Tổ 1',
        'TP. Hồ Chí Minh',
        'Phường Bến Thành',
        ''
    ],
    [
        'Đinh Thị Kim',
        'dinhthikim@email.com',
        '20/01/1998',
        'Nữ',
        '0990123456',
        '741 Hai Bà Trưng, Quận 3',
        'Tạm trú',
        '079098010123',
        'Đại học',
        'Long An',
        'Sinh viên',
        'Kinh',
        'Không',
        'Tổ 2',
        'TP. Hồ Chí Minh',
        'Phường Võ Thị Sáu',
        'Đang học đại học'
    ]
];

// Create worksheet from array of arrays
const ws = XLSX.utils.aoa_to_sheet(data);

// Set column widths for better readability
ws['!cols'] = [
    { wch: 20 },  // Họ và tên
    { wch: 25 },  // Email
    { wch: 12 },  // Ngày sinh
    { wch: 10 },  // Giới tính
    { wch: 15 },  // SĐT
    { wch: 35 },  // Địa chỉ
    { wch: 15 },  // Loại cư trú
    { wch: 15 },  // CMND/CCCD
    { wch: 15 },  // Học vấn
    { wch: 20 },  // Quê quán
    { wch: 20 },  // Nghề nghiệp
    { wch: 12 },  // Dân tộc
    { wch: 15 },  // Tôn giáo
    { wch: 12 },  // Tổ dân phố
    { wch: 20 },  // Tỉnh/TP
    { wch: 20 },  // Phường/Xã
    { wch: 25 }   // Ghi chú
];

// Create workbook and add worksheet
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Danh sách cư dân');

// Write file
XLSX.writeFile(wb, 'mau_import_cu_dan.xlsx');

console.log('✅ Đã tạo file mau_import_cu_dan.xlsx thành công!');
console.log('📍 Vị trí: ' + __dirname + '\\mau_import_cu_dan.xlsx');
console.log('📊 Số lượng: 10 cư dân mẫu');
console.log('');
console.log('Các cột trong file:');
console.log('  1. HỌ VÀ TÊN (bắt buộc)');
console.log('  2. EMAIL');
console.log('  3. NGÀY SINH (định dạng: DD/MM/YYYY)');
console.log('  4. GIỚI TÍNH (Nam/Nữ)');
console.log('  5. SỐ ĐIỆN THOẠI');
console.log('  6. ĐỊA CHỈ');
console.log('  7. LOẠI CƯ TRÚ (Thường trú/Tạm trú/Tạm vắng/Tạm trú có nhà)');
console.log('  8. CMND/CCCD');
console.log('  9. HỌC VẤN');
console.log(' 10. QUÊ QUÁN');
console.log(' 11. NGHỀ NGHIỆP');
console.log(' 12. DÂN TỘC');
console.log(' 13. TÔN GIÁO');
console.log(' 14. TỔ DÂN PHỐ');
console.log(' 15. TỈNH/THÀNH PHỐ');
console.log(' 16. PHƯỜNG/XÃ');
console.log(' 17. GHI CHÚ ĐẶC BIỆT');
