#!/usr/bin/env node

/**
 * DIRECT DATABASE IMPORT SCRIPT
 * Import residents from Excel directly to Supabase database
 * 
 * Usage:
 *   node scripts/direct-import.js <excel-file-path>
 * 
 * Example:
 *   node scripts/direct-import.js data/residents.xlsx
 */

import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Error: Missing Supabase credentials in .env file');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuration
const CONFIG = {
    BATCH_SIZE: 50,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
};

/**
 * Read Excel file and return rows
 */
function readExcelFile(filePath) {
    console.log(`\n📖 Reading Excel file: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: null
    });

    console.log(`✅ Found ${data.length} rows`);
    return data;
}

/**
 * Map Excel row to database format
 */
function mapRowToResident(row, index) {
    // Normalize column names (remove spaces, lowercase)
    const normalized = {};
    Object.keys(row).forEach(key => {
        const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
        normalized[normalizedKey] = row[key];
    });

    // Extract data with fallbacks
    const fullName = normalized['họ_và_tên'] || normalized['ho_va_ten'] || normalized['full_name'] || normalized['name'];
    const dob = normalized['ngày_sinh'] || normalized['ngay_sinh'] || normalized['dob'] || normalized['date_of_birth'];
    const gender = normalized['giới_tính'] || normalized['gioi_tinh'] || normalized['gender'];
    const phoneNumber = normalized['số_điện_thoại'] || normalized['so_dien_thoai'] || normalized['phone'] || normalized['phone_number'];
    const email = normalized['email'];
    const identityCard = normalized['cccd/cmnd'] || normalized['cccd'] || normalized['cmnd'] || normalized['identity_card'];
    const address = normalized['địa_chỉ'] || normalized['dia_chi'] || normalized['address'];
    const unit = normalized['tổ'] || normalized['to'] || normalized['unit'];
    const ward = normalized['xã/phường'] || normalized['xa_phuong'] || normalized['ward'];
    const province = normalized['tỉnh/thành_phố'] || normalized['tinh_thanh_pho'] || normalized['province'];
    const ethnicity = normalized['dân_tộc'] || normalized['dan_toc'] || normalized['ethnicity'];
    const religion = normalized['tôn_giáo'] || normalized['ton_giao'] || normalized['religion'];
    const education = normalized['trình_độ'] || normalized['trinh_do'] || normalized['education'];
    const profession = normalized['nghề_nghiệp'] || normalized['nghe_nghiep'] || normalized['profession'];
    const hometown = normalized['quê_quán'] || normalized['que_quan'] || normalized['hometown'];
    const residenceType = normalized['loại_cư_trú'] || normalized['loai_cu_tru'] || normalized['residence_type'] || 'Thường trú';

    // Validation
    const errors = [];
    if (!fullName) errors.push('Thiếu họ tên');
    if (!dob) errors.push('Thiếu ngày sinh');
    if (!phoneNumber) errors.push('Thiếu số điện thoại');

    if (errors.length > 0) {
        return { error: `Row ${index + 2}: ${errors.join(', ')}`, data: null };
    }

    // Format date (DD/MM/YYYY or YYYY-MM-DD to YYYY-MM-DD)
    let formattedDob = dob;
    if (dob && typeof dob === 'string') {
        if (dob.includes('/')) {
            const parts = dob.split('/');
            if (parts.length === 3) {
                // DD/MM/YYYY -> YYYY-MM-DD
                formattedDob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
    }

    // Build full address
    const addressParts = [address, ward, province].filter(Boolean);
    const fullAddress = addressParts.join(', ') || 'Chưa cập nhật';

    return {
        error: null,
        data: {
            full_name: fullName.trim(),
            dob: formattedDob,
            gender: gender || 'Khác',
            phone_number: phoneNumber.toString().trim(),
            email: email || null,
            identity_card: identityCard || null,
            address: fullAddress,
            unit: unit || null,
            ward: ward || null,
            province: province || null,
            ethnicity: ethnicity || null,
            religion: religion || null,
            education: education || null,
            profession: profession || null,
            hometown: hometown || null,
            residence_type: residenceType,
            status: 'active',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
            created_at: new Date().toISOString(),
        }
    };
}

/**
 * Insert residents in batches
 */
async function insertBatch(residents, batchIndex) {
    console.log(`\n📦 Batch ${batchIndex}: Inserting ${residents.length} residents...`);

    const { data, error } = await supabase
        .from('residents')
        .insert(residents)
        .select();

    if (error) {
        throw error;
    }

    console.log(`✅ Batch ${batchIndex}: Successfully inserted ${data.length} residents`);
    return data;
}

/**
 * Main import function
 */
async function importResidents(filePath) {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        DIRECT DATABASE IMPORT - RESIDENTS                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Read Excel file
    const rows = readExcelFile(filePath);

    // Transform data
    console.log('\n🔄 Transforming data...');
    const results = rows.map((row, index) => mapRowToResident(row, index));

    const validResidents = results.filter(r => !r.error).map(r => r.data);
    const errors = results.filter(r => r.error);

    console.log(`\n✅ Valid records: ${validResidents.length}`);
    console.log(`❌ Invalid records: ${errors.length}`);

    if (errors.length > 0) {
        console.log('\n⚠️  First 10 errors:');
        errors.slice(0, 10).forEach((err, idx) => {
            console.log(`${idx + 1}. ${err.error}`);
        });
    }

    if (validResidents.length === 0) {
        console.log('\n❌ No valid records to import!');
        return;
    }

    // Import in batches
    console.log(`\n🚀 Starting import (${CONFIG.BATCH_SIZE} records per batch)...`);

    const batches = [];
    for (let i = 0; i < validResidents.length; i += CONFIG.BATCH_SIZE) {
        batches.push(validResidents.slice(i, i + CONFIG.BATCH_SIZE));
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < batches.length; i++) {
        try {
            const inserted = await insertBatch(batches[i], i + 1);
            successCount += inserted.length;
        } catch (error) {
            console.error(`\n❌ Batch ${i + 1} failed:`, error.message);
            failCount += batches[i].length;
        }
    }

    // Summary
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    IMPORT SUMMARY                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`📊 Total records:     ${rows.length}`);
    console.log(`✅ Successfully imported: ${successCount}`);
    console.log(`❌ Failed:            ${failCount}`);
    console.log(`⚠️  Skipped (invalid): ${errors.length}`);
    console.log('');
}

// Run script
const filePath = process.argv[2];

if (!filePath) {
    console.error('❌ Error: Please provide Excel file path');
    console.error('Usage: node scripts/direct-import.js <excel-file-path>');
    console.error('Example: node scripts/direct-import.js data/residents.xlsx');
    process.exit(1);
}

importResidents(filePath)
    .then(() => {
        console.log('✅ Import completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Import failed:', error);
        process.exit(1);
    });
