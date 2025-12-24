import { Resident } from '../types';
import { FieldMapping } from './aiFieldMapper';

export interface ValidationError {
    row: number;
    field: string;
    value: any;
    message: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    data: Partial<Resident>;
}

/**
 * Validate and transform a single row of data
 */
export const validateResidentData = (
    rowData: any[],
    headers: string[],
    mapping: FieldMapping,
    rowIndex: number
): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const data: Partial<Resident> = {};

    // Map row data to resident fields
    headers.forEach((header, colIndex) => {
        const fieldName = mapping[header];
        if (!fieldName) return;

        const value = rowData[colIndex];

        // Validate and transform based on field type
        switch (fieldName) {
            case 'fullName':
                if (!value || String(value).trim() === '') {
                    errors.push({
                        row: rowIndex,
                        field: fieldName,
                        value,
                        message: 'Họ tên không được để trống'
                    });
                } else {
                    data.fullName = String(value).trim();
                }
                break;

            case 'phoneNumber':
                const phone = String(value || '').replace(/\D/g, '');
                if (!phone) {
                    errors.push({
                        row: rowIndex,
                        field: fieldName,
                        value,
                        message: 'Số điện thoại không được để trống'
                    });
                } else if (phone.length < 10) {
                    errors.push({
                        row: rowIndex,
                        field: fieldName,
                        value,
                        message: 'Số điện thoại phải có ít nhất 10 số'
                    });
                } else {
                    data.phoneNumber = phone;
                }
                break;

            case 'email':
                if (value) {
                    const email = String(value).trim();
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        warnings.push({
                            row: rowIndex,
                            field: fieldName,
                            value,
                            message: 'Email không hợp lệ'
                        });
                    } else {
                        data.email = email;
                    }
                }
                break;

            case 'dob':
                if (!value) {
                    errors.push({
                        row: rowIndex,
                        field: fieldName,
                        value,
                        message: 'Ngày sinh không được để trống'
                    });
                } else {
                    // Try to parse date
                    const dateStr = parseDateValue(value);
                    if (!dateStr) {
                        errors.push({
                            row: rowIndex,
                            field: fieldName,
                            value,
                            message: 'Ngày sinh không hợp lệ (định dạng: DD/MM/YYYY hoặc YYYY-MM-DD)'
                        });
                    } else {
                        data.dob = dateStr;
                    }
                }
                break;

            case 'gender':
                if (!value) {
                    errors.push({
                        row: rowIndex,
                        field: fieldName,
                        value,
                        message: 'Giới tính không được để trống'
                    });
                } else {
                    const gender = normalizeGender(String(value));
                    if (!gender) {
                        errors.push({
                            row: rowIndex,
                            field: fieldName,
                            value,
                            message: 'Giới tính không hợp lệ (Nam/Nữ/Khác)'
                        });
                    } else {
                        data.gender = gender;
                    }
                }
                break;

            case 'address':
                if (!value || String(value).trim() === '') {
                    errors.push({
                        row: rowIndex,
                        field: fieldName,
                        value,
                        message: 'Địa chỉ không được để trống'
                    });
                } else {
                    data.address = String(value).trim();
                }
                break;

            case 'identityCard':
                if (value) {
                    const id = String(value).replace(/\D/g, '');
                    if (id.length < 9 || id.length > 12) {
                        warnings.push({
                            row: rowIndex,
                            field: fieldName,
                            value,
                            message: 'CCCD/CMND phải có 9-12 số'
                        });
                    } else {
                        data.identityCard = id;
                    }
                }
                break;

            case 'isPartyMember':
                if (value) {
                    data.isPartyMember = normalizeBoolean(value);
                }
                break;

            case 'isHeadOfHousehold':
                if (value) {
                    data.isHeadOfHousehold = normalizeBoolean(value);
                }
                break;

            // String fields
            case 'education':
            case 'hometown':
            case 'profession':
            case 'ethnicity':
            case 'religion':
            case 'unit':
            case 'province':
            case 'ward':
            case 'specialStatus':
            case 'specialNotes':
                if (value && String(value).trim() !== '') {
                    data[fieldName] = String(value).trim();
                }
                break;

            case 'partyJoinDate':
                if (value) {
                    const dateStr = parseDateValue(value);
                    if (dateStr) {
                        data.partyJoinDate = dateStr;
                    }
                }
                break;
        }
    });

    // Set default values for required fields
    if (!data.status) {
        data.status = 'active' as any;
    }

    if (!data.avatar) {
        data.avatar = data.fullName
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=random&color=fff`
            : '';
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        data
    };
};

/**
 * Parse date value from various formats
 */
const parseDateValue = (value: any): string | null => {
    if (!value) return null;

    // If already a Date object
    if (value instanceof Date) {
        return value.toISOString().split('T')[0];
    }

    const str = String(value).trim();

    // Try DD/MM/YYYY format
    const ddmmyyyyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyyMatch) {
        const [_, day, month, year] = ddmmyyyyMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try YYYY-MM-DD format
    const yyyymmddMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyymmddMatch) {
        const [_, year, month, day] = yyyymmddMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try Excel serial date
    if (!isNaN(Number(value))) {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + Number(value) * 86400000);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    }

    return null;
};

/**
 * Normalize gender value
 */
const normalizeGender = (value: string): 'Nam' | 'Nữ' | 'Khác' | null => {
    const normalized = value.toLowerCase().trim();

    if (['nam', 'male', 'm', 'boy'].includes(normalized)) return 'Nam';
    if (['nữ', 'nu', 'female', 'f', 'girl'].includes(normalized)) return 'Nữ';
    if (['khác', 'khac', 'other', 'o'].includes(normalized)) return 'Khác';

    return null;
};

/**
 * Normalize boolean value
 */
const normalizeBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;

    const str = String(value).toLowerCase().trim();
    return ['true', 'yes', 'có', 'co', '1', 'x'].includes(str);
};

/**
 * Batch validate multiple rows
 */
export const batchValidateResidents = (
    rows: any[][],
    headers: string[],
    mapping: FieldMapping
): ValidationResult[] => {
    return rows.map((row, index) =>
        validateResidentData(row, headers, mapping, index + 1)
    );
};
