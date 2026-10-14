'use client'

import { useEffect, useRef } from 'react'
import type { ConfirmSheetProps, ExtractedLine } from '@/components/contract'
import { CATEGORIES } from '@/components/contract'
import { addDays, daysLeft, todayISO } from '@/lib/expiry'

export function ConfirmSheet({ lines, open, onChange, onSave, onCancel, busy }: ConfirmSheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (open && dialog && !dialog.open) dialog.showModal()
    if (!open && dialog?.open) dialog.close()
  }, [open])
  if (!open) return null
  const today = todayISO()
  const update = (i: number, patch: Partial<ExtractedLine>) => onChange(lines.map((l, j) => j === i ? { ...l, ...patch } : l))
  const ticked = lines.filter((l) => l.isFood).length
  return <dialog ref={ref} className="confirm-sheet" aria-labelledby="confirm-title" aria-describedby="confirm-note" onCancel={(e) => { e.preventDefault(); if (!busy) onCancel() }}>
    <header className="confirm-header"><p className="eyebrow">ONE QUICK CHECK</p><h2 id="confirm-title">What goes on your shelf?</h2><p id="confirm-note">Expiry dates are estimates. Edit anything, untick what is not food. Nothing is saved yet.</p></header>
    <ul className="confirm-lines">{lines.map((line, i) => <li key={i} data-kept={line.isFood} className="confirm-line">
      <label className="keep-check"><input type="checkbox" checked={line.isFood} disabled={busy} onChange={(e) => update(i, { isFood: e.target.checked })} aria-label={`Keep ${line.name}`} /><span>Keep</span></label>
      <label className="confirm-name">Item<input value={line.name} disabled={busy} onChange={(e) => update(i, { name: e.target.value })} /></label>
      <label>Qty<input type="number" min={0} step="any" value={line.qty} disabled={busy} onChange={(e) => update(i, { qty: Number(e.target.value) })} /></label>
      <label>Unit<input value={line.unit ?? ''} disabled={busy} placeholder="e.g. 1L" onChange={(e) => update(i, { unit: e.target.value || undefined })} /></label>
      <label className="confirm-category">Category<select value={line.category} disabled={busy} onChange={(e) => update(i, { category: e.target.value as ExtractedLine['category'] })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' & ')}</option>)}</select></label>
      <label className="confirm-date">Est. expiry<input type="date" disabled={busy} value={addDays(today, line.shelfLifeDays)} onChange={(e) => e.target.value && update(i, { shelfLifeDays: daysLeft(e.target.value) })} /></label>
    </li>)}</ul>
    <footer className="confirm-footer"><button type="button" className="button-primary" onClick={onSave} disabled={busy || ticked === 0}>{busy ? 'Saving…' : `Save ${ticked} item${ticked === 1 ? '' : 's'}`}</button><button type="button" onClick={onCancel} disabled={busy}>Cancel</button></footer>
  </dialog>
}
