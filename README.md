# Shelf Life

Photograph a grocery receipt, or paste its text. Confirm the items. They land in your fridge with an estimated expiry, the fridge shows what to use soon, and one button tells you what to cook.

UK households bin roughly a thousand pounds of food a year, so a few pounds a month to stop that is an easy sale.

**Live:** https://shelflife-self.vercel.app

## Features

- **Receipt in, three ways.** Paste the text, pick or drag a photo (the phone's camera through the normal file input), or press **Try a sample receipt** to run the real flow over a real Sainsbury's order.
- **Reads the receipt.** One Claude vision call returns the line items: name, quantity, unit, category, estimated shelf life, and whether it is food. The result is validated with zod before anything else happens.
- **Confirm before anything is saved.** Edit names, quantities, units, categories and expiry dates; untick the junk. Nothing is written until Save, and Save cannot double-insert.
- **The fridge.** Six zones in fixed order (freezer, top shelf, middle shelf, drawer, door, cupboard), soonest expiry first, a badge on every item that always carries text (`12d`, `3d`, `today`, `gone`). Empty zones stay visible but faint.
- **Use it or lose it.** Tap an item to mark it used or binned, or change its expiry date in place.
- **What can I cook.** One button asks for three dishes built around the items expiring soonest, each with the items it uses and the one or two things to buy. Cached until the fridge changes, then marked stale.
- **Add by hand.** A form for the days without a receipt.
- **No sign-up.** A household is created on first use and lives in a cookie. Reload and it is all still there.
- **Pages.** Home holds the three sections that matter: add your receipt, your fridge, what can I cook. The menu holds `/add` (add by hand), `/preview` (every UI component rendered once with fixture data) and `/about` (why this exists).

## Placeholder mode (no API credit)

The Anthropic key used by this deployment has no credit, so the two model calls cannot run. The app says so instead of failing quietly:

- Paste and photo show a message explaining the reader is off.
- **Try a sample receipt** opens the confirm sheet with a stored pre-read of the same receipt, labelled as such inside the sheet, so the full loop (confirm, fridge, used, binned, expiry edit) can still be exercised.
- The dishes button explains why it is off.

Add credit to the key and both calls switch on with no code change. `/api/health` reports whether the deployment can reach the database; `/api/sample` serves the sample receipt image.

## Run it

```
pnpm install
cp .env.example .env.local   # ANTHROPIC_API_KEY, DATABASE_URL (Neon)
pnpm db:push                 # drizzle-kit push
pnpm dev                     # http://localhost:3000
pnpm test                    # vitest: extraction validation, expiry rules
pnpm build
```

## How it works

1. **Add a receipt.** Photos are re-encoded to JPEG on the client (1600 px long edge, quality 0.8) so an iPhone HEIC works and the upload stays under 5 MB. Text is capped at 8,000 characters.
2. **Extract.** `claude-sonnet-5-5` with structured output, parsed and validated with zod. A photo with no receipt in it returns "could not read a receipt", nothing is saved.
3. **Confirm.** The sheet is the only way into the inventory. Each extraction gets a client-side key; saving twice with the same key is a no-op.
4. **Inventory.** Items are grouped by zone from their category and sorted by expiry. Freshness is derived: `fresh` (more than 3 days), `soon` (0 to 3), `expired`.
5. **Dishes.** A second structured call over the in-stock items. The suggestions are cached on the household against a hash of the in-stock item ids and expiry dates; when the hash no longer matches, the panel shows stale.

## Data model (Postgres on Neon, Drizzle)

- `households`: id, token (unique, 32 chars, lives in the cookie), created_at, suggestions jsonb, suggestions_key, suggestions_at
- `receipts`: id, household_id, source (image | text | sample), extracted jsonb (validated model output), client_key (unique, makes Save idempotent), created_at
- `items`: id, household_id, receipt_id (nullable, manual adds), name, qty, unit, category enum, bought_on, expires_on, status (in_stock | used | binned), created_at, updated_at

Indexes on `items(household_id, status, expires_on)` and `households(token)`.

## Three engineering calls

- **Expiry is an estimate and the UI says so.** Receipts carry no dates. The model proposes a shelf life per item; a category table (dairy 7, produce 5, meat_fish 3, bakery 4, frozen 90, dry 365, drinks 30, other 7) is the fallback and the sanity bound, clamped to twice the table. Every date is editable on the confirm sheet and in the fridge.
- **The photo is not stored.** It is sent to the model once; what is kept is the validated JSON on a `receipts` row. Less infrastructure, nothing personal sitting in a bucket, and the extraction is what the product actually needs.
- **No auth.** A household row is created on first write and its token lives in an httpOnly cookie. Every query is scoped by that household. Accounts are the first thing to add after the window.

## Edge cases handled

HEIC and oversized images (client re-encode, 5 MB cap with a plain message), a photo with no receipt in it, API failure (one retry, then a message; the pasted text and chosen file stay put with a Try again button), double submit (buttons disable while in flight; Save is idempotent), a bad or missing cookie (reads as an empty fridge, the first write makes a new household), oversized paste.

## Next (cut on purpose)

Voice input. Calorie tracking (a `meals` table logging what was cooked with the recipe's estimated kcal is the natural slot). Barcode scanning. Push or email reminders. Real expiry data from product labels. User accounts and shared households. Storing the receipt images.

## How this was built

A two hour take-home for Algosoup, built inside the window by two agents working in one tree: Claude Code ("Fire") for the data, the flow and the plain component shells; Codex for the look, restyling the shells in place against `components/contract.ts`. Both unedited session logs are in `agent-logs/`.

Before the clock the repo held only context: `CLAUDE.md` (the Claude brief), `AGENTS.md` (the Codex brief), `docs/PLAN.md` (the plan and where it came from), `.gitignore` and `samples/receipt-1.jpg`. Accounts made before the clock: GitHub, Vercel, Neon, an Anthropic API key. Nothing else existed before the first scaffold commit. `design/DESIGN.md` is Codex's design spec; `dum/` holds the retired handoff briefs and QA captures.

Stack: Next.js 16 (App Router, TypeScript), Tailwind 4, pnpm, Drizzle on Neon, `@anthropic-ai/sdk`, zod, vitest. No UI kit, no auth library, no state library.
