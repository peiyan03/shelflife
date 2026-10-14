import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Liveness for the deployment: can the function reach the database. No data is returned. */
export async function GET() {
  try {
    await db().execute(sql`select 1`)
    return NextResponse.json({ ok: true, db: 'ok' })
  } catch (e) {
    console.error('health', e)
    return NextResponse.json({ ok: false, db: 'error' }, { status: 500 })
  }
}
