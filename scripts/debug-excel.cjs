/**
 * Script debug để kiểm tra dữ liệu Excel và xem lý do tại sao không upload được
 */
const XLSX = require('xlsx');
const fs = require('fs');

const filePath = process.argv[2] || 'C:\\Users\\Admin\\Downloads\\qqe.xlsx';

console.log(`Đang đọc file: ${filePath}`);
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });

console.log(`\nTổng số dòng: ${data.length}`);
console.log(`\nCác cột trong file:`);
if (data.length > 0) {
    console.log(Object.keys(data[0]).join(', '));
}

console.log(`\n=== 5 BẢN GHI ĐẦU TIÊN ===`);
data.slice(0, 5).forEach((row, index) => {
    console.log(`\nBản ghi ${index + 1}:`);
    console.log(`  Họ và tên: "${row['Họ và tên']}"`);
    console.log(`  Ngày sinh: "${row['Ngày sinh']}"`);
    console.log(`  Giới tính: "${row['Giới tính']}"`);
    console.log(`  Địa chỉ: "${row['Địa chỉ']}"`);
    console.log(`  CMND/CCCD: "${row['CMND/CCCD']}"`);
    console.log(`  Loại Cư Trú: "${row['Loại Cư Trú']}"`);
});

// Kiểm tra bản ghi thiếu họ tên
const missingNames = data.filter(row => !row['Họ và tên'] || !row['Họ và tên'].trim());
console.log(`\n=== THỐNG KÊ ===`);
console.log(`Số bản ghi thiếu họ tên: ${missingNames.length}`);
console.log(`Số bản ghi có họ tên: ${data.length - missingNames.length}`);

if (missingNames.length > 0 && missingNames.length <= 10) {
    console.log(`\nCác bản ghi thiếu họ tên:`);
    missingNames.forEach((row, index) => {
        const rowNum = data.indexOf(row) + 2; // +2 vì Excel bắt đầu từ 1 và có header
        console.log(`  Dòng ${rowNum}: ${JSON.stringify(row).substring(0, 100)}...`);
    });
}
