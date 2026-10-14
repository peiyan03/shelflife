'use client'

import type { ItemTileProps } from '@/components/contract'
import { ExpiryBadge } from './ExpiryBadge'

export function ItemTile({ item, onUsed, onBinned, onExpiry }: ItemTileProps) {
  return (
    <li data-freshness={item.freshness} className="border p-2">
      <div className="flex items-center justify-between">
        <span aria-hidden="true">{item.icon}</span>
        <ExpiryBadge daysLeft={item.daysLeft} freshness={item.freshness} />
      </div>
      <p>{item.name}</p>
      <p className="text-sm">
        {item.qty}
        {item.unit ? ` × ${item.unit}` : ''}
      </p>
      {onExpiry ? (
        <label className="block text-xs">
          Expires{' '}
          <input type="date" value={item.expiresOn} onChange={(e) => e.target.value && onExpiry(e.target.value)} />
        </label>
      ) : null}
      <div className="flex gap-2 text-sm">
        <button type="button" onClick={onUsed}>
          Used
        </button>
        <button type="button" onClick={onBinned}>
          Binned
        </button>
      </div>
    </li>
  )
}
