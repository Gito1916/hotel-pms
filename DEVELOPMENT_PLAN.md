# Hotel PMS Development Plan

## Project Overview
Building a Progressive Web App (PWA) Hotel Property Management System with offline capabilities, role-based access, and comprehensive management features.

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Form Management**: React Hook Form + Zod validation
- **Charts**: Recharts
- **PWA**: next-pwa
- **Offline Storage**: IndexedDB via Dexie.js
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes (serverless)
- **Database**: SQLite (with better-sqlite3) for local storage
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js v5
- **Email**: Nodemailer
- **File Upload**: Uploadthing / local storage

### Development Tools
- **Package Manager**: pnpm
- **TypeScript**: Strict mode
- **Linting**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library

---

## Development Phases

### Phase 1: Foundation (Week 1)
- Project setup and configuration
- Database schema design
- Authentication system
- UI design system

### Phase 2: Core Features (Week 2-3)
- Room management
- Guest management
- Reservations
- Check-in/check-out flow

### Phase 3: Operations (Week 4)
- Restaurant & room services
- Payments & billing
- Notifications system

### Phase 4: Reporting & Analytics (Week 5)
- Financial reports
- Dashboard metrics
- Expense management

### Phase 5: Advanced Features (Week 6)
- Settings & configuration
- OTA email integration
- Sync & reporting architecture

### Phase 6: Offline & PWA (Week 7)
- PWA configuration
- Offline data handling
- Sync mechanisms
- Service workers

### Phase 7: Testing & Polish (Week 8)
- E2E testing
- Bug fixes
- Performance optimization
- Documentation

---

## Database Schema Overview

### Users
- id, email, password_hash, role, organization_id, is_active, must_change_password, created_at

### Organizations (Hotels)
- id, name, logo_url, address, phone, email, currency_code, theme_color, sync_enabled

### Rooms
- id, organization_id, room_number, floor, room_type, base_price, status, tax_rate

### Guests
- id, organization_id, name, phone, email, room_id, check_in_date, check_out_date, num_guests

### Reservations
- id, organization_id, guest_name, guest_phone, guest_email, room_id, check_in_date, check_out_date, amount_paid, outstanding_balance, status, source, platform, reservation_id, notes

### Transactions (Payments)
- id, organization_id, type (payment/refund), method (cash/pos/bank_transfer), amount, reference_id, description, created_at

### Expenses
- id, organization_id, category, amount, description, recorded_by, recorded_at

### Services
- id, organization_id, name, type (meal/laundry/chauffeur/custom), base_price, tax_rate, is_active

### Orders
- id, organization_id, room_id, service_id, status, amount, payment_method, order_date

### GuestTab
- id, organization_id, guest_id, service_id, amount, is_paid, created_at

### NotificationLogs
- id, organization_id, type, priority, message, is_read, created_at

### SyncLogs
- id, organization_id, payload, status, synced_at

---

## File Structure

```
hotel-pms/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── setup/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── guests/
│   │   ├── rooms/
│   │   ├── reservations/
│   │   ├── restaurant/
│   │   ├── reports/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/
│   │   ├── guests/
│   │   ├── rooms/
│   │   ├── reservations/
│   │   ├── payments/
│   │   ├── expenses/
│   │   ├── services/
│   │   ├── orders/
│   │   ├── sync/
│   │   └── webhooks/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── guests/
│   ├── rooms/
│   ├── reservations/
│   ├── restaurant/
│   ├── reports/
│   └── settings/
├── lib/
│   ├── db/
│   │   ├── schema/
│   │   └── migrations/
│   ├── hooks/
│   ├── utils/
│   └── validators/
├── public/
└── package.json
```

---

## Key Technical Decisions

### 1. Offline-First Architecture
- Local SQLite database as primary storage
- IndexedDB for client-side caching
- Sync queue for offline operations
- Conflict resolution via timestamps

### 2. Tax-Inclusive Pricing
- All prices stored as tax-inclusive
- Tax calculated and displayed separately
- Single currency per organization

### 3. Role-Based Access
- Server-side middleware for route protection
- Component-level UI visibility based on role
- Audit logging for all actions

### 4. PWA Strategy
- App shell architecture
- Service worker for offline caching
- Periodic background sync
- Network-first for auth, cache-first for static

### 5. OTA Email Integration
- IMAP polling for email monitoring
- LLM-based email parsing (OpenAI API)
- Fallback regex parser
- Manual review queue for low confidence

---

## Success Criteria
- All modules functional and tested
- PWA installs and works offline
- Sync operates without data loss
- Role-based access enforced
- Reports generate accurately
- OTA reservations import correctly

---

## Estimated Timeline: 8 Weeks
