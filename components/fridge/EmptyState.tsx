'use client'

import type { EmptyStateProps } from '@/components/contract'

export function EmptyState({ onSample }: EmptyStateProps) {
  return <div className="empty-state"><span aria-hidden="true">🥬</span><div><h2>A fresh start.</h2><p>Add a receipt to fill your shelves. No receipt handy?</p><button type="button" onClick={onSample}>Try a sample receipt ↗</button></div></div>
}
