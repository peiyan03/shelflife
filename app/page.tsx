import { Shelf } from '@/app/shelf'
import type { Dish } from '@/components/contract'
import { getHousehold } from '@/lib/household'
import { listItems } from '@/lib/items'
import { suggestionsKey } from '@/lib/suggestions'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export default async function Home() {
  const household = await getHousehold()
  const items = household ? await listItems(household.id) : []
  const dishes = (household?.suggestions as Dish[] | null) ?? null
  const stale = dishes !== null && household?.suggestionsKey !== suggestionsKey(items)
  return <Shelf items={items} dishes={dishes} stale={stale} />
}
