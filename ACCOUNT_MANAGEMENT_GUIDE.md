# Account Management System Documentation

## Overview

The Account Management system allows authorized users to create, read, update, and manage user accounts in the Prime Motors system. Access is controlled through role-based and branch-based permissions.

## Authorization & Access Control

### Who Can Access Account Management?

Only users with the following roles can access the Account Management page:

1. **General Manager (GM)** - Full access to all accounts and branches
2. **Chief Executive Officer (CEO)** - Full access to all accounts and branches
3. **National Sales Manager (NSM)** - Full access to all accounts and branches
4. **Accounting** - Full access to all accounts and branches
5. **Finance** - Full access to all accounts and branches

All other roles (purchasing, audit, branch) **cannot** access Account Management.

### Access Control Flow

The authorization system works in two layers:

#### 1. Frontend Layer (Frontend Check)
- `src/utils/roleAccess.ts` defines permissions
- `canManageAccounts(role)` function checks if user's role can manage accounts
- `canAccessAllBranches(role)` function checks if user can see all branches

#### 2. Backend Layer (API Check)
- `src/routes/accounts.ts` uses `authenticateToken` middleware
- All account endpoints require authentication
- Backend validates user before processing requests

## Features

### 1. Create Account
**Who can do this:** Authorized roles only
**Required Fields:**
- Username (must be unique)
- Password (required for new accounts)
- Name (full name of user)
- Email (must be unique)
- Role (user role from dropdown)
- Branch (required only for 'branch' role users)

**Validation:**
- Username must be unique
- Email must be unique and valid format
- Branch-role users must have a branch assigned
- Non-full-access users cannot create accounts outside their branch

### 2. View Accounts
**Features:**
- Search by username, name, or email
- Filter by role
- Filter by branch (if user has access to all branches)
- View account status (Active/Inactive)
- View creation date

**Branch Access:**
- **Full-access roles** (GM, CEO, NSM): See all branch accounts
- **Finance/Accounting roles**: See all branch accounts
- **Branch users** (if they had access): Would see only their own branch

### 3. Edit Account
**Editable Fields:**
- Name
- Email
- Role
- Branch
- Username (display only, cannot be changed after creation)
- Active/Inactive status

**Restrictions:**
- Cannot edit your own username
- Cannot change username of existing accounts (for security)

### 4. Reset Password
**Features:**
- Reset any user's password
- New password is hashed using bcrypt
- User can log in with new password immediately

**Access Control:**
- Can be used for any account except your own

### 5. Toggle Account Status
**Features:**
- Enable/Disable accounts
- Disabled accounts cannot log in
- Visual indicator shows current status

**Restrictions:**
- Cannot disable your own account (prevents lockout)
- Can be re-enabled later

### 6. Delete Account
**Features:**
- Permanently delete accounts
- Confirmation required

**Restrictions:**
- Cannot delete your own account
- Deleted accounts cannot be recovered

## Role-Based Permissions in Detail

### Complete Permission Matrix

| Permission | GM | CEO | NSM | Accounting | Finance | Others |
|-----------|----|----|-----|-----------|---------|--------|
| View All Accounts | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Account | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Account | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Reset Password | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Toggle Status | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Account | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Access All Branches | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Filter by Branch | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

## Branch Access Model

### For Full-Access Roles (GM, CEO, NSM, Accounting, Finance)
- Can see and manage accounts from **all branches**
- Can create accounts for any branch
- Can filter accounts by branch
- Branch dropdown shows all available branches

### For Limited-Access Roles (e.g., Branch users)
- Can see only accounts from **their own branch**
- Cannot create or manage accounts outside their branch
- Branch field is automatically limited to their branch
- Cannot change branch assignment

## Technical Implementation

### Frontend Components

#### Main Page: `src/pages/AccountManagement.tsx`
- Handles all CRUD operations
- Enforces role-based access
- Enforces branch-based access
- Provides search and filter functionality

#### Card Component: `src/components/AccountCard.tsx` (Optional)
- Displays account information in card format
- Can be used as alternative to table view
- Shows role color coding
- Shows account status visually

### Permission Functions

Located in `src/utils/roleAccess.ts`:

```typescript
// Check if user can manage accounts
export const canManageAccounts = (role: UserRole): boolean => {
  return ACCOUNT_MANAGEMENT_ROLES.includes(role as any);
};

// Check if user can see all branches
export const canAccessAllBranches = (role: UserRole): boolean => {
  return ALL_BRANCHES_ACCESS.includes(role as any);
};
```

### API Integration

Located in `src/services/accountApi.ts`:

```typescript
export const accountApi = {
  getAll: async (): Promise<Account[]> => {
    return api.get<Account[]>('/accounts');
  },
  
  create: async (data: CreateAccountRequest): Promise<Account> => {
    return api.post<Account>('/accounts', data);
  },
  
  update: async (id: number, data: UpdateAccountRequest): Promise<Account> => {
    return api.put<Account>(`/accounts/${id}`, data);
  },
  
  updatePassword: async (id: number, data: UpdatePasswordRequest): Promise<{ message: string }> => {
    return api.put<{ message: string }>(`/accounts/${id}/password`, data);
  },
  
  delete: async (id: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/accounts/${id}`);
  },
  
  toggleStatus: async (id: number): Promise<Account> => {
    return api.put<Account>(`/accounts/${id}/toggle-status`, {});
  }
};
```

### Backend Endpoints

Located in `src/routes/accounts.ts`:

```typescript
// All endpoints require authentication
router.use(authenticateToken);

GET    /accounts           - Get all accounts
GET    /accounts/:id       - Get account by ID
POST   /accounts           - Create new account
PUT    /accounts/:id       - Update account
PUT    /accounts/:id/password - Update password
DELETE /accounts/:id       - Delete account
PATCH  /accounts/:id/toggle-status - Toggle status
```

## User Interface

### Header Section
- Shows current user information
- Displays logged-in user's role
- Shows user's branch (if applicable)

### Create/Edit Form Modal
- Modal dialog for creating new accounts
- Displays error messages in red
- Shows success messages in green
- Form validation prevents invalid submissions
- Branch dropdown respects access rules

### Accounts Table
- Displays all accounts (filtered by access control)
- Shows: Username, Name, Email, Role, Branch, Status, Created Date
- Action buttons: Edit, Reset Password, Toggle Status, Delete
- Color-coded roles for easy identification
- Branch shown in purple badge
- Hover effects for better UX

### Filters Section
- **Search Input**: Find accounts by username, name, or email
- **Role Filter**: Filter by user role
- **Branch Filter**: Filter by branch (only for full-access users)

### Statistics Cards
- Total accounts count
- Active accounts count
- Inactive accounts count
- Filtered results count

## Security Considerations

1. **Password Hashing**: Passwords are hashed with bcrypt on the backend
2. **Authentication**: All account endpoints require valid JWT token
3. **Authorization**: Role-based access control on both frontend and backend
4. **Branch Isolation**: Non-full-access users can only modify their branch
5. **Self-Protection**: Cannot disable or delete your own account
6. **Validation**: All inputs validated on frontend and backend
7. **Unique Constraints**: Username and email must be unique

## Error Handling

The system handles the following error scenarios:

1. **Unauthorized Access**: Redirects users without permission
2. **Invalid Input**: Displays validation errors
3. **Duplicate Username/Email**: Shows conflict error
4. **Network Errors**: Shows error message to user
5. **Account Not Found**: Returns 404 error
6. **Self-Modification Attempts**: Prevents dangerous actions

## Future Enhancements

Potential improvements:
- Bulk account operations (import/export)
- Advanced search with multiple criteria
- Activity logging for account changes
- Email notifications for account creation
- Two-factor authentication setup
- Account activity history
- Role templates for faster creation
- Bulk role assignment

## Usage Examples

### Creating a Finance Account
1. Log in as GM, CEO, NSM, Accounting, or Finance user
2. Click "New Account" button
3. Fill in:
   - Username: `john.doe`
   - Password: `SecurePassword123`
   - Name: `John Doe`
   - Email: `john.doe@primes.com`
   - Role: `Finance`
   - Branch: `Sta. Mesa` (or any branch)
4. Click "Save"

### Managing Branch Accounts
1. Search for accounts by branch name
2. Filter by "branch" role
3. Edit to assign/change branch
4. Toggle status to enable/disable
5. Reset password if needed

### Bulk Password Reset
1. Find accounts needing password reset
2. Click key icon on each account
3. Enter new password
4. Click "Update Password"
5. Users can log in with new password

## Support

For issues or questions regarding Account Management:
- Check role assignments in the system
- Verify branch assignments for branch-role users
- Ensure authentication token is valid
- Check backend logs for detailed errors
