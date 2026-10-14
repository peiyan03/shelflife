import type { Category, Freshness } from '@/components/contract'

// Expiry is an estimate. Receipts carry no dates; the model proposes shelfLifeDays
// per item and this table is both the fallback and the sanity bound.
export const FALLBACK_DAYS: Record<Category, number> = {
  dairy: 7,
  produce: 5,
  meat_fish: 3,
  bakery: 4,
  frozen: 90,
  dry: 365,
  drinks: 30,
  other: 7,
}

/** Model estimate bounded to [1, 2 x table]; missing or non-positive falls back to the table. */
export function clampShelfLife(category: Category, days: number | null | undefined): number {
  const base = FALLBACK_DAYS[category]
  if (days == null || !Number.isFinite(days) || days <= 0) return base
  return Math.max(1, Math.min(Math.round(days), base * 2))
}

const DAY_MS = 86_400_000

function parseISO(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function toISO(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

/** Today's date as YYYY-MM-DD (UTC calendar day). */
export function todayISO(now: Date = new Date()): string {
  return toISO(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export function addDays(iso: string, days: number): string {
  return toISO(parseISO(iso) + days * DAY_MS)
}

/** Whole calendar days from today until expiresOn; negative once past. */
export function daysLeft(expiresOn: string, now: Date = new Date()): number {
  return Math.round((parseISO(expiresOn) - parseISO(todayISO(now))) / DAY_MS)
}

export function freshnessFor(days: number): Freshness {
  if (days < 0) return 'expired'
  if (days <= 3) return 'soon'
  return 'fresh'
}

/** Badge text always carries a label; colour alone never carries the state. */
export function badgeLabel(days: number): string {
  if (days < 0) return 'gone'
  if (days === 0) return 'today'
  return `${days}d`
}
