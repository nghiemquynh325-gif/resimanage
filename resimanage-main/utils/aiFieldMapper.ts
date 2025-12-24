import { GoogleGenerativeAI } from '@google/generative-ai';

export interface FieldMapping {
    [excelColumn: string]: string | null; // Maps Excel column to Resident field
}

export interface MappingSuggestion {
    mapping: FieldMapping;
    confidence: number;
}

// Resident field definitions with Vietnamese descriptions
const RESIDENT_FIELDS = {
    fullName: { required: true, description: 'Họ và tên', examples: ['Họ tên', 'HỌ TÊN', 'Tên', 'Full Name', 'Name', 'Họ và tên', 'HỌ VÀ TÊN'] },
    phoneNumber: { required: true, description: 'Số điện thoại', examples: ['SĐT', 'SỐ ĐIỆN THOẠI', 'Điện thoại', 'Phone', 'Mobile', 'DIEN THOAI'] },
    address: { required: true, description: 'Địa chỉ', examples: ['Địa chỉ', 'ĐỊA CHỈ', 'Address', 'Nơi ở', 'DIA CHI'] },
    dob: { required: true, description: 'Ngày sinh', examples: ['Ngày sinh', 'NGÀY SINH', 'DOB', 'Date of Birth', 'Sinh nhật', 'NGAY SINH'] },
    gender: { required: true, description: 'Giới tính', examples: ['Giới tính', 'GIỚI TÍNH', 'Gender', 'Sex', 'GIOI TINH'] },
    email: { required: false, description: 'Email', examples: ['Email', 'EMAIL', 'E-mail', 'Thư điện tử'] },
    identityCard: { required: false, description: 'CCCD/CMND', examples: ['CCCD', 'CMND', 'ID Card', 'Số CCCD', 'SO CCCD'] },
    education: { required: false, description: 'Trình độ học vấn', examples: ['Học vấn', 'HỌC VẤN', 'Education', 'Trình độ', 'TRINH DO'] },
    hometown: { required: false, description: 'Quê quán', examples: ['Quê quán', 'QUÊ QUÁN', 'Hometown', 'Nguyên quán', 'QUE QUAN'] },
    profession: { required: false, description: 'Nghề nghiệp', examples: ['Nghề nghiệp', 'NGHỀ NGHIỆP', 'Profession', 'Job', 'Occupation', 'NGHE NGHIEP'] },
    ethnicity: { required: false, description: 'Dân tộc', examples: ['Dân tộc', 'DÂN TỘC', 'Ethnicity', 'Ethnic', 'DAN TOC'] },
    religion: { required: false, description: 'Tôn giáo', examples: ['Tôn giáo', 'TÔN GIÁO', 'Religion', 'TON GIAO'] },
    unit: { required: false, description: 'Tổ dân phố', examples: ['Tổ', 'TỔ', 'Unit', 'Tổ DP', 'TO DP'] },
    province: { required: false, description: 'Tỉnh/Thành phố', examples: ['Tỉnh', 'TỈNH', 'Province', 'Thành phố', 'TINH'] },
    ward: { required: false, description: 'Xã/Phường', examples: ['Xã', 'XÃ', 'Phường', 'PHƯỜNG', 'Ward', 'PHUONG'] },
    isPartyMember: { required: false, description: 'Đảng viên', examples: ['Đảng viên', 'ĐẢNG VIÊN', 'Party Member', 'DANG VIEN'] },
    partyJoinDate: { required: false, description: 'Ngày vào Đảng', examples: ['Ngày vào Đảng', 'NGÀY VÀO ĐẢNG', 'Party Join Date', 'NGAY VAO DANG'] },
    specialStatus: { required: false, description: 'Đặc điểm', examples: ['Đặc điểm', 'ĐẶC ĐIỂM', 'Special Status', 'Ghi chú đặc biệt', 'DAC DIEM'] },
};

/**
 * Use AI to map Excel columns to Resident fields
 */
export const mapFieldsWithAI = async (
    headers: string[],
    sampleRows: any[][]
): Promise<MappingSuggestion> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        // Gemini API key not configured, falling back to rule-based mapping
        return mapFieldsWithRules(headers);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Bạn là một AI chuyên phân tích dữ liệu cư dân. Nhiệm vụ của bạn là map các cột trong file Excel sang các trường dữ liệu cư dân.

CÁC TRƯỜNG DỮ LIỆU CƯ DÂN:
${Object.entries(RESIDENT_FIELDS).map(([key, field]) =>
            `- ${key} (${field.required ? 'BẮT BUỘC' : 'TÙY CHỌN'}): ${field.description}. Ví dụ: ${field.examples.join(', ')}`
        ).join('\n')}

CÁC CỘT TRONG FILE EXCEL:
${headers.map((h, i) => `${i + 1}. "${h}"`).join('\n')}

MẪU DỮ LIỆU (3 dòng đầu):
${sampleRows.slice(0, 3).map((row, i) =>
            `Dòng ${i + 1}: ${row.map((cell, j) => `${headers[j]}="${cell}"`).join(', ')}`
        ).join('\n')}

YÊU CẦU:
1. Phân tích tên cột và dữ liệu mẫu
2. Map mỗi cột Excel sang trường dữ liệu cư dân phù hợp nhất
3. Nếu không chắc chắn, để null
4. Trả về JSON với format: { "Tên cột Excel": "fieldName" hoặc null }

VÍ DỤ OUTPUT:
{
  "Họ và tên": "fullName",
  "SĐT": "phoneNumber",
  "Ngày sinh": "dob",
  "Cột không rõ": null
}

CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT GIẢI THÍCH THÊM.`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI response không chứa JSON hợp lệ');
        }

        const mapping: FieldMapping = JSON.parse(jsonMatch[0]);

        return {
            mapping,
            confidence: 0.9 // AI-based mapping has high confidence
        };
    } catch (error) {
        // AI mapping failed, falling back to rule-based mapping
        return mapFieldsWithRules(headers);
    }
};

/**
 * Fallback: Enhanced rule-based field mapping using fuzzy matching and similarity scoring
 */
const mapFieldsWithRules = (headers: string[]): MappingSuggestion => {
    const mapping: FieldMapping = {};

    headers.forEach(header => {
        const normalizedHeader = normalizeVietnameseText(header);
        let bestMatch: { field: string | null; score: number } = { field: null, score: 0 };

        // Try to match with examples using similarity scoring
        for (const [fieldName, fieldDef] of Object.entries(RESIDENT_FIELDS)) {
            const score = calculateFieldSimilarity(normalizedHeader, fieldDef);

            if (score > bestMatch.score && score > 0.5) { // Threshold: 50% similarity
                bestMatch = { field: fieldName, score };
            }
        }

        mapping[header] = bestMatch.field;
    });

    return {
        mapping,
        confidence: 0.75 // Enhanced rule-based has better confidence
    };
};

/**
 * Normalize Vietnamese text for better matching
 */
const normalizeVietnameseText = (text: string): string => {
    // Remove Vietnamese diacritics
    const withoutDiacritics = text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd');

    return withoutDiacritics
        .toLowerCase()
        .trim()
        // Remove common prefixes/suffixes
        .replace(/^(số|so|ma|mã|ten|tên|ho|họ)\s+/g, '')
        .replace(/\s+(cư dân|cu dan|nguoi|người|khach|khách)$/g, '')
        // Normalize spaces
        .replace(/\s+/g, '');
};

/**
 * Calculate similarity score between header and field definition
 */
const calculateFieldSimilarity = (
    header: string,
    fieldDef: { description: string; examples: string[] }
): number => {
    let maxScore = 0;

    // Check exact match with examples
    for (const example of fieldDef.examples) {
        const normalizedExample = normalizeVietnameseText(example);

        // Exact match
        if (header === normalizedExample) {
            return 1.0;
        }

        // Contains match
        if (header.includes(normalizedExample) || normalizedExample.includes(header)) {
            maxScore = Math.max(maxScore, 0.9);
        }

        // Fuzzy match using Levenshtein-like approach
        const similarity = calculateStringSimilarity(header, normalizedExample);
        maxScore = Math.max(maxScore, similarity);
    }

    // Also check description
    const normalizedDesc = normalizeVietnameseText(fieldDef.description);
    if (header.includes(normalizedDesc) || normalizedDesc.includes(header)) {
        maxScore = Math.max(maxScore, 0.85);
    }

    // Keyword-based matching for common patterns
    maxScore = Math.max(maxScore, matchByKeywords(header, fieldDef));

    return maxScore;
};

/**
 * Calculate string similarity using a simple algorithm
 */
const calculateStringSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
};

/**
 * Calculate Levenshtein distance between two strings
 */
const getEditDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
};

/**
 * Match by specific keywords and patterns
 */
const matchByKeywords = (
    header: string,
    fieldDef: { description: string; examples: string[] }
): number => {
    const keywordPatterns: Record<string, string[]> = {
        fullName: ['ten', 'name', 'ho', 'hoten', 'hovaten', 'họtên', 'họvàtên', 'chuho', 'tennguoi'],
        phoneNumber: ['sdt', 'phone', 'dienthoai', 'mobile', 'tel', 'sodienthoai', 'sodtthoai', 'dtthoai'],
        email: ['email', 'mail', 'thu', 'thudientu'],
        address: ['diachi', 'address', 'noi o', 'cho o', 'noio', 'choo', 'diachithuongtru'],
        dob: ['ngaysinh', 'sinh', 'dob', 'birthday', 'birth', 'namsinh', 'ns'],
        gender: ['gioitinh', 'gender', 'sex', 'phai', 'gt'],
        identityCard: ['cccd', 'cmnd', 'id', 'cmt', 'socccd', 'socmnd'],
        education: ['hocvan', 'education', 'trinhdo', 'trinhdohocvan'],
        profession: ['nghenghiep', 'job', 'profession', 'occupation', 'nghề'],
        ethnicity: ['dantoc', 'ethnic', 'dt'],
        religion: ['tongiao', 'religion', 'tg'],
        unit: ['to', 'unit', 'todp', 'todanpho'],
        province: ['tinh', 'province', 'thanhpho', 'tinhthanhpho'],
        ward: ['xa', 'phuong', 'ward', 'xaphuong'],
        hometown: ['quequan', 'hometown', 'nguyenquan', 'qq'],
        isPartyMember: ['dang', 'party', 'dangvien', 'đảngviên'],
        partyJoinDate: ['ngayvaodang', 'partyjoin', 'vaodang'],
        specialStatus: ['dacdiem', 'special', 'ghichu', 'đặcđiểm']
    };

    // Find matching field by keywords
    for (const [fieldName, keywords] of Object.entries(keywordPatterns)) {
        if (fieldDef.description.toLowerCase().includes(fieldName.toLowerCase())) {
            for (const keyword of keywords) {
                if (header.replace(/\s/g, '').includes(keyword)) {
                    return 0.8;
                }
            }
        }
    }

    return 0;
};

/**
 * Get required fields that are missing from mapping
 */
export const getMissingRequiredFields = (mapping: FieldMapping): string[] => {
    const mappedFields = new Set(Object.values(mapping).filter(v => v !== null));
    const requiredFields = Object.entries(RESIDENT_FIELDS)
        .filter(([_, def]) => def.required)
        .map(([key, _]) => key);

    return requiredFields.filter(field => !mappedFields.has(field));
};

/**
 * Get field description for display
 */
export const getFieldDescription = (fieldName: string): string => {
    return RESIDENT_FIELDS[fieldName as keyof typeof RESIDENT_FIELDS]?.description || fieldName;
};

/**
 * Get all available fields for manual mapping
 */
export const getAllFields = () => {
    return Object.entries(RESIDENT_FIELDS).map(([key, def]) => ({
        value: key,
        label: `${def.description} ${def.required ? '(*)' : ''}`,
        required: def.required
    }));
};
