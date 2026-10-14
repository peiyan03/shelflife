'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { addItem } from '@/app/actions'
import { CATEGORIES, type Category } from '@/components/contract'
import { FALLBACK_DAYS, addDays, todayISO } from '@/lib/expiry'

// Manual add so the app works before the camera does. Lives on /add.
export function ManualAdd() {
  const [name, setName] = useState('')
  const [qty, setQty] = useState('1')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState<Category>('produce')
  const [expiresOn, setExpiresOn] = useState(addDays(todayISO(), FALLBACK_DAYS.produce))
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const pickCategory = (c: Category) => {
    setCategory(c)
    setExpiresOn(addDays(todayISO(), FALLBACK_DAYS[c]))
  }

  return (
    <form
      className="manual-form"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        setAdded(null)
        const label = name
        start(async () => {
          const r = await addItem({ name, qty: Number(qty), unit: unit || undefined, category, expiresOn })
          if (!r.ok) setError(r.error)
          else {
            setAdded(label)
            setName('')
            setQty('1')
            setUnit('')
          }
        })
      }}
    >
      <label className="manual-name">
        Name <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
      </label>
      <label>
        Qty <input type="number" min="0.01" step="any" value={qty} onChange={(e) => setQty(e.target.value)} />
      </label>
      <label>
        Unit <input value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={20} placeholder="e.g. 1L" />
      </label>
      <label>
        Category{' '}
        <select value={category} onChange={(e) => pickCategory(e.target.value as Category)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace('_', ' & ')}
            </option>
          ))}
        </select>
      </label>
      <label>
        Estimated expiry <input type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} required />
      </label>
      <div className="manual-actions">
        <button type="submit" className="button-primary" disabled={pending}>
          {pending ? 'Adding…' : 'Add to fridge'}
        </button>
        <Link href="/">Back to your fridge</Link>
      </div>
      {added ? (
        <p className="notice" aria-live="polite">
          Added {added}. It is in your fridge now.
        </p>
      ) : null}
      {error ? (
        <p className="notice" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
