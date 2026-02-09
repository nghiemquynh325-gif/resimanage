/**
 * Script để upload dữ liệu cư dân từ Excel lên Supabase
 * 
 * Cách sử dụng:
 * 1. Cài đặt dependencies: npm install xlsx @supabase/supabase-js
 * 2. Chạy script: node scripts/upload-excel-to-supabase.js <đường-dẫn-file-excel>
 * 
 * Ví dụ: node scripts/upload-excel-to-supabase.js data/cudan.xlsx
 */

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cấu hình Supabase
const SUPABASE_URL = 'https://etcwjkfiduzblrkdlzpp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3dqa2ZpZHV6Ymxya2RsenBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTA4NDQsImV4cCI6MjA4MTY4Njg0NH0.NIhwxPq0oUlWTiKfYn2PP5SfNfhiriKNQZyLfE2Hvfk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Mapping các cột từ Excel sang field trong Supabase
 * Dựa trên cấu trúc file Excel đã cung cấp
 */
const COLUMN_MAPPING = {
    'STT': null, // Bỏ qua
    'Họ và tên': 'full_name',  // snake_case
    'Email': 'email',
    'Ngày sinh': 'dob',
    'Giới tính': 'gender',
    'Địa chỉ': 'address',
    'Loại Cư Trú': 'residence_type',  // snake_case
    'CMND/CCCD': 'identity_card',  // snake_case
    'Học vấn': 'education',
    'Quê quán': 'hometown',
    'Nghề nghiệp': 'profession',
    'Dân tộc': 'ethnicity',
    'Tôn giáo': 'religion',
    'Tổ dân phố': 'unit',
    'Tỉnh/Thành phố': 'province',
    'Phường/Xã': 'ward',
    'Ghi chú đặc biệt': 'special_notes'  // snake_case
};

/**
 * Chuẩn hóa giá trị giới tính
 */
function normalizeGender(value) {
    if (!value) return 'Khác';
    const normalized = value.toString().trim().toLowerCase();
    if (normalized === 'nam' || normalized === 'male' || normalized === 'm') return 'Nam';
    if (normalized === 'nữ' || normalized === 'nu' || normalized === 'female' || normalized === 'f') return 'Nữ';
    return 'Khác';
}

/**
 * Chuẩn hóa loại hình cư trú
 */
function normalizeResidenceType(value) {
    if (!value) return 'Thường trú';
    const normalized = value.toString().trim();
    const validTypes = ['Thường trú', 'Tạm trú', 'Tạm vắng', 'Tạm trú có nhà'];

    // Tìm kiếm gần đúng
    for (const type of validTypes) {
        if (normalized.includes(type) || type.includes(normalized)) {
            return type;
        }
    }

    return 'Thường trú';
}

/**
 * Chuẩn hóa ngày tháng từ Excel
 */
function normalizeDate(value) {
    if (!value) return null;

    try {
        // Nếu là số (Excel date serial)
        if (typeof value === 'number') {
            const date = XLSX.SSF.parse_date_code(value);
            return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
        }

        // Nếu là chuỗi
        if (typeof value === 'string') {
            // Thử parse các format phổ biến
            const formats = [
                /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
                /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
                /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
            ];

            for (const format of formats) {
                const match = value.match(format);
                if (match) {
                    if (format === formats[0] || format === formats[2]) {
                        // DD/MM/YYYY or DD-MM-YYYY
                        const [, day, month, year] = match;
                        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    } else {
                        // YYYY-MM-DD
                        return value;
                    }
                }
            }
        }

        // Nếu là Date object
        if (value instanceof Date) {
            return value.toISOString().split('T')[0];
        }
    } catch (error) {
        console.warn(`Không thể parse ngày: ${value}`, error.message);
    }

    return null;
}

/**
 * Đọc dữ liệu từ file Excel
 */
function readExcelFile(filePath) {
    console.log(`Đang đọc file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`File không tồn tại: ${filePath}`);
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Chuyển đổi sang JSON
    const data = XLSX.utils.sheet_to_json(worksheet, {
        raw: false, // Giữ nguyên format
        defval: null // Giá trị mặc định cho ô trống
    });

    console.log(`Đã đọc ${data.length} dòng dữ liệu`);
    return data;
}

/**
 * Chuyển đổi dữ liệu Excel sang format Supabase
 * Bỏ qua các bản ghi có thông tin thiếu (ngày sinh, CCCD, v.v.)
 */
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

            // Map các field
            for (const [excelCol, dbField] of Object.entries(COLUMN_MAPPING)) {
                if (!dbField) continue; // Bỏ qua các cột không cần

                let value = row[excelCol];

                // Xử lý đặc biệt cho một số field
                if (dbField === 'gender') {
                    value = normalizeGender(value);
                } else if (dbField === 'residenceType') {
                    value = normalizeResidenceType(value);
                } else if (dbField === 'dob') {
                    value = normalizeDate(value);
                } else if (dbField === 'phone_number') {
                    // Chuẩn hóa số điện thoại
                    value = value ? value.toString().replace(/\s+/g, '') : '';
                } else if (dbField === 'identity_card') {
                    // Chuẩn hóa CCCD - xóa khoảng trắng và ký tự đặc biệt
                    value = value ? value.toString().replace(/[^0-9]/g, '') : '';
                } else if (dbField === 'residence_type') {
                    value = normalizeResidenceType(value);
                }

                resident[dbField] = value || null;
            }

            // Validate dữ liệu bắt buộc - CHỈ YÊU CẦU HỌ TÊN
            if (!resident.fullName || !resident.fullName.trim()) {
                throw new Error('Thiếu họ tên');
            }

            // Các trường khác có thể để trống (null)
            // Không bỏ qua bản ghi nếu thiếu thông tin

            // Đặt số điện thoại mặc định nếu không có
            if (!resident.phoneNumber) {
                resident.phoneNumber = '0000000000';
            }

            residents.push(resident);
        } catch (error) {
            skipped.push({
                row: index + 2, // +2 vì index bắt đầu từ 0 và có header
                name: row['Họ và Tên'] || 'N/A',
                reason: error.message
            });
        }
    });

    console.log(`Chuyển đổi thành công: ${residents.length} bản ghi`);
    if (skipped.length > 0) {
        console.log(`Bỏ qua: ${skipped.length} bản ghi (thiếu thông tin)`);
        // Chỉ hiển thị 10 bản ghi đầu tiên để tránh spam console
        const displayCount = Math.min(skipped.length, 10);
        for (let i = 0; i < displayCount; i++) {
            const skip = skipped[i];
            console.log(`  - Dòng ${skip.row} (${skip.name}): ${skip.reason}`);
        }
        if (skipped.length > 10) {
            console.log(`  ... và ${skipped.length - 10} bản ghi khác`);
        }
    }

    return { residents, skipped };
}

/**
 * Upload dữ liệu lên Supabase
 */
async function uploadToSupabase(residents, batchSize = 100) {
    console.log(`\nĐang upload ${residents.length} bản ghi lên Supabase...`);

    const results = {
        success: 0,
        failed: 0,
        errors: []
    };

    // Chia nhỏ thành các batch
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
                results.errors.push({
                    batch: batchNum,
                    error: error.message,
                    count: batch.length
                });
            } else {
                results.success += data.length;
                console.log(`✓ Batch ${batchNum} thành công: ${data.length} bản ghi`);
            }
        } catch (error) {
            console.error(`Lỗi không mong đợi batch ${batchNum}:`, error.message);
            results.failed += batch.length;
            results.errors.push({
                batch: batchNum,
                error: error.message,
                count: batch.length
            });
        }

        // Delay nhỏ giữa các batch để tránh rate limit
        if (i + batchSize < residents.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return results;
}

/**
 * Main function
 */
async function main() {
    try {
        // Lấy đường dẫn file từ command line
        const filePath = process.argv[2];

        if (!filePath) {
            console.error('Vui lòng cung cấp đường dẫn file Excel!');
            console.log('Cách dùng: node scripts/upload-excel-to-supabase.js <đường-dẫn-file>');
            process.exit(1);
        }

        // Đọc file Excel
        const excelData = readExcelFile(filePath);

        if (excelData.length === 0) {
            console.log('File Excel không có dữ liệu!');
            process.exit(0);
        }

        // Chuyển đổi dữ liệu
        const { residents, skipped } = transformData(excelData);

        if (residents.length === 0) {
            console.log('Không có dữ liệu hợp lệ để upload!');
            process.exit(0);
        }

        // Xác nhận trước khi upload
        console.log('\n' + '='.repeat(60));
        console.log('THÔNG TIN UPLOAD:');
        console.log(`- Tổng số bản ghi: ${excelData.length}`);
        console.log(`- Bản ghi hợp lệ: ${residents.length}`);
        console.log(`- Bản ghi bỏ qua: ${skipped.length}`);
        console.log('='.repeat(60));

        // Upload lên Supabase
        const uploadResults = await uploadToSupabase(residents);

        // Hiển thị kết quả
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

        // Lưu log
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

// Chạy script
main();
