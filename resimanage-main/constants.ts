
import { DashboardStats, Event, Post, Resident } from './types';

export const MOCK_STATS: DashboardStats = {
  totalResidents: 0,
  totalHouseholds: 0,
  upcomingEvents: 0,
  newDocuments: 0,
  pendingRequests: 0,
};

export const MOCK_RESIDENTS: Resident[] = [];

export const MOCK_EVENTS: Event[] = [];

export const MOCK_POSTS: Post[] = [];

export const CHART_DATA_AGE = [
  { name: '0-18', value: 0 },
  { name: '19-40', value: 0 },
  { name: '41-60', value: 0 },
  { name: '60+', value: 0 },
];

export const CHART_DATA_GROWTH = [
  { name: 'T1', resident: 0 },
  { name: 'T2', resident: 0 },
  { name: 'T3', resident: 0 },
  { name: 'T4', resident: 0 },
  { name: 'T5', resident: 0 },
  { name: 'T6', resident: 0 },
];
