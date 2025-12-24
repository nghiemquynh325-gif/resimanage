import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { validateAPIKey } from '../../utils/geminiService';

interface APIKeyInputProps {
    onKeyValidated: (apiKey: string) => void;
    initialKey?: string;
}

const API_KEY_STORAGE_KEY = 'gemini_api_key_session';

/**
 * Component for Google AI Studio API Key input and validation.
 * 
 * Features:
 * - Secure input with show/hide toggle
 * - Real-time validation
 * - Session storage (cleared on tab close)
 * - Link to get API key
 */
const APIKeyInput: React.FC<APIKeyInputProps> = ({ onKeyValidated, initialKey }) => {
    const [apiKey, setApiKey] = useState(initialKey || '');
    const [showKey, setShowKey] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [error, setError] = useState<string | null>(null);

    // Load saved key from sessionStorage on mount
    useEffect(() => {
        if (!initialKey) {
            const saved = sessionStorage.getItem(API_KEY_STORAGE_KEY);
            if (saved) {
                setApiKey(saved);
                setValidationStatus('valid');
                onKeyValidated(saved);
            }
        }
    }, [initialKey, onKeyValidated]);

    const handleValidate = async () => {
        if (!apiKey.trim()) {
            setError('Vui lòng nhập API key');
            return;
        }

        setIsValidating(true);
        setError(null);
        setValidationStatus('idle');

        try {
            await validateAPIKey(apiKey.trim());

            // Save to sessionStorage
            sessionStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());

            setValidationStatus('valid');
            onKeyValidated(apiKey.trim());
        } catch (err: any) {
            setValidationStatus('invalid');
            setError(err.message);
        } finally {
            setIsValidating(false);
        }
    };

    const handleClear = () => {
        setApiKey('');
        setValidationStatus('idle');
        setError(null);
        sessionStorage.removeItem(API_KEY_STORAGE_KEY);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Key className="inline mr-1" size={16} />
                        Google AI Studio API Key
                    </label>

                    <div className="relative">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                                setValidationStatus('idle');
                                setError(null);
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleValidate();
                            }}
                            placeholder="AIzaSy..."
                            className={`w-full px-4 py-2 pr-24 border rounded-lg focus:ring-2 focus:outline-none transition-all ${validationStatus === 'valid'
                                    ? 'border-green-300 focus:ring-green-200'
                                    : validationStatus === 'invalid'
                                        ? 'border-red-300 focus:ring-red-200'
                                        : 'border-gray-300 focus:ring-blue-200'
                                }`}
                        />

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {validationStatus === 'valid' && (
                                <CheckCircle2 className="text-green-600" size={18} />
                            )}
                            {validationStatus === 'invalid' && (
                                <AlertCircle className="text-red-600" size={18} />
                            )}

                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title={showKey ? 'Ẩn API key' : 'Hiện API key'}
                            >
                                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {error}
                        </p>
                    )}

                    {validationStatus === 'valid' && (
                        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle2 size={14} />
                            API key hợp lệ và đã được lưu
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between gap-2">
                <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                    <ExternalLink size={14} />
                    Lấy API key miễn phí
                </a>

                <div className="flex gap-2">
                    {validationStatus === 'valid' && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                            Xóa
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleValidate}
                        disabled={isValidating || !apiKey.trim() || validationStatus === 'valid'}
                        className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isValidating ? 'Đang kiểm tra...' : validationStatus === 'valid' ? 'Đã xác thực' : 'Xác thực'}
                    </button>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                    <strong>Lưu ý:</strong> API key chỉ được lưu trong phiên làm việc hiện tại (sessionStorage)
                    và sẽ tự động xóa khi đóng tab. Dữ liệu của bạn được xử lý an toàn và không được lưu trữ.
                </p>
            </div>
        </div>
    );
};

export default APIKeyInput;
