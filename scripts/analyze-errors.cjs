/**
 * Script để phân tích lỗi upload
 */
const fs = require('fs');
const path = require('path');

// Tìm file log mới nhất
const scriptsDir = __dirname;
const files = fs.readdirSync(scriptsDir)
    .filter(f => f.startsWith('upload-log-') && f.endsWith('.json'))
    .map(f => ({
        name: f,
        path: path.join(scriptsDir, f),
        time: fs.statSync(path.join(scriptsDir, f)).mtime
    }))
    .sort((a, b) => b.time - a.time);

if (files.length === 0) {
    console.log('Không tìm thấy file log!');
    process.exit(1);
}

const log = JSON.parse(fs.readFileSync(files[0].path, 'utf8'));

console.log('=== PHÂN TÍCH LỖI UPLOAD ===\n');
console.log(`File log: ${files[0].name}`);
console.log(`Tổng: ${log.total}`);
console.log(`Thành công: ${log.uploadResults.success}`);
console.log(`Thất bại: ${log.uploadResults.failed}`);
console.log(`Số batch lỗi: ${log.uploadResults.errors.length}\n`);

if (log.uploadResults.errors.length > 0) {
    console.log('=== CHI TIẾT LỖI ===\n');
    log.uploadResults.errors.forEach((err, index) => {
        console.log(`Batch ${err.batch} (${err.count} records):`);
        console.log(`  Error: ${err.error.substring(0, 150)}...`);
        console.log('');
    });

    // Phân tích loại lỗi
    const errorTypes = {};
    log.uploadResults.errors.forEach(err => {
        const errorKey = err.error.substring(0, 50);
        errorTypes[errorKey] = (errorTypes[errorKey] || 0) + err.count;
    });

    console.log('=== PHÂN LOẠI LỖI ===\n');
    Object.entries(errorTypes).forEach(([type, count]) => {
        console.log(`${count} records: ${type}...`);
    });
}
