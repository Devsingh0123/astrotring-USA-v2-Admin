# AstroTring — Admin Portal

Enterprise administration console for **AstroTring** ([astrotring.com](https://astrotring.com/)).

This portal enables platform administrators to authenticate securely, oversee user registrations, inspect bound Vedic birth charts, monitor credit balances, and manage account statuses.

---

## Tech Stack

- **Runtime & Framework:** React 19 (JavaScript) + Vite
- **CSS & Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **UI Components:** shadcn/ui with `@base-ui/react` and **Nova** preset (`base-nova`)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit` + `react-redux`) with `createAsyncThunk`
- **HTTP Client:** Axios (automatic `Bearer` token injection & 401 handling)
- **Routing:** React Router DOM v7 with protected route guards
- **Notifications:** Sonner
- **Icons:** Lucide React
- **Code Quality:** Oxlint

---

## Key Features

1. **Email + Password Authentication:**
   - Public login endpoint (`POST /api/v1/admin/auth/login`) with role validation (`role === 'admin'`).
   - Token security: `accessToken` and `refreshToken` are persisted in `localStorage` and strictly isolated from the Redux store.
   - Protected route guard (`ProtectedRoute.jsx`) with automatic redirect to `/login` on invalid/expired sessions.
2. **User Management (`/users`):**
   - Paginated data table (`GET /api/v1/admin/users`) with debounced email search.
   - User profile tags: Role, Tier (`Free`, `Silver`, `Gold`, `Diamond`), Question credits, Report credits, Onboarding state, and Active status.
   - Inline Block / Unblock switch toggle calling `PATCH /api/v1/admin/users/:id/status`.
   - Comprehensive User Details Drawer (`UserDetailsModal.jsx`) displaying account metadata and all bound Vedic birth chart profiles.
3. **Dashboard Placeholder (`/`):**
   - Clean 'Coming Soon' placeholder maintaining the enterprise layout frame.

---

## Getting Started

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```
Ensure `VITE_ADMIN_API_BASE_URL` points to your active Admin Backend:
```env
VITE_ADMIN_API_BASE_URL=http://localhost:5001/api/v1/admin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

- `npm run dev`: Launches local Vite dev server with HMR.
- `npm run build`: Compiles production assets into `dist/`.
- `npm run lint`: Runs Oxlint code quality verification.
- `npm run preview`: Previews the compiled production build locally.

---

## Documentation

- **Technical Requirements Document (TRD):** [`TRD-admin.md`](./TRD-admin.md)
- **Backend API Specifications:** [`../shared/admin-api-contracts.md`](../shared/admin-api-contracts.md)
- **Database Schema:** [`../shared/db-schema.md`](../shared/db-schema.md)
