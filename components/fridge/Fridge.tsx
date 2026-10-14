'use client'

import type { FridgeProps } from '@/components/contract'
import { ZONES, groupByZone } from '@/lib/zones'
import { FridgeZone } from './FridgeZone'

export function Fridge({ items, onUsed, onBinned, onExpiry }: FridgeProps) {
  const groups = groupByZone(items)
  return <div className="fridge">
    <header className="fridge-heading"><div><p className="eyebrow">KEEP THE GOOD STUFF</p><h2>Your fridge</h2></div><span className="fridge-stamp" aria-hidden="true">fresh<br />thinking</span></header>
    <p className="expiry-note">Expiry dates are estimates. Check your food before using it.</p>
    <div className="expiry-legend"><span data-freshness="fresh">Fresh</span><span data-freshness="soon">Use soon · 0–3d</span><span data-freshness="expired">Expired</span></div>
    {ZONES.map((zone) => <FridgeZone key={zone} zone={zone} items={groups[zone]} onUsed={onUsed} onBinned={onBinned} onExpiry={onExpiry} />)}
  </div>
}
