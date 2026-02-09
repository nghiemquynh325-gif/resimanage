/**
 * Script để kiểm tra tên cột chính xác trong Excel
 */
const XLSX = require('xlsx');

const filePath = process.argv[2] || 'C:\\Users\\Admin\\Downloads\\qqe.xlsx';

console.log(`Đang đọc file: ${filePath}`);
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });

console.log(`\nTổng số dòng: ${data.length}\n`);

if (data.length > 0) {
    console.log('=== TÊN CÁC CỘT (với mã hex để kiểm tra ký tự đặc biệt) ===\n');
    Object.keys(data[0]).forEach((col, index) => {
        const hex = Buffer.from(col, 'utf8').toString('hex');
        console.log(`${index + 1}. "${col}"`);
        console.log(`   Hex: ${hex}`);
        console.log(`   Length: ${col.length} chars\n`);
    });

    console.log('\n=== KIỂM TRA CỘT "Họ và tên" ===');
    const nameColumn = Object.keys(data[0]).find(col => col.includes('tên') || col.includes('Họ'));
    if (nameColumn) {
        console.log(`Tìm thấy cột: "${nameColumn}"`);
        console.log(`Giá trị mẫu:`);
        data.slice(0, 5).forEach((row, i) => {
            console.log(`  ${i + 1}. "${row[nameColumn]}"`);
        });
    } else {
        console.log('KHÔNG TÌM THẤY cột chứa "tên" hoặc "Họ"');
    }
}
