/**
 * Bulk Import Script for Residents
 * 
 * This script imports large volumes of resident data from Excel files
 * directly to Supabase database with progress tracking and error handling.
 * 
 * Usage:
 *   node scripts/bulk-import-residents.js <path-to-excel-file>
 * 
 * Example:
 *   node scripts/bulk-import-residents.js ./data/residents.xlsx
 */

import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    BATCH_SIZE: 100, // Number of records per batch
    DELAY_BETWEEN_BATCHES: 200, // Milliseconds
    MAX_RETRIES: 3,
    LOG_FILE: path.resolve(__dirname, '../logs/import-log.json'),
    PROGRESS_FILE: path.resolve(__dirname, '../logs/import-progress.json')
};

// Load environment variables from .env file manually
function loadEnvFile() {
    const envPath = path.resolve(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
        return {};
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};

    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            }
        }
    });

    return env;
}

const env = loadEnvFile();

// Initialize Supabase client
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials in .env file');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Statistics
const stats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    startTime: null,
    endTime: null,
    errors: []
};

/**
 * Parse Excel file and extract data
 */
function parseExcelFile(filePath) {
    console.log(`\n📖 Reading Excel file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        raw: false // Get formatted values
    });

    if (jsonData.length === 0) {
        throw new Error('Excel file is empty');
    }

    const headers = jsonData[0];
    const rows = jsonData.slice(1);

    console.log(`✅ Found ${rows.length} rows with ${headers.length} columns`);
    console.log(`📋 Headers: ${headers.join(', ')}\n`);

    return { headers, rows };
}

/**
 * Map Excel column names to database field names
 */
function createFieldMapping(headers) {
    const mapping = {};

    // Common Vietnamese column names mapping
    const columnMap = {
        // Full name variations
        'HỌ TÊN': 'full_name',
        'HỌ VÀ TÊN': 'full_name',
        'HỌTEN': 'full_name',
        'TÊN': 'full_name',
        'HO TEN': 'full_name',
        'HO VA TEN': 'full_name',

        // Date of birth variations
        'NGÀY SINH': 'dob',
        'NGAYSINH': 'dob',
        'SINH NHẬT': 'dob',
        'NGAY SINH': 'dob',
        'SINH NHAT': 'dob',

        // Gender variations
        'GIỚI TÍNH': 'gender',
        'GIOITINH': 'gender',
        'PHÁI': 'gender',
        'GIOI TINH': 'gender',
        'PHAI': 'gender',

        // Phone number variations
        'SỐ ĐIỆN THOẠI': 'phone_number',
        'ĐIỆN THOẠI': 'phone_number',
        'SDT': 'phone_number',
        'PHONE': 'phone_number',
        'SO DIEN THOAI': 'phone_number',
        'DIEN THOAI': 'phone_number',

        // Address variations (including user's file format)
        'ĐỊA CHỈ': 'address',
        'DIACHI': 'address',
        'NƠI Ở': 'address',
        'DIA CHI': 'address',
        'NOI O': 'address',
        'HỘ KHẨU THƯỜNG TRÚ': 'address',
        'HO KHAU THUONG TRU': 'address',
        'HKTT': 'address',
        'NƠI Ở HIỆN NAY': 'current_address',
        'NOI O HIEN NAY': 'current_address',
        'ĐỊA CHỈ HIỆN TẠI': 'current_address',

        // Exact columns from user's file
        'NƠI THƯỜNG TRÚ': 'hometown',  // Nơi thường trú → hometown (quê quán)
        'NOI THUONG TRU': 'hometown',
        'NƠI TẠM TRÚ': 'address',      // Nơi tạm trú → address (địa chỉ hiện tại)
        'NOI TAM TRU': 'address',
        'HỌ TÊN CHỦ HỘ': 'household_head_name',
        'HO TEN CHU HO': 'household_head_name',
        'NGƯỜI ĐẠI DIỆN': 'representative_name',
        'NGUOI DAI DIEN': 'representative_name',
        'HỌ TÊN CHỦ HỘ/NGƯỜI ĐẠI DIỆN': 'household_head_name',
        'NGÀY ĐKTT': 'temp_residence_date',
        'NGAY DKTT': 'temp_residence_date',

        // Email variations
        'EMAIL': 'email',
        'THƯ ĐIỆN TỬ': 'email',
        'THU DIEN TU': 'email',

        // Identity card variations (including user's file format)
        'CCCD': 'identity_card',
        'CMND': 'identity_card',
        'SỐ CCCD': 'identity_card',
        'SO CCCD': 'identity_card',
        'SỐ CMND': 'identity_card',
        'SO CMND': 'identity_card',
        'SỐ CCCD/CMND': 'identity_card',
        'SO CCCD/CMND': 'identity_card',
        'SỐ ĐDCN/CCCD/CMND': 'identity_card',
        'SO DDCN/CCCD/CMND': 'identity_card',

        // Profession variations
        'NGHỀ NGHIỆP': 'profession',
        'NGHENGHIEP': 'profession',
        'CÔNG VIỆC': 'profession',
        'NGHE NGHIEP': 'profession',
        'CONG VIEC': 'profession',
        'NƠI LÀM VIỆC': 'workplace',
        'NOI LAM VIEC': 'workplace',

        // Education variations
        'HỌC VẤN': 'education',
        'HOCVAN': 'education',
        'TRÌNH ĐỘ': 'education',
        'HOC VAN': 'education',
        'TRINH DO': 'education',

        // Hometown variations
        'QUÊ QUÁN': 'hometown',
        'QUEQUAN': 'hometown',
        'QUE QUAN': 'hometown',

        // Ethnicity variations
        'DÂN TỘC': 'ethnicity',
        'DANTOC': 'ethnicity',
        'DAN TOC': 'ethnicity',

        // Religion variations
        'TÔN GIÁO': 'religion',
        'TONGIAO': 'religion',
        'TON GIAO': 'religion',

        // Unit variations
        'TỔ DÂN PHỐ': 'unit',
        'TỔ': 'unit',
        'KHU PHỐ': 'unit',
        'TO DAN PHO': 'unit',
        'TO': 'unit',
        'KHU PHO': 'unit',

        // Province variations
        'TỈNH': 'province',
        'THÀNH PHỐ': 'province',
        'TINH': 'province',
        'THANH PHO': 'province',

        // Ward variations
        'PHƯỜNG': 'ward',
        'XÃ': 'ward',
        'PHUONG': 'ward',
        'XA': 'ward',

        // Party member variations
        'ĐẢNG VIÊN': 'is_party_member',
        'DANGVIEN': 'is_party_member',
        'DANG VIEN': 'is_party_member',

        'NGÀY VÀO ĐẢNG': 'party_join_date',
        'NGAYVAODANG': 'party_join_date',
        'NGAY VAO DANG': 'party_join_date',

        // Special status and notes
        'ĐẶC ĐIỂM': 'special_status',
        'DACDIEM': 'special_status',
        'DAC DIEM': 'special_status',
        'GHI CHÚ': 'special_notes',
        'GHI CHU': 'special_notes',
        'GHICHU': 'special_notes',

        // Temporary residence (from user's file)
        'NGÀY ĐĂNG KÝ TẠM TRÚ': 'temp_residence_date',
        'NGAY DANG KY TAM TRU': 'temp_residence_date',
        'THỜI HẠN TẠM TRÚ': 'temp_residence_duration',
        'THOI HAN TAM TRU': 'temp_residence_duration'
    };

    headers.forEach((header, index) => {
        const normalizedHeader = header.toString().trim().toUpperCase();
        const fieldName = columnMap[normalizedHeader];

        if (fieldName) {
            mapping[index] = fieldName;
        }
    });

    console.log('🗺️  Field Mapping:');
    Object.entries(mapping).forEach(([index, field]) => {
        console.log(`   ${headers[index]} → ${field}`);
    });
    console.log('');

    return mapping;
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr) {
    if (!dateStr) return null;

    const str = dateStr.toString().trim();
    if (!str) return null;

    // Try DD/MM/YYYY format
    const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try YYYY-MM-DD format
    const yyyymmdd = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (yyyymmdd) {
        const [, year, month, day] = yyyymmdd;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return null;
}

/**
 * Normalize gender value
 */
function normalizeGender(value) {
    if (!value) return null;

    const str = value.toString().trim().toLowerCase();

    if (str.includes('nam') || str === 'm' || str === 'male') return 'Nam';
    if (str.includes('nữ') || str.includes('nu') || str === 'f' || str === 'female') return 'Nữ';

    return 'Khác';
}

/**
 * Normalize boolean value
 */
function normalizeBoolean(value) {
    if (!value) return false;

    const str = value.toString().trim().toLowerCase();
    return str === 'có' || str === 'yes' || str === 'true' || str === '1' || str === 'x';
}

/**
 * Format name to title case (first letter of each word capitalized)
 */
function formatName(name) {
    if (!name) return name;

    return name
        .toString()
        .trim()
        .toLowerCase()
        .split(' ')
        .map(word => {
            if (word.length === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

/**
 * Format address to proper case
 * Example: "28/c4, KHU PHỐ 3, PHƯỜNG AN PHÚ, TP.HCM" 
 *       -> "28/C4, Khu Phố 3, Phường An Phú, Thành Phố Hồ Chí Minh"
 */
function formatAddress(address) {
    if (!address) return address;

    return address
        .toString()
        .trim()
        .split(',')
        .map((part, index) => {
            // Trim and convert to lowercase
            const trimmed = part.trim().toLowerCase();

            // For the first part (house number), handle special formatting
            if (index === 0) {
                // Format house numbers like "16/c1" -> "16/C1" or "16a/c1" -> "16A/C1"
                return trimmed
                    .split('/')
                    .map(segment => {
                        // Capitalize all letters in each segment
                        return segment.toUpperCase();
                    })
                    .join('/');
            }

            // For other parts, capitalize first letter of each word
            return trimmed
                .split(' ')
                .map(word => {
                    if (word.length === 0) return word;
                    return word.charAt(0).toUpperCase() + word.slice(1);
                })
                .join(' ');
        })
        .join(', ');
}

/**
 * Transform Excel row to resident object
 */
function transformRow(row, mapping, rowIndex) {
    const resident = {};

    Object.entries(mapping).forEach(([colIndex, fieldName]) => {
        if (fieldName && typeof fieldName === 'string') {
            const value = row[parseInt(colIndex)];

            if (fieldName === 'dob' || fieldName === 'party_join_date' || fieldName === 'temp_residence_date') {
                resident[fieldName] = parseDate(value);
            } else if (fieldName === 'gender') {
                resident[fieldName] = normalizeGender(value);
            } else if (fieldName === 'is_party_member') {
                resident[fieldName] = normalizeBoolean(value);
            } else if (value !== null && value !== undefined && value !== '') {
                resident[fieldName] = value.toString().trim();
            }
        }
    });

    // Format full name to title case
    if (resident.full_name) {
        resident.full_name = formatName(resident.full_name);
    }

    // Format address to proper case
    if (resident.address) {
        resident.address = formatAddress(resident.address);
    }

    // Format hometown to proper case
    if (resident.hometown) {
        resident.hometown = formatAddress(resident.hometown);
    }

    // No need for address fallback anymore since temp_address is now mapped to address directly

    // Auto-generate date of birth if missing
    if (!resident.dob) {
        resident.dob = '1990-01-01'; // Default date
        resident.special_notes = (resident.special_notes ? resident.special_notes + ' | ' : '') +
            'Ngày sinh mặc định - cần cập nhật';
    }

    // Auto-generate phone number if missing
    if (!resident.phone_number) {
        // Generate a fake phone number based on row index
        const randomPart = String(rowIndex).padStart(6, '0').slice(-6);
        resident.phone_number = `09${randomPart.slice(0, 2)}${randomPart.slice(2)}`;
        resident._auto_generated_phone = true; // Mark as auto-generated
        resident.special_notes = (resident.special_notes ? resident.special_notes + ' | ' : '') +
            'SĐT tự động tạo - cần cập nhật';
    }

    // Set defaults
    if (!resident.ethnicity) resident.ethnicity = 'Kinh';
    if (!resident.religion) resident.religion = 'Không';
    if (!resident.status) resident.status = 'pending_approval';
    if (!resident.is_party_member) resident.is_party_member = false;

    // Generate avatar URL
    if (!resident.avatar && resident.full_name) {
        resident.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.full_name)}&background=random&color=fff`;
    }

    return resident;
}

/**
 * Validate resident data
 */
function validateResident(resident, rowIndex) {
    const errors = [];

    if (!resident.full_name) {
        errors.push('Thiếu họ tên');
    }

    // Date of birth is now optional - will be set to null if missing
    // if (!resident.dob) {
    //     errors.push('Thiếu ngày sinh');
    // }

    if (!resident.gender) {
        errors.push('Thiếu giới tính');
    }

    // Phone number validation - skip if it was auto-generated
    if (resident.phone_number && !resident._auto_generated_phone) {
        const cleanPhone = resident.phone_number.replace(/\s/g, '');
        if (!/^\d{10}$/.test(cleanPhone)) {
            errors.push('Số điện thoại không hợp lệ (phải có 10 chữ số)');
        }
    }

    if (!resident.address) {
        errors.push('Thiếu địa chỉ');
    }

    return errors;
}

/**
 * Display progress bar
 */
function displayProgress(current, total, success, failed) {
    const percentage = Math.floor((current / total) * 100);
    const barLength = 40;
    const filledLength = Math.floor((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

    process.stdout.write(`\r[${bar}] ${percentage}% | ${current}/${total} | ✅ ${success} | ❌ ${failed}`);
}

/**
 * Save progress to file
 */
function saveProgress(batchIndex, stats) {
    const logsDir = path.dirname(CONFIG.PROGRESS_FILE);
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG.PROGRESS_FILE, JSON.stringify({
        lastBatch: batchIndex,
        stats,
        timestamp: new Date().toISOString()
    }, null, 2));
}

/**
 * Load progress from file
 */
function loadProgress() {
    if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(CONFIG.PROGRESS_FILE, 'utf8'));
        } catch (error) {
            console.warn('⚠️  Could not load progress file');
        }
    }
    return null;
}

/**
 * Import batch of residents
 */
async function importBatch(residents, batchIndex, retryCount = 0) {
    try {
        // Whitelist of valid database columns (based on residents table schema)
        const validColumns = [
            'full_name', 'email', 'dob', 'gender', 'phone_number', 'address',
            'status', 'avatar', 'household_id', 'is_party_member', 'party_join_date',
            'identity_card', 'education', 'hometown', 'profession', 'ethnicity', 'religion',
            'unit', 'province', 'ward', 'is_head_of_household', 'special_status', 'special_notes',
            'rejection_reason'
        ];

        // Clean up: only keep valid database columns
        const cleanResidents = residents.map(r => {
            const cleanResident = {};
            validColumns.forEach(col => {
                if (r[col] !== undefined && r[col] !== null && r[col] !== '') {
                    cleanResident[col] = r[col];
                }
            });
            return cleanResident;
        });

        const { data, error } = await supabase
            .from('residents')
            .insert(cleanResidents);

        if (error) {
            throw error;
        }

        return { success: residents.length, failed: 0 };
    } catch (error) {
        // Log the first error for debugging
        if (retryCount === 0) {
            console.log(`\n❌ Batch ${batchIndex} error: ${error.message}`);
            console.log(`   Details: ${JSON.stringify(error, null, 2)}\n`);
        }

        if (retryCount < CONFIG.MAX_RETRIES) {
            console.log(`\n⚠️  Batch ${batchIndex} failed, retrying (${retryCount + 1}/${CONFIG.MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return importBatch(residents, batchIndex, retryCount + 1);
        }

        // If batch fails, try one by one
        console.log(`\n⚠️  Batch ${batchIndex} failed, importing one by one...`);
        let success = 0;
        let failed = 0;

        for (const resident of residents) {
            try {
                // Whitelist of valid database columns
                const validColumns = [
                    'full_name', 'email', 'dob', 'gender', 'phone_number', 'address',
                    'status', 'avatar', 'household_id', 'is_party_member', 'party_join_date',
                    'identity_card', 'education', 'hometown', 'profession', 'ethnicity', 'religion',
                    'unit', 'province', 'ward', 'is_head_of_household', 'special_status', 'special_notes',
                    'rejection_reason'
                ];

                // Clean up: only keep valid database columns
                const cleanResident = {};
                validColumns.forEach(col => {
                    if (resident[col] !== undefined && resident[col] !== null && resident[col] !== '') {
                        cleanResident[col] = resident[col];
                    }
                });

                const { error } = await supabase
                    .from('residents')
                    .insert([cleanResident]);

                if (error) throw error;
                success++;
            } catch (err) {
                failed++;
                stats.errors.push({
                    resident: resident.full_name,
                    error: err.message,
                    details: err.details || err.hint || ''
                });

                // Log first few individual errors
                if (failed <= 3) {
                    console.log(`\n❌ Failed to insert ${resident.full_name}:`);
                    console.log(`   Error: ${err.message}`);
                    if (err.details) console.log(`   Details: ${err.details}`);
                    if (err.hint) console.log(`   Hint: ${err.hint}`);
                }
            }
        }

        return { success, failed };
    }
}

/**
 * Main import function
 */
async function bulkImport(filePath, resumeFromBatch = 0) {
    stats.startTime = new Date();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        BULK IMPORT RESIDENTS TO SUPABASE                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Parse Excel file
    const { headers, rows } = parseExcelFile(filePath);
    stats.total = rows.length;

    // Create field mapping
    const mapping = createFieldMapping(headers);

    // Transform and validate data
    console.log('🔄 Transforming and validating data...\n');
    const validResidents = [];

    for (let i = 0; i < rows.length; i++) {
        const resident = transformRow(rows[i], mapping, i + 2);
        const errors = validateResident(resident, i + 2);

        if (errors.length > 0) {
            stats.skipped++;
            stats.errors.push({
                row: i + 2,
                resident: resident.full_name || 'Unknown',
                errors
            });
        } else {
            validResidents.push(resident);
        }
    }

    console.log(`✅ Valid records: ${validResidents.length}`);
    console.log(`⚠️  Skipped records: ${stats.skipped}\n`);

    // Show first 10 errors for debugging
    if (stats.errors.length > 0) {
        console.log('🔍 First 10 validation errors:\n');
        stats.errors.slice(0, 10).forEach((err, idx) => {
            console.log(`${idx + 1}. Row ${err.row} (${err.resident}):`);
            if (Array.isArray(err.errors)) {
                err.errors.forEach(e => console.log(`   - ${e}`));
            } else {
                console.log(`   - ${err.errors}`);
            }
        });
        console.log('');
    }

    if (validResidents.length === 0) {
        console.log('❌ No valid records to import!');
        return;
    }

    // Import in batches
    console.log(`🚀 Starting import (${CONFIG.BATCH_SIZE} records per batch)...\n`);

    const totalBatches = Math.ceil(validResidents.length / CONFIG.BATCH_SIZE);

    for (let i = resumeFromBatch; i < totalBatches; i++) {
        const start = i * CONFIG.BATCH_SIZE;
        const end = Math.min(start + CONFIG.BATCH_SIZE, validResidents.length);
        const batch = validResidents.slice(start, end);

        const result = await importBatch(batch, i + 1);

        stats.success += result.success;
        stats.failed += result.failed;

        displayProgress(end, validResidents.length, stats.success, stats.failed);

        // Save progress
        saveProgress(i, stats);

        // Delay between batches
        if (i < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_BATCHES));
        }
    }

    stats.endTime = new Date();

    // Print summary
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    IMPORT SUMMARY                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const duration = (stats.endTime - stats.startTime) / 1000;

    console.log(`📊 Total records:     ${stats.total}`);
    console.log(`✅ Successfully imported: ${stats.success}`);
    console.log(`❌ Failed:            ${stats.failed}`);
    console.log(`⚠️  Skipped:          ${stats.skipped}`);
    console.log(`⏱️  Duration:         ${duration.toFixed(2)}s`);
    console.log(`⚡ Speed:            ${(stats.success / duration).toFixed(2)} records/sec\n`);

    // Save error log
    if (stats.errors.length > 0) {
        const logsDir = path.dirname(CONFIG.LOG_FILE);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        fs.writeFileSync(CONFIG.LOG_FILE, JSON.stringify({
            summary: {
                total: stats.total,
                success: stats.success,
                failed: stats.failed,
                skipped: stats.skipped,
                duration: `${duration.toFixed(2)}s`
            },
            errors: stats.errors
        }, null, 2));

        console.log(`📝 Error log saved to: ${CONFIG.LOG_FILE}\n`);
    }

    // Clean up progress file
    if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
        fs.unlinkSync(CONFIG.PROGRESS_FILE);
    }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('❌ Error: Please provide Excel file path');
    console.error('\nUsage: node scripts/bulk-import-residents.js <path-to-excel-file>');
    console.error('Example: node scripts/bulk-import-residents.js ./data/residents.xlsx\n');
    process.exit(1);
}

const filePath = path.resolve(args[0]);

// Check for resume
const progress = loadProgress();
if (progress) {
    console.log(`\n⚠️  Found previous import progress (batch ${progress.lastBatch + 1})`);
    console.log('Do you want to resume? (Press Ctrl+C to cancel, or wait 5 seconds to resume)\n');

    setTimeout(() => {
        bulkImport(filePath, progress.lastBatch + 1).catch(error => {
            console.error('\n❌ Import failed:', error.message);
            process.exit(1);
        });
    }, 5000);
} else {
    bulkImport(filePath).catch(error => {
        console.error('\n❌ Import failed:', error.message);
        process.exit(1);
    });
}
