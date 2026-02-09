import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { createPortal } from 'react-dom';
import { parseExcelFile, validateExcelFile, ExcelData } from '../../utils/excelParser';
import { batchInsertResidents } from '../../utils/supabaseImporter';

interface VoterImportProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'upload' | 'preview' | 'importing' | 'complete';

interface ProcessedResident {
    full_name: string;
    email?: string;
    dob?: string;
    gender: 'Nam' | 'Nữ' | 'Khác';
    phone_number: string;
    address?: string;
    residence_type?: string;
    identity_card?: string;
    education?: string;
    hometown?: string;
    profession?: string;
    ethnicity?: string;
    religion?: string;
    unit?: string;
    province?: string;
    ward?: string;
    special_notes?: string;
    status: 'active';
    avatar: string;
    _rowIndex?: number;
    _isValid?: boolean;
    _errors?: string[];
}

// Column mapping from Excel to database fields
const COLUMN_MAPPING: Record<string, string> = {
    'STT': '',
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
    'TRẠNG THÁI': '',
    'ĐẢNG VIÊN': '',
    'NGÀY VÀO ĐẢNG': ''
};

// Normalize gender values
const normalizeGender = (value: any): 'Nam' | 'Nữ' | 'Khác' => {
    if (!value) return 'Khác';
    const normalized = String(value).trim().toLowerCase();
    if (normalized === 'nam' || normalized === 'male' || normalized === 'm') return 'Nam';
    if (normalized === 'nữ' || normalized === 'nu' || normalized === 'female' || normalized === 'f') return 'Nữ';
    return 'Khác';
};

// Normalize residence type
const normalizeResidenceType = (value: any): string | undefined => {
    if (!value) return undefined;
    const normalized = String(value).trim().toLowerCase();

    if (normalized === 'thường trú' || normalized === 'thuong tru') return 'Thường trú';
    if (normalized === 'tạm trú' || normalized === 'tam tru') return 'Tạm trú';
    if (normalized === 'tạm vắng' || normalized === 'tam vang') return 'Tạm vắng';
    if (normalized === 'tạm trú có nhà' || normalized === 'tam tru co nha') return 'Tạm trú có nhà';

    return String(value).trim();
};

// Normalize date (supports multiple formats)
const normalizeDate = (value: any): string | undefined => {
    if (!value) return undefined;

    try {
        let year: number, month: number, day: number;

        if (typeof value === 'number') {
            // Excel serial date
            const date = new Date((value - 25569) * 86400 * 1000);
            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDate();
        } else if (typeof value === 'string') {
            const formats = [
                /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
                /(\d{4})-(\d{1,2})-(\d{1,2})/,
                /(\d{1,2})-(\d{1,2})-(\d{4})/,
            ];

            let matched = false;
            for (const format of formats) {
                const match = value.match(format);
                if (match) {
                    if (format === formats[0] || format === formats[2]) {
                        [, day, month, year] = match.map(Number);
                    } else {
                        [, year, month, day] = match.map(Number);
                    }
                    matched = true;
                    break;
                }
            }
            if (!matched) return undefined;
        } else if (value instanceof Date) {
            return value.toISOString().split('T')[0];
        } else {
            return undefined;
        }

        // Validate date ranges
        if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
            return undefined;
        }

        // Validate actual date
        const testDate = new Date(year, month - 1, day);
        if (testDate.getFullYear() !== year ||
            testDate.getMonth() !== month - 1 ||
            testDate.getDate() !== day) {
            return undefined;
        }

        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } catch (error) {
        return undefined;
    }
};

const VoterImport: React.FC<VoterImportProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [excelData, setExcelData] = useState<ExcelData | null>(null);
    const [processedData, setProcessedData] = useState<ProcessedResident[]>([]);
    const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleFileSelect = async (selectedFile: File) => {
        setError(null);
        setFile(selectedFile);

        // Validate file
        const validation = validateExcelFile(selectedFile);
        if (!validation.valid) {
            setError(validation.error!);
            return;
        }

        setIsProcessing(true);

        try {
            // Parse Excel
            const data = await parseExcelFile(selectedFile);
            setExcelData(data);

            // Process and validate data
            const processed = processExcelData(data);
            setProcessedData(processed);

            setStep('preview');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const processExcelData = (data: ExcelData): ProcessedResident[] => {
        const results: ProcessedResident[] = [];

        data.rows.forEach((row, index) => {
            const errors: string[] = [];
            const resident: any = {
                status: 'active',
                avatar: '',
                _rowIndex: index + 2, // +2 because row 1 is header, array is 0-indexed
                _isValid: true,
                _errors: []
            };

            // Map columns
            data.headers.forEach((header, colIndex) => {
                const dbField = COLUMN_MAPPING[header.toUpperCase()];
                if (!dbField) return;

                let value = row[colIndex];

                // Apply normalization based on field type
                if (dbField === 'gender') {
                    value = normalizeGender(value);
                } else if (dbField === 'residence_type') {
                    value = normalizeResidenceType(value);
                } else if (dbField === 'dob') {
                    value = normalizeDate(value);
                } else if (dbField === 'phone_number') {
                    value = value ? String(value).replace(/\s+/g, '') : '';
                } else if (dbField === 'identity_card') {
                    value = value ? String(value).replace(/[^0-9]/g, '') : '';
                }

                resident[dbField] = value || undefined;
            });

            // Validate required fields
            if (!resident.full_name || !resident.full_name.trim()) {
                errors.push('Thiếu họ tên');
                resident._isValid = false;
            }

            // Set default phone number if missing
            if (!resident.phone_number) {
                resident.phone_number = '0000000000';
            }

            // Set default avatar
            resident.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${resident.full_name || `user${index}`}`;

            resident._errors = errors;
            results.push(resident);
        });

        return results;
    };

    const handleImport = async () => {
        setStep('importing');
        setIsProcessing(true);
        setError(null);

        try {
            // Filter valid residents
            const validResidents = processedData
                .filter(r => r._isValid)
                .map(r => {
                    const { _rowIndex, _isValid, _errors, ...resident } = r;

                    // Convert snake_case to camelCase for supabaseImporter
                    return {
                        fullName: resident.full_name,
                        email: resident.email,
                        dob: resident.dob,
                        gender: resident.gender,
                        phoneNumber: resident.phone_number,
                        address: resident.address,
                        residenceType: resident.residence_type,
                        identityCard: resident.identity_card,
                        education: resident.education,
                        hometown: resident.hometown,
                        profession: resident.profession,
                        ethnicity: resident.ethnicity,
                        religion: resident.religion,
                        unit: resident.unit,
                        province: resident.province,
                        ward: resident.ward,
                        specialNotes: resident.special_notes,
                        status: resident.status,
                        avatar: resident.avatar
                    };
                });

            if (validResidents.length === 0) {
                setError('Không có dữ liệu hợp lệ để import');
                setIsProcessing(false);
                setStep('preview');
                return;
            }

            // Import to Supabase
            const result = await batchInsertResidents(validResidents);

            setImportResult({
                success: result.success,
                failed: result.failed
            });

            setStep('complete');

            // Call onSuccess after a short delay
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err: any) {
            setError(err.message);
            setStep('preview');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        if (step === 'importing') return;

        setStep('upload');
        setFile(null);
        setExcelData(null);
        setProcessedData([]);
        setImportResult(null);
        setError(null);
        onClose();
    };

    const validCount = processedData.filter(r => r._isValid).length;
    const invalidCount = processedData.filter(r => !r._isValid).length;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="text-white" size={24} />
                        <h2 className="text-xl font-bold text-white">Import Cư dân từ Excel</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={step === 'importing'}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        {[
                            { key: 'upload', label: 'Upload File' },
                            { key: 'preview', label: 'Xem trước' },
                            { key: 'importing', label: 'Import' }
                        ].map((s, idx) => (
                            <div key={s.key} className="flex items-center flex-1">
                                <div className={`flex items-center gap-2 ${step === s.key ? 'text-green-600 font-semibold' :
                                    ['preview', 'importing', 'complete'].indexOf(step) > idx ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === s.key ? 'bg-green-600 text-white' :
                                        ['preview', 'importing', 'complete'].indexOf(step) > idx ? 'bg-green-600 text-white' : 'bg-gray-200'
                                        }`}>
                                        {['preview', 'importing', 'complete'].indexOf(step) > idx ? (
                                            <CheckCircle2 size={16} />
                                        ) : (
                                            <span className="text-sm">{idx + 1}</span>
                                        )}
                                    </div>
                                    <span className="text-sm hidden sm:inline">{s.label}</span>
                                </div>
                                {idx < 2 && (
                                    <div className={`flex-1 h-0.5 mx-2 ${['preview', 'importing', 'complete'].indexOf(step) > idx ? 'bg-green-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Step 1: Upload */}
                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">📋 Định dạng file Excel</h3>
                                <p className="text-sm text-gray-700 mb-2">
                                    File Excel cần có các cột sau (không phân biệt hoa thường):
                                </p>
                                <ul className="text-xs text-gray-600 space-y-1 ml-4 grid grid-cols-2 gap-x-4">
                                    <li>• <strong>HỌ VÀ TÊN</strong> (bắt buộc)</li>
                                    <li>• EMAIL</li>
                                    <li>• NGÀY SINH</li>
                                    <li>• GIỚI TÍNH</li>
                                    <li>• SỐ ĐIỆN THOẠI</li>
                                    <li>• ĐỊA CHỈ</li>
                                    <li>• LOẠI CƯ TRÚ</li>
                                    <li>• CMND/CCCD</li>
                                    <li>• HỌC VẤN</li>
                                    <li>• QUÊ QUÁN</li>
                                    <li>• NGHỀ NGHIỆP</li>
                                    <li>• DÂN TỘC</li>
                                    <li>• TÔN GIÁO</li>
                                    <li>• TỔ DÂN PHỐ</li>
                                    <li>• TỈNH/THÀNH PHỐ</li>
                                    <li>• PHƯỜNG/XÃ</li>
                                </ul>
                            </div>

                            <label className="block">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors cursor-pointer">
                                    <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-lg font-medium text-gray-700 mb-2">
                                        Click để chọn file hoặc kéo thả file vào đây
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Hỗ trợ: .xlsx, .xls (Tối đa 10MB)
                                    </p>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileSelect(file);
                                        }}
                                    />
                                </div>
                            </label>

                            {file && (
                                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <FileSpreadsheet className="text-green-600" size={24} />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{file.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                    {isProcessing && <Loader2 className="animate-spin text-green-600" size={20} />}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Preview */}
                    {step === 'preview' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-green-600">{validCount}</p>
                                    <p className="text-sm text-green-700">Hợp lệ</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-red-600">{invalidCount}</p>
                                    <p className="text-sm text-red-700">Lỗi</p>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-blue-600">{processedData.length}</p>
                                    <p className="text-sm text-blue-700">Tổng số</p>
                                </div>
                            </div>

                            {invalidCount > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800 font-medium mb-2">
                                        ⚠️ Có {invalidCount} dòng bị lỗi. Chỉ {validCount} dòng hợp lệ sẽ được import.
                                    </p>
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {processedData.filter(r => !r._isValid).slice(0, 10).map((resident, idx) => (
                                            <div key={idx} className="text-xs bg-white p-2 rounded border border-yellow-300">
                                                <strong>Dòng {resident._rowIndex}:</strong> {resident._errors?.join(', ')}
                                            </div>
                                        ))}
                                        {invalidCount > 10 && (
                                            <p className="text-xs text-yellow-700">... và {invalidCount - 10} lỗi khác</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Preview table */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Eye size={20} className="text-gray-600" />
                                    <h3 className="font-semibold text-gray-900">Xem trước dữ liệu (10 dòng đầu)</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-2 py-2 text-left">STT</th>
                                                <th className="px-2 py-2 text-left">Họ và tên</th>
                                                <th className="px-2 py-2 text-left">Ngày sinh</th>
                                                <th className="px-2 py-2 text-left">Giới tính</th>
                                                <th className="px-2 py-2 text-left">SĐT</th>
                                                <th className="px-2 py-2 text-left">Địa chỉ</th>
                                                <th className="px-2 py-2 text-left">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {processedData.slice(0, 10).map((resident, idx) => (
                                                <tr key={idx} className={resident._isValid ? '' : 'bg-red-50'}>
                                                    <td className="px-2 py-2">{idx + 1}</td>
                                                    <td className="px-2 py-2">{resident.full_name || '—'}</td>
                                                    <td className="px-2 py-2">{resident.dob || '—'}</td>
                                                    <td className="px-2 py-2">{resident.gender}</td>
                                                    <td className="px-2 py-2">{resident.phone_number}</td>
                                                    <td className="px-2 py-2 max-w-xs truncate">{resident.address || '—'}</td>
                                                    <td className="px-2 py-2">
                                                        {resident._isValid ? (
                                                            <span className="text-green-600">✓</span>
                                                        ) : (
                                                            <span className="text-red-600">✗</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Importing */}
                    {step === 'importing' && (
                        <div className="text-center py-12">
                            <Loader2 className="animate-spin text-green-600 mx-auto mb-4" size={48} />
                            <p className="text-lg font-medium text-gray-900">Đang import dữ liệu...</p>
                            <p className="text-sm text-gray-500 mt-2">Vui lòng không đóng cửa sổ này</p>
                        </div>
                    )}

                    {/* Step 4: Complete */}
                    {step === 'complete' && importResult && (
                        <div className="text-center py-12">
                            <CheckCircle2 className="text-green-600 mx-auto mb-4" size={64} />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Import thành công!</h3>
                            <div className="space-y-2 mt-6">
                                <p className="text-lg">
                                    <span className="font-semibold text-green-600">{importResult.success}</span> cư dân đã được thêm
                                </p>
                                {importResult.failed > 0 && (
                                    <p className="text-lg">
                                        <span className="font-semibold text-red-600">{importResult.failed}</span> thất bại
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                    <button
                        onClick={handleClose}
                        disabled={step === 'importing'}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {step === 'complete' ? 'Đóng' : 'Hủy'}
                    </button>

                    <div className="flex gap-2">
                        {step === 'preview' && (
                            <button
                                onClick={handleImport}
                                disabled={validCount === 0 || isProcessing}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                Import {validCount} cư dân
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default VoterImport;
