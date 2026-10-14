# Shelf Life

Photograph a grocery receipt, or paste its text, and the app reads it. You confirm the items, and they land in your fridge inventory with an estimated expiry. The fridge shows what to use soon, and one button tells you what to cook with it.

UK households bin roughly a thousand pounds of food a year, so a few pounds a month to stop that is an easy sale.

Live: https://shelflife-self.vercel.app

## Run it

```
pnpm install
cp .env.example .env.local   # ANTHROPIC_API_KEY, DATABASE_URL
pnpm db:push                 # drizzle-kit push against Neon
pnpm dev                     # http://localhost:3000, /preview shows every component with fixtures
pnpm test                    # two vitest suites
pnpm build
```

No accounts: the first write creates a `household` row and sets an httpOnly cookie. Press **Try a sample receipt** on the home page to run the real flow over `samples/receipt-1.jpg`.

## How it works

1. **Add a receipt.** Drag or pick a photo, paste the text, or press the sample button. Photos are re-encoded to JPEG on the client (1600 px long edge, quality 0.8) so an iPhone HEIC works and the upload stays under 5 MB.
2. **Extract.** One Claude vision call (`claude-sonnet-5-5`, structured output) returns line items: name, qty, unit, category, shelfLifeDays, isFood. The result is validated with zod before anything else happens.
3. **Confirm.** Edit names, quantities, categories and expiry dates; untick the junk. Nothing is written before Save, and Save is idempotent per receipt.
4. **Inventory.** Items grouped into six fridge zones, soonest expiry first, expired marked. Tap to mark used or binned, or change a date. Manual add works without a camera.
5. **What can I cook.** One Claude call over the in-stock items returns three dishes that use the soonest-expiring items first, with what each uses and the one or two things to buy. Cached on the household until the inventory changes, then shown as stale.

## Data model (Postgres on Neon, Drizzle)

- `households`: id, token (unique, 32 chars, lives in the cookie), created_at, suggestions jsonb, suggestions_key, suggestions_at
- `receipts`: id, household_id, source (image | text | sample), extracted jsonb (validated model output), client_key (unique, makes Save idempotent), created_at
- `items`: id, household_id, receipt_id (nullable, manual adds), name, qty, unit, category enum, bought_on, expires_on, status (in_stock | used | binned), created_at, updated_at

Indexes on `items(household_id, status, expires_on)` and `households(token)`.

## Three engineering calls

- **Expiry is an estimate and the UI says so.** Receipts carry no dates. The model proposes `shelfLifeDays` per item; a category table (dairy 7, produce 5, meat_fish 3, bakery 4, frozen 90, dry 365, drinks 30, other 7) is the fallback and the sanity bound (clamped to twice the table). Every date is editable on the confirm sheet and in the fridge.
- **The photo is not stored.** It is sent to Claude once; what is kept is the validated JSON on a `receipts` row. Less infrastructure, nothing personal sitting in a bucket, and the extraction is what the product actually needs.
- **No auth.** A household row is created on first write and its token lives in an httpOnly cookie. Every query is scoped by that household. Accounts are the first thing to add after the window.

## Edge cases handled

HEIC and oversized images (client re-encode, 5 MB cap with a plain message), a photo with no receipt in it (message, nothing saved), API failure (one retry, then a message; the pasted text and chosen file stay put with a Try again button), double submit (buttons disable while in flight; Save is idempotent), a bad or missing cookie (reads as an empty fridge, the first write makes a new household), oversized paste (8,000 character cap).

## Next (cut on purpose)

Voice input. Calorie tracking (a `meals` table logging what was cooked with the recipe's estimated kcal is the natural slot). Barcode scanning. Push or email reminders. Real expiry data from product labels. User accounts and shared households. Storing the receipt images.

## How this was built

A two hour take-home for Algosoup, built by two agents inside the window: Claude Code ("Fire") for the data, the flow and the plain component shells; Codex for the look, restyling the shells in place against `components/contract.ts`. Both unedited session logs are in `agent-logs/`.

Before the clock the repo held only context: `CLAUDE.md` (the Claude brief), `AGENTS.md` (the Codex brief), `docs/PLAN.md` (the plan and where it came from), `.gitignore` and `samples/receipt-1.jpg`. Accounts made before the clock: GitHub, Vercel, Neon, an Anthropic API key. Nothing else existed before the first scaffold commit.

Stack: Next.js (App Router, TypeScript), Tailwind, pnpm, Drizzle on Neon, `@anthropic-ai/sdk`, zod, vitest. No UI kit, no auth library, no state library.
