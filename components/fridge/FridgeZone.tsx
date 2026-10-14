'use client'

import type { FridgeZoneProps } from '@/components/contract'
import { ZONE_LABELS } from '@/lib/zones'
import { ItemTile } from './ItemTile'

export function FridgeZone({ zone, items, onUsed, onBinned, onExpiry }: FridgeZoneProps) {
  const empty = items.length === 0
  return <section data-zone={zone} data-empty={empty} className="fridge-zone">
    <h3 className="zone-label">{ZONE_LABELS[zone]}<span aria-hidden="true">{String(items.length).padStart(2, '0')}</span></h3>
    {empty ? <p className="zone-empty">A little room for something good.</p> : <ul className="tile-grid">{items.map((item) => <ItemTile key={item.id} item={item} onUsed={() => onUsed(item.id)} onBinned={() => onBinned(item.id)} onExpiry={onExpiry ? (date) => onExpiry(item.id, date) : undefined} />)}</ul>}
  </section>
}
