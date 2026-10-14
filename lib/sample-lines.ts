import type { ExtractedLine } from '@/components/contract'

// A pre-read of samples/receipt-1.jpg, used only when the model cannot be called
// (no API credit on this deployment). The confirm sheet says so when it is shown.
export const SAMPLE_LINES: ExtractedLine[] = [
  { name: 'Lactofree whole milk', qty: 2, unit: '1L', category: 'dairy', shelfLifeDays: 7, isFood: true },
  { name: 'Black cherry conserve', qty: 1, unit: '370g', category: 'dry', shelfLifeDays: 365, isFood: true },
  { name: 'Extra virgin olive oil', qty: 1, unit: '1L', category: 'dry', shelfLifeDays: 365, isFood: true },
  { name: 'Pasta sauce, tomato and basil', qty: 2, unit: '350g', category: 'dry', shelfLifeDays: 365, isFood: true },
  { name: 'Protein granola, brownie and caramel', qty: 2, unit: '400g', category: 'dry', shelfLifeDays: 180, isFood: true },
  { name: 'Protein granola, mango and passionfruit', qty: 1, unit: '400g', category: 'dry', shelfLifeDays: 180, isFood: true },
  { name: 'Chicken breast fillets', qty: 1, unit: '2kg', category: 'meat_fish', shelfLifeDays: 3, isFood: true },
  { name: 'Aubergine', qty: 5, category: 'produce', shelfLifeDays: 6, isFood: true },
  { name: 'Closed cup mushrooms', qty: 1, unit: '400g', category: 'produce', shelfLifeDays: 4, isFood: true },
  { name: 'Italian chopped tomatoes', qty: 2, unit: '4x400g', category: 'dry', shelfLifeDays: 365, isFood: true },
  { name: 'Oranges', qty: 2, unit: 'x4', category: 'produce', shelfLifeDays: 8, isFood: true },
  { name: 'Pickled gherkins', qty: 1, unit: '700g', category: 'dry', shelfLifeDays: 365, isFood: true },
  { name: 'Porridge oats', qty: 1, unit: '1kg', category: 'dry', shelfLifeDays: 365, isFood: true },
  { name: 'Berry mix', qty: 1, unit: '1kg', category: 'frozen', shelfLifeDays: 90, isFood: true },
]
