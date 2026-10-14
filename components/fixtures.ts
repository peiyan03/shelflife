import type { Dish, ExtractedLine, FridgeItem } from '@/components/contract'
import { addDays, daysLeft, freshnessFor, todayISO } from '@/lib/expiry'
import { iconFor } from '@/lib/icons'

// Fixtures for /preview. Drawn from the sample receipt (a Sainsbury's order) so the
// preview looks like the real thing. Dates are relative to today so freshness is stable.

const today = todayISO()

function item(
  id: string,
  name: string,
  qty: number,
  category: FridgeItem['category'],
  inDays: number,
  unit?: string,
): FridgeItem {
  const expiresOn = addDays(today, inDays)
  const left = daysLeft(expiresOn)
  return {
    id,
    name,
    qty,
    unit,
    category,
    boughtOn: addDays(today, -2),
    expiresOn,
    daysLeft: left,
    freshness: freshnessFor(left),
    icon: iconFor(name, category),
  }
}

// 12 items: every zone, every freshness state (soon: milk, chicken, aubergine; expired: mince).
export const fixtureItems: FridgeItem[] = [
  item('fx-berries', 'Berry mix', 1, 'frozen', 60, '1kg'),
  item('fx-peas', 'Garden peas', 1, 'frozen', 88, '900g'),
  item('fx-milk', 'Lactofree whole milk', 2, 'dairy', 3, '1L'),
  item('fx-eggs', 'Free range eggs', 1, 'dairy', 9, '12'),
  item('fx-cheddar', 'Mature cheddar', 1, 'dairy', 12, '350g'),
  item('fx-chicken', 'Chicken breast fillets', 1, 'meat_fish', 0, '2kg'),
  item('fx-mince', 'Beef mince', 1, 'meat_fish', -1, '500g'),
  item('fx-aubergine', 'Aubergine', 5, 'produce', 2),
  item('fx-mushrooms', 'Closed cup mushrooms', 1, 'produce', 4, '400g'),
  item('fx-oranges', 'Oranges', 2, 'produce', 6, 'x4'),
  item('fx-oj', 'Orange juice', 1, 'drinks', 20, '1L'),
  item('fx-oats', 'Porridge oats', 1, 'dry', 300, '1kg'),
]

export const fixtureDishes: Dish[] = [
  {
    title: 'Chicken and aubergine traybake',
    minutes: 40,
    usesItemIds: ['fx-chicken', 'fx-aubergine', 'fx-mushrooms'],
    missing: ['garlic', 'lemon'],
    steps: [
      'Heat the oven to 200C and cut the aubergine into chunks.',
      'Toss chicken, aubergine and mushrooms with oil, garlic and salt.',
      'Roast for 30 minutes, turning once.',
      'Squeeze over lemon and serve.',
    ],
  },
  {
    title: 'Mushroom and cheddar omelette',
    minutes: 15,
    usesItemIds: ['fx-eggs', 'fx-mushrooms', 'fx-cheddar', 'fx-milk'],
    missing: [],
    steps: [
      'Fry the sliced mushrooms until golden.',
      'Whisk three eggs with a splash of milk.',
      'Pour over the mushrooms and cook until just set.',
      'Scatter cheddar, fold and serve.',
    ],
  },
  {
    title: 'Overnight oats with berries',
    minutes: 10,
    usesItemIds: ['fx-oats', 'fx-milk', 'fx-berries'],
    missing: ['honey'],
    steps: [
      'Mix oats and milk in a jar.',
      'Stir through a handful of frozen berries.',
      'Leave in the fridge overnight.',
      'Top with honey in the morning.',
    ],
  },
]

// 6 lines from a receipt read, including one non-food line and one multibuy.
export const fixtureLines: ExtractedLine[] = [
  { name: 'Lactofree whole milk', qty: 2, unit: '1L', category: 'dairy', shelfLifeDays: 7, isFood: true },
  { name: 'Chicken breast fillets', qty: 1, unit: '2kg', category: 'meat_fish', shelfLifeDays: 3, isFood: true },
  { name: 'Italian chopped tomatoes', qty: 2, unit: '4x400g', category: 'dry', shelfLifeDays: 365, isFood: true },
  { name: 'Aubergine', qty: 5, category: 'produce', shelfLifeDays: 5, isFood: true },
  { name: 'Kitchen roll', qty: 1, unit: '2 pack', category: 'other', shelfLifeDays: 365, isFood: false },
  { name: 'Porridge oats', qty: 1, unit: '1kg', category: 'dry', shelfLifeDays: 365, isFood: true },
]
