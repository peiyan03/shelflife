import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type { ExtractedLine } from '@/components/contract'
import { extractionSchema, normaliseLines, NoReceiptError } from '@/lib/extract'

export const MODEL = 'claude-sonnet-5-5'

export type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
export const IMAGE_TYPES: ImageMediaType[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/** True when the API answered that this key cannot be used (no credit, bad key). */
export function isUnavailable(e: unknown): boolean {
  if (!(e instanceof Anthropic.APIError)) return false
  if (e.status === 401 || e.status === 403) return true
  return e.status === 400 && /credit|billing/i.test(e.message)
}

let cached: Anthropic | null = null
function client(): Anthropic {
  // One retry, then a clear message to the user. Timeout in ms.
  cached ??= new Anthropic({ maxRetries: 1, timeout: 60_000 })
  return cached
}

const EXTRACT_SYSTEM = `You read UK grocery receipts and online order summaries and list what was bought.

Return one entry per product line. Rules:
- name: short, human, no brand noise ("Chicken breast fillets", not "Sainsbury's 2kg British Fresh Skinless & Boneless Chicken Breast Fillets"). Keep the pack size in unit, not in name.
- qty: how many of that line were bought (the receipt's quantity column). Default 1.
- unit: the pack size or count as printed, e.g. "1L", "2kg", "4x400g", "x4", "370g". Omit if none.
- category: dairy, produce, meat_fish, bakery, frozen, dry, drinks, other. Tinned, jarred and ambient goods are dry. Eggs are dairy.
- shelfLifeDays: your estimate of how many days this product keeps from purchase, as a whole number. Fresh meat and fish 2-4, milk about 7, most produce 4-10 (potatoes and onions longer), bread about 4, frozen 90, tins, jars, dried goods and oils 365.
- isFood: false for anything not eaten (kitchen roll, bags, toiletries, batteries).
Skip lines that are not products: subtotal, total, delivery, savings, coupons, discounts, loyalty points, bag charges, deposits, card details, dates, store addresses.
A multibuy such as "2 x Chopped Tomatoes 4x400g" is one entry with qty 2 and unit "4x400g".
If the input is not a receipt or lists no products, return an empty items array.`

export interface ExtractInput {
  image?: { data: string; mediaType: ImageMediaType }
  text?: string
}

/** One vision/text call. Throws NoReceiptError when nothing usable was read. */
export async function extractReceipt(input: ExtractInput): Promise<ExtractedLine[]> {
  const content: Anthropic.ContentBlockParam[] = []
  if (input.image) {
    content.push({ type: 'image', source: { type: 'base64', media_type: input.image.mediaType, data: input.image.data } })
    content.push({ type: 'text', text: 'List the products on this receipt.' })
  } else {
    content.push({ type: 'text', text: `Receipt text:\n\n${input.text ?? ''}\n\nList the products on this receipt.` })
  }

  const response = await client().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    system: EXTRACT_SYSTEM,
    messages: [{ role: 'user', content }],
    output_config: { format: zodOutputFormat(extractionSchema), effort: 'medium' },
  })

  if (response.stop_reason === 'refusal' || !response.parsed_output) throw new NoReceiptError()
  const parsed = extractionSchema.safeParse(response.parsed_output)
  if (!parsed.success) throw new NoReceiptError()
  return normaliseLines(parsed.data)
}

// ---- Dishes -----------------------------------------------------------------

import { z } from 'zod'
import type { Dish, FridgeItem } from '@/components/contract'

const dishSchema = z.object({
  title: z.string().trim().min(1).max(80),
  minutes: z.number().int().min(5).max(180),
  usesItemIds: z.array(z.string()).min(1).max(12),
  missing: z.array(z.string().trim().min(1).max(40)).max(2),
  steps: z.array(z.string().trim().min(1).max(200)).min(3).max(5),
})
export const dishesSchema = z.object({ dishes: z.array(dishSchema).length(3) })

const DISHES_SYSTEM = `You suggest home cooking from what is in someone's fridge. Return exactly three dishes.
Rules:
- Build each dish around the items expiring soonest; the list is sorted soonest first and days left are given.
- usesItemIds must only contain ids from the list. Every dish should use at least two listed items.
- missing lists at most two store-cupboard things to buy, by name ("garlic", "lemon"). Assume salt, pepper and oil are at home.
- steps: three to five short imperative sentences.
- minutes: realistic total time.
- Dishes should be different from each other and be things a tired person would actually cook on a weeknight.`

/** One call over the in-stock items. Ids the model invents are dropped. */
export async function suggestDishes(items: FridgeItem[]): Promise<Dish[]> {
  const sorted = [...items].sort((a, b) => a.daysLeft - b.daysLeft)
  const listing = sorted
    .map((i) => `- id=${i.id} | ${i.name} | ${i.qty}${i.unit ? ' x ' + i.unit : ''} | ${i.category} | ${i.daysLeft} days left`)
    .join('\n')
  const response = await client().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    system: DISHES_SYSTEM,
    messages: [{ role: 'user', content: `In the fridge, soonest first:\n${listing}\n\nWhat should I cook?` }],
    output_config: { format: zodOutputFormat(dishesSchema), effort: 'medium' },
  })
  if (response.stop_reason === 'refusal' || !response.parsed_output) throw new Error('No dishes returned')
  const parsed = dishesSchema.safeParse(response.parsed_output)
  if (!parsed.success) throw new Error('Dishes did not validate')
  const known = new Set(items.map((i) => i.id))
  return parsed.data.dishes.map((d) => ({ ...d, usesItemIds: d.usesItemIds.filter((id) => known.has(id)) }))
}
