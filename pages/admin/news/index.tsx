import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Edit, Trash2, Calendar, User } from 'lucide-react';
import type { NewsPost, Role } from '../../../types';
import { getNewsPosts, createNewsPost, updateNewsPost, deleteNewsPost } from '../../../utils/api/news';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const NewsPage: React.FC = () => {
    const [news, setNews] = useState<NewsPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<NewsPost | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; newsId: string; title: string }>({
        isOpen: false,
        newsId: '',
        title: '',
    });

    // Mock role - in production, get from auth context
    const role: Role = 'ADMIN';
    const isAdmin = role === 'ADMIN';

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const data = await getNewsPosts();
            setNews(data);
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingNews(null);
        setIsModalOpen(true);
    };

    const handleEdit = (newsItem: NewsPost) => {
        setEditingNews(newsItem);
        setIsModalOpen(true);
    };

    const handleDelete = (newsItem: NewsPost) => {
        setConfirmDialog({ isOpen: true, newsId: newsItem.id, title: newsItem.title });
    };

    const confirmDelete = async () => {
        try {
            await deleteNewsPost(confirmDialog.newsId);
            await fetchNews();
        } catch (error) {
            console.error('Failed to delete news:', error);
            alert('Không thể xóa tin tức. Vui lòng thử lại.');
        }
    };

    const handleSave = async (newsData: Partial<NewsPost>) => {
        try {
            if (editingNews) {
                await updateNewsPost(editingNews.id, newsData);
            } else {
                await createNewsPost(newsData as Omit<NewsPost, 'id' | 'createdAt' | 'updatedAt'>);
            }
            await fetchNews();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save news:', error);
            alert('Không thể lưu tin tức. Vui lòng thử lại.');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Newspaper className="h-8 w-8 text-blue-600" />
                        Tin tức
                    </h1>
                    <p className="text-gray-600 mt-1">Thông tin và tin tức từ khu phố</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Tạo tin tức
                    </button>
                )}
            </div>

            {/* News Grid */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Đang tải tin tức...</p>
                </div>
            ) : news.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có tin tức nào</p>
                    {isAdmin && (
                        <button
                            onClick={handleCreate}
                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Tạo tin tức đầu tiên
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((newsItem) => (
                        <div
                            key={newsItem.id}
                            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {newsItem.imageUrl && (
                                <img
                                    src={newsItem.imageUrl}
                                    alt={newsItem.title}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{newsItem.title}</h3>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{newsItem.content}</p>

                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(newsItem.createdAt)}
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleEdit(newsItem)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(newsItem)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Xóa
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <NewsModal
                    news={editingNews}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, newsId: '', title: '' })}
                onConfirm={confirmDelete}
                title="Xác nhận xóa tin tức"
                message={`Bạn có chắc chắn muốn xóa tin tức "${confirmDialog.title}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy bỏ"
                type="danger"
            />
        </div>
    );
};

// News Modal Component
interface NewsModalProps {
    news: NewsPost | null;
    onClose: () => void;
    onSave: (data: Partial<NewsPost>) => void;
}

const NewsModal: React.FC<NewsModalProps> = ({ news, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: news?.title || '',
        content: news?.content || '',
        imageUrl: news?.imageUrl || '',
        zaloPostId: news?.zaloPostId || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {news ? 'Chỉnh sửa tin tức' : 'Tạo tin tức mới'}
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
                            Nội dung <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL hình ảnh
                        </label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zalo Post ID
                        </label>
                        <input
                            type="text"
                            value={formData.zaloPostId}
                            onChange={(e) => setFormData({ ...formData, zaloPostId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="ID bài đăng từ Zalo OA"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {news ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewsPage;
