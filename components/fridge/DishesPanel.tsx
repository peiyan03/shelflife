'use client'

import type { DishesPanelProps } from '@/components/contract'
import { DishCard } from './DishCard'

export function DishesPanel({ dishes, stale, onRefresh, busy, items }: DishesPanelProps) {
  const noStock = items.length === 0
  return <section className="dishes-panel" aria-busy={busy}>
    <header><p className="eyebrow">GOOD FOOD, ALREADY HERE</p><h2>What can I cook?</h2><p className="panel-intro">A little inspiration from your shelves.</p></header>
    <button type="button" className="button-primary refresh-button" onClick={onRefresh} disabled={busy || noStock}>{busy ? 'Thinking…' : dishes ? 'Refresh dishes ↻' : 'Suggest dishes ↗'}</button>
    {stale && dishes ? <p className="stale-note">Your fridge changed. Refresh for new ideas.</p> : null}
    {dishes?.length ? <div className="dish-list">{dishes.map((d) => <DishCard key={d.title} dish={d} items={items} />)}</div> : <div className="dish-empty"><span aria-hidden="true">🍽️</span><h3>{busy ? 'Something good is cooking.' : noStock ? 'Dinner starts on your shelf.' : 'Your next meal is in here.'}</h3><p aria-live="polite">{busy ? 'Finding ideas with what you have…' : noStock ? 'Add something to the fridge first, then come back for a little inspiration.' : 'Press Suggest dishes for three ideas using what you already have.'}</p></div>}
  </section>
}
