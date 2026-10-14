import { NextResponse } from 'next/server'
import { addItem, markBinned, markUsed, saveReceipt, updateExpiry } from '@/app/actions'
import { getHousehold } from '@/lib/household'
import { listItems } from '@/lib/items'
import { SAMPLE_LINES } from '@/lib/sample-lines'

export const dynamic = 'force-dynamic'

/**
 * Dev-only: walks every database action through the real Next runtime (cookies included)
 * for the household of the calling browser. 404 in production.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') return new NextResponse(null, { status: 404 })
  const log: Record<string, unknown> = {}

  log.add = await addItem({ name: 'Selftest milk', qty: 1, unit: '1L', category: 'dairy', expiresOn: '2026-10-20' })
  const h1 = await getHousehold()
  log.household = h1 ? 'found' : 'missing'
  if (!h1) return NextResponse.json(log, { status: 500 })

  let items = await listItems(h1.id)
  const milk = items.find((i) => i.name === 'Selftest milk')
  log.afterAdd = { count: items.length, milk: milk ? { freshness: milk.freshness, daysLeft: milk.daysLeft, icon: milk.icon } : null }

  const key = crypto.randomUUID()
  log.save1 = await saveReceipt({ source: 'sample', clientKey: key, lines: SAMPLE_LINES })
  log.save2 = await saveReceipt({ source: 'sample', clientKey: key, lines: SAMPLE_LINES }) // idempotent
  items = await listItems(h1.id)
  log.afterSave = { count: items.length, first: items[0]?.name, firstDays: items[0]?.daysLeft }

  if (milk) {
    log.expiry = await updateExpiry(milk.id, '2026-10-15')
    log.used = await markUsed(milk.id)
  }
  const chicken = items.find((i) => i.name === 'Chicken breast fillets')
  if (chicken) log.binned = await markBinned(chicken.id)
  items = await listItems(h1.id)
  log.afterStatus = { count: items.length, names: items.map((i) => i.name).slice(0, 4) }
  return NextResponse.json(log)
}
