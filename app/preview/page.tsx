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

// Each contract component once, with the fixtures.
export default function Preview() {
  const [lines, setLines] = useState<ExtractedLine[]>(fixtureLines)
  const [open, setOpen] = useState(false)
  return (
    <main className="preview-lab flex flex-col gap-8">
      <div>
        <p className="eyebrow">FIXTURE PREVIEW</p>
        <h1 className="page-title">Components</h1>
        <p className="page-intro">The nine components of the contract, each rendered once with fixture data. The sample button opens the confirm sheet.</p>
      </div>

      <section>
        <h2>InputStrip</h2>
        <InputStrip onText={noop} onImage={noop} onSample={() => setOpen(true)} busy={false} />
      </section>

      <section>
        <h2>ExpiryBadge</h2>
        <div className="preview-badges">
          <ExpiryBadge daysLeft={12} freshness="fresh" />
          <ExpiryBadge daysLeft={3} freshness="soon" />
          <ExpiryBadge daysLeft={0} freshness="soon" />
          <ExpiryBadge daysLeft={-1} freshness="expired" />
        </div>
      </section>

      <section>
        <h2>ItemTile</h2>
        <ul className="tile-grid preview-tiles">
          <ItemTile item={fixtureItems[2]} onUsed={noop} onBinned={noop} onExpiry={noop} />
        </ul>
      </section>

      <section>
        <h2>FridgeZone</h2>
        <FridgeZone zone="top" items={fixtureItems.filter((i) => i.category === 'dairy')} onUsed={noop} onBinned={noop} />
      </section>

      <section>
        <h2>Fridge</h2>
        <Fridge items={fixtureItems} onUsed={noop} onBinned={noop} onExpiry={noop} />
      </section>

      <section>
        <h2>ConfirmSheet</h2>
        <button type="button" onClick={() => setOpen(true)}>
          Open the confirm sheet
        </button>
        <ConfirmSheet lines={lines} open={open} onChange={setLines} onSave={() => setOpen(false)} onCancel={() => setOpen(false)} busy={false} />
      </section>

      <section>
        <h2>DishCard</h2>
        <DishCard dish={fixtureDishes[0]} items={fixtureItems} />
      </section>

      <section>
        <h2>DishesPanel</h2>
        <DishesPanel dishes={fixtureDishes} stale={false} onRefresh={noop} busy={false} items={fixtureItems} />
      </section>

      <section>
        <h2>EmptyState</h2>
        <EmptyState onSample={() => setOpen(true)} />
      </section>
    </main>
  )
}
