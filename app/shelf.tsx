'use client'

import { useState, useTransition } from 'react'
import { markBinned, markUsed, updateExpiry } from '@/app/actions'
import { ManualAdd } from '@/app/manual-add'
import type { Dish, ExtractedLine, FridgeItem } from '@/components/contract'
import { ConfirmSheet, DishesPanel, EmptyState, Fridge, InputStrip } from '@/components/fridge'

interface ShelfProps {
  items: FridgeItem[]
  dishes: Dish[] | null
  stale: boolean
}

// The one screen. Holds client state (confirm sheet, busy, errors); the server page feeds it data.
export function Shelf({ items, dishes, stale }: ShelfProps) {
  const [lines, setLines] = useState<ExtractedLine[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [reading, setReading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [, start] = useTransition()

  const notYet = () => setError('Receipt reading is being wired up. Add an item by hand for now.')
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn()
      if (!r.ok) setError(r.error)
    })

  return (
    <main className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">Shelf Life</h1>
      <InputStrip onText={notYet} onImage={notYet} onSample={notYet} busy={reading} error={error} />
      <ManualAdd />
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <section>
          <ConfirmSheet
            lines={lines}
            open={sheetOpen}
            onChange={setLines}
            onSave={() => setSaving(false)}
            onCancel={() => setSheetOpen(false)}
            busy={saving}
          />
          {items.length === 0 && !sheetOpen ? <EmptyState onSample={notYet} /> : null}
          <Fridge
            items={items}
            onUsed={(id) => run(() => markUsed(id))}
            onBinned={(id) => run(() => markBinned(id))}
            onExpiry={(id, date) => run(() => updateExpiry(id, date))}
          />
        </section>
        <DishesPanel dishes={dishes} stale={stale} onRefresh={() => setReading(false)} busy={false} items={items} />
      </div>
    </main>
  )
}
