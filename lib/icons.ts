import type { Category } from '@/components/contract'

const CATEGORY_ICON: Record<Category, string> = {
  dairy: '🥛',
  produce: '🥦',
  meat_fish: '🍗',
  bakery: '🍞',
  frozen: '🧊',
  dry: '🥫',
  drinks: '🧃',
  other: '🛒',
}

// Name overrides, first match wins. Order matters where words overlap.
const NAME_ICONS: Array<[RegExp, string]> = [
  [/\bmilk\b/, '🥛'],
  [/\begg/, '🥚'],
  [/cheese|cheddar/, '🧀'],
  [/butter/, '🧈'],
  [/chicken/, '🍗'],
  [/beef|steak|mince/, '🥩'],
  [/fish|salmon|cod\b|tuna|prawn/, '🐟'],
  [/bread|loaf|bagel|roll/, '🍞'],
  [/apple/, '🍎'],
  [/banana/, '🍌'],
  [/tomato/, '🍅'],
  [/onion/, '🧅'],
  [/\brice\b/, '🍚'],
  [/pasta|spaghetti|penne/, '🍝'],
  [/juice/, '🧃'],
  [/beer|lager|\bale\b/, '🍺'],
  [/aubergine|eggplant/, '🍆'],
  [/mushroom/, '🍄'],
  [/orange/, '🍊'],
  [/berry|berries/, '🫐'],
  [/oat|granola|porridge/, '🥣'],
  [/olive oil|\boil\b/, '🫒'],
  [/jam|conserve|marmalade/, '🍯'],
  [/gherkin|pickle|cucumber/, '🥒'],
]

export function iconFor(name: string, category: Category): string {
  const n = name.toLowerCase()
  for (const [re, icon] of NAME_ICONS) if (re.test(n)) return icon
  return CATEGORY_ICON[category]
}
