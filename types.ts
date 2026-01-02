
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
  hasVoted?: boolean; // Voting tracker
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
  // Business household fields
  isBusiness?: boolean;
  businessName?: string;
  businessLicenseNumber?: string;
  businessLicenseDate?: string;
  businessOwnerId?: string;
  businessManagerId?: string;
  // Land certificate fields
  landPlotNumber?: string; // Thửa đất số
  landMapSheetNumber?: string; // Tờ bản đồ số
  certificateIssueNumber?: string; // Số phát hành GCN
  certificateRegistryNumber?: string; // Số vào sổ cấp giấy
  // New business property fields
  businessArea?: number; // Diện tích (m²)
  businessConstructionYear?: number; // Năm xây dựng
  businessFloors?: number; // Số tầng
  businessRooms?: number; // Số phòng
  businessSector?: string; // Ngành nghề kinh doanh
  // Poor household fields
  isPoorHousehold?: boolean;
  poorHouseholdNotes?: string;
  // Policy household fields
  isPolicyHousehold?: boolean;
  policyHouseholdNotes?: string;
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
    attendees?: string;
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

// Association Management Types
export type AssociationType = 'veterans' | 'women' | 'youth' | 'red_cross' | 'discharged_military' | 'party_member_213';
export type AssociationRole = 'president' | 'vice_president' | 'member';

export interface Association {
  id: string;
  name: string;
  type: AssociationType;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AssociationMember {
  id: string;
  associationId: string;
  residentId: string;
  role: AssociationRole;
  joinedDate: string;
  createdAt: string;
  updatedAt?: string;
  // Populated fields
  resident?: Resident;
  militaryInfo?: MilitaryInfo;
  partyMemberInfo?: PartyMemberInfo;
}

// Military Information for Discharged Military Association
export interface MilitaryInfo {
  id: string;
  associationMemberId: string;
  enlistmentDate?: string; // Ngày nhập ngũ
  dischargeDate?: string; // Ngày xuất ngũ
  rank?: string; // Cấp bậc
  position?: string; // Chức vụ
  militarySpecialty?: string; // Chuyên nghiệp quân sự
  lastUnit?: string; // Đơn vị trước khi xuất ngũ
  createdAt: string;
  updatedAt?: string;
}

export interface PartyMemberInfo {
  id: string;
  associationMemberId: string;
  workplace?: string;
  introductionDate?: string;
  partyJoinDate?: string;
  officialDate?: string;
  partyActivities?: string;
  partyNotes?: string;
  createdAt: string;
  updatedAt?: string;
}
