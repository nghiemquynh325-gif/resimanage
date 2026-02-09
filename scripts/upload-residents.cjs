/**
 * Script để upload dữ liệu cư dân từ Excel lên Supabase
 * Sử dụng snake_case cho tất cả field names
 * 
 * Cách sử dụng:
 * node scripts/upload-residents.cjs "C:\path\to\file.xlsx"
 */

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cấu hình Supabase
const SUPABASE_URL = 'https://etcwjkfiduzblrkdlzpp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3dqa2ZpZHV6Ymxya2RsenBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTA4NDQsImV4cCI6MjA4MTY4Njg0NH0.NIhwxPq0oUlWTiKfYn2PP5SfNfhiriKNQZyLfE2Hvfk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mapping cột Excel -> Database (snake_case)
// CẬP NHẬT: Các cột trong file Excel đều viết HOA
const COLUMN_MAPPING = {
    'STT': null,
    'HỌ VÀ TÊN': 'full_name',
    'EMAIL': 'email',
    'NGÀY SINH': 'dob',
    'GIỚI TÍNH': 'gender',
    'SỐ ĐIỆN THOẠI': 'phone_number',
    'ĐỊA CHỈ': 'address',
    'LOẠI CƯ TRÚ': 'residence_type',
    'CMND/CCCD': 'identity_card',
    'HỌC VẤN': 'education',
    'QUÊ QUÁN': 'hometown',
    'NGHỀ NGHIỆP': 'profession',
    'DÂN TỘC': 'ethnicity',
    'TÔN GIÁO': 'religion',
    'TỔ DÂN PHỐ': 'unit',
    'TỈNH/THÀNH PHỐ': 'province',
    'PHƯỜNG/XÃ': 'ward',
    'GHI CHÚ ĐẶC BIỆT': 'special_notes',
    'TRẠNG THÁI': null,  // Bỏ qua, sẽ set mặc định là 'active'
    'ĐẢNG VIÊN': null,   // Bỏ qua, thông tin đảng viên ở bảng riêng
    'NGÀY VÀO ĐẢNG': null  // Bỏ qua, thông tin đảng viên ở bảng riêng
};

function normalizeGender(value) {
    if (!value) return 'Khác';
    const normalized = value.toString().trim().toLowerCase();
    if (normalized === 'nam' || normalized === 'male' || normalized === 'm') return 'Nam';
    if (normalized === 'nữ' || normalized === 'nu' || normalized === 'female' || normalized === 'f') return 'Nữ';
    return 'Khác';
}

function normalizeResidenceType(value) {
    if (!value) return null; // Return null instead of default
    const normalized = value.toString().trim().toLowerCase();

    // Exact matching (case-insensitive)
    if (normalized === 'thường trú' || normalized === 'thuong tru') return 'Thường trú';
    if (normalized === 'tạm trú' || normalized === 'tam tru') return 'Tạm trú';
    if (normalized === 'tạm vắng' || normalized === 'tam vang') return 'Tạm vắng';
    if (normalized === 'tạm trú có nhà' || normalized === 'tam tru co nha') return 'Tạm trú có nhà';

    // Return original value if not recognized (will be stored as-is)
    return value.toString().trim();
}

function normalizeDate(value) {
    if (!value) return null;
    try {
        let year, month, day;

        if (typeof value === 'number') {
            const date = XLSX.SSF.parse_date_code(value);
            year = date.y;
            month = date.m;
            day = date.d;
        } else if (typeof value === 'string') {
            const formats = [
                /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
                /(\d{4})-(\d{1,2})-(\d{1,2})/,
                /(\d{1,2})-(\d{1,2})-(\d{4})/,
            ];
            for (const format of formats) {
                const match = value.match(format);
                if (match) {
                    if (format === formats[0] || format === formats[2]) {
                        [, day, month, year] = match;
                    } else {
                        [, year, month, day] = match;
                    }
                    year = parseInt(year);
                    month = parseInt(month);
                    day = parseInt(day);
                    break;
                }
            }
            if (!year) return null; // No match found
        } else if (value instanceof Date) {
            return value.toISOString().split('T')[0];
        } else {
            return null;
        }

        // Basic range validation
        if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
            return null;
        }

        // ✅ CRITICAL: Validate actual date using JavaScript Date object
        // This catches invalid dates like Feb 29 in non-leap years
        const testDate = new Date(year, month - 1, day);
        if (testDate.getFullYear() !== year ||
            testDate.getMonth() !== month - 1 ||
            testDate.getDate() !== day) {
            // Invalid date (e.g., 1998-02-29, 2001-04-31)
            return null;
        }

        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } catch (error) {
        return null;
    }
}

function readExcelFile(filePath) {
    console.log(`Đang đọc file: ${filePath}`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`File không tồn tại: ${filePath}`);
    }
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });
    console.log(`Đã đọc ${data.length} dòng dữ liệu`);
    return data;
}

function transformData(excelData) {
    console.log('Đang chuyển đổi dữ liệu...');
    const residents = [];
    const skipped = [];

    excelData.forEach((row, index) => {
        try {
            const resident = {
                status: 'active',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (row['Họ và tên'] || `user${index}`)
            };

            for (const [excelCol, dbField] of Object.entries(COLUMN_MAPPING)) {
                if (!dbField) continue;
                let value = row[excelCol];

                if (dbField === 'gender') {
                    value = normalizeGender(value);
                } else if (dbField === 'residence_type') {
                    value = normalizeResidenceType(value);
                } else if (dbField === 'dob') {
                    value = normalizeDate(value);
                } else if (dbField === 'phone_number') {
                    value = value ? value.toString().replace(/\s+/g, '') : '';
                } else if (dbField === 'identity_card') {
                    value = value ? value.toString().replace(/[^0-9]/g, '') : '';
                }

                resident[dbField] = value || null;
            }

            // CHỈ validate họ tên
            if (!resident.full_name || !resident.full_name.trim()) {
                throw new Error('Thiếu họ tên');
            }

            // Đặt phone_number mặc định
            if (!resident.phone_number) {
                resident.phone_number = '0000000000';
            }

            residents.push(resident);
        } catch (error) {
            skipped.push({
                row: index + 2,
                name: row['Họ và tên'] || 'N/A',
                reason: error.message
            });
        }
    });

    console.log(`Chuyển đổi thành công: ${residents.length} bản ghi`);
    if (skipped.length > 0) {
        console.log(`Bỏ qua: ${skipped.length} bản ghi`);
        const displayCount = Math.min(skipped.length, 10);
        for (let i = 0; i < displayCount; i++) {
            console.log(`  - Dòng ${skipped[i].row} (${skipped[i].name}): ${skipped[i].reason}`);
        }
        if (skipped.length > 10) {
            console.log(`  ... và ${skipped.length - 10} bản ghi khác`);
        }
    }

    return { residents, skipped };
}

async function uploadToSupabase(residents, batchSize = 100) {
    console.log(`\nĐang upload ${residents.length} bản ghi lên Supabase...`);
    const results = { success: 0, failed: 0, errors: [] };

    for (let i = 0; i < residents.length; i += batchSize) {
        const batch = residents.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(residents.length / batchSize);

        console.log(`Đang xử lý batch ${batchNum}/${totalBatches} (${batch.length} bản ghi)...`);

        try {
            const { data, error } = await supabase
                .from('residents')
                .insert(batch)
                .select();

            if (error) {
                console.error(`Lỗi batch ${batchNum}:`, error.message);
                results.failed += batch.length;
                results.errors.push({ batch: batchNum, error: error.message, count: batch.length });
            } else {
                results.success += data.length;
                console.log(`✓ Batch ${batchNum} thành công: ${data.length} bản ghi`);
            }
        } catch (error) {
            console.error(`Lỗi batch ${batchNum}:`, error.message);
            results.failed += batch.length;
            results.errors.push({ batch: batchNum, error: error.message, count: batch.length });
        }

        if (i + batchSize < residents.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return results;
}

async function main() {
    try {
        const filePath = process.argv[2];
        if (!filePath) {
            console.error('Vui lòng cung cấp đường dẫn file Excel!');
            console.log('Cách dùng: node scripts/upload-residents.cjs <đường-dẫn-file>');
            process.exit(1);
        }

        const excelData = readExcelFile(filePath);
        if (excelData.length === 0) {
            console.log('File Excel không có dữ liệu!');
            process.exit(0);
        }

        const { residents, skipped } = transformData(excelData);
        if (residents.length === 0) {
            console.log('Không có dữ liệu hợp lệ để upload!');
            process.exit(0);
        }

        console.log('\n' + '='.repeat(60));
        console.log('THÔNG TIN UPLOAD:');
        console.log(`- Tổng số bản ghi: ${excelData.length}`);
        console.log(`- Bản ghi hợp lệ: ${residents.length}`);
        console.log(`- Bản ghi bỏ qua: ${skipped.length}`);
        console.log('='.repeat(60));

        const uploadResults = await uploadToSupabase(residents);

        console.log('\n' + '='.repeat(60));
        console.log('KẾT QUẢ UPLOAD:');
        console.log(`✓ Thành công: ${uploadResults.success} bản ghi`);
        console.log(`✗ Thất bại: ${uploadResults.failed} bản ghi`);

        if (uploadResults.errors.length > 0) {
            console.log('\nChi tiết lỗi:');
            uploadResults.errors.forEach(err => {
                console.log(`  - Batch ${err.batch}: ${err.error} (${err.count} bản ghi)`);
            });
        }

        console.log('='.repeat(60));

        const logFile = path.join(__dirname, `upload-log-${Date.now()}.json`);
        fs.writeFileSync(logFile, JSON.stringify({
            timestamp: new Date().toISOString(),
            file: filePath,
            total: excelData.length,
            valid: residents.length,
            skipped,
            uploadResults
        }, null, 2));

        console.log(`\nLog đã được lưu tại: ${logFile}`);

    } catch (error) {
        console.error('Lỗi:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
