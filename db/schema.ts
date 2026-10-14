import { date, index, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { CATEGORIES } from '@/components/contract'

export const categoryEnum = pgEnum('category', CATEGORIES)
export const itemStatusEnum = pgEnum('item_status', ['in_stock', 'used', 'binned'])
export const receiptSourceEnum = pgEnum('receipt_source', ['image', 'text', 'sample'])

// One row per browser. The token lives in an httpOnly cookie; every query is scoped by household.
export const households = pgTable(
  'households',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Cached dish suggestions, keyed by the in-stock items they were built from.
    suggestions: jsonb('suggestions'),
    suggestionsKey: text('suggestions_key'),
    suggestionsAt: timestamp('suggestions_at', { withTimezone: true }),
  },
  (t) => [index('households_token_idx').on(t.token)],
)

// The photo is never stored; only the validated extraction is.
export const receipts = pgTable('receipts', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  source: receiptSourceEnum('source').notNull(),
  extracted: jsonb('extracted').notNull(),
  // Minted by the client per extraction; makes Save idempotent per receipt.
  clientKey: text('client_key').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const items = pgTable(
  'items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    householdId: uuid('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    receiptId: uuid('receipt_id').references(() => receipts.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    qty: numeric('qty', { precision: 10, scale: 2, mode: 'number' }).notNull(),
    unit: text('unit'),
    category: categoryEnum('category').notNull(),
    boughtOn: date('bought_on').notNull(),
    expiresOn: date('expires_on').notNull(),
    status: itemStatusEnum('status').notNull().default('in_stock'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('items_household_status_expires_idx').on(t.householdId, t.status, t.expiresOn)],
)

export type ItemRow = typeof items.$inferSelect
export type HouseholdRow = typeof households.$inferSelect
