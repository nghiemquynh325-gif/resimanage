// Residence Type Badge Helper
const getStatusBadge = (status: string) => {
    let classes = "bg-gray-100 text-gray-800";
    let label = status;

    // Residence types with specific colors
    if (status === 'Thường trú') {
        classes = "bg-blue-100 text-blue-800";
    } else if (status === 'Tạm trú') {
        classes = "bg-green-100 text-green-800";
    } else if (status === 'Tạm vắng') {
        classes = "bg-orange-100 text-orange-800";
    } else if (status === 'Tạm trú có nhà') {
        classes = "bg-purple-100 text-purple-800";
    }
    // Legacy status support (for backward compatibility)
    else if (status === 'active') {
        classes = "bg-green-100 text-green-800";
        label = 'Hoạt động';
    } else if (status === 'pending_approval') {
        classes = "bg-yellow-100 text-yellow-800";
        label = 'Chờ duyệt';
    } else if (status === 'inactive' || status === 'rejected') {
        classes = "bg-red-100 text-red-800";
        label = status === 'inactive' ? 'Vô hiệu hóa' : 'Từ chối';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
            {label}
        </span>
    );
};

const columns = [
    "Họ và Tên",
    "Tổ",
    "Email",
    "Số điện thoại",
    "Địa chỉ",
    "Loại cư trú",
    "Hành động"
];
