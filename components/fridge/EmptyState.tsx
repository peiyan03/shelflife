'use client'

import type { EmptyStateProps } from '@/components/contract'

export function EmptyState({ onSample }: EmptyStateProps) {
  return (
    <div className="border p-3">
      <p>Nothing here yet. Add a receipt, or</p>
      <button type="button" onClick={onSample}>
        Try a sample receipt
      </button>
    </div>
  )
}
