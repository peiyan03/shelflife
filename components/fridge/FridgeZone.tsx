'use client'

import type { FridgeZoneProps } from '@/components/contract'
import { ZONE_LABELS } from '@/lib/zones'
import { ItemTile } from './ItemTile'

export function FridgeZone({ zone, items, onUsed, onBinned, onExpiry }: FridgeZoneProps) {
  const empty = items.length === 0
  return (
    <section data-zone={zone} data-empty={empty} className={empty ? 'opacity-50' : undefined}>
      <h3 className="font-medium">{ZONE_LABELS[zone]}</h3>
      {empty ? (
        <p className="text-sm">Empty</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <ItemTile
              key={item.id}
              item={item}
              onUsed={() => onUsed(item.id)}
              onBinned={() => onBinned(item.id)}
              onExpiry={onExpiry ? (date) => onExpiry(item.id, date) : undefined}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
