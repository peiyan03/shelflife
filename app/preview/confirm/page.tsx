'use client'

import { useState } from 'react'
import { fixtureItems, fixtureLines } from '@/components/fixtures'
import { ConfirmSheet, Fridge } from '@/components/fridge'
import type { ExtractedLine } from '@/components/contract'

const noop = () => {}

export default function ConfirmPreview() {
  const [lines, setLines] = useState<ExtractedLine[]>(fixtureLines)
  const [open, setOpen] = useState(true)
  return <main><h1>Shelf Life</h1><button onClick={() => setOpen(true)}>Review sample</button><Fridge items={fixtureItems} onUsed={noop} onBinned={noop} onExpiry={noop} /><ConfirmSheet lines={lines} open={open} onChange={setLines} onSave={() => setOpen(false)} onCancel={() => setOpen(false)} busy={false} /></main>
}
