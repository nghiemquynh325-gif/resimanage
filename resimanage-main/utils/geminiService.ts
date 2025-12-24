/**
 * @fileoverview Google Gemini AI Service for Excel Data Processing
 * 
 * This service uses Google's Gemini AI to intelligently parse and normalize
 * resident data from Excel files with varying formats and structures.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Analyzes Excel headers and maps them to resident fields using AI.
 * 
 * @param apiKey - Google AI Studio API key
 * @param headers - Array of Excel column headers
 * @param sampleRows - Sample data rows for context
 * @returns Suggested field mapping
 */
export const analyzeExcelHeaders = async (
    apiKey: string,
    headers: string[],
    sampleRows: any[][]
): Promise<Record<string, string>> => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Bạn là một AI chuyên phân tích dữ liệu Excel. Hãy phân tích các cột Excel sau và map chúng với các trường cư dân.

**Các cột Excel:**
${headers.map((h, i) => `${i + 1}. "${h}"`).join('\n')}

**Dữ liệu mẫu (5 dòng đầu):**
${sampleRows.slice(0, 5).map((row, i) =>
        `Dòng ${i + 1}: ${headers.map((h, j) => `${h}="${row[j] || ''}"`).join(', ')}`
    ).join('\n')}

**Các trường cần map:**
- fullName: Họ và tên đầy đủ
- dob: Ngày sinh (YYYY-MM-DD)
- gender: Giới tính (Nam/Nữ/Khác)
- phoneNumber: Số điện thoại
- email: Email
- identityCard: Số CMND/CCCD
- address: Địa chỉ đầy đủ
- unit: Tổ dân phố
- province: Tỉnh/Thành phố
- ward: Phường/Xã
- ethnicity: Dân tộc
- religion: Tôn giáo
- profession: Nghề nghiệp
- education: Trình độ học vấn

**Yêu cầu:**
1. Trả về JSON object với key là tên cột Excel, value là tên trường tương ứng
2. Nếu không chắc chắn, bỏ qua cột đó (không map)
3. Chỉ map các cột có độ tin cậy cao

**Ví dụ output:**
{
  "HỌ TÊN": "fullName",
  "NGÀY SINH": "dob",
  "GIỚI TÍNH": "gender",
  "ĐDCN": "identityCard",
  "ĐỊA CHỈ": "address"
}

Chỉ trả về JSON, không giải thích thêm.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI không trả về JSON hợp lệ');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
        throw new Error(`Lỗi phân tích AI: ${error.message}`);
    }
};

/**
 * Normalizes resident data using AI.
 * 
 * @param apiKey - Google AI Studio API key
 * @param data - Raw resident data from Excel
 * @returns Normalized and validated data
 */
export const normalizeResidentData = async (
    apiKey: string,
    data: any[]
): Promise<any[]> => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Process in batches of 10 to avoid token limits
    const batchSize = 10;
    const results: any[] = [];

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        const prompt = `
Bạn là AI chuyên chuẩn hóa dữ liệu cư dân. Hãy chuẩn hóa dữ liệu sau:

**Dữ liệu cần chuẩn hóa:**
${JSON.stringify(batch, null, 2)}

**Yêu cầu chuẩn hóa:**
1. **Ngày sinh (dob):** Chuyển về format YYYY-MM-DD
   - Ví dụ: "15/08/2014" → "2014-08-15"
   - Ví dụ: "30/01/1991" → "1991-01-30"

2. **Giới tính (gender):** Chuẩn hóa thành Nam/Nữ/Khác
   - "Nam", "nam", "M", "Male" → "Nam"
   - "Nữ", "nữ", "F", "Female" → "Nữ"

3. **Họ tên (fullName):** Viết hoa chữ cái đầu mỗi từ
   - Ví dụ: "NGUYỄN VĂN A" → "Nguyễn Văn A"

4. **Số điện thoại (phoneNumber):** Chuẩn hóa format
   - Loại bỏ khoảng trắng, dấu gạch ngang
   - Thêm số 0 đầu nếu thiếu

5. **Địa chỉ (address):** Viết hoa chữ cái đầu, chuẩn hóa format

6. **Số CMND/CCCD (identityCard):** Loại bỏ khoảng trắng

**Output:** Trả về mảng JSON đã chuẩn hóa, giữ nguyên cấu trúc.

Chỉ trả về JSON array, không giải thích.
`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                // If AI fails, use original data
                results.push(...batch);
                continue;
            }

            const normalized = JSON.parse(jsonMatch[0]);
            results.push(...normalized);
        } catch (error) {
            // On error, use original data
            results.push(...batch);
        }
    }

    return results;
};

/**
 * Validates API key by making a test request.
 * 
 * @param apiKey - Google AI Studio API key to validate
 * @returns True if valid, throws error if invalid
 */
export const validateAPIKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey || apiKey.trim().length === 0) {
        throw new Error('API key không được để trống');
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Simple test request
        const result = await model.generateContent('Hello');
        await result.response;

        return true;
    } catch (error: any) {
        if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
            throw new Error('API key không hợp lệ. Vui lòng kiểm tra lại.');
        }
        throw new Error(`Lỗi xác thực: ${error.message}`);
    }
};
