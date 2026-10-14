import type { DishCardProps } from '@/components/contract'

export function DishCard({ dish, items }: DishCardProps) {
  const uses = dish.usesItemIds.map((id) => items.find((i) => i.id === id)).filter((i) => i !== undefined)
  return <article className="dish-card">
    <div className="dish-title"><h3>{dish.title}</h3><span className="dish-time">{dish.minutes} min</span></div>
    <p className="eyebrow dish-label">FROM YOUR FRIDGE</p>
    <ul className="ingredient-list">{uses.map((i) => <li key={i.id} data-freshness={i.freshness}><span aria-hidden="true">{i.icon}</span> {i.name}</li>)}</ul>
    {dish.missing.length ? <p className="missing-note"><strong>Just add</strong> {dish.missing.join(', ')}</p> : <p className="missing-note">You have everything you need.</p>}
    <details className="recipe-details"><summary>Let’s cook <span aria-hidden="true">＋</span></summary><ol>{dish.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></details>
  </article>
}
