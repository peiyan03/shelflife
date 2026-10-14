// The component contract. Codex builds the look against these props; Fire owns the data.
// Nobody changes a prop without saying so.

export const CATEGORIES = ['dairy', 'produce', 'meat_fish', 'bakery', 'frozen', 'dry', 'drinks', 'other'] as const
export type Category = (typeof CATEGORIES)[number]
export type Zone = 'freezer' | 'top' | 'middle' | 'drawer' | 'door' | 'cupboard'
export type Freshness = 'fresh' | 'soon' | 'expired'

export interface FridgeItem {
  id: string
  name: string
  qty: number
  unit?: string
  category: Category
  boughtOn: string // YYYY-MM-DD
  expiresOn: string // YYYY-MM-DD
  daysLeft: number
  freshness: Freshness
  icon: string
}

export interface ExtractedLine {
  name: string
  qty: number
  unit?: string
  category: Category
  shelfLifeDays: number
  isFood: boolean
}

export interface Dish {
  title: string
  minutes: number
  usesItemIds: string[]
  missing: string[]
  steps: string[]
}

// presentational: Codex owns the look, Fire owns the data

export interface InputStripProps {
  onText: (text: string) => void
  onImage: (file: File) => void
  onSample: () => void
  busy: boolean
  error?: string
}

export interface FridgeProps {
  items: FridgeItem[]
  onUsed: (id: string) => void
  onBinned: (id: string) => void
  /** optional: edit an item's expiry date in place (YYYY-MM-DD) */
  onExpiry?: (id: string, expiresOn: string) => void
}

export interface FridgeZoneProps {
  zone: Zone
  items: FridgeItem[]
  onUsed: (id: string) => void
  onBinned: (id: string) => void
  onExpiry?: (id: string, expiresOn: string) => void
}

export interface ItemTileProps {
  item: FridgeItem
  onUsed: () => void
  onBinned: () => void
  onExpiry?: (expiresOn: string) => void
}

export interface ExpiryBadgeProps {
  daysLeft: number
  freshness: Freshness
}

export interface ConfirmSheetProps {
  lines: ExtractedLine[]
  open: boolean
  onChange: (lines: ExtractedLine[]) => void
  onSave: () => void
  onCancel: () => void
  busy: boolean
}

export interface DishesPanelProps {
  dishes: Dish[] | null
  stale: boolean
  onRefresh: () => void
  busy: boolean
  items: FridgeItem[]
}

export interface DishCardProps {
  dish: Dish
  items: FridgeItem[]
}

export interface EmptyStateProps {
  onSample: () => void
}
