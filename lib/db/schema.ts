import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['owner', 'admin', 'frontdesk', 'restaurant'] }).notNull(),
  organizationId: text('organization_id').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  mustChangePassword: integer('must_change_password', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const organizations = sqliteTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  currencyCode: text('currency_code').notNull().default('NGN'),
  currencySymbol: text('currency_symbol').notNull().default('₦'),
  themeColor: text('theme_color').default('#3b82f6'),
  operatingMode: text('operating_mode', { enum: ['offline', 'online', 'hybrid'] }).notNull().default('hybrid'),
  syncEnabled: integer('sync_enabled', { mode: 'boolean' }).notNull().default(false),
  syncSchedule: text('sync_schedule').default('00:00'),
  darkMode: text('dark_mode', { enum: ['light', 'dark', 'system'] }).notNull().default('system'),
  exportFormat: text('export_format', { enum: ['pdf', 'excel', 'both'] }).notNull().default('both'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  roomNumber: text('room_number').notNull(),
  floor: integer('floor').notNull().default(1),
  roomType: text('room_type', { enum: ['single', 'double', 'suite', 'deluxe'] }).notNull(),
  basePrice: real('base_price').notNull(),
  status: text('status', { enum: ['available', 'occupied', 'dirty', 'out_of_service'] }).notNull().default('available'),
  taxRate: real('tax_rate').notNull().default(7.5),
  maxGuests: integer('max_guests').notNull().default(2),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const guests = sqliteTable('guests', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  roomId: text('room_id').notNull().references(() => rooms.id),
  checkInDate: integer('check_in_date', { mode: 'timestamp' }).notNull(),
  checkOutDate: integer('check_out_date', { mode: 'timestamp' }),
  numGuests: integer('num_guests').notNull().default(1),
  isCheckedIn: integer('is_checked_in', { mode: 'boolean' }).notNull().default(false),
  isCheckedOut: integer('is_checked_out', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const reservations = sqliteTable('reservations', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  guestName: text('guest_name').notNull(),
  guestPhone: text('guest_phone').notNull(),
  guestEmail: text('guest_email'),
  roomId: text('room_id').notNull().references(() => rooms.id),
  checkInDate: integer('check_in_date', { mode: 'timestamp' }).notNull(),
  checkOutDate: integer('check_out_date', { mode: 'timestamp' }).notNull(),
  nights: integer('nights').notNull(),
  adults: integer('adults').notNull().default(1),
  children: integer('children').notNull().default(0),
  amountPaid: real('amount_paid').notNull().default(0),
  outstandingBalance: real('outstanding_balance').notNull().default(0),
  totalAmount: real('total_amount').notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'checked_in', 'canceled', 'no_show'] }).notNull().default('pending'),
  source: text('source', { enum: ['walk_in', 'phone', 'whatsapp', 'website', 'email_ai_agent'] }).notNull(),
  platform: text('platform', { enum: ['booking_com', 'airbnb', 'direct', null] }),
  reservationId: text('reservation_id'),
  specialRequests: text('special_requests'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  type: text('type', { enum: ['payment', 'refund'] }).notNull(),
  method: text('method', { enum: ['cash', 'pos', 'bank_transfer'] }).notNull(),
  amount: real('amount').notNull(),
  referenceId: text('reference_id').notNull(),
  reservationId: text('reservation_id').references(() => reservations.id),
  guestId: text('guest_id').references(() => guests.id),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  category: text('category', { enum: ['accommodation_supplies', 'restaurant_supplies', 'repairs_maintenance', 'subscriptions', 'other'] }).notNull(),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  recordedBy: text('recorded_by').notNull().references(() => users.id),
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const services = sqliteTable('services', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  type: text('type', { enum: ['meal', 'laundry', 'chauffeur', 'custom'] }).notNull(),
  basePrice: real('base_price').notNull(),
  taxRate: real('tax_rate').notNull().default(7.5),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  roomId: text('room_id').references(() => rooms.id),
  serviceId: text('service_id').notNull().references(() => services.id),
  guestId: text('guest_id').references(() => guests.id),
  status: text('status', { enum: ['pending', 'confirmed', 'delivered', 'canceled'] }).notNull().default('pending'),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method', { enum: ['immediate', 'room_tab'] }).notNull(),
  orderDate: integer('order_date', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
  notes: text('notes'),
})

export const guestTab = sqliteTable('guest_tab', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  guestId: text('guest_id').notNull().references(() => guests.id),
  serviceId: text('service_id').notNull().references(() => services.id),
  orderId: text('order_id').references(() => orders.id),
  amount: real('amount').notNull(),
  isPaid: integer('is_paid', { mode: 'boolean' }).notNull().default(false),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const notificationLogs = sqliteTable('notification_logs', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  type: text('type', { enum: ['pending_checkout', 'outstanding_balance', 'new_order', 'room_cleaning', 'new_reservation'] }).notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).notNull().default('medium'),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  userId: text('user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const syncLogs = sqliteTable('sync_logs', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  payload: text('payload').notNull(),
  status: text('status', { enum: ['success', 'failed', 'pending'] }).notNull().default('pending'),
  syncedAt: integer('synced_at', { mode: 'timestamp' }),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  userId: text('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: text('entity_id').notNull(),
  changes: text('changes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})

export const loginLogs = sqliteTable('login_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  success: integer('success', { mode: 'boolean' }).notNull().default(true),
  failedReason: text('failed_reason'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().default(sql`(unixepoch() * 1000)`),
})
