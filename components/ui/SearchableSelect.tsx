
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface SearchableSelectProps {
  label?: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  error,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal search term with external value changes
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search term to current value if closed without selecting new one
        setSearchTerm(value || '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setSearchTerm(option);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
    
    // Optional: Allow clearing via input delete
    if (e.target.value === '') {
      onChange('');
    }
  };

  return (
    <div className={`w-full relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={14} className="text-slate-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className={`w-full pl-9 pr-8 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200'
          }`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onClick={() => !disabled && setIsOpen(true)}
          onFocus={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
           {searchTerm && !disabled && (
             <button 
               type="button"
               onClick={(e) => {
                 e.stopPropagation();
                 onChange('');
                 setSearchTerm('');
                 inputRef.current?.focus();
               }}
               className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 mr-1"
             >
               <X size={14} />
             </button>
           )}
           <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((option, index) => (
                <li
                  key={index}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${
                    option === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              Không tìm thấy kết quả
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
