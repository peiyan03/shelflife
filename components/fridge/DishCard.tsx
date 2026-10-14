import type { DishCardProps } from '@/components/contract'

export function DishCard({ dish, items }: DishCardProps) {
  const uses = dish.usesItemIds.map((id) => items.find((i) => i.id === id)).filter((i) => i !== undefined)
  return (
    <article className="border p-2">
      <h3 className="font-medium">{dish.title}</h3>
      <p className="text-sm">{dish.minutes} min</p>
      <p className="text-sm">
        Uses:{' '}
        {uses.map((i) => (
          <span key={i.id} data-freshness={i.freshness}>
            {i.icon} {i.name}{' '}
          </span>
        ))}
      </p>
      {dish.missing.length ? <p className="text-sm">To buy: {dish.missing.join(', ')}</p> : null}
      <ol className="list-decimal pl-5 text-sm">
        {dish.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </article>
  )
}
