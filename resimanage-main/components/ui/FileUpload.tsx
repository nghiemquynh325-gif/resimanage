
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  error?: string;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  onChange, 
  error, 
  accept = "image/*" 
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file: File | undefined) => {
    if (file) {
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onChange(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null);
  };

  // Cleanup object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      
      <div 
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer overflow-hidden group
          ${error ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
          ${preview ? 'h-48' : 'h-32 flex flex-col items-center justify-center'}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          accept={accept}
          onChange={handleFileChange}
        />

        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-sm font-medium">Nhấp để thay đổi</p>
            </div>
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white text-slate-600 rounded-full shadow-sm transition-colors"
              type="button"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="text-center p-4">
            <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <UploadCloud size={20} />
            </div>
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-blue-600">Tải ảnh lên</span> hoặc kéo thả
            </p>
            <p className="text-[10px] text-slate-400 mt-1">PNG, JPG tối đa 5MB</p>
          </div>
        )}
      </div>
      
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FileUpload;
