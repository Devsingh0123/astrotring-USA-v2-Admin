# Japaika — Admin Portal

Enterprise administration console for **Japaika** ([japaika.com](https://japaika.com)), hosted at [admin.japaika.com](https://admin.japaika.com).

This portal enables platform administrators to authenticate securely, oversee user registrations, inspect bound Vedic birth charts, manage question and report packs, monitor AI chat logs, publish SEO blog articles, review orders & GST invoices, and govern staff RBAC permissions.

---

## Domain & Service Architecture

| Service | Production Domain | Local Development |
| :--- | :--- | :--- |
| **Admin Frontend (`admin/`)** | `https://admin.japaika.com` | `http://localhost:5173` |
| **Admin Backend (`admin-backend/`)** | `https://adminbackend.japaika.com` | `http://localhost:5001` |
| **User Frontend (`frontend/`)** | `https://japaika.com` | `http://localhost:5174` |
| **User Backend (`backend/`)** | `https://backend.japaika.com` | `http://localhost:5000` |

---

## Tech Stack

- **Runtime & Framework:** React 19 (JavaScript) + Vite
- **CSS & Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **UI Components:** shadcn/ui with `@base-ui/react` and **Nova** preset (`base-nova`)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit` + `react-redux`) with `createAsyncThunk`
- **HTTP Client:** Axios (automatic `Bearer` token injection & 401 token refresh)
- **Routing:** React Router DOM v7 with protected route guards & Error Boundary
- **Rich Text Editor:** Tiptap v3 (for Blog CMS)
- **Charts & Telemetry:** Recharts
- **Notifications:** Sonner
- **Icons:** Lucide React
- **Code Quality:** Oxlint

---

## Key Features

1. **Email + Password Administrator Authentication (`/login`):**
   - Backed by the dedicated `admins` table (`role IN ('admin', 'super_admin')`).
   - Tokens (`japaika_admin_access_token`, `japaika_admin_refresh_token`) are persisted in `localStorage` and strictly isolated from Redux state.
2. **Executive Dashboard (`/`):**
   - Real-time KPI cards, 7-day multi-currency revenue trends, and platform health indicators.
3. **User Management (`/users`):**
   - Paginated directory, Vedic birth chart inspection, manual question/report credit adjustments, account block/unblock controls, and CSV export.
4. **Orders, Refunds & GST Invoicing (`/orders`):**
   - Transaction tracking, Razorpay refund processing, printable GST HTML tax invoices, and CSV export.
5. **Catalog & Promotions (`/coupons`, `/question-packs`, `/report-packs`):**
   - Multi-currency (`INR` / `USD`) pack management and promotional coupon administration.
6. **Blog CMS (`/blogs`):**
   - Rich-text article authoring, Cloudinary media uploads (`japaika/blogs`), and live Google SERP previews (`https://japaika.com/blog/:slug`).
7. **AI Chat Monitoring (`/chats`):**
   - Turn-by-turn inspection of Jyotish & Shastra AI threads, reasoning traces, token consumption, and satisfaction metrics.
8. **Staff Admins & System Settings (`/admins`, `/settings`):**
   - Super-admin RBAC management, profile/avatar updates (`japaika/admins`), password rotation, and live Node/MySQL diagnostics.

---

## Getting Started

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```
Configure `VITE_ADMIN_API_BASE_URL` (local dev or `https://adminbackend.japaika.com/api/v1/admin` for production):
```env
VITE_ADMIN_API_BASE_URL=http://localhost:5001/api/v1/admin
VITE_USER_FRONTEND_URL=https://japaika.com
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
