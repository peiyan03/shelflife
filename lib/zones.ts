import type { Category, FridgeItem, Zone } from '@/components/contract'

export const ZONES: Zone[] = ['freezer', 'top', 'middle', 'drawer', 'door', 'cupboard']

export const ZONE_LABELS: Record<Zone, string> = {
  freezer: 'Freezer',
  top: 'Top shelf',
  middle: 'Middle shelf',
  drawer: 'Drawer',
  door: 'Door',
  cupboard: 'Cupboard',
}

const ZONE_FOR: Record<Category, Zone> = {
  frozen: 'freezer',
  dairy: 'top',
  meat_fish: 'middle',
  other: 'middle',
  produce: 'drawer',
  drinks: 'door',
  dry: 'cupboard',
  bakery: 'cupboard',
}

export function zoneFor(category: Category): Zone {
  return ZONE_FOR[category]
}

/** Groups items by zone, keeping the incoming order (callers sort "use soon" first). Every zone is present. */
export function groupByZone(items: FridgeItem[]): Record<Zone, FridgeItem[]> {
  const groups = { freezer: [], top: [], middle: [], drawer: [], door: [], cupboard: [] } as Record<Zone, FridgeItem[]>
  for (const item of items) groups[zoneFor(item.category)].push(item)
  return groups
}
