import { describe, expect, it } from 'vitest'
import { extractionSchema, normaliseLines } from './extract'

// A messy read: brand noise, a multibuy, a non-food line, a silly shelf life, an empty unit.
const messy = {
  items: [
    { name: "Sainsbury's Italian Chopped Tomatoes", qty: 2, unit: '4x400g', category: 'dry', shelfLifeDays: 365, isFood: true },
    { name: 'Chicken breast fillets', qty: 1, unit: '2kg', category: 'meat_fish', shelfLifeDays: 40, isFood: true },
    { name: 'Kitchen roll', qty: 1, unit: '', category: 'other', shelfLifeDays: 0, isFood: false },
    { name: 'Aubergine', qty: 5, category: 'produce', shelfLifeDays: 6, isFood: true },
  ],
}

describe('extraction validation', () => {
  it('accepts a messy extraction and normalises it', () => {
    const parsed = extractionSchema.parse(messy)
    const lines = normaliseLines(parsed)
    expect(lines).toHaveLength(4)
    expect(lines[0]).toMatchObject({ qty: 2, unit: '4x400g', category: 'dry', shelfLifeDays: 365 })
    expect(lines[1].shelfLifeDays).toBe(6) // 40 days of fresh chicken is bounded to twice the table
    expect(lines[2]).toMatchObject({ isFood: false, unit: undefined, shelfLifeDays: 7 }) // falls back to the table
    expect(lines[3].shelfLifeDays).toBe(6)
  })

  it('rejects an unknown category and a non-positive quantity', () => {
    expect(extractionSchema.safeParse({ items: [{ ...messy.items[0], category: 'snacks' }] }).success).toBe(false)
    expect(extractionSchema.safeParse({ items: [{ ...messy.items[0], qty: 0 }] }).success).toBe(false)
    expect(extractionSchema.safeParse({ items: [{ ...messy.items[0], name: '' }] }).success).toBe(false)
  })

  it('treats an empty read as no receipt', () => {
    expect(() => normaliseLines({ items: [] })).toThrow('No receipt found')
  })
})
