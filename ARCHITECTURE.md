# ResiManage - Architecture Documentation

## Project Overview

ResiManage is a comprehensive residential community management system built with React, TypeScript, and Supabase. It provides tools for managing residents, households, associations, events, and administrative workflows.

---

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **FullCalendar** - Event calendar
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication (currently using mock)

### Development Tools
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking

---

## Project Structure

```
resimanage/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── admin/       # Admin-specific components
│   │   ├── associations/# Association management
│   │   ├── common/      # Shared components (ErrorBoundary, etc.)
│   │   ├── dashboard/   # Dashboard widgets
│   │   ├── events/      # Event management
│   │   ├── households/  # Household management
│   │   ├── residents/   # Resident management
│   │   ├── skeletons/   # Loading skeletons
│   │   └── ui/          # Base UI components (Modal, Table, etc.)
│   │
│   ├── hooks/           # Custom React hooks
│   │   ├── useAdminDashboard.ts  # Dashboard data aggregation
│   │   ├── useApi.ts             # Generic API hook
│   │   └── usePendingApprovals.ts# Approval workflow
│   │
│   ├── pages/           # Route components
│   │   ├── admin/       # Admin pages
│   │   └── resident/    # Resident pages
│   │
│   ├── stores/          # Zustand state stores
│   │   ├── authStore.ts # Authentication state
│   │   └── partyStore.ts# Party member data
│   │
│   ├── types/           # TypeScript type definitions
│   │   ├── index.ts     # Main types export
│   │   └── user.ts      # User-related types
│   │
│   ├── utils/           # Utility functions
│   │   ├── mockApi.ts   # API layer (Supabase integration)
│   │   ├── supabaseClient.ts # Supabase client setup
│   │   ├── networkMonitor.ts # Network debugging tool
│   │   └── excelUtils.ts     # Excel import/export
│   │
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
│
├── .sql files           # Database migration scripts
└── package.json         # Dependencies
```

---

## State Management

### Global State (Zustand)

**authStore** - Authentication state
- User profile
- Login/logout actions
- Session persistence
- Role-based access control

**partyStore** - Party member data
- Party member list
- CRUD operations
- Caching strategy

### Local State Patterns

1. **Form State** - React Hook Form + Zod
   - Form validation
   - Error handling
   - Multi-step forms

2. **UI State** - React useState
   - Modal visibility
   - Loading states
   - Filters and search

3. **Server State** - Custom hooks (useApi)
   - Data fetching
   - Loading/error states
   - Automatic refetching

---

## API Integration

### Architecture

```
Component → Custom Hook → mockApi.ts → Supabase Client → PostgreSQL
```

### Key Patterns

**1. Mock API Layer (`utils/mockApi.ts`)**
- Centralizes all database operations
- Provides consistent error handling
- Implements caching where needed
- Handles pagination for large datasets

**2. Custom Hooks Pattern**
```typescript
// Example: useAdminDashboard
export const useAdminDashboard = () => {
  const fetchData = useCallback(async () => {
    const [stats, demographics] = await Promise.all([
      getAdminStatsSummary(),
      getAdminStatsDemographics()
    ]);
    return { stats, demographics };
  }, []);

  return useApi(fetchData, true); // auto-fetch on mount
};
```

**3. Optimistic UI Updates**
- Update local state immediately
- Call API in background
- Revert on error

---

## Database Schema

### Core Tables

**residents** - Resident information
- Personal details (name, DOB, gender, etc.)
- Contact information
- Identity card details
- Status (active, pending_approval)
- Household relationship

**households** - Household groups
- Name and address
- Head of household reference
- Unit/group assignment
- Business household fields
- Poor/policy household flags

**household_members** - Many-to-many relationship
- Links residents to households
- Stores relationship type

**associations** - Community organizations
- Association name and type
- Member count

**association_members** - Association membership
- Links residents to associations
- Role (president, vice_president, member)
- Military info (for veterans association)
- Party member info (for party association)

**events** - Calendar events
- Title, description, location
- Start/end dates
- Event type
- Attendees

### Supporting Tables
- **admin_staff** - Administrative users
- **party_resolutions** - Party decisions
- **discipline_rewards** - Awards and disciplinary actions
- **financial_transactions** - Financial records

---

## Key Design Decisions

### 1. Why Supabase?
- **Rapid Development**: Built-in auth, real-time, and database
- **PostgreSQL**: Powerful relational database
- **RLS**: Row-level security for data protection
- **Cost-effective**: Free tier suitable for small communities

### 2. Mock API Layer
- **Abstraction**: Easy to swap backend if needed
- **Consistency**: Centralized error handling
- **Testing**: Easier to mock for tests
- **Migration**: Currently using localStorage for auth, can switch to Supabase auth easily

### 3. Form Validation with Zod
- **Type Safety**: Schemas generate TypeScript types
- **Reusability**: Same schema for validation and types
- **Error Messages**: Customizable Vietnamese error messages

### 4. Optimistic UI
- **Better UX**: Immediate feedback
- **Perceived Performance**: App feels faster
- **Error Handling**: Graceful rollback on failure

### 5. Component Organization
- **Feature-based**: Components grouped by feature
- **Reusability**: Shared components in `/ui`
- **Separation of Concerns**: Smart (container) vs Dumb (presentational) components

---

## Data Flow Examples

### Example 1: Creating a Household

```
User fills form
  ↓
HouseholdFormModal validates with Zod
  ↓
Calls createHousehold(data)
  ↓
mockApi.ts inserts to Supabase
  ↓
Returns new household
  ↓
Parent component refreshes list
  ↓
UI updates
```

### Example 2: Approving a Resident

```
Admin clicks "Approve"
  ↓
Optimistic update (remove from pending list)
  ↓
Call approveUser(id)
  ↓
mockApi.ts updates status in Supabase
  ↓
On success: keep optimistic update
On error: revert and show error
```

---

## Performance Optimizations

1. **Pagination**: Large datasets (residents, events) use pagination
2. **Lazy Loading**: Routes are code-split
3. **Memoization**: useMemo/useCallback for expensive computations
4. **Debouncing**: Search inputs debounced (300ms)
5. **Caching**: Zustand stores cache frequently accessed data
6. **Optimistic UI**: Immediate feedback without waiting for server

---

## Security Considerations

### Current Implementation
- **Mock Authentication**: Using localStorage (development only)
- **Client-side Validation**: Zod schemas
- **Type Safety**: TypeScript prevents many runtime errors

### Production Recommendations
1. **Enable Supabase Auth**: Replace mock auth
2. **Implement RLS Policies**: Protect data at database level
3. **Environment Variables**: Secure API keys
4. **HTTPS Only**: Enforce secure connections
5. **Input Sanitization**: Prevent XSS attacks
6. **Rate Limiting**: Prevent abuse

---

## Future Enhancements

### Planned Features
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Document management
- [ ] Payment integration
- [ ] SMS notifications

### Technical Debt
- [ ] Replace mock auth with Supabase auth
- [ ] Add comprehensive test suite
- [ ] Implement error boundary for all routes
- [ ] Add analytics tracking
- [ ] Optimize bundle size

---

## Development Workflow

### Running Locally
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm run preview  # Preview production build
```

### Database Migrations
1. Create `.sql` file in project root
2. Run in Supabase SQL Editor
3. Verify with test data

---

## Troubleshooting

### Common Issues

**Issue**: Page becomes unresponsive
- **Cause**: Rendering too many items at once
- **Solution**: Implement pagination or virtualization

**Issue**: Data not updating
- **Cause**: Stale cache
- **Solution**: Hard refresh (Ctrl+Shift+R)

**Issue**: TypeScript errors
- **Cause**: Type mismatch between frontend and database
- **Solution**: Update types in `types/index.ts`

---

## Contact & Handover Notes

### Key Files to Understand
1. `utils/mockApi.ts` - All database operations
2. `stores/authStore.ts` - Authentication logic
3. `types/index.ts` - Type definitions
4. `App.tsx` - Routing and layout

### Before Going to Production
- [ ] Replace mock auth with Supabase auth
- [ ] Set up proper environment variables
- [ ] Configure RLS policies in Supabase
- [ ] Test all user flows thoroughly
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure backup strategy

### Support
For questions or issues, refer to:
- Supabase docs: https://supabase.com/docs
- React docs: https://react.dev
- TypeScript docs: https://www.typescriptlang.org/docs
