'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { CATEGORIES } from '@/components/contract'
import { db, schema } from '@/lib/db'
import { todayISO } from '@/lib/expiry'
import { getOrCreateHousehold } from '@/lib/household'

export type ActionResult = { ok: true } | { ok: false; error: string }

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')

const addItemSchema = z.object({
  name: z.string().trim().min(1).max(80),
  qty: z.number().positive().max(999),
  unit: z.string().trim().max(20).optional(),
  category: z.enum(CATEGORIES),
  expiresOn: isoDate,
})
export type AddItemInput = z.infer<typeof addItemSchema>

export async function addItem(input: AddItemInput): Promise<ActionResult> {
  const parsed = addItemSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Check the item: name, quantity and date are needed.' }
  try {
    const household = await getOrCreateHousehold()
    const v = parsed.data
    await db().insert(schema.items).values({
      householdId: household.id,
      name: v.name,
      qty: v.qty,
      unit: v.unit || null,
      category: v.category,
      boughtOn: todayISO(),
      expiresOn: v.expiresOn,
    })
    revalidatePath('/')
    return { ok: true }
  } catch (e) {
    console.error('addItem', e)
    return { ok: false, error: 'Could not save the item. Try again.' }
  }
}

async function setStatus(id: string, status: 'used' | 'binned'): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: 'Unknown item.' }
  try {
    const household = await getOrCreateHousehold()
    await db()
      .update(schema.items)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(schema.items.id, id), eq(schema.items.householdId, household.id)))
    revalidatePath('/')
    return { ok: true }
  } catch (e) {
    console.error('setStatus', e)
    return { ok: false, error: 'Could not update the item. Try again.' }
  }
}

export async function markUsed(id: string): Promise<ActionResult> {
  return setStatus(id, 'used')
}

export async function markBinned(id: string): Promise<ActionResult> {
  return setStatus(id, 'binned')
}

export async function updateExpiry(id: string, expiresOn: string): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(id).success || !isoDate.safeParse(expiresOn).success) {
    return { ok: false, error: 'Pick a valid date.' }
  }
  try {
    const household = await getOrCreateHousehold()
    await db()
      .update(schema.items)
      .set({ expiresOn, updatedAt: new Date() })
      .where(and(eq(schema.items.id, id), eq(schema.items.householdId, household.id)))
    revalidatePath('/')
    return { ok: true }
  } catch (e) {
    console.error('updateExpiry', e)
    return { ok: false, error: 'Could not change the date. Try again.' }
  }
}
