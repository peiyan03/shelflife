import { ManualAdd } from '@/app/manual-add'

export default function AddPage() {
  return (
    <main className="page-narrow">
      <p className="eyebrow">NO RECEIPT HANDY</p>
      <h1 className="page-title">Add by hand</h1>
      <p className="page-intro">Type in what you bought. The expiry is an estimate from the category; change it if the pack says otherwise.</p>
      <ManualAdd />
    </main>
  )
}
