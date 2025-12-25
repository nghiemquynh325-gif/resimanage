const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// =====================================================
// CONFIGURATION
// =====================================================
// TODO: Thay đổi các giá trị này
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Ví dụ: https://xxxxx.supabase.co
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const EXCEL_FILE = 'residents_data.xlsx'; // Tên file Excel
const TABLE_NAME = 'residents'; // Tên table trong Supabase

// =====================================================
// Initialize Supabase client
// =====================================================
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Transform Excel row to database record
 * Customize this function based on your Excel structure
 */
function transformRow(row) {
    return {
        // Map Excel columns to database columns
        full_name: row['Họ và tên'] || row['Họ tên'] || row['Full Name'],
        dob: row['Ngày sinh'] || row['DOB'],
        gender: row['Giới tính'] || row['Gender'],
        phone_number: row['Số điện thoại'] || row['Phone'],
        email: row['Email'],
        identity_card: row['CCCD/CMND'] || row['CCCD'] || row['ID Card'],
        ethnicity: row['Dân tộc'] || row['Ethnicity'] || 'Kinh',
        religion: row['Tôn giáo'] || row['Religion'] || 'Không',
        address: row['Địa chỉ'] || row['Address'],
        status: 'active',
        residence_type: row['Loại cư trú'] || row['Residence Type'] || 'Thường trú',

        // Optional fields
        household_id: row['Mã hộ khẩu'] || null,
        relationship: row['Quan hệ với chủ hộ'] || null,
        occupation: row['Nghề nghiệp'] || null,
        education: row['Trình độ học vấn'] || null,
    };
}

/**
 * Clean and validate record
 */
function cleanRecord(record) {
    // Remove undefined/null values
    const cleaned = {};
    for (const [key, value] of Object.entries(record)) {
        if (value !== undefined && value !== null && value !== '') {
            cleaned[key] = value;
        }
    }
    return cleaned;
}

/**
 * Import residents from Excel to Supabase
 */
async function importFromExcel(filePath, tableName) {
    try {
        console.log('📂 Reading Excel file:', filePath);

        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        // Read Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        console.log(`📊 Reading sheet: ${sheetName}`);

        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log(`✅ Found ${data.length} rows in Excel file`);

        if (data.length === 0) {
            console.log('⚠️  No data to import');
            return;
        }

        // Show sample of first row
        console.log('\n📋 Sample data (first row):');
        console.log(JSON.stringify(data[0], null, 2));
        console.log('\n');

        // Transform and clean data
        const records = data.map(row => cleanRecord(transformRow(row)));

        console.log(`🔄 Transformed ${records.length} records`);

        // Batch insert
        const batchSize = 100;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(records.length / batchSize);

            try {
                console.log(`⏳ Inserting batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);

                const { data, error } = await supabase
                    .from(tableName)
                    .insert(batch);

                if (error) {
                    console.error(`❌ Error in batch ${batchNumber}:`, error.message);
                    errorCount += batch.length;
                } else {
                    console.log(`✅ Batch ${batchNumber} inserted successfully`);
                    successCount += batch.length;
                }
            } catch (error) {
                console.error(`❌ Exception in batch ${batchNumber}:`, error.message);
                errorCount += batch.length;
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 IMPORT SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total rows in Excel: ${data.length}`);
        console.log(`Successfully inserted: ${successCount}`);
        console.log(`Failed: ${errorCount}`);
        console.log('='.repeat(50));

        if (successCount > 0) {
            console.log('\n✅ Import completed successfully!');
        } else {
            console.log('\n⚠️  Import completed with errors');
        }

    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * Verify Supabase connection
 */
async function verifyConnection() {
    try {
        console.log('🔌 Verifying Supabase connection...');
        const { data, error } = await supabase.from(TABLE_NAME).select('count').limit(1);

        if (error) {
            throw new Error(`Connection failed: ${error.message}`);
        }

        console.log('✅ Supabase connection successful\n');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
        console.error('\nPlease check:');
        console.error('1. SUPABASE_URL is correct');
        console.error('2. SUPABASE_KEY is correct');
        console.error('3. Table exists in database');
        console.error('4. RLS policies allow insert\n');
        return false;
    }
}

// =====================================================
// MAIN
// =====================================================
async function main() {
    console.log('\n' + '='.repeat(50));
    console.log('📥 EXCEL TO SUPABASE IMPORT TOOL');
    console.log('='.repeat(50) + '\n');

    // Verify connection first
    const connected = await verifyConnection();
    if (!connected) {
        process.exit(1);
    }

    // Get file path
    const filePath = path.resolve(EXCEL_FILE);

    // Run import
    await importFromExcel(filePath, TABLE_NAME);
}

// Run
main();
