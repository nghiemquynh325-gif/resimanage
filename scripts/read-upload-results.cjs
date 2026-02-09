/**
 * Script đơn giản để đọc kết quả upload
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

const latestLog = files[0];
console.log(`Đọc file log: ${latestLog.name}\n`);

const log = JSON.parse(fs.readFileSync(latestLog.path, 'utf8'));

console.log('=== KẾT QUẢ UPLOAD ===');
console.log(`Tổng số dòng: ${log.total}`);
console.log(`Bản ghi hợp lệ: ${log.valid}`);
console.log(`Bản ghi bỏ qua: ${log.skipped.length}`);
console.log('');
console.log('Kết quả upload:');
console.log(`  ✓ Thành công: ${log.uploadResults.success}`);
console.log(`  ✗ Thất bại: ${log.uploadResults.failed}`);

if (log.uploadResults.errors && log.uploadResults.errors.length > 0) {
    console.log(`\nLỗi: ${log.uploadResults.errors.length} batches`);
    console.log('Chi tiết 3 lỗi đầu tiên:');
    log.uploadResults.errors.slice(0, 3).forEach(err => {
        console.log(`  - Batch ${err.batch}: ${err.error.substring(0, 100)}...`);
    });
}

console.log('\n=== MẪU DỮ LIỆU BỊ BỎ QUA (5 DÒNG ĐẦU) ===');
log.skipped.slice(0, 5).forEach(skip => {
    console.log(`Dòng ${skip.row} (${skip.name}): ${skip.reason}`);
});
