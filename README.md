# Hotel PMS - Property Management System

A comprehensive Progressive Web App (PWA) for hotel management with offline capabilities.

## Features

- **Dashboard**: Real-time metrics and quick actions
- **Guest Management**: Check-in/check-out, guest tabs
- **Room Management**: Room status, housekeeping workflow
- **Reservations**: Booking management, OTA integration
- **Restaurant & Services**: Order management, room service
- **Payments & Billing**: Multiple payment methods, tax-inclusive pricing
- **Reports & Analytics**: Financial insights, exports
- **Role-Based Access**: Owner, Admin, Front Desk, Restaurant
- **PWA Offline Mode**: Works offline with sync
- **OTA Email Integration**: AI-powered booking imports

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, SQLite, Drizzle ORM
- **Auth**: NextAuth.js v5
- **Offline**: IndexedDB, Service Workers
- **Styling**: Tailwind CSS, Lucide Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hotel-pms
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration.

4. Initialize the database:
```bash
pnpm db:push
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Time Setup

1. Visit the application
2. Complete the initial setup wizard
3. Create admin account
4. Configure your hotel details

## Database Commands

```bash
# Generate migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema (dev only)
pnpm db:push

# Open database studio
pnpm db:studio
```

## Project Structure

```
hotel-pms/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/              # API routes
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── dashboard/       # Dashboard components
├── lib/                 # Utilities
│   ├── db/             # Database
│   └── utils.ts        # Helper functions
└── public/             # Static files
```

## User Roles

- **Owner**: Dashboard, reports only (read-only)
- **Admin**: Full access to all modules
- **Front Desk**: Guests, rooms, reservations
- **Restaurant**: Restaurant & services only

## License

MIT
