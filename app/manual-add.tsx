'use client'

import { useState, useTransition } from 'react'
import { addItem } from '@/app/actions'
import { CATEGORIES, type Category } from '@/components/contract'
import { FALLBACK_DAYS, addDays, todayISO } from '@/lib/expiry'

// Manual add so the app works before the camera does. Not part of the design contract.
export function ManualAdd() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [qty, setQty] = useState('1')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState<Category>('produce')
  const [expiresOn, setExpiresOn] = useState(addDays(todayISO(), FALLBACK_DAYS.produce))
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const pickCategory = (c: Category) => {
    setCategory(c)
    setExpiresOn(addDays(todayISO(), FALLBACK_DAYS[c]))
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm underline">
        Add an item by hand
      </button>
    )
  }

  return (
    <form
      className="flex flex-wrap items-end gap-2 border p-2 text-sm"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        start(async () => {
          const r = await addItem({ name, qty: Number(qty), unit: unit || undefined, category, expiresOn })
          if (!r.ok) setError(r.error)
          else {
            setName('')
            setQty('1')
            setUnit('')
          }
        })
      }}
    >
      <label>
        Name <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
      </label>
      <label>
        Qty <input type="number" min="0.01" step="any" value={qty} onChange={(e) => setQty(e.target.value)} className="w-16" />
      </label>
      <label>
        Unit <input value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={20} className="w-20" />
      </label>
      <label>
        Category{' '}
        <select value={category} onChange={(e) => pickCategory(e.target.value as Category)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label>
        Expires <input type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} required />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? 'Adding…' : 'Add'}
      </button>
      <button type="button" onClick={() => setOpen(false)}>
        Close
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </form>
  )
}
