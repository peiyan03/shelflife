'use client'

import type { ConfirmSheetProps, ExtractedLine } from '@/components/contract'
import { CATEGORIES } from '@/components/contract'
import { addDays, daysLeft, todayISO } from '@/lib/expiry'

export function ConfirmSheet({ lines, open, onChange, onSave, onCancel, busy }: ConfirmSheetProps) {
  if (!open) return null
  const today = todayISO()
  const update = (i: number, patch: Partial<ExtractedLine>) =>
    onChange(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  const ticked = lines.filter((l) => l.isFood).length

  return (
    <div role="dialog" aria-modal="true" aria-label="Confirm items" className="border p-3">
      <h2 className="font-medium">Confirm what goes in the fridge</h2>
      <p className="text-sm">Expiry dates are estimates. Edit anything, untick what is not food.</p>
      <ul className="flex flex-col gap-2">
        {lines.map((line, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2">
            <input
              type="checkbox"
              checked={line.isFood}
              onChange={(e) => update(i, { isFood: e.target.checked })}
              aria-label={`Keep ${line.name}`}
            />
            <input value={line.name} onChange={(e) => update(i, { name: e.target.value })} aria-label="Name" />
            <input
              type="number"
              min={0}
              step="any"
              value={line.qty}
              onChange={(e) => update(i, { qty: Number(e.target.value) })}
              aria-label="Quantity"
              className="w-16"
            />
            <input
              value={line.unit ?? ''}
              onChange={(e) => update(i, { unit: e.target.value || undefined })}
              aria-label="Unit"
              className="w-20"
            />
            <select value={line.category} onChange={(e) => update(i, { category: e.target.value as ExtractedLine['category'] })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={addDays(today, line.shelfLifeDays)}
              onChange={(e) => e.target.value && update(i, { shelfLifeDays: daysLeft(e.target.value) })}
              aria-label="Expires"
            />
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button type="button" onClick={onSave} disabled={busy || ticked === 0}>
          {busy ? 'Saving…' : `Save ${ticked} item${ticked === 1 ? '' : 's'}`}
        </button>
        <button type="button" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  )
}
