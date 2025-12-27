/**
 * @fileoverview Mock API Layer with Supabase Integration
 * 
 * This module provides a hybrid data layer that combines:
 * 1. **Supabase (PostgreSQL)** - Primary data source for residents, households, events, posts
 * 2. **LocalStorage** - Fallback for soft-deletes, session management, and settings
 * 
 * ## Architecture Strategy
 * 
 * ### Data Transformation
 * The database uses `snake_case` (PostgreSQL convention) while the TypeScript
 * application uses `camelCase`. This file handles bidirectional transformation:
 * - **DB → App**: `mapResidentFromDb()` converts snake_case to camelCase
 * - **App → DB**: Individual functions transform camelCase to snake_case before insert/update
 * 
 * ### Household Members Management
 * Households use a junction table `household_members` instead of storing memberIds directly.
 * Functions like `getHouseholds()`, `createHousehold()`, and `updateHousehold()` handle
 * the join operations and build the `memberIds` array dynamically.
 * 
 * ### Soft Delete Pattern
 * For demo purposes, `deleteHousehold()` implements a soft-delete pattern:
 * 1. Attempts real delete via Supabase
 * 2. Falls back to LocalStorage tracking if DB delete fails (RLS restrictions)
 * 3. Filters out "deleted" items in `getHouseholds()`
 * 
 * ### Authentication
 * Uses a hybrid approach:
 * - Hardcoded admin account for development
 * - Supabase `profiles` table for resident accounts
 * - LocalStorage for session persistence
 * 
 * @module utils/mockApi
 */

import { Resident, Household, Event, Post, DashboardStats, Role, AdminStaff } from '../types';
import { Notification } from '../types/notification';
import { User } from '../types/user';
import { supabase } from './supabaseClient';

/** Simulated network delay for realistic UX */
const DELAY_MS = 500;

/** LocalStorage keys for various data stores */
const KEYS = {
  RESIDENTS: 'community_residents',
  HOUSEHOLDS: 'community_households',
  EVENTS: 'community_events',
  POSTS: 'community_posts',
  NOTIFICATIONS: 'community_notifications',
  SETTINGS: 'community_settings',
  SESSION: 'community_session',
  DELETED_HOUSEHOLDS: 'community_deleted_households',
};

/** Utility: Simulates network latency */
const delay = (ms: number = DELAY_MS) => new Promise(resolve => setTimeout(resolve, ms));

/** Utility: Safely retrieves and parses data from LocalStorage */
const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultVal;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultVal;
  }
};

/** Utility: Saves data to LocalStorage as JSON */
const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

/**
 * Data Transformer: Database (snake_case) → Application (camelCase)
 * 
 * Converts Supabase resident records to TypeScript Resident interface.
 * Handles both snake_case and camelCase inputs for flexibility.
 * 
 * @param data - Raw database record
 * @returns Transformed Resident object
 */
const mapResidentFromDb = (data: any): Resident => {
  if (!data) return data;

  // Fallback logic: If residenceType is empty but status contains residence type values,
  // migrate the data on-the-fly
  const residenceTypes = ['Thường trú', 'Tạm trú', 'Tạm vắng', 'Tạm trú có nhà'];
  let status = data.status;
  let residenceType = data.residence_type || data.residenceType;

  // Migration: If status contains residence type, move it to residenceType
  if (!residenceType && residenceTypes.includes(data.status)) {
    residenceType = data.status;
    status = 'active'; // Default status for migrated data
  }

  return {
    id: data.id,
    fullName: data.full_name || data.fullName,
    email: data.email,
    dob: data.dob,
    gender: data.gender,
    phoneNumber: data.phone_number || data.phoneNumber,
    address: data.address,
    status: status,
    residenceType: residenceType,
    avatar: data.avatar,
    householdId: data.household_id || data.householdId,
    isPartyMember: data.is_party_member || data.isPartyMember,
    partyJoinDate: data.party_join_date || data.partyJoinDate,
    specialStatus: data.special_status || data.specialStatus,
    identityCard: data.identity_card || data.identityCard,
    education: data.education,
    hometown: data.hometown,
    profession: data.profession,
    ethnicity: data.ethnicity,
    religion: data.religion,
    unit: data.unit,
    province: data.province,
    ward: data.ward,
    isHeadOfHousehold: data.is_head_of_household || data.isHeadOfHousehold,
    specialNotes: data.special_notes || data.specialNotes,
    rejectionReason: data.rejection_reason || data.rejectionReason,
    createdAt: data.created_at || data.createdAt,
    hasVoted: data.has_voted || false,
  };
};

/**
 * Initializes the application by clearing old mock data from LocalStorage.
 * Called once on app startup to ensure clean state.
 * 
 * @remarks
 * This function clears all LocalStorage keys used by the app except for
 * Supabase session data. Settings are initialized with default values if missing.
 */
export const seedDatabase = () => {
  // CLEAR ALL MOCK DATA FROM LOCAL STORAGE
  localStorage.removeItem(KEYS.RESIDENTS);
  localStorage.removeItem(KEYS.HOUSEHOLDS);
  localStorage.removeItem(KEYS.EVENTS);
  localStorage.removeItem(KEYS.POSTS);
  localStorage.removeItem(KEYS.NOTIFICATIONS);
  localStorage.removeItem(KEYS.DELETED_HOUSEHOLDS);

  if (!localStorage.getItem(KEYS.SETTINGS)) {
    setStorage(KEYS.SETTINGS, { zaloLink: 'https://zalo.me/g/example' });
  }
};

// ... fetchMock ...
export const fetchMock = async (endpoint: string, options?: any) => {
  await delay(200);

  const url = new URL('http://mock' + endpoint);
  const path = url.pathname;
  const params = url.searchParams;

  // --- Residents API (SUPABASE) ---
  if (path === '/api/admin/residents') {
    const page = parseInt(params.get('page') || '1');
    const limit = parseInt(params.get('limit') || '10');
    const search = params.get('search');
    const status = params.get('status');

    return await getResidents({ page, limit, search, status });
  }

  // --- Events API (SUPABASE) ---
  if (path === '/api/events') {
    const { data, error } = await supabase.from('events').select('*').order('start', { ascending: true });

    if (error) {
      console.error('❌ [Supabase] Error fetching events:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Không thể tải sự kiện: ${error.message}`);
    }

    const events = (data || []).map((e: any) => ({
      ...e,
      extendedProps: {
        location: e.location,
        description: e.description,
        type: e.type,
        attendees: e.attendees
      }
    }));

    return { data: events };
  }

  if (path === '/api/events/upcoming') {
    const today = new Date().toISOString();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start', today)
      .order('start', { ascending: true })
      .limit(5);

    if (error) {
      console.error('❌ [Supabase] Error fetching upcoming events:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Không thể tải sự kiện sắp tới: ${error.message}`);
    }

    const events = (data || []).map((e: any) => ({
      ...e,
      extendedProps: {
        location: e.location,
        description: e.description,
        type: e.type,
        attendees: e.attendees
      }
    }));

    return { data: events };
  }

  // --- Posts API (Supabase) ---
  if (path === '/api/posts') {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [Supabase] Error fetching posts:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Không thể tải bài viết: ${error.message}`);
    }

    if (data) {
      const mappedPosts = data.map((p: any) => ({
        id: p.id,
        author: {
          name: p.author_name,
          role: p.author_role,
          avatarUrl: p.author_avatar || `https://ui-avatars.com/api/?name=${p.author_name}&background=random`
        },
        content: p.content,
        imageUrl: p.image_url,
        likes: p.likes,
        comments: p.comments,
        createdAt: p.created_at,
        isLiked: p.is_liked
      }));
      return { data: mappedPosts };
    }
    return { data: [] };
  }

  // --- Notifications API (Local Storage Fallback) ---
  if (path === '/api/notifications') {
    return { data: getStorage<Notification[]>(KEYS.NOTIFICATIONS, []) };
  }

  if (path === '/api/notifications/unread-count') {
    const notifs = getStorage<Notification[]>(KEYS.NOTIFICATIONS, []);
    return { count: notifs.filter(n => !n.isRead).length };
  }

  return null;
};

/**
 * Authenticates a user using mock authentication.
 * 
 * Supports two authentication methods:
 * 1. **Hardcoded Admin** - email: admin@example.com, password: admin123
 * 2. **Supabase Profiles** - Looks up user in `profiles` table
 * 
 * @param email - User's email address
 * @param pass - User's password (not validated for demo purposes)
 * @param role - Expected role ('ADMIN' or 'RESIDENT')
 * @returns User object with profile information
 * @throws Error if credentials are invalid or role mismatch
 * 
 * @example
 * ```typescript
 * const user = await loginMock('admin@example.com', 'admin123', 'ADMIN');
 * ```
 */
export const loginMock = async (email: string, pass: string, role: Role): Promise<User> => {
  await delay(500);

  // 1. Check Hardcoded Admin
  if (role === 'ADMIN') {
    if ((email === 'admin@resimanage.com' || email === 'admin@123.com') && pass === '123123') {
      const adminUser: User = {
        id: 'admin-master',
        email: email,
        fullName: 'Quản trị viên',
        role: 'ADMIN',
        avatar: `https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff`
      };
      setStorage(KEYS.SESSION, adminUser);
      return adminUser;
    }

    // 2. Check admin_staff table for registered staff
    const { data: adminStaff, error: staffError } = await supabase
      .from('admin_staff')
      .select('*')
      .eq('email', email)
      .eq('password', pass)
      .eq('status', 'approved')
      .single();

    if (adminStaff && !staffError) {
      const user: User = {
        id: adminStaff.id,
        email: adminStaff.email,
        fullName: adminStaff.full_name,
        role: 'ADMIN',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(adminStaff.full_name)}&background=0D8ABC&color=fff`,
        phoneNumber: adminStaff.phone_number
      };
      setStorage(KEYS.SESSION, user);
      return user;
    }
  }

  // 2. Check Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (!error && data.user) {
    const { data: profile, error: profileError } = await supabase
      .from('residents')
      .select('*')
      .eq('email', email)
      .single();

    if (profile) {
      if (profile.status === 'active' || profile.status === 'Thường trú' || profile.status === 'Tạm trú') {
        const user: User = {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name || profile.fullName,
          role: 'RESIDENT',
          avatar: profile.avatar,
          phoneNumber: profile.phone_number || profile.phoneNumber
        };
        setStorage(KEYS.SESSION, user);
        return user;
      } else {
        throw new Error(`Tài khoản đang ở trạng thái: ${profile.status}`);
      }
    }
  }

  throw new Error('Email hoặc mật khẩu không đúng');
};

/**
 * Logs out the current user and clears session data.
 * Also clears "remember me" credentials for security.
 */
export const logoutUser = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem(KEYS.SESSION);
  // Clear remember me credentials on logout for security
  localStorage.removeItem('resimanage_remember_me');
};

export const loadUserSession = async (): Promise<User | null> => {
  const localSession = getStorage<User | null>(KEYS.SESSION, null);
  if (localSession) return localSession;

  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    const email = data.session.user.email;
    const { data: profile } = await supabase.from('residents').select('*').eq('email', email).single();
    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name || profile.fullName,
        role: 'RESIDENT',
        avatar: profile.avatar,
        phoneNumber: profile.phone_number || profile.phoneNumber
      };
    }
  }
  return null;
};

/**
 * Fetches paginated residents with filtering and search capabilities.
 * 
 * Supports multiple query parameters:
 * - **Pagination**: `page`, `limit`
 * - **Search**: `search` (searches full_name and phone_number)
 * - **Filters**: `status`, `isPartyMember`, `ethnicity`, `religion`, `specialStatus`, `specialNotes`
 * 
 * @param params - Query parameters object
 * @param params.page - Page number (1-indexed)
 * @param params.limit - Items per page
 * @param params.search - Search term for name/phone
 * @param params.status - Filter by resident status
 * @param params.isPartyMember - Filter party members
 * @param params.ethnicity - Filter by ethnicity
 * @param params.religion - Filter by religion
 * @param params.specialStatus - Filter by special status
 * @param params.specialNotes - Filter by special notes
 * 
 * @returns Paginated result with data, total count, and total pages
 * 
 * @example
 * ```typescript
 * const result = await getResidents({ 
 *   page: 1, 
 *   limit: 10, 
 *   search: 'Nguyễn',
 *   status: 'active' 
 * });
 * console.log(result.data, result.total, result.totalPages);
 * ```
 */
export const getResidents = async (params: any) => {
  let query = supabase.from('residents').select('*', { count: 'exact' });

  if (params.search) {
    const s = params.search.toLowerCase();
    query = query.or(`full_name.ilike.%${s}%,phone_number.ilike.%${s}%,address.ilike.%${s}%`);
  }

  if (params.status && params.status !== 'all') {
    if (params.status === 'active') {
      query = query.in('status', ['Thường trú', 'Tạm trú', 'Tạm trú có nhà', 'active']);
    } else {
      query = query.eq('status', params.status);
    }
  }

  if (params.ethnicity && params.ethnicity !== 'all') query = query.eq('ethnicity', params.ethnicity);
  if (params.religion && params.religion !== 'all') query = query.eq('religion', params.religion);

  // Gender Filter
  if (params.gender && params.gender !== 'all') {
    query = query.eq('gender', params.gender);
  }

  // Age Range Filter
  if (params.ageFrom || params.ageTo) {
    const currentYear = new Date().getFullYear();

    if (params.ageFrom) {
      // For minimum age, person must be born on or before (currentYear - ageFrom)
      const maxBirthYear = currentYear - params.ageFrom;
      query = query.lte('dob', `${maxBirthYear}-12-31`);
    }

    if (params.ageTo) {
      // For maximum age, person must be born on or after (currentYear - ageTo)
      const minBirthYear = currentYear - params.ageTo;
      query = query.gte('dob', `${minBirthYear}-01-01`);
    }
  }

  if (params.specialFilter && params.specialFilter !== 'all') {
    if (params.specialFilter === 'party_member') {
      query = query.eq('is_party_member', true);
    } else if (params.specialFilter === 'special_notes') {
      query = query.not('special_notes', 'is', null).neq('special_notes', '');
    } else {
      query = query.eq('special_status', params.specialFilter);
    }
  }

  const page = params.page || 1;
  const limit = params.limit || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false });

  if (error) {
    return { data: [], total: 0, totalPages: 0 };
  }

  // Map to frontend types
  const mappedData = (data || []).map(mapResidentFromDb);

  return {
    data: mappedData,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit)
  };
};

export const getAllResidents = async () => {
  // Fetch all residents without pagination limit
  // Supabase has a default limit of 1000, so we need to specify a large limit
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .limit(100000); // Set a very high limit to get all records

  if (error) {
    return [];
  }
  return (data || []).map(mapResidentFromDb);
};

// ... createResident, registerResident, updateResident ...
export const createResident = async (data: Partial<Resident>) => {
  const newResident = {
    full_name: data.fullName,
    email: data.email,
    dob: data.dob,
    gender: data.gender,
    phone_number: data.phoneNumber,
    address: data.address,
    status: data.status || 'Thường trú',
    avatar: data.avatar || `https://ui-avatars.com/api/?name=${data.fullName}&background=random`,
    household_id: data.householdId,
    is_party_member: data.isPartyMember || false,
    party_join_date: data.partyJoinDate,
    identity_card: data.identityCard,
    education: data.education,
    hometown: data.hometown,
    profession: data.profession,
    ethnicity: data.ethnicity,
    religion: data.religion,
    unit: data.unit,
    province: data.province,
    ward: data.ward,
    is_head_of_household: data.isHeadOfHousehold || false,
    special_status: data.specialStatus,
    special_notes: data.specialNotes,
    rejection_reason: data.rejectionReason
  };

  const { data: inserted, error } = await supabase.from('residents').insert([newResident]).select().single();
  if (error) throw new Error(error.message);
  return mapResidentFromDb(inserted);
};

export const registerResident = async (data: any) => {
  const newResident = {
    full_name: data.fullName,
    email: data.email,
    phone_number: data.phoneNumber,
    identity_card: data.identityCard,
    address: data.address,
    unit: data.unit,
    province: data.province,
    ward: data.ward,
    dob: '1990-01-01',
    gender: 'Nam',
    status: 'pending_approval',
    avatar: `https://ui-avatars.com/api/?name=${data.fullName}&background=random`
  };

  const { data: inserted, error } = await supabase.from('residents').insert([newResident]).select().single();
  if (error) throw new Error(error.message);
  return mapResidentFromDb(inserted);
};

export const updateResident = async (id: string, updates: Partial<Resident>) => {
  const dbUpdates: any = {};

  if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.dob !== undefined) dbUpdates.dob = updates.dob;
  if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
  if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
  if (updates.householdId !== undefined) dbUpdates.household_id = updates.householdId;
  if (updates.isPartyMember !== undefined) dbUpdates.is_party_member = updates.isPartyMember;
  if (updates.partyJoinDate !== undefined) dbUpdates.party_join_date = updates.partyJoinDate;
  if (updates.identityCard !== undefined) dbUpdates.identity_card = updates.identityCard;
  if (updates.education !== undefined) dbUpdates.education = updates.education;
  if (updates.hometown !== undefined) dbUpdates.hometown = updates.hometown;
  if (updates.profession !== undefined) dbUpdates.profession = updates.profession;
  if (updates.ethnicity !== undefined) dbUpdates.ethnicity = updates.ethnicity;
  if (updates.religion !== undefined) dbUpdates.religion = updates.religion;
  if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
  if (updates.province !== undefined) dbUpdates.province = updates.province;
  if (updates.ward !== undefined) dbUpdates.ward = updates.ward;
  if (updates.isHeadOfHousehold !== undefined) dbUpdates.is_head_of_household = updates.isHeadOfHousehold;
  if (updates.specialStatus !== undefined) dbUpdates.special_status = updates.specialStatus;
  if (updates.specialNotes !== undefined) dbUpdates.special_notes = updates.specialNotes;
  if (updates.rejectionReason !== undefined) dbUpdates.rejection_reason = updates.rejectionReason;

  const { data, error } = await supabase.from('residents').update(dbUpdates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return mapResidentFromDb(data);
};

export const getUserProfile = async (id: string) => {
  const { data, error } = await supabase.from('residents').select('*').eq('id', id).single();
  if (error || !data) throw new Error("User not found");
  return mapResidentFromDb(data);
};

export const updateUserProfile = async (id: string, updates: Partial<Resident>) => {
  return await updateResident(id, updates);
};

/**
 * Deletes a resident from the database.
 * 
 * @param id - Resident ID to delete
 * @throws Error if deletion fails
 */
export const deleteResident = async (id: string) => {
  // 1. Remove from any household_members
  await supabase.from('household_members').delete().eq('resident_id', id);

  // 2. Delete the resident
  const { error } = await supabase.from('residents').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

/**
 * Toggle voting status for a resident
 */
export const toggleVote = async (residentId: string, hasVoted: boolean) => {
  const { data, error } = await supabase
    .from('residents')
    .update({ has_voted: hasVoted })
    .eq('id', residentId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapResidentFromDb(data);
};

/**
 * Get voting statistics grouped by Tổ - WITH PAGINATION
 * Bypasses Supabase 1000-row limit
 */
export const getVotingStats = async () => {

  let allData: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  // Fetch ALL residents using pagination
  while (hasMore) {
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await supabase
      .from('residents')
      .select('unit, has_voted')
      .range(start, end);

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      page++;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }


  // Group by Tổ and calculate stats
  const stats: Record<string, { total: number; voted: number; percentage: number }> = {};

  allData.forEach((resident: any) => {
    const group = resident.unit || 'Không có tổ';

    if (!stats[group]) {
      stats[group] = { total: 0, voted: 0, percentage: 0 };
    }

    stats[group].total++;
    if (resident.has_voted) {
      stats[group].voted++;
    }
  });

  // Calculate percentages
  Object.keys(stats).forEach(group => {
    const { total, voted } = stats[group];
    stats[group].percentage = total > 0 ? Math.round((voted / total) * 100) : 0;
  });

  return stats;
};

// --- Households (HYBRID: SUPABASE + LOCAL STORAGE FALLBACK) ---

export const getHouseholds = async () => {
  const { data: householdsData, error: householdsError } = await supabase
    .from('households')
    .select('*')
    .order('created_at', { ascending: false });

  let householdsList = [];

  if (!householdsError && householdsData) {
    householdsList = householdsData;
  } else {
    // Supabase fetch failed, returning empty list
  }

  // 1. Fetch Household Members from DB with relationships
  const { data: membersData } = await supabase
    .from('household_members')
    .select('household_id, resident_id, relationship');

  const membersByHousehold: Record<string, string[]> = {};
  const relationshipsByHousehold: Record<string, Record<string, string>> = {};

  (membersData || []).forEach((member: any) => {
    if (!membersByHousehold[member.household_id]) {
      membersByHousehold[member.household_id] = [];
      relationshipsByHousehold[member.household_id] = {};
    }
    membersByHousehold[member.household_id].push(member.resident_id);
    if (member.relationship) {
      relationshipsByHousehold[member.household_id][member.resident_id] = member.relationship;
    }
  });

  // 2. Filter out "Soft Deleted" households (Local Override)
  const deletedIds = getStorage<string[]>(KEYS.DELETED_HOUSEHOLDS, []);

  const households = householdsList
    .filter((h: any) => !deletedIds.includes(h.id))
    .map((h: any) => ({
      id: h.id,
      name: h.name,
      address: h.address,
      unit: h.unit,
      headOfHouseholdId: h.head_of_household_id || '',
      memberIds: membersByHousehold[h.id] || [],
      relationships: relationshipsByHousehold[h.id] || {},
      // Business household fields
      isBusiness: h.is_business || false,
      businessName: h.business_name,
      businessLicenseNumber: h.business_license_number,
      businessLicenseDate: h.business_license_date,
      businessOwnerId: h.business_owner_id,
      businessManagerId: h.business_manager_id,
      // Poor household fields
      isPoorHousehold: h.is_poor_household || false,
      poorHouseholdNotes: h.poor_household_notes,
      // Policy household fields
      isPolicyHousehold: h.is_policy_household || false,
      policyHouseholdNotes: h.policy_household_notes,
      createdAt: h.created_at
    }));

  return households;
};

export const createHousehold = async (data: Partial<Household>) => {
  const householdData: any = {
    name: data.name,
    address: data.address,
    unit: data.unit,
    head_of_household_id: data.headOfHouseholdId,
    // Business household fields
    is_business: data.isBusiness || false,
    business_name: data.businessName || null,
    business_license_number: data.businessLicenseNumber || null,
    business_license_date: data.businessLicenseDate || null,
    business_owner_id: data.businessOwnerId || null,
    business_manager_id: data.businessManagerId || null,
    // Poor household fields
    is_poor_household: data.isPoorHousehold || false,
    poor_household_notes: data.poorHouseholdNotes || null,
    // Policy household fields
    is_policy_household: data.isPolicyHousehold || false,
    policy_household_notes: data.policyHouseholdNotes || null
  };

  const { data: inserted, error } = await supabase.from('households').insert([householdData]).select().single();
  if (error) throw new Error(error.message);

  if (data.memberIds && data.memberIds.length > 0) {
    const memberRecords = data.memberIds
      .filter(residentId => residentId !== data.headOfHouseholdId) // Exclude head
      .map(residentId => ({
        household_id: inserted.id,
        resident_id: residentId,
        relationship: data.relationships?.[residentId] || null
      }));

    if (memberRecords.length > 0) {
      await supabase.from('household_members').insert(memberRecords);
    }
  }

  return inserted;
};

export const updateHousehold = async (id: string, data: Partial<Household>) => {
  const { data: currentMembers } = await supabase
    .from('household_members')
    .select('resident_id')
    .eq('household_id', id);

  const oldMemberIds = (currentMembers || []).map((m: any) => m.resident_id);
  const newMemberIds = (data.memberIds || oldMemberIds).filter(mid => mid !== data.headOfHouseholdId); // Exclude head

  const householdData: any = {
    name: data.name,
    address: data.address,
    unit: data.unit,
    head_of_household_id: data.headOfHouseholdId,
    // Business household fields
    is_business: data.isBusiness !== undefined ? data.isBusiness : false,
    business_name: data.businessName || null,
    business_license_number: data.businessLicenseNumber || null,
    business_license_date: data.businessLicenseDate || null,
    business_owner_id: data.businessOwnerId || null,
    business_manager_id: data.businessManagerId || null,
    // Poor household fields
    is_poor_household: data.isPoorHousehold !== undefined ? data.isPoorHousehold : false,
    poor_household_notes: data.poorHouseholdNotes || null,
    // Policy household fields
    is_policy_household: data.isPolicyHousehold !== undefined ? data.isPolicyHousehold : false,
    policy_household_notes: data.policyHouseholdNotes || null
  };

  const { data: updated, error } = await supabase
    .from('households')
    .update(householdData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const removedIds = oldMemberIds.filter((mid: string) => !newMemberIds.includes(mid));
  const addedIds = newMemberIds.filter((mid: string) => !oldMemberIds.includes(mid));

  if (removedIds.length > 0) {
    await supabase
      .from('household_members')
      .delete()
      .eq('household_id', id)
      .in('resident_id', removedIds);
  }

  if (addedIds.length > 0) {
    const memberRecords = addedIds.map(residentId => ({
      household_id: id,
      resident_id: residentId,
      relationship: data.relationships?.[residentId] || null
    }));

    await supabase
      .from('household_members')
      .insert(memberRecords);
  }

  // Update relationships for existing members
  if (data.relationships) {
    const existingMemberIds = oldMemberIds.filter((mid: string) => newMemberIds.includes(mid));
    for (const residentId of existingMemberIds) {
      if (data.relationships[residentId]) {
        const { error: updateError } = await supabase
          .from('household_members')
          .update({ relationship: data.relationships[residentId] })
          .eq('household_id', id)
          .eq('resident_id', residentId);

        if (updateError) {
          // Failed to update relationship - continue anyway
        }
      }
    }
  }

  return updated;
};

export const deleteHousehold = async (id: string) => {
  // Try Real Delete via Supabase
  try {
    // 1. Unlink residents
    await supabase.from('residents').update({ household_id: null }).eq('household_id', id);
    // 2. Delete members
    await supabase.from('household_members').delete().eq('household_id', id);
    // 3. Delete household
    const { error } = await supabase.from('households').delete().eq('id', id);
    if (error) throw error;
  } catch (e) {
    // Backend delete failed - perform local soft-delete
  }

  // 4. Force "Soft Delete" in Local Storage (Demo Mode Guarantee)
  // This ensures the item disappears from the list even if the API failed.
  const deletedIds = getStorage<string[]>(KEYS.DELETED_HOUSEHOLDS, []);
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    setStorage(KEYS.DELETED_HOUSEHOLDS, deletedIds);
  }
};

// ... createEvent, updateEvent, deleteEvent, getUpcomingEvents ...
export const createEvent = async (data: any) => {
  const payload = {
    title: data.title,
    start: data.start || data.date,
    end: data.end || data.date,
    location: data.extendedProps?.location || data.location,
    description: data.extendedProps?.description || data.description,
    type: data.extendedProps?.type || data.type,
    attendees: data.extendedProps?.attendees || data.attendees,
    background_color: data.backgroundColor || '#3B82F6'
  };

  const { data: inserted, error } = await supabase.from('events').insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return inserted;
};

export const updateEvent = async (id: string, data: any) => {
  const payload: any = {};
  if (data.title) payload.title = data.title;
  if (data.start) payload.start = data.start;
  if (data.end) payload.end = data.end;
  if (data.backgroundColor) payload.background_color = data.backgroundColor;

  const location = data.extendedProps?.location ?? data.location;
  if (location !== undefined) payload.location = location;

  const description = data.extendedProps?.description ?? data.description;
  if (description !== undefined) payload.description = description;

  const type = data.extendedProps?.type ?? data.type;
  if (type !== undefined) payload.type = type;

  const attendees = data.extendedProps?.attendees ?? data.attendees;
  if (attendees !== undefined) payload.attendees = attendees;

  const { data: updated, error } = await supabase.from('events').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return updated;
};

export const deleteEvent = async (id: string) => {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const getUpcomingEvents = async () => {
  const { data } = await fetchMock('/api/events/upcoming');
  return data;
}

// ... createPost, likePost, community settings ...
export const createPost = async (data: any) => {
  const payload = {
    author_name: data.author.name,
    author_role: data.author.role,
    author_avatar: data.author.avatarUrl,
    content: data.content,
    image_url: data.imageUrl,
    likes: 0,
    comments: 0
  };

  const { data: inserted, error } = await supabase.from('posts').insert([payload]).select().single();
  if (error) throw new Error(error.message);

  return {
    id: inserted.id,
    author: { name: inserted.author_name, role: inserted.author_role, avatarUrl: inserted.author_avatar },
    content: inserted.content,
    likes: inserted.likes,
    comments: inserted.comments,
    createdAt: inserted.created_at,
    isLiked: false
  };
};

export const likePost = async (id: string) => {
  const { data } = await supabase.from('posts').select('likes').eq('id', id).single();
  if (data) {
    const newLikes = (data.likes || 0) + 1;
    await supabase.from('posts').update({ likes: newLikes }).eq('id', id);
  }
};

export const deletePost = async (id: string) => {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const getCommunitySettings = async () => {
  return getStorage(KEYS.SETTINGS, { zaloLink: 'https://zalo.me/g/example' });
};

export const updateCommunitySettings = async (settings: any) => {
  await delay(300);
  const current = getStorage(KEYS.SETTINGS, {});
  setStorage(KEYS.SETTINGS, { ...current, ...settings });
  return settings;
};

// ... dashboard, notifications, utils ...
export const getDashboardStats = async () => {
  return getAdminStatsSummary();
};

export const getAdminStatsSummary = async () => {
  try {
    const { count: residentsCount } = await supabase.from('residents').select('*', { count: 'exact', head: true });
    const { count: householdsCount } = await supabase.from('households').select('*', { count: 'exact', head: true });
    const { count: pendingCount } = await supabase.from('residents').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval');

    const today = new Date().toISOString();
    const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true }).gte('start', today);

    return {
      totalResidents: residentsCount || 0,
      totalHouseholds: householdsCount || 0,
      upcomingEvents: eventsCount || 0,
      newDocuments: 12, // Static mock
      pendingRequests: pendingCount || 0
    };
  } catch (e) {
    return { totalResidents: 0, totalHouseholds: 0, upcomingEvents: 0, newDocuments: 0, pendingRequests: 0 };
  }
};

export const getAdminStatsDemographics = async () => {
  try {
    const { data: residents, error } = await supabase.from('residents').select('gender, dob');
    if (error) throw error;

    const genderCounts = { Nam: 0, Nữ: 0, Khác: 0 };
    residents?.forEach(r => {
      if (r.gender === 'Nam') genderCounts.Nam++;
      else if (r.gender === 'Nữ') genderCounts.Nữ++;
      else genderCounts.Khác++;
    });
    const genderData = [
      { name: 'Nam', value: genderCounts.Nam },
      { name: 'Nữ', value: genderCounts.Nữ },
      { name: 'Khác', value: genderCounts.Khác }
    ].filter(d => d.value > 0);

    const currentYear = new Date().getFullYear();
    const ageGroups = { '0-18': 0, '19-40': 0, '41-60': 0, '60+': 0 };
    residents?.forEach(r => {
      if (r.dob) {
        const age = currentYear - new Date(r.dob).getFullYear();
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 40) ageGroups['19-40']++;
        else if (age <= 60) ageGroups['41-60']++;
        else ageGroups['60+']++;
      }
    });

    const ageData = [
      { name: '0-18', count: ageGroups['0-18'] },
      { name: '19-40', count: ageGroups['19-40'] },
      { name: '41-60', count: ageGroups['41-60'] },
      { name: '60+', count: ageGroups['60+'] },
    ];

    return { genderData, ageData };
  } catch (e) {
    return { genderData: [], ageData: [] };
  }
};

export const markNotificationAsRead = async (id: string) => {
  await delay(100);
  const notifications = getStorage<Notification[]>(KEYS.NOTIFICATIONS, []);
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].isRead = true;
    setStorage(KEYS.NOTIFICATIONS, notifications);
  }
};

export const mockImageUpload = async (file: File) => {
  await delay(1000);
  return URL.createObjectURL(file); // Temporary blob URL
};

export const requestPasswordReset = async (email: string) => true;
export const validateResetToken = async (token: string) => !!token;
export const resetPassword = async (token: string, newPass: string) => true;
export const changePassword = async (id: string, oldPass: string, newPass: string) => true;

// =====================================================
// Admin Staff Management
// =====================================================

/**
 * Register a new admin staff member
 */
export const registerAdminStaff = async (data: {
  fullName: string;
  email: string;
  phoneNumber?: string;
  identityCard?: string;
  position?: string;
  department?: string;
  password: string;
}) => {
  const { data: inserted, error } = await supabase
    .from('admin_staff')
    .insert([{
      full_name: data.fullName,
      email: data.email,
      phone_number: data.phoneNumber,
      identity_card: data.identityCard,
      position: data.position,
      department: data.department,
      password: data.password,
      status: 'pending_approval'
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return inserted;
};

/**
 * Get all pending admin staff registrations
 */
export const getPendingAdminStaff = async () => {
  const { data, error } = await supabase
    .from('admin_staff')
    .select('*')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  // Map to camelCase
  return (data || []).map((item: any) => ({
    id: item.id,
    fullName: item.full_name,
    email: item.email,
    phoneNumber: item.phone_number,
    identityCard: item.identity_card,
    position: item.position,
    department: item.department,
    status: item.status,
    rejectionReason: item.rejection_reason,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
};

/**
 * Approve an admin staff registration
 */
export const approveAdminStaff = async (id: string) => {
  const { data, error } = await supabase
    .from('admin_staff')
    .update({ status: 'approved' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // TODO: Create admin user account in Supabase Auth
  // This would require additional setup with Supabase Auth

  return data;
};

/**
 * Reject an admin staff registration
 */
export const rejectAdminStaff = async (id: string, reason: string) => {
  const { data, error } = await supabase
    .from('admin_staff')
    .update({
      status: 'rejected',
      rejection_reason: reason
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// ============================================
// ASSOCIATION MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get all associations (4 types: veterans, women, youth, red_cross)
 */
export async function getAssociations() {
  const { data, error } = await supabase
    .from('associations')
    .select('*')
    .order('type');

  if (error) throw error;
  return data || [];
}

/**
 * Get all members of an association with resident details
 * Sorted by role: president -> vice_president -> member
 * For discharged_military association, also fetch military_info
 */
export async function getAssociationMembers(associationId: string) {
  const { data, error } = await supabase
    .from('association_members')
    .select(`
      *,
      resident:residents(*),
      military_info:military_info(*),
      party_member_info:party_member_info(*)
    `)
    .eq('association_id', associationId);

  if (error) throw error;

  // Map data and transform resident info
  const mappedData = (data || []).map((member: any) => ({
    id: member.id,
    associationId: member.association_id,
    residentId: member.resident_id,
    role: member.role,
    joinedDate: member.joined_date,
    createdAt: member.created_at,
    updatedAt: member.updated_at,
    // Map nested resident data
    resident: member.resident ? mapResidentFromDb(member.resident) : undefined,
    // Map military info if exists (for discharged_military association)
    militaryInfo: member.military_info ? {
      id: member.military_info.id,
      associationMemberId: member.military_info.association_member_id,
      enlistmentDate: member.military_info.enlistment_date,
      dischargeDate: member.military_info.discharge_date,
      rank: member.military_info.rank,
      position: member.military_info.position,
      militarySpecialty: member.military_info.military_specialty,
      lastUnit: member.military_info.last_unit,
      createdAt: member.military_info.created_at,
      updatedAt: member.military_info.updated_at,
    } : undefined,
    // Map party member info if exists (for party_member_213 association)
    partyMemberInfo: member.party_member_info ? {
      id: member.party_member_info.id,
      associationMemberId: member.party_member_info.association_member_id,
      workplace: member.party_member_info.workplace,
      introductionDate: member.party_member_info.introduction_date,
      partyJoinDate: member.party_member_info.party_join_date,
      officialDate: member.party_member_info.official_date,
      partyActivities: member.party_member_info.party_activities,
      partyNotes: member.party_member_info.party_notes,
      createdAt: member.party_member_info.created_at,
      updatedAt: member.party_member_info.updated_at,
    } : undefined,
  }));

  // Sort by role priority
  const roleOrder = { president: 1, vice_president: 2, member: 3 };
  const sortedData = mappedData.sort((a, b) => {
    return roleOrder[a.role] - roleOrder[b.role];
  });

  return sortedData;
}

/**
 * Add a resident to an association
 */
export async function addAssociationMember(
  associationId: string,
  residentId: string,
  role: 'president' | 'vice_president' | 'member' = 'member'
) {
  const { data, error } = await supabase
    .from('association_members')
    .insert({
      association_id: associationId,
      resident_id: residentId,
      role: role,
      joined_date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update member role (e.g., promote to vice_president or president)
 */
export async function updateMemberRole(
  memberId: string,
  newRole: 'president' | 'vice_president' | 'member'
) {
  const { data, error } = await supabase
    .from('association_members')
    .update({
      role: newRole,
      updated_at: new Date().toISOString()
    })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove a member from an association
 */
export async function removeMemberFromAssociation(memberId: string) {
  const { error } = await supabase
    .from('association_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}

/**
 * Add military information for a discharged military association member
 */
export async function addMilitaryInfo(
  associationMemberId: string,
  militaryData: {
    enlistmentDate?: string;
    dischargeDate?: string;
    rank?: string;
    position?: string;
    militarySpecialty?: string;
    lastUnit?: string;
  }
) {
  const { data, error } = await supabase
    .from('military_info')
    .insert({
      association_member_id: associationMemberId,
      enlistment_date: militaryData.enlistmentDate || null,
      discharge_date: militaryData.dischargeDate || null,
      rank: militaryData.rank || null,
      position: militaryData.position || null,
      military_specialty: militaryData.militarySpecialty || null,
      last_unit: militaryData.lastUnit || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add party member information for a party_member_213 association member
 */
export async function addPartyMemberInfo(
  associationMemberId: string,
  partyData: {
    workplace?: string;
    introductionDate?: string;
    partyActivities?: string;
    partyNotes?: string;
  }
) {
  const { data, error } = await supabase
    .from('party_member_info')
    .insert({
      association_member_id: associationMemberId,
      workplace: partyData.workplace || null,
      introduction_date: partyData.introductionDate || null,
      party_join_date: partyData.partyJoinDate || null,
      official_date: partyData.officialDate || null,
      party_activities: partyData.partyActivities || null,
      party_notes: partyData.partyNotes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

