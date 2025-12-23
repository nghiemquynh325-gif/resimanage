
export type Role = 'ADMIN' | 'RESIDENT';

export interface Resident {
  id: string;
  fullName: string;
  email?: string;
  dob: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  phoneNumber: string;
  address: string;
  status: 'active' | 'inactive' | 'pending_approval' | 'rejected';
  residenceType?: 'Thường trú' | 'Tạm trú' | 'Tạm vắng' | 'Tạm trú có nhà'; // Loại hình cư trú
  avatar: string;
  householdId?: string;
  isPartyMember?: boolean;
  partyJoinDate?: string; // New field
  specialStatus?: string;

  // New fields
  identityCard?: string;
  education?: string;
  hometown?: string;
  profession?: string;
  ethnicity?: string;
  religion?: string;
  unit?: string; // Tổ
  province?: string; // Tỉnh/Thành phố
  ward?: string; // Xã/Phường
  isHeadOfHousehold?: boolean;
  specialNotes?: string;
  rejectionReason?: string; // Lý do từ chối
  createdAt?: string; // New field for creation date
}

export interface Household {
  id: string;
  name: string;
  address: string;
  unit: string; // Tổ dân phố
  headOfHouseholdId: string;
  memberIds: string[];
  relationships?: Record<string, string>; // Map<ResidentId, RelationshipName>
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: 'Họp' | 'Sinh hoạt' | 'Khác';
}

// FullCalendar compatible event object
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string; // ISO string
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    location?: string;
    description?: string;
    type?: 'Họp' | 'Sinh hoạt' | 'Khác';
  };
}

export interface Post {
  id: string;
  author: {
    name: string;
    role: Role;
    avatarUrl: string;
  };
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string; // ISO string
  isLiked?: boolean; // Local state helper
}

export interface DashboardStats {
  totalResidents: number;
  totalHouseholds: number;
  upcomingEvents: number;
  newDocuments: number;
  pendingRequests: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatar?: string;
  phoneNumber?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface AdminStaff {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  identityCard?: string;
  position?: string;  // Chức vụ
  department?: string; // Phòng ban
  status: 'pending_approval' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}