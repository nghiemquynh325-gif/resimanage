# ResiManage - Project Documentation

## 📋 Tổng Quan Dự Án

**ResiManage** là hệ thống quản lý cư dân khu phố toàn diện, được xây dựng với React + TypeScript + Supabase.

## 🏗️ Kiến Trúc Hệ Thống

### Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **UI Framework:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect)
- **Routing:** React Router v6
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Icons:** Lucide React
- **Charts:** Recharts

### Cấu Trúc Thư Mục

```
resimanage/
├── components/          # React components
│   ├── common/         # Shared components (modals, layouts)
│   ├── associations/   # Association management
│   ├── households/     # Household management
│   ├── residents/      # Resident management
│   ├── dashboard/      # Dashboard widgets
│   └── ui/            # UI primitives (Table, etc.)
├── pages/              # Page components
│   └── admin/         # Admin pages
├── utils/              # Utilities
│   ├── api/           # API layer (Supabase)
│   └── mockApi.ts     # Main API functions
├── types.ts            # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## 🔑 Core Features

### 1. Quản Lý Cư Dân (Residents)
- CRUD operations cho cư dân
- Import từ Excel với AI (Google Gemini)
- Bộ lọc nâng cao (tuổi, giới tính, dân tộc, v.v.)
- Theo dõi bỏ phiếu
- Phân trang và tìm kiếm

### 2. Quản Lý Hộ Gia Đình (Households)
- Tạo và quản lý hộ gia đình
- Chọn chủ hộ và thành viên
- Theo dõi hộ nghèo/cận nghèo, hộ chính sách
- Quản lý tài sản kinh doanh
- Mối quan hệ giữa các thành viên

### 3. Quản Lý Chi Hội (Associations)
- 8 loại chi hội: Cựu chiến binh, Phụ nữ, Thanh niên, Hội Chữ thập đỏ, Hội Cựu Chiến Binh, Đảng viên 213, Dân quân, ANCS
- Quản lý thành viên và vai trò
- Thông tin bổ sung (quân sự, đảng viên)

### 4. Dashboard
- Thống kê tổng quan
- Biểu đồ phân tích (Pie charts)
- Dữ liệu real-time

## 🔐 Authentication & Authorization

### RLS (Row Level Security)
Supabase RLS policies đảm bảo:
- Chỉ authenticated users mới truy cập được dữ liệu
- Mỗi user chỉ thấy dữ liệu của khu phố mình quản lý

### User Roles
- **ADMIN:** Quản lý toàn bộ hệ thống
- **RESIDENT:** Xem thông tin cá nhân (future feature)

## 📊 Data Model

### Core Entities

```typescript
Resident {
  id, fullName, dob, gender, ethnicity, religion,
  phoneNumber, address, residenceType, hasVoted
}

Household {
  id, name, unit, headOfHouseholdId, memberIds,
  isPoorHousehold, isPolicyHousehold, isBusinessHousehold
}

Association {
  id, name, type, description
}

AssociationMember {
  id, associationId, residentId, role, joinedDate
}
```

### Relationships
- Household → Resident (1:N)
- Association → Resident (M:N through AssociationMember)
- Household → HouseholdMember (1:N with relationship info)

## 🎨 UI/UX Design

### Responsive Design
- **Mobile-first approach**
- Hamburger menu cho mobile
- Tables với horizontal scroll
- Touch-friendly buttons (≥44px)
- Modals tối ưu cho mọi screen size

### Design System
- **Colors:** Blue primary, semantic colors for status
- **Typography:** System fonts, readable sizes
- **Spacing:** Consistent padding/margin
- **Components:** Reusable, well-documented

## 🔄 State Management

### Approach
- **Local state:** useState cho component-specific state
- **Derived state:** useMemo cho computed values
- **Server state:** Direct Supabase queries (no global cache)

### Data Flow
```
User Action → Component Handler → API Call → Supabase → Response → State Update → Re-render
```

## 📡 API Layer

### Structure
```
utils/
├── mockApi.ts          # Main API (residents, households, associations)
└── api/
    └── households.ts   # Household-specific operations
```

### Key Functions
- `getResidents()` - Fetch residents with pagination
- `getHouseholds()` - Fetch households with members
- `getAssociations()` - Fetch associations
- `updateHousehold()` - Update household with members

### Error Handling
- Try-catch blocks
- User-friendly error messages
- Optimistic updates with rollback

## 🧪 Testing Strategy

### Manual Testing
- Test trên Chrome DevTools (mobile, tablet, desktop)
- Verify CRUD operations
- Check responsive design
- Validate forms

### Future: Automated Testing
- Unit tests với Vitest
- E2E tests với Cypress (setup đã có)

## 🚀 Deployment

### Build
```bash
npm run build
```

### Environment Variables
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_key (optional)
```

### Hosting
- Netlify/Vercel recommended
- Static site deployment
- `_redirects` file for SPA routing

## 📝 Code Conventions

### TypeScript
- Strict mode enabled
- Explicit types for props
- Interfaces for complex objects

### React
- Functional components only
- Hooks for state/effects
- Props destructuring
- Meaningful component names

### Styling
- Tailwind utility classes
- Responsive modifiers (sm:, md:, lg:)
- Consistent spacing scale

## 🔧 Maintenance

### Adding New Features
1. Define types in `types.ts`
2. Create API functions in `utils/`
3. Build components in `components/`
4. Add pages in `pages/`
5. Update routes in `App.tsx`

### Database Changes
1. Write SQL migration
2. Test in Supabase SQL Editor
3. Update TypeScript types
4. Update API functions

## 📚 Key Files to Understand

| File | Purpose |
|------|---------|
| `types.ts` | All TypeScript interfaces |
| `utils/mockApi.ts` | Main API layer |
| `App.tsx` | Routing configuration |
| `components/common/MainLayout.tsx` | App layout |
| `pages/admin/residents/index.tsx` | Residents management |
| `pages/admin/households/index.tsx` | Households management |
| `pages/admin/associations/index.tsx` | Associations management |

## 🐛 Common Issues & Solutions

### Issue: RLS Policy Errors
**Solution:** Check Supabase RLS policies, ensure user is authenticated

### Issue: Data Not Updating
**Solution:** Check network tab, verify API response, check state updates

### Issue: Mobile Layout Broken
**Solution:** Review responsive classes, test on actual device

## 📞 Support & Handoff

### For Developers
- Read this document first
- Review `types.ts` for data model
- Check `utils/mockApi.ts` for API patterns
- Test locally before deploying

### For Maintainers
- Database: Supabase dashboard
- Logs: Browser console + Network tab
- Deployment: Netlify/Vercel dashboard

---

**Last Updated:** 2026-01-02  
**Version:** 1.0.0  
**Status:** Production Ready ✅
