'use client'

import { useRef, useState } from 'react'
import type { InputStripProps } from '@/components/contract'

export const MAX_TEXT = 8000

export function InputStrip({ onText, onImage, onSample, busy, error }: InputStripProps) {
  const [text, setText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const tooLong = text.length > MAX_TEXT

  return (
    <section className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste receipt text…"
        rows={3}
        disabled={busy}
      />
      {tooLong ? <p role="alert">That is over {MAX_TEXT.toLocaleString()} characters. Trim it down.</p> : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy || !text.trim() || tooLong} onClick={() => onText(text)}>
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
          Photo
        </button>
        <button type="button" disabled={busy} onClick={onSample}>
          Try a sample receipt
        </button>
      </div>
      {busy ? <p aria-live="polite">Reading…</p> : null}
      {error ? <p role="alert">{error}</p> : null}
    </section>
  )
}
