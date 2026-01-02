# API Refactoring - Incremental Migration Guide

## Overview

The `mockApi.ts` file has been refactored into a modular structure for better maintainability.

## Current Structure

```
utils/
├── api/
│   ├── index.ts           # Main entry point (re-exports everything)
│   ├── helpers.ts         # Shared utilities & mappers ✓
│   ├── residents.ts       # Resident APIs ✓
│   └── [future modules]   # To be added incrementally
├── dashboardStats.ts      # Dashboard statistics (already separated)
├── mockApi.ts            # Original file (still in use for non-migrated functions)
└── mockApi.ts.backup     # Backup of original file
```

## Migration Status

### ✅ Completed Modules

- **helpers.ts** - Shared utilities, constants, mappers
- **residents.ts** - All resident-related functions:
  - `getResidents()`
  - `getAllResidents()`
  - `createResident()`
  - `updateResident()`
  - `deleteResident()`
  - `toggleVote()`

### 🔄 Still in mockApi.ts

- Households
- Events
- Posts
- Authentication
- Notifications
- Associations
- Admin Staff
- Dashboard (partially - stats in separate file)

## How to Use

### Current Imports (No Change Needed)

All existing imports continue to work:

```typescript
// This still works!
import { getResidents, createResident } from '../utils/mockApi';
```

### Recommended New Imports

For better code organization, use the new API module:

```typescript
// Recommended approach
import { getResidents, createResident } from '../utils/api';
```

Both approaches work identically - `api/index.ts` re-exports everything.

## Next Steps for Migration

When ready to migrate more modules:

1. **Create new module file** (e.g., `api/households.ts`)
2. **Copy functions** from `mockApi.ts`
3. **Update imports** in the new file
4. **Export from `api/index.ts`**
5. **Test** to ensure nothing breaks
6. **Optionally update imports** across the app

## Benefits

✅ **Smaller files** - Easier to navigate and edit  
✅ **Better organization** - Functions grouped by domain  
✅ **Backward compatible** - No breaking changes  
✅ **Incremental** - Migrate at your own pace  
✅ **Safer** - Original file backed up

## Backup

Original file backed up at: `utils/mockApi.ts.backup`

To restore if needed:
```powershell
Copy-Item "utils/mockApi.ts.backup" "utils/mockApi.ts" -Force
```
