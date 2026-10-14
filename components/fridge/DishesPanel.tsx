'use client'

import type { DishesPanelProps } from '@/components/contract'
import { DishCard } from './DishCard'

export function DishesPanel({ dishes, stale, onRefresh, busy, items }: DishesPanelProps) {
  const noStock = items.length === 0
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="font-medium">What can I cook</h2>
        <button type="button" onClick={onRefresh} disabled={busy || noStock}>
          {busy ? 'Thinking…' : dishes ? 'Refresh dishes' : 'Suggest dishes'}
        </button>
      </div>
      {stale && dishes ? <p className="text-sm">Your fridge changed since these were made.</p> : null}
      {noStock ? <p className="text-sm">Add something to the fridge first.</p> : null}
      {dishes && dishes.length ? (
        <div className="flex flex-col gap-2">
          {dishes.map((d) => (
            <DishCard key={d.title} dish={d} items={items} />
          ))}
        </div>
      ) : !noStock ? (
        <p className="text-sm">No dishes yet. Press the button.</p>
      ) : null}
    </section>
  )
}
