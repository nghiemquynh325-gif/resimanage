import React from 'react';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';

const ContactInfoWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
        Thông tin liên hệ BQL
      </h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Phone size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Hotline Kỹ thuật</p>
            <p className="text-sm font-semibold text-slate-800">1900 1234 (Nhánh 1)</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Mail size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Email Hỗ trợ</p>
            <p className="text-sm font-semibold text-slate-800">hotro@khudanpho.vn</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Giờ làm việc</p>
            <p className="text-sm font-semibold text-slate-800">08:00 - 17:30 (T2 - T7)</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Văn phòng</p>
            <p className="text-sm font-semibold text-slate-800">Tầng 1, Tòa nhà A</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoWidget;
