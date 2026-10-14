import { and, asc, eq } from 'drizzle-orm'
import type { FridgeItem } from '@/components/contract'
import { db, schema } from '@/lib/db'
import { daysLeft, freshnessFor } from '@/lib/expiry'
import { iconFor } from '@/lib/icons'
import type { ItemRow } from '@/db/schema'

export function toFridgeItem(row: ItemRow): FridgeItem {
  const left = daysLeft(row.expiresOn)
  return {
    id: row.id,
    name: row.name,
    qty: row.qty,
    unit: row.unit ?? undefined,
    category: row.category,
    boughtOn: row.boughtOn,
    expiresOn: row.expiresOn,
    daysLeft: left,
    freshness: freshnessFor(left),
    icon: iconFor(row.name, row.category),
  }
}

/** In-stock items, soonest expiry first, so "use soon" leads inside every zone. */
export async function listItems(householdId: string): Promise<FridgeItem[]> {
  const rows = await db()
    .select()
    .from(schema.items)
    .where(and(eq(schema.items.householdId, householdId), eq(schema.items.status, 'in_stock')))
    .orderBy(asc(schema.items.expiresOn), asc(schema.items.createdAt))
  return rows.map(toFridgeItem)
}
