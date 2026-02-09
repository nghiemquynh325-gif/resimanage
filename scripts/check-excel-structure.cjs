/**
 * Script để xem đầy đủ cấu trúc Excel
 */

const XLSX = require('xlsx');
const fs = require('fs');

const filePath = 'C:\\Users\\Admin\\Downloads\\qe.xlsx';

console.log(`Đang đọc file: ${filePath}\n`);

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(worksheet, {
    raw: false,
    defval: null
});

console.log(`Tổng số dòng: ${data.length}\n`);

if (data.length > 0) {
    console.log('=== DANH SÁCH CÁC CỘT ===');
    const columns = Object.keys(data[0]);
    columns.forEach((col, index) => {
        console.log(`${index + 1}. "${col}"`);
    });

    console.log('\n=== MẪU DỮ LIỆU (3 DÒNG ĐẦU) ===\n');

    for (let i = 0; i < Math.min(3, data.length); i++) {
        console.log(`--- Dòng ${i + 1} ---`);
        const row = data[i];
        for (const [key, value] of Object.entries(row)) {
            if (value) {
                console.log(`  ${key}: ${value}`);
            }
        }
        console.log('');
    }

    // Lưu vào file
    fs.writeFileSync('excel-structure.json', JSON.stringify({
        totalRows: data.length,
        columns: columns,
        sampleData: data.slice(0, 5)
    }, null, 2), 'utf8');

    console.log('Đã lưu chi tiết vào file: excel-structure.json');
}
