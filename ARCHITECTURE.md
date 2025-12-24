# ResiManage - Architecture Overview

## 📋 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6 (Hash routing for compatibility)
- **State Management**: Zustand (lightweight alternative to Redux)
- **UI Framework**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Calendar**: FullCalendar

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Mock Auth for development
- **Storage**: Supabase Storage (for future file uploads)
- **Real-time**: Supabase Realtime (not currently used)

---

## 📁 Project Structure

```
/resimanage
├── /components          # Reusable UI components
│   ├── /common         # Shared components (Header, ErrorBoundary, etc.)
│   ├── /events         # Event-related components
│   ├── /feed           # Community feed components
│   ├── /households     # Household management components
│   └── /ui             # Base UI components (Modal, Input, etc.)
├── /pages              # Route pages
│   ├── /admin          # Admin-only pages
│   └── /resident       # Resident-only pages
├── /stores             # Zustand stores
│   ├── authStore.ts    # Authentication state
│   ├── dashboardStore.ts
│   └── notificationStore.ts
├── /hooks              # Custom React hooks
├── /utils              # Utility functions
│   ├── mockApi.ts      # API wrapper for Supabase
│   └── supabaseClient.ts
├── /migrations         # Database migration scripts
└── types.ts            # TypeScript type definitions
```

---

## 🔑 Key Design Decisions

### 1. Authentication Strategy

**Development Mode**:
- Hardcoded admin account (`admin@resimanage.com`)
- No real Supabase auth session for admin
- RLS policies relaxed to allow development

**Production Considerations**:
- Migrate admin to Supabase auth
- Implement proper RLS policies
- Add role-based access control (RBAC)

### 2. State Management

**Zustand for Global State**:
- `authStore`: User authentication and profile
- `dashboardStore`: Dashboard statistics
- `notificationStore`: User notifications

**Local State for Page-Specific Data**:
- Filters, pagination, modals
- Optimistic UI updates
- Form state (via React Hook Form)

### 3. API Layer (`mockApi.ts`)

**Purpose**: Centralized wrapper around Supabase client

**Key Functions**:
- `fetchMock()`: Generic GET requests
- CRUD operations for each resource (residents, events, posts, etc.)
- Handles pagination, filtering, sorting

**Benefits**:
- Easy to swap Supabase with another backend
- Consistent error handling
- Type-safe API calls

### 4. Styling Approach

**Tailwind CSS Utility-First**:
- Inline utility classes for rapid development
- Custom color palette in `tailwind.config.js`
- Responsive design with mobile-first approach

**Framer Motion for Animations**:
- Smooth page transitions
- Interactive micro-animations
- Optimistic UI feedback

---

## 🗄️ Database Schema

### Core Tables

**residents**
- User profiles for residents
- Linked to households
- Filterable by status, age, gender, ethnicity, religion

**households**
- Household information
- Linked to residents via `household_id`
- Tracks head of household and members

**events**
- Calendar events
- Types: Họp, Sinh hoạt, Khác
- Includes attendees field

**posts**
- Community feed posts
- Author info stored denormalized
- Likes and comments count

### RLS Policies

**Current (Development)**:
- Most tables allow all operations (`USING (true)`)
- Needed because hardcoded admin has no `auth.uid()`

**Recommended (Production)**:
```sql
-- Example: Restrict residents table
CREATE POLICY "Admins can manage residents"
  ON public.residents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
```

---

## 🔄 Data Flow

### Example: Resident Filtering

1. **User Action**: Changes filter (e.g., selects "Nam" for gender)
2. **State Update**: `setFilterGender('Nam')`
3. **Debounce**: `useEffect` waits 500ms
4. **API Call**: `getResidents({ gender: 'Nam', ... })`
5. **Supabase Query**: Filters applied via `.eq('gender', 'Nam')`
6. **Response**: Paginated results returned
7. **UI Update**: Table re-renders with filtered data

### Example: Optimistic UI (Like Post)

1. **User Action**: Clicks like button
2. **Optimistic Update**: Immediately update UI (likes +1, isLiked = true)
3. **API Call**: `likePost(postId)`
4. **Success**: Keep optimistic update
5. **Error**: Revert to original state, show error toast

---

## 🚀 Key Features

### Admin Features
- **Resident Management**: CRUD, filtering, bulk import from Excel
- **Household Management**: Create/edit households, manage members
- **Event Calendar**: Create/edit/delete events, view calendar
- **Community Feed**: Create posts, delete posts
- **Dashboard**: Statistics and quick actions

### Resident Features
- **Profile Management**: View/edit own profile
- **Event Calendar**: View upcoming events
- **Community Feed**: Like posts, view feed

---

## 🛠️ Development Workflow

### Running Locally
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

### Database Migrations
1. Create SQL file in `/migrations`
2. Run in Supabase SQL Editor
3. Verify with test queries

---

## 📝 Code Conventions

### TypeScript
- Strict mode enabled
- Interfaces for all props
- Type imports from `types.ts`

### Components
- Functional components with hooks
- Props interface defined above component
- JSDoc for complex components

### Naming
- Components: PascalCase (`CreateEventModal`)
- Files: PascalCase for components, camelCase for utilities
- Functions: camelCase (`handleSubmit`)
- Constants: UPPER_SNAKE_CASE (`API_URL`)

---

## 🔐 Security Considerations

### Current Limitations
- Hardcoded admin credentials
- Relaxed RLS policies
- No input sanitization for SQL injection

### Recommended Improvements
1. Implement proper authentication
2. Strict RLS policies
3. Input validation on backend
4. Rate limiting for API calls
5. HTTPS in production

---

## 📚 Further Reading

- [Supabase Documentation](https://supabase.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)
- [FullCalendar](https://fullcalendar.io/)

---

## 👥 Handoff Notes

### Important Files to Review
1. `stores/authStore.ts` - Authentication logic
2. `utils/mockApi.ts` - All API calls
3. `pages/admin/residents/index.tsx` - Complex filtering example
4. `components/events/CreateEventModal.tsx` - Form validation example

### Known Issues
- RLS policies need tightening for production
- Admin auth should migrate to Supabase
- Some console.error statements may remain in error boundaries

### Next Steps
1. Implement real admin authentication
2. Add unit tests
3. Optimize bundle size
4. Add error tracking (e.g., Sentry)
5. Implement proper logging
