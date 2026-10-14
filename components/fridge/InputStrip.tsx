'use client'

import { useId, useRef, useState } from 'react'
import type { InputStripProps } from '@/components/contract'

export const MAX_TEXT = 8000

export function InputStrip({ onText, onImage, onSample, busy, error }: InputStripProps) {
  const textId = useId()
  const [text, setText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const tooLong = text.length > MAX_TEXT

  return (
    <section className="input-strip">
      <div className="input-heading"><div><p className="eyebrow">FROM SHOP TO SHELF</p><h2>Add your receipt</h2></div><p>Less forgotten. More enjoyed.</p></div>
      <label className="sr-only" htmlFor={textId}>Receipt text</label>
      <textarea
        id={textId}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste receipt text…"
        rows={3}
        disabled={busy}
      />
      {tooLong ? <p className="notice" role="alert">That is over {MAX_TEXT.toLocaleString()} characters. Trim it down.</p> : null}
      <div className="input-buttons">
        <button type="button" disabled={busy || !text.trim() || tooLong} className="button-primary" onClick={() => onText(text)}>
          Read text
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onImage(file)
            e.target.value = ''
          }}
        />
        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()}>
          <span aria-hidden="true">↗ </span>Photo
        </button>
        <button type="button" disabled={busy} className="sample-button" onClick={onSample}>
          Try a sample receipt
        </button>
      </div>
      {busy ? <p className="reading-status" aria-live="polite">Reading your receipt…</p> : null}
      {error ? <p className="notice" role="alert">{error}</p> : null}
    </section>
  )
}
