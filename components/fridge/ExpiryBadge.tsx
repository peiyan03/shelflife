import type { ExpiryBadgeProps } from '@/components/contract'
import { badgeLabel } from '@/lib/expiry'

export function ExpiryBadge({ daysLeft, freshness }: ExpiryBadgeProps) {
  return (
    <span data-freshness={freshness} className="text-xs border px-1">
      {badgeLabel(daysLeft)}
    </span>
  )
}
