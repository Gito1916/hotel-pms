# Quick Start Guide for Developers

## Development Workflow

### Initial Setup
```bash
# 1. Install dependencies
cd hotel-pms
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 3. Initialize database
pnpm db:push

# 4. Start development server
pnpm dev
```

### Database Operations
```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema directly (dev only)
pnpm db:push

# Open database studio (visual interface)
pnpm db:studio
```

### Adding a New Page/Route

1. Create page file in `app/` directory:
```typescript
// app/(dashboard)/new-module/page.tsx
import { auth } from "@/lib/auth"

export default async function NewModulePage() {
  const session = await auth()
  if (!session) return null

  return <div>Module content</div>
}
```

2. Add navigation link in `components/dashboard/sidebar.tsx`:
```typescript
{ name: "New Module", href: "/dashboard/new-module", icon: Icon, roles: ["admin"] }
```

### Adding a New API Route

Create file in `app/api/` directory:
```typescript
// app/api/new-resource/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await db.query.yourTable.findMany({
    where: eq(schema.yourTable.organizationId, session.user.organizationId),
  })

  return NextResponse.json(data)
}
```

### Adding a New Database Table

1. Define in `lib/db/schema.ts`:
```typescript
export const yourTable = sqliteTable('your_table', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  // ... other fields
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})
```

2. Run migration:
```bash
pnpm db:push
```

### Using the Database

```typescript
import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"

// Query
const item = await db.query.yourTable.findFirst({
  where: eq(schema.yourTable.id, itemId),
})

// Insert
const newItem = await db
  .insert(schema.yourTable)
  .values({ /* data */ })
  .returning()

// Update
const updated = await db
  .update(schema.yourTable)
  .set({ /* changes */ })
  .where(eq(schema.yourTable.id, itemId))
  .returning()

// Delete
await db
  .delete(schema.yourTable)
  .where(eq(schema.yourTable.id, itemId))
```

### Creating a New UI Component

Create in `components/ui/`:
```typescript
// components/ui/my-component.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface MyComponentProps {
  className?: string
  children: React.ReactNode
}

export function MyComponent({ className, children }: MyComponentProps) {
  return (
    <div className={cn("base-classes", className)}>
      {children}
    </div>
  )
}
```

### Authentication & Authorization

```typescript
import { auth } from "@/lib/auth"

// Get session in server components
const session = await auth()
if (!session) {
  // Not authenticated
}

// Check user role
if (session.user.role !== 'admin') {
  // Not authorized
}

// Get organization ID
const orgId = session.user.organizationId
```

### Role-Based UI Visibility

```typescript
const role = session.user.role

{role === 'admin' && <AdminOnlyComponent />}

{['admin', 'frontdesk'].includes(role) && <RestrictedComponent />}
```

### Utility Functions

```typescript
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"

formatCurrency(5000) // "₦5,000.00"
formatDate(new Date()) // "Jan 5, 2026"
formatDateTime(new Date()) // "Jan 5, 2026, 10:30 AM"
```

### Styling with Tailwind

```typescript
import { cn } from "@/lib/utils"

// Combine classes conditionally
<div className={cn("base-class", isActive && "active-class", className)} />

// Design tokens
className="bg-primary text-primary-foreground"
className="text-muted-foreground"
className="border-border"
```

## Common Patterns

### Server Component with Data Fetching
```typescript
export default async function Page() {
  const session = await auth()
  const data = await db.query.table.findMany({
    where: eq(schema.table.organizationId, session.user.organizationId),
  })

  return <div>{JSON.stringify(data)}</div>
}
```

### Client Component with Interactivity
```typescript
"use client"

import { useState } from "react"

export default function Component() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const response = await fetch('/api/endpoint', { method: 'POST' })
    setLoading(false)
  }

  return <button onClick={handleClick}>Action</button>
}
```

### Form Handling
```typescript
"use client"

import { useState } from "react"

export default function FormPage() {
  const [formData, setFormData] = useState({ name: '', email: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/resource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Error Handling
```typescript
try {
  const response = await fetch('/api/endpoint')
  if (!response.ok) {
    const error = await response.json()
    alert(error.message)
  }
} catch (error) {
  console.error('Operation failed:', error)
  alert('An error occurred')
}
```

## Project Structure

### Core Directories
- `app/` - Next.js 14 App Router pages and API routes
- `components/` - React components
- `lib/` - Utilities and database configuration
- `public/` - Static assets

### Component Organization
- `components/ui/` - Reusable base components (buttons, inputs, cards)
- `components/dashboard/` - Dashboard-specific components

### API Routes
- `app/api/auth/` - Authentication
- `app/api/rooms/` - Room management
- `app/api/reservations/` - Reservations
- `app/api/guests/` - Guest management
- `app/api/services/` - Services
- `app/api/orders/` - Orders
- `app/api/setup/` - System setup

## Best Practices

### Database
- Always filter by `organizationId` for multi-tenancy
- Use transactions for related updates
- Add audit logging for sensitive operations

### Security
- Validate user role before operations
- Never expose sensitive data in API responses
- Use prepared statements (Drizzle handles this)

### Performance
- Use server components when possible
- Implement pagination for large lists
- Cache frequently accessed data

### Error Handling
- Always wrap API calls in try-catch
- Return appropriate HTTP status codes
- Log errors for debugging

## Testing Commands

```bash
# Lint code
pnpm lint

# Type check
pnpm typecheck

# Run tests (when implemented)
pnpm test
```

## Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Getting Help

- Check `README.md` for general information
- Check `DEVELOPMENT_PLAN.md` for architecture details
- Check `IMPLEMENTATION_SUMMARY.md` for feature overview
- Review existing components and API routes for patterns
