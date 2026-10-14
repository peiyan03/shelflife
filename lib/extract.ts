import { z } from 'zod'
import { CATEGORIES, type ExtractedLine } from '@/components/contract'
import { clampShelfLife } from '@/lib/expiry'

// What the model must return for a receipt. Validated before anything touches the database.
export const extractedLineSchema = z.object({
  name: z.string().trim().min(1).max(80),
  qty: z.number().positive().finite().max(99),
  unit: z.string().trim().max(20).optional(),
  category: z.enum(CATEGORIES),
  shelfLifeDays: z.number().int().min(0).max(400),
  isFood: z.boolean(),
})

export const extractionSchema = z.object({
  items: z.array(extractedLineSchema).max(100),
})

export type Extraction = z.infer<typeof extractionSchema>

export class NoReceiptError extends Error {
  constructor() {
    super('No receipt found')
    this.name = 'NoReceiptError'
  }
}

/** Apply the shelf-life sanity bound; drop empty units. Throws NoReceiptError when nothing was read. */
export function normaliseLines(extraction: Extraction): ExtractedLine[] {
  const lines = extraction.items.map((l) => ({
    name: l.name,
    qty: l.qty,
    unit: l.unit || undefined,
    category: l.category,
    shelfLifeDays: clampShelfLife(l.category, l.shelfLifeDays),
    isFood: l.isFood,
  }))
  if (lines.length === 0) throw new NoReceiptError()
  return lines
}

// The lines the user edited on the confirm sheet, re-checked before saving.
export const confirmedLineSchema = extractedLineSchema.extend({
  shelfLifeDays: z.number().int().min(0).max(800),
})
export const confirmedLinesSchema = z.array(confirmedLineSchema).min(1).max(100)
