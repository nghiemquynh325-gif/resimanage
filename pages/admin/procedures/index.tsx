import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Download, Upload, Youtube, Calendar } from 'lucide-react';
import type { AdminProcedure, Role } from '../../../types';
import {
    getProcedures,
    createProcedure,
    updateProcedure,
    deleteProcedure,
    uploadProcedureFile,
} from '../../../utils/api/procedures';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const ProceduresPage: React.FC = () => {
    const [procedures, setProcedures] = useState<AdminProcedure[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProcedure, setEditingProcedure] = useState<AdminProcedure | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; procedureId: string; title: string }>({
        isOpen: false,
        procedureId: '',
        title: '',
    });

    // Mock role - in production, get from auth context
    const role: Role = 'ADMIN';
    const isAdmin = role === 'ADMIN';

    useEffect(() => {
        fetchProcedures();
    }, []);

    const fetchProcedures = async () => {
        setIsLoading(true);
        try {
            const data = await getProcedures();
            setProcedures(data);
        } catch (error) {
            console.error('Failed to fetch procedures:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProcedure(null);
        setIsModalOpen(true);
    };

    const handleEdit = (procedure: AdminProcedure) => {
        setEditingProcedure(procedure);
        setIsModalOpen(true);
    };

    const handleDelete = (procedure: AdminProcedure) => {
        setConfirmDialog({ isOpen: true, procedureId: procedure.id, title: procedure.title });
    };

    const confirmDelete = async () => {
        try {
            await deleteProcedure(confirmDialog.procedureId);
            await fetchProcedures();
        } catch (error) {
            console.error('Failed to delete procedure:', error);
            alert('Không thể xóa thủ tục. Vui lòng thử lại.');
        }
    };

    const handleSave = async (procedureData: Partial<AdminProcedure>) => {
        try {
            if (editingProcedure) {
                await updateProcedure(editingProcedure.id, procedureData);
            } else {
                await createProcedure(procedureData as Omit<AdminProcedure, 'id' | 'createdAt' | 'updatedAt'>);
            }
            await fetchProcedures();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save procedure:', error);
            alert('Không thể lưu thủ tục. Vui lòng thử lại.');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getYouTubeEmbedUrl = (url: string) => {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-8 w-8 text-blue-600" />
                        Thủ tục hành chính
                    </h1>
                    <p className="text-gray-600 mt-1">Hướng dẫn và mẫu đơn thủ tục hành chính</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Tạo thủ tục
                    </button>
                )}
            </div>

            {/* Procedures List */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Đang tải thủ tục...</p>
                </div>
            ) : procedures.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có thủ tục nào</p>
                    {isAdmin && (
                        <button
                            onClick={handleCreate}
                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Tạo thủ tục đầu tiên
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {procedures.map((procedure) => {
                        const youtubeEmbedUrl = procedure.youtubeUrl ? getYouTubeEmbedUrl(procedure.youtubeUrl) : null;

                        return (
                            <div
                                key={procedure.id}
                                className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{procedure.title}</h3>
                                        {procedure.category && (
                                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                {procedure.category}
                                            </span>
                                        )}
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(procedure)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(procedure)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {procedure.description && (
                                    <p className="text-gray-600 mb-4">{procedure.description}</p>
                                )}

                                {/* Files */}
                                {procedure.fileUrls && procedure.fileUrls.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Download className="h-4 w-4" />
                                            Tài liệu đính kèm
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {procedure.fileUrls.map((file, index) => (
                                                <a
                                                    key={index}
                                                    href={file.url}
                                                    download
                                                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                        {file.size && (
                                                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                        )}
                                                    </div>
                                                    <Download className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* YouTube Video */}
                                {youtubeEmbedUrl && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Youtube className="h-4 w-4" />
                                            Video hướng dẫn
                                        </h4>
                                        <div className="aspect-video rounded-lg overflow-hidden">
                                            <iframe
                                                src={youtubeEmbedUrl}
                                                title={procedure.title}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-200">
                                    <Calendar className="h-4 w-4" />
                                    Tạo ngày {formatDate(procedure.createdAt)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <ProcedureModal
                    procedure={editingProcedure}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, procedureId: '', title: '' })}
                onConfirm={confirmDelete}
                title="Xác nhận xóa thủ tục"
                message={`Bạn có chắc chắn muốn xóa thủ tục "${confirmDialog.title}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy bỏ"
                type="danger"
            />
        </div>
    );
};

// Procedure Modal Component
interface ProcedureModalProps {
    procedure: AdminProcedure | null;
    onClose: () => void;
    onSave: (data: Partial<AdminProcedure>) => void;
}

const ProcedureModal: React.FC<ProcedureModalProps> = ({ procedure, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: procedure?.title || '',
        description: procedure?.description || '',
        category: procedure?.category || '',
        youtubeUrl: procedure?.youtubeUrl || '',
    });
    const [files, setFiles] = useState<Array<{ name: string; url: string; size: number; type: string }>>(
        procedure?.fileUrls || []
    );
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;

        setIsUploading(true);
        try {
            const uploadPromises = Array.from(selectedFiles).map((file) => uploadProcedureFile(file));
            const uploadedFiles = await Promise.all(uploadPromises);
            setFiles([...files, ...uploadedFiles]);
        } catch (error) {
            console.error('Failed to upload files:', error);
            alert('Không thể tải file lên. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            fileUrls: files,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {procedure ? 'Chỉnh sửa thủ tục' : 'Tạo thủ tục mới'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Danh mục
                        </label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="VD: Hộ khẩu, Giấy tờ, v.v."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tài liệu đính kèm
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <label className="cursor-pointer">
                                <span className="text-blue-600 hover:text-blue-700 font-medium">
                                    Chọn file
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    accept=".doc,.docx,.xls,.xlsx,.pdf,.jpg,.png"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                                Word, Excel, PDF, hoặc hình ảnh
                            </p>
                        </div>

                        {files.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                    >
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                            {file.size && (
                                                <p className="text-xs text-gray-500">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(index)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            YouTube URL
                        </label>
                        <input
                            type="url"
                            value={formData.youtubeUrl}
                            onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isUploading}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            disabled={isUploading}
                        >
                            {isUploading ? 'Đang tải...' : procedure ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProceduresPage;
