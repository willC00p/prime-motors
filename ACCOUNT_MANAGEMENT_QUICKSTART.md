# Quick Start - Account Management Setup

## Overview
The Account Management page is already implemented and ready to use. This guide helps you get started.

## Prerequisites
- ✅ Backend API running at `http://localhost:4000`
- ✅ Frontend running at `http://localhost:5173` (Vite)
- ✅ Database with users table
- ✅ Authorized user account (GM, CEO, NSM, Accounting, or Finance role)

## Accessing Account Management

### Step 1: Navigate to the Page
The Account Management page is located at:
```
frontend/src/pages/AccountManagement.tsx
```

### Step 2: Check Authorization
Make sure you're logged in with one of these roles:
- **GM** (General Manager)
- **CEO** (Chief Executive Officer)
- **NSM** (National Sales Manager)
- **Accounting**
- **Finance**

### Step 3: Access the Page
In your frontend routing (check `App.tsx`), the account management page should be accessible via a route. If not set up yet, add it:

```typescript
import AccountManagement from './pages/AccountManagement';

// In your routing:
<Route path="/accounts" element={<ProtectedRoute><AccountManagement /></ProtectedRoute>} />
```

## Key Components

### Main Component
- **Path**: `frontend/src/pages/AccountManagement.tsx`
- **Purpose**: Main page for account management
- **Size**: ~570 lines
- **Features**: CRUD, search, filter, role-based access

### Optional Card Component
- **Path**: `frontend/src/components/AccountCard.tsx`
- **Purpose**: Alternative card-based view (optional, for future enhancement)
- **Can be used**: To display accounts in card grid instead of table

### Utility Functions
- **Path**: `frontend/src/utils/roleAccess.ts`
- **Functions**:
  - `canManageAccounts(role)` - Check if user can manage accounts
  - `canAccessAllBranches(role)` - Check if user can see all branches
  - `hasAccountsAccess(role)` - Check role permission

## API Endpoints Used

The page uses these backend endpoints:

```
GET    /api/accounts              - Fetch all accounts
GET    /api/branches              - Fetch all branches
POST   /api/accounts              - Create new account
PUT    /api/accounts/:id          - Update account
PUT    /api/accounts/:id/password - Reset password
DELETE /api/accounts/:id          - Delete account
PATCH  /api/accounts/:id/toggle-status - Toggle status
```

**Note**: All endpoints require JWT authentication token in headers.

## Configuration

### Environment Variables
Ensure these are set in your `.env` files:

**Frontend (.env or .env.local)**:
```
VITE_API_URL=http://localhost:4000
```

**Backend (.env)**:
```
DATABASE_URL=postgresql://user:password@localhost:5432/prime_motors
JWT_SECRET=your-secret-key
```

## Testing the Page

### Test 1: Login and Access
```
1. Start backend: npm start (in backend/)
2. Start frontend: npm run dev (in frontend/)
3. Navigate to http://localhost:5173
4. Login with GM/CEO/NSM/Accounting/Finance account
5. Go to Account Management page
6. Should see list of accounts
```

### Test 2: Create Account
```
1. Click "New Account" button
2. Fill in:
   - Username: testuser123
   - Password: TestPassword123
   - Name: Test User
   - Email: testuser@example.com
   - Role: branch
   - Branch: Select any branch
3. Click "Save"
4. Should see success message
5. New account appears in list
```

### Test 3: Edit Account
```
1. Click "Edit" button on any account
2. Change name or email
3. Click "Save"
4. Should see success message
5. Changes reflected in table
```

### Test 4: Reset Password
```
1. Click "🔑" icon on any account
2. Enter new password
3. Click "Update Password"
4. Should see success message
```

### Test 5: Toggle Status
```
1. Click lock/unlock icon
2. Account status should change
3. Active becomes Inactive (and vice versa)
```

### Test 6: Delete Account
```
1. Click trash icon
2. Confirm deletion
3. Account should be removed from list
4. Should see success message
```

### Test 7: Test Authorization
```
1. Login as 'purchasing' role user
2. Try to navigate to Account Management
3. Should see "Access Denied" message
4. List of authorized roles shown
```

## Troubleshooting

### Issue: Page shows "Access Denied"
**Solution**: 
- Verify you're logged in with correct role
- Check that your user's role is one of: GM, CEO, NSM, Accounting, Finance
- Clear browser cache and re-login

### Issue: Button clicks don't work
**Solution**:
- Check browser console for JavaScript errors
- Verify backend API is running
- Check network tab in DevTools to see API calls
- Verify JWT token is valid (check localStorage)

### Issue: Accounts list is empty
**Solution**:
- Check that there are users in database
- Verify backend connection is working
- Check database for users table
- Check backend logs for errors

### Issue: "Username already exists" error
**Solution**:
- Username must be unique
- Choose a different username
- Check if username is already used by another account

### Issue: "Email already exists" error
**Solution**:
- Email must be unique
- Choose a different email address
- Check if email is already registered

### Issue: Can't see branch filter
**Solution**:
- Branch filter only shows for full-access users (GM, CEO, NSM)
- If you're Accounting/Finance, branch filter may not show
- This is by design - limited access users see all branches

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── AccountManagement.tsx    ← Main page
│   │   └── ...
│   ├── components/
│   │   ├── AccountCard.tsx          ← Optional component
│   │   └── ...
│   ├── services/
│   │   ├── accountApi.ts            ← API calls
│   │   └── ...
│   ├── utils/
│   │   ├── roleAccess.ts            ← Authorization functions
│   │   └── ...
│   ├── types/
│   │   ├── account.ts               ← TypeScript types
│   │   └── ...
│   └── ...
└── ...

backend/
├── src/
│   ├── controllers/
│   │   ├── accountController.ts    ← Business logic
│   │   └── ...
│   ├── routes/
│   │   ├── accounts.ts             ← API routes
│   │   └── ...
│   └── ...
└── ...
```

## Code Examples

### Checking Authorization
```typescript
import { canManageAccounts } from '../utils/roleAccess';
import { useAuth } from '../contexts/AuthContext';

export default function MyComponent() {
  const { user } = useAuth();
  
  if (!canManageAccounts(user?.role)) {
    return <div>Access Denied</div>;
  }
  
  return <div>Account Management</div>;
}
```

### Checking Branch Access
```typescript
import { canAccessAllBranches } from '../utils/roleAccess';
import { useAuth } from '../contexts/AuthContext';

export default function MyComponent() {
  const { user } = useAuth();
  const accessAllBranches = canAccessAllBranches(user?.role);
  
  return (
    <div>
      {accessAllBranches ? (
        <select>Filter by all branches</select>
      ) : (
        <div>Can only see your branch</div>
      )}
    </div>
  );
}
```

### Calling Account API
```typescript
import { accountApi } from '../services/accountApi';

// Get all accounts
const accounts = await accountApi.getAll();

// Create account
await accountApi.create({
  username: 'newuser',
  password: 'password123',
  name: 'New User',
  email: 'new@example.com',
  role: 'accounting',
  branchId: 1
});

// Update account
await accountApi.update(1, {
  name: 'Updated Name',
  email: 'updated@example.com'
});

// Reset password
await accountApi.updatePassword(1, { password: 'newpassword' });

// Delete account
await accountApi.delete(1);

// Toggle status
await accountApi.toggleStatus(1);
```

## Common Tasks

### Task: Add Account Management to Navigation
```typescript
// In your Layout or Navigation component
import { useAuth } from '../contexts/AuthContext';
import { canManageAccounts } from '../utils/roleAccess';

export default function Navigation() {
  const { user } = useAuth();
  
  return (
    <nav>
      {/* ... other nav items ... */}
      
      {canManageAccounts(user?.role) && (
        <Link to="/accounts">Account Management</Link>
      )}
    </nav>
  );
}
```

### Task: Filter Accounts by Role
```typescript
// Already implemented in AccountManagement.tsx
const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');

const filteredAccounts = accounts.filter(account => {
  const matchesRole = filterRole === 'all' || account.role === filterRole;
  return matchesRole;
});
```

### Task: Validate Branch Access
```typescript
// Already implemented in form validation
if (!accessAllBranches && form.branchId && form.branchId !== user?.branchId) {
  setError('You can only manage accounts for your assigned branch');
  return false;
}
```

## Next Steps

1. ✅ **Verify Setup** - Test basic functionality
2. ✅ **Test All Roles** - Try with different user roles
3. ✅ **Test All Features** - Create, edit, delete, reset password
4. ✅ **Add to Navigation** - Link to Account Management page
5. ✅ **Deploy** - Push to production

## Support & Documentation

- **Full Guide**: See `ACCOUNT_MANAGEMENT_GUIDE.md`
- **Implementation Details**: See `ACCOUNT_MANAGEMENT_IMPLEMENTATION.md`
- **Code Comments**: Check AccountManagement.tsx for inline documentation

## Need Help?

Check these resources:
1. React documentation: https://react.dev
2. TypeScript docs: https://www.typescriptlang.org/docs/
3. Tailwind CSS: https://tailwindcss.com/docs
4. React Icons: https://react-icons.github.io/react-icons/

---

**Last Updated**: February 23, 2026
**Status**: ✅ Production Ready
