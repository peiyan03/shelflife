import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import type { HouseholdRow } from '@/db/schema'

const COOKIE = 'sl_household'
const ONE_YEAR = 60 * 60 * 24 * 365

async function lookup(): Promise<HouseholdRow | null> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token || token.length < 32) return null
  const rows = await db().select().from(schema.households).where(eq(schema.households.token, token)).limit(1)
  return rows[0] ?? null
}

/** Read-only: the household for this browser, or null. Safe to call while rendering. */
export async function getHousehold(): Promise<HouseholdRow | null> {
  try {
    return await lookup()
  } catch {
    return null
  }
}

/**
 * For server actions only (they may set cookies). A missing or unknown cookie
 * yields a fresh household rather than an error.
 */
export async function getOrCreateHousehold(): Promise<HouseholdRow> {
  const existing = await lookup()
  if (existing) return existing
  const token = randomBytes(24).toString('base64url') // 32 chars
  const [row] = await db().insert(schema.households).values({ token }).returning()
  ;(await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_YEAR,
  })
  return row
}
