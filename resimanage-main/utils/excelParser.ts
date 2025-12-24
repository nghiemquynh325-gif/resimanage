import * as XLSX from 'xlsx';

export interface ExcelData {
    headers: string[];
    rows: any[][];
}

/**
 * Parse Excel file and extract headers and data rows
 */
export const parseExcelFile = async (file: File): Promise<ExcelData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: ''
                });

                if (jsonData.length === 0) {
                    reject(new Error('File Excel trống'));
                    return;
                }

                // First row is headers
                const headers = jsonData[0].map(h => String(h || '').trim());

                // Rest are data rows
                const rows = jsonData.slice(1).filter(row =>
                    row.some(cell => cell !== null && cell !== undefined && cell !== '')
                );

                resolve({ headers, rows });
            } catch (error) {
                reject(new Error('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Lỗi khi đọc file'));
        };

        reader.readAsBinaryString(file);
    });
};

/**
 * Validate Excel file before parsing
 */
export const validateExcelFile = (file: File): { valid: boolean; error?: string } => {
    const validExtensions = ['.xlsx', '.xls'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
        return {
            valid: false,
            error: 'File không hợp lệ. Vui lòng chọn file Excel (.xlsx hoặc .xls)'
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File quá lớn. Kích thước tối đa là 10MB'
        };
    }

    return { valid: true };
};
