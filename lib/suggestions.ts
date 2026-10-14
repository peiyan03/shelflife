import { createHash } from 'node:crypto'
import type { FridgeItem } from '@/components/contract'

/** Cache key for dish suggestions: sha1 of the sorted in-stock ids with their expiry dates. */
export function suggestionsKey(items: FridgeItem[]): string {
  const parts = items.map((i) => `${i.id}:${i.expiresOn}`).sort()
  return createHash('sha1').update(parts.join('|')).digest('hex')
}
