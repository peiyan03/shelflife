import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="page-narrow about-page">
      <p className="eyebrow">WHY THIS EXISTS</p>
      <h1 className="page-title">About Shelf Life</h1>
      <p className="page-intro">
        Photograph a grocery receipt, or paste its text, and the app reads it. You confirm the items, and they land in
        your fridge with an estimated expiry. The fridge shows what to use soon, and one button tells you what to cook
        with it.
      </p>
      <p>UK households bin roughly a thousand pounds of food a year, so a few pounds a month to stop that is an easy sale.</p>

      <h2>Three engineering calls</h2>
      <ul>
        <li>
          <strong>Expiry is an estimate and the app says so.</strong> Receipts carry no dates. The model proposes a
          shelf life per item; a category table is the fallback and the sanity bound. Every date is editable on the
          confirm sheet and in the fridge.
        </li>
        <li>
          <strong>The photo is not stored.</strong> It is sent to the model once; what is kept is the validated list of
          items. Less infrastructure, nothing personal sitting in a bucket.
        </li>
        <li>
          <strong>No accounts.</strong> A household is created on first use and lives in a cookie. Every query is scoped
          to it. Accounts are the first thing to add next.
        </li>
      </ul>

      <h2>Next</h2>
      <p>
        Voice input, calorie tracking, barcode scanning, reminders, real expiry data from product labels, user accounts
        and shared households, storing receipt images. All cut on purpose for this version.
      </p>

      <p>
        <Link href="/">Back to your fridge</Link>
      </p>
    </main>
  )
}
