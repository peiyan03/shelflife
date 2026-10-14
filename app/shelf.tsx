'use client'

import { useState, useTransition } from 'react'
import {
  extractFromImage,
  extractFromText,
  extractSample,
  markBinned,
  markUsed,
  saveReceipt,
  updateExpiry,
  type ExtractResult,
} from '@/app/actions'
import { ManualAdd } from '@/app/manual-add'
import type { Dish, ExtractedLine, FridgeItem } from '@/components/contract'
import { ConfirmSheet, DishesPanel, EmptyState, Fridge, InputStrip } from '@/components/fridge'
import { reencodeToJpeg } from '@/lib/reencode'

interface ShelfProps {
  items: FridgeItem[]
  dishes: Dish[] | null
  stale: boolean
}

type Source = 'image' | 'text' | 'sample'

interface Pending {
  source: Source
  clientKey: string
  lines: ExtractedLine[]
}

// The one screen. Holds client state (confirm sheet, busy, errors); the server page feeds it data.
export function Shelf({ items, dishes, stale }: ShelfProps) {
  const [pending, setPending] = useState<Pending | null>(null)
  const [reading, setReading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [retry, setRetry] = useState<(() => void) | null>(null)
  const [, start] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn()
      if (!r.ok) setError(r.error)
    })

  // One extraction at a time; the button that started it is disabled while it runs.
  const extract = (source: Source, call: () => Promise<ExtractResult>) => {
    if (reading) return
    setReading(true)
    setError(undefined)
    setRetry(null)
    call()
      .then((r) => {
        if (r.ok) setPending({ source, clientKey: crypto.randomUUID(), lines: r.lines })
        else {
          setError(r.error)
          setRetry(() => () => extract(source, call))
        }
      })
      .catch(() => {
        setError('Something went wrong. Your input is still here; try again.')
        setRetry(() => () => extract(source, call))
      })
      .finally(() => setReading(false))
  }

  const onText = (text: string) => extract('text', () => extractFromText(text))
  const onSample = () => extract('sample', () => extractSample())
  const onImage = (file: File) => {
    if (reading) return
    setReading(true)
    setError(undefined)
    reencodeToJpeg(file)
      .then((jpeg) => {
        const fd = new FormData()
        fd.append('image', jpeg)
        setReading(false)
        extract('image', () => extractFromImage(fd))
      })
      .catch((e: Error) => {
        setReading(false)
        setError(e.message || 'Could not read this image.')
      })
  }

  const onSave = () => {
    if (!pending || saving) return
    setSaving(true)
    saveReceipt(pending)
      .then((r) => {
        if (r.ok) {
          setPending(null)
          setError(undefined)
        } else setError(r.error)
      })
      .catch(() => setError('Could not save those items. Try again.'))
      .finally(() => setSaving(false))
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">Shelf Life</h1>
      <InputStrip onText={onText} onImage={onImage} onSample={onSample} busy={reading} error={error} />
      {retry && !reading ? (
        <button type="button" onClick={retry} className="self-start text-sm underline">
          Try again
        </button>
      ) : null}
      <ManualAdd />
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <section className="flex flex-col gap-4">
          <ConfirmSheet
            lines={pending?.lines ?? []}
            open={pending !== null}
            onChange={(lines) => setPending((p) => (p ? { ...p, lines } : p))}
            onSave={onSave}
            onCancel={() => setPending(null)}
            busy={saving}
          />
          {items.length === 0 && !pending ? <EmptyState onSample={onSample} /> : null}
          <Fridge
            items={items}
            onUsed={(id) => run(() => markUsed(id))}
            onBinned={(id) => run(() => markBinned(id))}
            onExpiry={(id, date) => run(() => updateExpiry(id, date))}
          />
        </section>
        <DishesPanel dishes={dishes} stale={stale} onRefresh={() => {}} busy={false} items={items} />
      </div>
    </main>
  )
}
