import type { ExpiryBadgeProps } from '@/components/contract'
import { badgeLabel } from '@/lib/expiry'

export function ExpiryBadge({ daysLeft, freshness }: ExpiryBadgeProps) {
  return <span data-freshness={freshness} className="expiry-badge" aria-label={`${freshness === 'soon' ? 'Use soon' : freshness === 'expired' ? 'Expired' : 'Fresh'}: ${badgeLabel(daysLeft)}`}>{badgeLabel(daysLeft)}</span>
}
