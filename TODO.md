# TODO: Replace Cookies with Encrypted Storage

## Overview
Replace all cookie usages with encrypted localStorage functions to enhance security. The application currently uses js-cookie for storing sensitive data like tokens and user info. We need to migrate to the encrypted storage helper (`src/utils/storageHelper.ts`) which uses CryptoJS for encryption.

## Key Changes
- Use `setEncryptedItem`, `getDecryptedItem`, `removeEncryptedItem` instead of `Cookies.set`, `Cookies.get`, `Cookies.remove`
- Store individual encrypted items instead of a single userData object for easier access
- Ensure all authentication-related data is encrypted

## Steps

### 1. Update AuthForm.tsx
- Change from storing `userData` object to individual encrypted items
- Store: token, refreshToken, email, subadmin_id, role, plan_name, plan_expiry_date, id

### 2. Update Api.ts
- Replace `Cookies.get("token")` with `getDecryptedItem("token")`
- Replace `Cookies.get("refreshToken")` with `getDecryptedItem("refreshToken")`
- Replace `Cookies.set("token", ...)` with `setEncryptedItem("token", ...)`

### 3. Update auth.ts
- Replace `Cookies.get("role")` with `getDecryptedItem("role")`

### 4. Update App.tsx
- Replace `Cookies.get("token")` and `Cookies.get("role")` with encrypted versions

### 5. Update sidebar.tsx
- Replace remaining `Cookies.get` calls with `getDecryptedItem`
- Ensure logout removes all encrypted items

### 6. Update Page Components
- Replace all `Cookies.get` calls in page files with `getDecryptedItem`
- Files to check: managelinklist/page.tsx, voicebot/page.tsx, updatereturn/page.tsx, upsells pages, plan pages, menu pages, business-hour pages, catering pages, etc.

### 7. Update PaymentForm.tsx and CardDetailsSection.tsx
- Replace cookie storage for card details with encrypted storage

### 8. Testing
- Test login/signup flow
- Test token refresh
- Test logout
- Test protected routes
- Test data retrieval in components

### 9. Cleanup
- Remove js-cookie import from files where no longer needed
- Check if js-cookie can be removed from package.json
