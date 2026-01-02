/**
 * @fileoverview Shared helpers and utilities for API layer
 */

import { supabase } from '../supabaseClient';

/** Simulated network delay for realistic UX */
export const DELAY_MS = 500;

/** LocalStorage keys for various data stores */
export const KEYS = {
    RESIDENTS: 'community_residents',
    HOUSEHOLDS: 'community_households',
    EVENTS: 'community_events',
    POSTS: 'community_posts',
    NOTIFICATIONS: 'community_notifications',
    ADMIN_STAFF: 'admin_staff',
    DELETED_HOUSEHOLDS: 'deleted_households',
    CURRENT_USER: 'current_user',
};

/**
 * Map resident data from database format (snake_case) to app format (camelCase)
 */
export const mapResidentFromDb = (dbResident: any) => {
    return {
        id: dbResident.id,
        fullName: dbResident.full_name,
        email: dbResident.email,
        dob: dbResident.dob,
        gender: dbResident.gender,
        phoneNumber: dbResident.phone_number,
        address: dbResident.address,
        status: dbResident.status,
        avatar: dbResident.avatar,
        householdId: dbResident.household_id,
        isPartyMember: dbResident.is_party_member || false,
        partyJoinDate: dbResident.party_join_date,
        identityCard: dbResident.identity_card,
        education: dbResident.education,
        hometown: dbResident.hometown,
        profession: dbResident.profession,
        ethnicity: dbResident.ethnicity,
        religion: dbResident.religion,
        unit: dbResident.unit,
        province: dbResident.province,
        ward: dbResident.ward,
        residenceType: dbResident.residence_type,
        isHeadOfHousehold: dbResident.is_head_of_household || false,
        specialStatus: dbResident.special_status,
        specialNotes: dbResident.special_notes,
        rejectionReason: dbResident.rejection_reason,
        hasVoted: dbResident.has_voted || false,
        createdAt: dbResident.created_at,
    };
};

/**
 * Helper to simulate delay
 */
export const delay = (ms: number = DELAY_MS) =>
    new Promise(resolve => setTimeout(resolve, ms));
