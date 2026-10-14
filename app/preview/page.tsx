'use client'

import { useState } from 'react'
import type { ExtractedLine } from '@/components/contract'
import { fixtureDishes, fixtureItems, fixtureLines } from '@/components/fixtures'
import {
  ConfirmSheet,
  DishCard,
  DishesPanel,
  EmptyState,
  ExpiryBadge,
  Fridge,
  FridgeZone,
  InputStrip,
  ItemTile,
} from '@/components/fridge'

const noop = () => {}

// Every contract component with the fixtures. Codex's playground; it ships.
export default function Preview() {
  const [lines, setLines] = useState<ExtractedLine[]>(fixtureLines)
  const [open, setOpen] = useState(true)
  return (
    <main className="flex flex-col gap-8 p-4">
      <h1 className="text-xl font-semibold">Component preview</h1>

      <section>
        <h2>InputStrip</h2>
        <InputStrip onText={noop} onImage={noop} onSample={noop} busy={false} />
        <InputStrip onText={noop} onImage={noop} onSample={noop} busy={true} />
        <InputStrip onText={noop} onImage={noop} onSample={noop} busy={false} error="Could not read a receipt in that photo." />
      </section>

      <section>
        <h2>ExpiryBadge</h2>
        <ExpiryBadge daysLeft={12} freshness="fresh" />
        <ExpiryBadge daysLeft={3} freshness="soon" />
        <ExpiryBadge daysLeft={0} freshness="soon" />
        <ExpiryBadge daysLeft={-1} freshness="expired" />
      </section>

      <section>
        <h2>ItemTile</h2>
        <ul className="flex flex-wrap gap-2">
          {fixtureItems.slice(0, 3).map((item) => (
            <ItemTile key={item.id} item={item} onUsed={noop} onBinned={noop} onExpiry={noop} />
          ))}
        </ul>
      </section>

      <section>
        <h2>FridgeZone</h2>
        <FridgeZone zone="top" items={fixtureItems.filter((i) => i.category === 'dairy')} onUsed={noop} onBinned={noop} />
        <FridgeZone zone="door" items={[]} onUsed={noop} onBinned={noop} />
      </section>

      <section>
        <h2>Fridge</h2>
        <Fridge items={fixtureItems} onUsed={noop} onBinned={noop} onExpiry={noop} />
      </section>

      <section>
        <h2>ConfirmSheet</h2>
        {!open ? <button onClick={() => setOpen(true)}>Reopen</button> : null}
        <ConfirmSheet lines={lines} open={open} onChange={setLines} onSave={() => setOpen(false)} onCancel={() => setOpen(false)} busy={false} />
      </section>

      <section>
        <h2>DishCard</h2>
        <DishCard dish={fixtureDishes[0]} items={fixtureItems} />
      </section>

      <section>
        <h2>DishesPanel</h2>
        <DishesPanel dishes={fixtureDishes} stale={false} onRefresh={noop} busy={false} items={fixtureItems} />
        <DishesPanel dishes={fixtureDishes} stale={true} onRefresh={noop} busy={false} items={fixtureItems} />
        <DishesPanel dishes={null} stale={false} onRefresh={noop} busy={true} items={fixtureItems} />
        <DishesPanel dishes={null} stale={false} onRefresh={noop} busy={false} items={[]} />
      </section>

      <section>
        <h2>EmptyState</h2>
        <EmptyState onSample={noop} />
      </section>
    </main>
  )
}
