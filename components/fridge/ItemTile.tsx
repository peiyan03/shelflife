'use client'

import type { ItemTileProps } from '@/components/contract'
import { ExpiryBadge } from './ExpiryBadge'

export function ItemTile({ item, onUsed, onBinned, onExpiry }: ItemTileProps) {
  return (
    <li data-freshness={item.freshness} className="item-tile">
      <div className="tile-top"><span className="food-icon" aria-hidden="true">{item.icon}</span><ExpiryBadge daysLeft={item.daysLeft} freshness={item.freshness} /></div>
      <p className="tile-name">{item.name}</p>
      <p className="tile-quantity">{item.qty}{item.unit ? ` × ${item.unit}` : ''}</p>
      <details className="tile-details">
        <summary aria-label={`Actions for ${item.name}`}>Manage <span aria-hidden="true">＋</span></summary>
        <div className="tile-actions">
          {onExpiry ? <label>Estimated expiry<input type="date" value={item.expiresOn} onChange={(e) => e.target.value && onExpiry(e.target.value)} /></label> : null}
          <div className="tile-buttons"><button type="button" onClick={onUsed}>Used</button><button type="button" className="bin-button" onClick={onBinned}>Binned</button></div>
        </div>
      </details>
    </li>
  )
}
