/**
 * Script to generate Excel template for resident import
 * Run: node scripts/generate-import-template.js
 */

import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template data with headers and sample rows
const templateData = [
    // Header row
    [
        'HỌ TÊN',
        'NGÀY SINH',
        'GIỚI TÍNH',
        'CCCD',
        'ĐỊA CHỈ',
        'SỐ ĐIỆN THOẠI',
        'EMAIL',
        'TỔ DÂN PHỐ',
        'NGHỀ NGHIỆP',
        'HỌC VẤN',
        'QUÊ QUÁN',
        'DÂN TỘC',
        'TÔN GIÁO',
        'ĐẢNG VIÊN',
        'NGÀY VÀO ĐẢNG',
        'ĐẶC ĐIỂM'
    ],
    // Sample data rows
    [
        'NGUYỄN VĂN A',
        '15/05/1985',
        'Nam',
        '001085012345',
        '40/03 Khu phố 3, Phường An Phú, Thành phố Hồ Chí Minh',
        '0901234567',
        'nguyenvana@email.com',
        '1',
        'Kỹ sư',
        'Đại học',
        'Hà Nội',
        'Kinh',
        'Không',
        'Có',
        '01/01/2010',
        ''
    ],
    [
        'TRƯƠNG THỊ B',
        '20/08/1990',
        'Nữ',
        '001090054321',
        '40/03 Khu phố 3, Phường An Phú, Thành phố Hồ Chí Minh',
        '0912345678',
        'truongthib@email.com',
        '1',
        'Giáo viên',
        'Đại học',
        'TP.HCM',
        'Kinh',
        'Phật giáo',
        'Không',
        '',
        ''
    ],
    [
        'NGUYỄN VĂN C',
        '10/03/1978',
        'Nam',
        '001078098765',
        '40/03 Khu phố 3, Phường An Phú, Thành phố Hồ Chí Minh',
        '0923456789',
        'nguyenvanc@email.com',
        '2',
        'Bác sĩ',
        'Thạc sĩ',
        'Đà Nẵng',
        'Kinh',
        'Không',
        'Có',
        '15/06/2005',
        ''
    ],
    [
        'LÊ THỊ D',
        '25/12/1995',
        'Nữ',
        '001095011111',
        '40/03 Khu phố 3, Phường An Phú, Thành phố Hồ Chí Minh',
        '0934567890',
        'lethid@email.com',
        '2',
        'Nhân viên văn phòng',
        'Cao đẳng',
        'Cần Thơ',
        'Kinh',
        'Công giáo',
        'Không',
        '',
        'Gia đình chính sách'
    ],
    [
        'PHẠM VĂN E',
        '05/07/1982',
        'Nam',
        '001082022222',
        '40/03 Khu phố 3, Phường An Phú, Thành phố Hồ Chí Minh',
        '0945678901',
        'phamvane@email.com',
        '3',
        'Kinh doanh',
        'Đại học',
        'Hải Phòng',
        'Kinh',
        'Không',
        'Không',
        '',
        ''
    ]
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(templateData);

// Set column widths for better readability
const colWidths = [
    { wch: 20 }, // HỌ TÊN
    { wch: 12 }, // NGÀY SINH
    { wch: 10 }, // GIỚI TÍNH
    { wch: 15 }, // CCCD
    { wch: 50 }, // ĐỊA CHỈ
    { wch: 15 }, // SỐ ĐIỆN THOẠI
    { wch: 25 }, // EMAIL
    { wch: 12 }, // TỔ DÂN PHỐ
    { wch: 20 }, // NGHỀ NGHIỆP
    { wch: 15 }, // HỌC VẤN
    { wch: 15 }, // QUÊ QUÁN
    { wch: 12 }, // DÂN TỘC
    { wch: 15 }, // TÔN GIÁO
    { wch: 12 }, // ĐẢNG VIÊN
    { wch: 15 }, // NGÀY VÀO ĐẢNG
    { wch: 25 }  // ĐẶC ĐIỂM
];
ws['!cols'] = colWidths;

// Style header row (bold)
const headerRange = XLSX.utils.decode_range(ws['!ref']);
for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" }
    };
}

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Danh sách cư dân');

// Write to file in project root
const outputPath = path.join(__dirname, '..', 'mau_import_cu_dan.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ Đã tạo file mẫu thành công!');
console.log(`📁 Đường dẫn: ${outputPath}`);
console.log('');
console.log('Hướng dẫn sử dụng:');
console.log('1. Mở file Excel vừa tạo');
console.log('2. Xóa các dòng mẫu (dòng 2-6)');
console.log('3. Nhập dữ liệu thực của bạn');
console.log('4. Lưu file');
console.log('5. Vào trang Quản lý Cư dân → Import Excel → Upload file');
