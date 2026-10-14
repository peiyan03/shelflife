'use client'

import type { FridgeProps } from '@/components/contract'
import { ZONES, groupByZone } from '@/lib/zones'
import { FridgeZone } from './FridgeZone'

export function Fridge({ items, onUsed, onBinned, onExpiry }: FridgeProps) {
  const groups = groupByZone(items)
  return (
    <div className="flex flex-col gap-4">
      {ZONES.map((zone) => (
        <FridgeZone key={zone} zone={zone} items={groups[zone]} onUsed={onUsed} onBinned={onBinned} onExpiry={onExpiry} />
      ))}
    </div>
  )
}
