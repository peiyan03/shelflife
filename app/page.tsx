import { Shelf } from '@/app/shelf'
import { getHousehold } from '@/lib/household'
import { listItems } from '@/lib/items'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export default async function Home() {
  const household = await getHousehold()
  const items = household ? await listItems(household.id) : []
  return <Shelf items={items} dishes={null} stale={false} />
}
