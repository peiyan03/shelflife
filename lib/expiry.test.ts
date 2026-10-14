import { describe, expect, it } from 'vitest'
import { FALLBACK_DAYS, addDays, badgeLabel, clampShelfLife, daysLeft, freshnessFor } from './expiry'

describe('expiry fallback table', () => {
  it('matches the product brief', () => {
    expect(FALLBACK_DAYS).toEqual({ dairy: 7, produce: 5, meat_fish: 3, bakery: 4, frozen: 90, dry: 365, drinks: 30, other: 7 })
  })

  it('falls back to the table when the model gives nothing usable', () => {
    expect(clampShelfLife('dairy', undefined)).toBe(7)
    expect(clampShelfLife('produce', 0)).toBe(5)
    expect(clampShelfLife('meat_fish', -4)).toBe(3)
    expect(clampShelfLife('dry', Number.NaN)).toBe(365)
  })

  it('keeps a sane model estimate and bounds a wild one at twice the table', () => {
    expect(clampShelfLife('produce', 8)).toBe(8)
    expect(clampShelfLife('meat_fish', 30)).toBe(6)
    expect(clampShelfLife('dairy', 0.4)).toBe(1)
  })
})

describe('freshness and badge', () => {
  it('splits fresh, soon and expired at 3 and 0 days', () => {
    expect(freshnessFor(12)).toBe('fresh')
    expect(freshnessFor(4)).toBe('fresh')
    expect(freshnessFor(3)).toBe('soon')
    expect(freshnessFor(0)).toBe('soon')
    expect(freshnessFor(-1)).toBe('expired')
  })

  it('always carries a label', () => {
    expect(badgeLabel(12)).toBe('12d')
    expect(badgeLabel(3)).toBe('3d')
    expect(badgeLabel(0)).toBe('today')
    expect(badgeLabel(-2)).toBe('gone')
  })

  it('counts calendar days without timezone drift', () => {
    const now = new Date('2026-10-14T23:30:00Z')
    expect(daysLeft('2026-10-17', now)).toBe(3)
    expect(daysLeft('2026-10-14', now)).toBe(0)
    expect(daysLeft('2026-10-13', now)).toBe(-1)
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02')
  })
})
