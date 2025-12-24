import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Download, Sparkles } from 'lucide-react';
import { createPortal } from 'react-dom';
import { parseExcelFile, validateExcelFile, ExcelData } from '../../utils/excelParser';
import { mapFieldsWithAI, FieldMapping, getMissingRequiredFields, getAllFields, getFieldDescription } from '../../utils/aiFieldMapper';
import { batchValidateResidents, ValidationResult } from '../../utils/residentValidator';
import { batchInsertResidents } from '../../utils/supabaseImporter';
import APIKeyInput from '../common/APIKeyInput';
import { analyzeExcelHeaders, normalizeResidentData } from '../../utils/geminiService';

interface AIExcelImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'upload' | 'mapping' | 'validation' | 'importing' | 'complete';

const AIExcelImportModal: React.FC<AIExcelImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [excelData, setExcelData] = useState<ExcelData | null>(null);
    const [mapping, setMapping] = useState<FieldMapping>({});
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
    const [importProgress, setImportProgress] = useState(0);
    const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [apiKey, setApiKey] = useState<string>('');
    const [useAI, setUseAI] = useState(false); // Default: use local AI, not Gemini

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

            // Use Gemini AI if API key is available and useAI is enabled
            if (useAI && apiKey) {
                try {
                    // Use Gemini to analyze headers
                    const geminiMapping = await analyzeExcelHeaders(
                        apiKey,
                        data.headers,
                        data.rows.slice(0, 5)
                    );

                    setMapping(geminiMapping);
                } catch (aiError: any) {
                    // Fallback to local AI if Gemini fails
                    const { mapping: suggestedMapping } = await mapFieldsWithAI(
                        data.headers,
                        data.rows.slice(0, 5)
                    );
                    setMapping(suggestedMapping);
                    setError(`AI phân tích thất bại, sử dụng phương pháp dự phòng: ${aiError.message}`);
                }
            } else {
                // Use local AI mapping
                const { mapping: suggestedMapping } = await mapFieldsWithAI(
                    data.headers,
                    data.rows.slice(0, 5)
                );
                setMapping(suggestedMapping);
            }

            setStep('mapping');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMappingChange = (excelColumn: string, residentField: string | null) => {
        setMapping(prev => ({
            ...prev,
            [excelColumn]: residentField
        }));
    };

    const handleValidate = async () => {
        if (!excelData) return;

        setIsProcessing(true);
        setError(null);

        try {
            // Check for missing required fields
            const missingFields = getMissingRequiredFields(mapping);
            if (missingFields.length > 0) {
                setError(`Thiếu các trường bắt buộc: ${missingFields.map(f => getFieldDescription(f)).join(', ')}`);
                setIsProcessing(false);
                return;
            }

            // Transform Excel rows to resident objects
            let residents = excelData.rows.map((row, rowIndex) => {
                const resident: any = { _rowIndex: rowIndex + 2 }; // +2 because row 1 is header, array is 0-indexed

                Object.entries(mapping).forEach(([excelCol, residentField]) => {
                    if (residentField && typeof residentField === 'string') {
                        const colIndex = excelData.headers.indexOf(excelCol);
                        if (colIndex !== -1) {
                            resident[residentField] = row[colIndex];
                        }
                    }
                });

                return resident;
            });

            // Use Gemini AI to normalize data if available
            if (useAI && apiKey && residents.length > 0) {
                try {
                    const normalized = await normalizeResidentData(apiKey, residents);
                    residents = normalized.map((r, i) => ({ ...r, _rowIndex: residents[i]._rowIndex }));
                } catch (aiError: any) {
                    // Continue with non-normalized data if AI fails
                    setError(`AI chuẩn hóa thất bại, tiếp tục với dữ liệu gốc: ${aiError.message}`);
                }
            }

            // Validate all rows
            const results = batchValidateResidents(residents, excelData.headers, mapping);
            setValidationResults(results);
            setStep('validation');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImport = async () => {
        setStep('importing');
        setIsProcessing(true);
        setError(null);

        try {
            // Filter out invalid rows
            const validResidents = validationResults
                .filter(r => r.valid)
                .map(r => r.data);

            if (validResidents.length === 0) {
                setError('Không có dữ liệu hợp lệ để import');
                setIsProcessing(false);
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
            setStep('validation');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        if (step === 'importing') return; // Don't allow closing during import

        setStep('upload');
        setFile(null);
        setExcelData(null);
        setMapping({});
        setValidationResults([]);
        setImportProgress(0);
        setImportResult(null);
        setError(null);
        onClose();
    };

    const validCount = validationResults.filter(r => r.valid).length;
    const invalidCount = validationResults.filter(r => !r.valid).length;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="text-white" size={24} />
                        <h2 className="text-xl font-bold text-white">Import Cư dân từ Excel (AI)</h2>
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
                            { key: 'mapping', label: 'Map Columns' },
                            { key: 'validation', label: 'Validate' },
                            { key: 'importing', label: 'Import' }
                        ].map((s, idx) => (
                            <div key={s.key} className="flex items-center flex-1">
                                <div className={`flex items-center gap-2 ${step === s.key ? 'text-blue-600 font-semibold' :
                                    ['mapping', 'validation', 'importing', 'complete'].indexOf(step) > idx ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === s.key ? 'bg-blue-600 text-white' :
                                        ['mapping', 'validation', 'importing', 'complete'].indexOf(step) > idx ? 'bg-green-600 text-white' : 'bg-gray-200'
                                        }`}>
                                        {['mapping', 'validation', 'importing', 'complete'].indexOf(step) > idx ? (
                                            <CheckCircle2 size={16} />
                                        ) : (
                                            <span className="text-sm">{idx + 1}</span>
                                        )}
                                    </div>
                                    <span className="text-sm hidden sm:inline">{s.label}</span>
                                </div>
                                {idx < 3 && (
                                    <div className={`flex-1 h-0.5 mx-2 ${['mapping', 'validation', 'importing', 'complete'].indexOf(step) > idx ? 'bg-green-600' : 'bg-gray-200'
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
                            {/* AI Configuration Section */}
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="text-purple-600" size={20} />
                                    <h3 className="font-semibold text-gray-900">Tự động phân tích cột Excel</h3>
                                </div>

                                <div className="bg-white rounded-lg p-3 mb-3">
                                    <p className="text-sm text-gray-700 mb-2">
                                        ✨ <strong>Tính năng thông minh tích hợp sẵn</strong> - Hệ thống sẽ tự động phân tích và map các cột Excel của bạn <strong>không cần API key</strong>!
                                    </p>
                                    <ul className="text-xs text-gray-600 space-y-1 ml-4">
                                        <li>• Nhận diện thông minh tên cột tiếng Việt và tiếng Anh</li>
                                        <li>• Xử lý lỗi chính tả và viết tắt phổ biến</li>
                                        <li>• Hoạt động hoàn toàn offline, nhanh chóng</li>
                                    </ul>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        type="checkbox"
                                        id="useAI"
                                        checked={useAI}
                                        onChange={(e) => setUseAI(e.target.checked)}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <label htmlFor="useAI" className="text-sm text-gray-700 cursor-pointer">
                                        Sử dụng Google Gemini AI để tăng độ chính xác (tùy chọn)
                                    </label>
                                </div>

                                {useAI && (
                                    <APIKeyInput
                                        onKeyValidated={(key) => setApiKey(key)}
                                        initialKey={apiKey}
                                    />
                                )}
                            </div>

                            <div className="text-center">
                                <p className="text-gray-600 mb-4">
                                    Upload file Excel chứa danh sách cư dân.
                                    {useAI && apiKey ? ' AI sẽ tự động phân tích và chuẩn hóa dữ liệu.' : ' Hệ thống sẽ tự động map các cột.'}
                                </p>
                            </div>

                            <label className="block">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
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
                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <FileSpreadsheet className="text-blue-600" size={24} />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{file.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                    {isProcessing && <Loader2 className="animate-spin text-blue-600" size={20} />}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Mapping */}
                    {step === 'mapping' && excelData && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>{useAI && apiKey ? '✨ Gemini AI đã phân tích file của bạn!' : '🤖 Hệ thống đã phân tích file của bạn!'}</strong> Kiểm tra và điều chỉnh mapping nếu cần.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {excelData.headers.map((header, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cột Excel: <span className="text-blue-600">{header}</span>
                                            </label>
                                            <p className="text-xs text-gray-500">
                                                Mẫu: {excelData.rows[0]?.[idx] || '(trống)'}
                                            </p>
                                        </div>
                                        <div className="flex-1">
                                            <select
                                                value={mapping[header] || ''}
                                                onChange={(e) => handleMappingChange(header, e.target.value || null)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">-- Bỏ qua cột này --</option>
                                                {getAllFields().map(field => (
                                                    <option key={field.value} value={field.value}>
                                                        {field.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Validation */}
                    {step === 'validation' && (
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
                                    <p className="text-3xl font-bold text-blue-600">{validationResults.length}</p>
                                    <p className="text-sm text-blue-700">Tổng số</p>
                                </div>
                            </div>

                            {invalidCount > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800 font-medium mb-2">
                                        ⚠️ Có {invalidCount} dòng bị lỗi. Chỉ {validCount} dòng hợp lệ sẽ được import.
                                    </p>
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {validationResults.filter(r => !r.valid).slice(0, 10).map((result, idx) => (
                                            <div key={idx} className="text-xs bg-white p-2 rounded border border-yellow-300">
                                                <strong>Dòng {result.errors[0]?.row}:</strong> {result.errors[0]?.message}
                                            </div>
                                        ))}
                                        {invalidCount > 10 && (
                                            <p className="text-xs text-yellow-700">... và {invalidCount - 10} lỗi khác</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Importing */}
                    {step === 'importing' && (
                        <div className="text-center py-12">
                            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                            <p className="text-lg font-medium text-gray-900">Đang import dữ liệu...</p>
                            <p className="text-sm text-gray-500 mt-2">Vui lòng không đóng cửa sổ này</p>
                        </div>
                    )}

                    {/* Step 5: Complete */}
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
                        {step === 'mapping' && (
                            <button
                                onClick={handleValidate}
                                disabled={isProcessing}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isProcessing && <Loader2 className="animate-spin" size={16} />}
                                Tiếp tục
                            </button>
                        )}

                        {step === 'validation' && (
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

export default AIExcelImportModal;
