import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from '@/db/schema'

let cached: NeonHttpDatabase<typeof schema> | null = null

/** Lazily built so a missing DATABASE_URL never throws at import or build time. */
export function db(): NeonHttpDatabase<typeof schema> {
  if (cached) return cached
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  cached = drizzle(neon(url), { schema })
  return cached
}

export { schema }
