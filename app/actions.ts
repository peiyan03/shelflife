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

// ---- Receipts ----------------------------------------------------------------

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { ExtractedLine } from '@/components/contract'
import { IMAGE_TYPES, extractReceipt, type ImageMediaType } from '@/lib/ai'
import { NoReceiptError, confirmedLinesSchema } from '@/lib/extract'
import { addDays } from '@/lib/expiry'

export type ExtractResult = { ok: true; lines: ExtractedLine[] } | { ok: false; error: string }

export const MAX_TEXT = 8000

async function runExtract(input: Parameters<typeof extractReceipt>[0]): Promise<ExtractResult> {
  try {
    const lines = await extractReceipt(input)
    return { ok: true, lines }
  } catch (e) {
    if (e instanceof NoReceiptError) {
      return { ok: false, error: 'Could not read a receipt there. Try a clearer photo, or paste the text.' }
    }
    console.error('extract', e)
    return { ok: false, error: 'The receipt reader did not answer. Your input is still here; try again.' }
  }
}

export async function extractFromText(text: string): Promise<ExtractResult> {
  const trimmed = (text ?? '').trim()
  if (!trimmed) return { ok: false, error: 'Paste some receipt text first.' }
  if (trimmed.length > MAX_TEXT) {
    return { ok: false, error: `That is over ${MAX_TEXT.toLocaleString()} characters. Trim it down.` }
  }
  return runExtract({ text: trimmed })
}

export async function extractFromImage(formData: FormData): Promise<ExtractResult> {
  const file = formData.get('image')
  if (!(file instanceof File)) return { ok: false, error: 'Pick a photo first.' }
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: 'That image is over 5 MB. Try a smaller photo.' }
  if (!IMAGE_TYPES.includes(file.type as ImageMediaType)) {
    return { ok: false, error: 'Use a JPEG, PNG, WebP or GIF photo.' }
  }
  const data = Buffer.from(await file.arrayBuffer()).toString('base64')
  return runExtract({ image: { data, mediaType: file.type as ImageMediaType } })
}

/** The "Try a sample receipt" button: the real flow over samples/receipt-1.jpg. */
export async function extractSample(): Promise<ExtractResult> {
  try {
    const buf = await readFile(path.join(process.cwd(), 'samples', 'receipt-1.jpg'))
    return runExtract({ image: { data: buf.toString('base64'), mediaType: 'image/jpeg' } })
  } catch (e) {
    console.error('sample', e)
    return { ok: false, error: 'The sample receipt is missing from this deployment.' }
  }
}

const saveSchema = z.object({
  source: z.enum(['image', 'text', 'sample']),
  clientKey: z.string().uuid(),
  lines: confirmedLinesSchema,
})
export type SaveInput = z.infer<typeof saveSchema>

/**
 * The only write from a receipt. Idempotent per clientKey: a second save of the same
 * extraction inserts nothing. Unticked lines are kept in `extracted` but not as items.
 */
export async function saveReceipt(input: SaveInput): Promise<ActionResult & { saved?: number }> {
  const parsed = saveSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Check the items: every kept line needs a name and a quantity.' }
  const { source, clientKey, lines } = parsed.data
  const keep = lines.filter((l) => l.isFood)
  if (keep.length === 0) return { ok: false, error: 'Tick at least one item to save.' }
  try {
    const household = await getOrCreateHousehold()
    const existing = await db()
      .select({ id: schema.receipts.id })
      .from(schema.receipts)
      .where(eq(schema.receipts.clientKey, clientKey))
      .limit(1)
    if (existing.length) {
      revalidatePath('/')
      return { ok: true, saved: 0 }
    }
    const receiptId = crypto.randomUUID()
    const today = todayISO()
    await db().batch([
      db().insert(schema.receipts).values({
        id: receiptId,
        householdId: household.id,
        source,
        extracted: lines,
        clientKey,
      }),
      db()
        .insert(schema.items)
        .values(
          keep.map((l) => ({
            householdId: household.id,
            receiptId,
            name: l.name,
            qty: l.qty,
            unit: l.unit || null,
            category: l.category,
            boughtOn: today,
            expiresOn: addDays(today, l.shelfLifeDays),
          })),
        ),
    ])
    revalidatePath('/')
    return { ok: true, saved: keep.length }
  } catch (e) {
    console.error('saveReceipt', e)
    return { ok: false, error: 'Could not save those items. Try again.' }
  }
}

// ---- Dishes -----------------------------------------------------------------

import { suggestDishes } from '@/lib/ai'
import { listItems } from '@/lib/items'
import { suggestionsKey } from '@/lib/suggestions'

/** On demand: three dishes from the in-stock items, cached on the household against a key of those items. */
export async function refreshDishes(): Promise<ActionResult> {
  try {
    const household = await getOrCreateHousehold()
    const items = await listItems(household.id)
    if (items.length === 0) return { ok: false, error: 'Add something to the fridge first.' }
    const dishes = await suggestDishes(items)
    await db()
      .update(schema.households)
      .set({ suggestions: dishes, suggestionsKey: suggestionsKey(items), suggestionsAt: new Date() })
      .where(eq(schema.households.id, household.id))
    revalidatePath('/')
    return { ok: true }
  } catch (e) {
    console.error('refreshDishes', e)
    return { ok: false, error: 'Could not get dishes just now. Try again.' }
  }
}
