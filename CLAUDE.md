# Shelf Life

Take-home for Algosoup. **Two hour hard cap.** This file and `.gitignore` were written before the clock started; everything else in the repo is built inside the window. The full unedited session log is submitted with the repo.

## The product

You photograph a grocery receipt (or paste its text). The app reads it, you confirm the items, and they land in your fridge inventory with an estimated expiry. The inventory shows what to use soon, and one button tells you what to cook with it.

Built from a real problem at home: food bought, forgotten, thrown away. The belief: UK households bin roughly a thousand pounds of food a year, so a few pounds a month to stop that is an easy sale. One line of that in the README is enough, no market research.

It is a **web product**: one URL on Vercel, works in a laptop browser first (drag a photo, or paste text), the same page on a phone uses the camera through the normal file input. No app store, nothing installed.

## Core flow (all of this must work live)

1. **Add a receipt.** Drag or pick an image, or paste the receipt text. A **"Try a sample receipt"** button loads `samples/receipt-1.jpg` (or the sample text if no image is present) and runs the real flow, so a grader with no receipt in hand can see the loop in one click.
2. **Extract.** One Claude vision call returns line items: `name`, `qty`, `unit`, `category`, `shelf_life_days`, `is_food`. Non-food lines are shown but unticked.
3. **Confirm.** The user edits names, quantities and expiry dates, unticks junk, then saves. **Nothing is written to the inventory before this step.** Receipt text is messy (abbreviations, multibuys, bags, deposits) and the confirm screen is where the product earns trust.
4. **Inventory.** Items sorted by expiry, "use soon" (3 days or fewer) on top, expired marked. Tap to mark **used** or **binned**. Manual add exists so the app works before the camera does.
5. **What can I cook.** One Claude call over the in-stock items returns three recipes that use the soonest-expiring items first, each with the items it uses and the one or two things to buy.

## Cut, on purpose (name these in the README under "Next")

Calorie tracking (a `meals` table logging what was cooked with the recipe's estimated kcal is the natural slot), barcode scanning, push or email reminders, real expiry data from product labels, user accounts and shared households, storing the receipt images.

## Three engineering calls

- **Expiry is an estimate and the UI says so.** Receipts carry no dates. The model proposes `shelf_life_days` per item; a category table is the fallback and the sanity bound: dairy 7, fresh produce 5, meat and fish 3, bakery 4, frozen 90, dry and tinned 365. Every date is editable on the confirm screen and in the inventory.
- **The photo is not stored.** It is sent to Claude once; what is kept is the extracted JSON on a `receipts` row. Less infrastructure, better privacy, say why in the README.
- **No auth.** A `household` row is created on first visit and its token lives in an httpOnly cookie. Every query is scoped by that household. Accounts are the first thing to add after the window.

## Data model (Postgres on Neon, Drizzle)

- `households`: `id`, `token` (unique, random, 32+ chars), `created_at`
- `receipts`: `id`, `household_id`, `source` (`image` | `text` | `sample`), `extracted` (jsonb, the model output after validation), `created_at`
- `items`: `id`, `household_id`, `receipt_id` (nullable, manual adds), `name`, `qty` (numeric), `unit` (text, nullable), `category` (enum: dairy, produce, meat_fish, bakery, frozen, dry, drinks, other), `bought_on` (date), `expires_on` (date), `status` (enum: in_stock, used, binned), `created_at`, `updated_at`

Indexes on `items(household_id, status, expires_on)` and `households(token)`.

## Stack and conventions

- Next.js (App Router, TypeScript), Tailwind. Server actions or route handlers, whichever is simpler for the step. Keep components small and plain; no UI kit unless it saves real time.
- Drizzle ORM with `drizzle-kit push` against Neon. `DATABASE_URL` from Vercel's Neon integration.
- `@anthropic-ai/sdk`. Model `claude-sonnet-5-5` for both the receipt read and the recipes; drop to `claude-haiku-5-5` only if latency hurts. Ask for structured JSON (tool use with a schema, or a strict JSON instruction) and **validate with zod** before anything touches the database. Load the `claude-api` skill before wiring the SDK.
- Env: `ANTHROPIC_API_KEY`, `DATABASE_URL`. Never committed. `.env.local` locally, `vercel env` for production.
- Package manager: pnpm.

## Edge cases that must be handled (not all edge cases, these ones)

- **HEIC from iPhone.** Claude vision takes jpeg, png, gif, webp only. Re-encode on the client with a canvas to JPEG (max 1600 px long edge, quality 0.8) before upload. This also shrinks the file. Reject anything over 5 MB after re-encode with a plain message.
- **Photo with no items** (blurry, not a receipt): show "could not read a receipt" and keep the user on the page, no empty save.
- **API failure or timeout:** one retry, then a clear message; the pasted text or chosen file is not lost.
- **Double submit:** disable the button while a request is in flight; the save action is idempotent per receipt.
- **Bad or missing household cookie:** create a new household, never 500.
- **Oversized paste:** cap receipt text at 8,000 characters with a message.

## Time boxes

| Time | Box |
|---|---|
| 0:00 to 0:15 | Scaffold, first commit, "hello" deployed on Vercel. A live URL exists at minute 15. |
| 0:15 to 0:40 | Schema pushed, household cookie, inventory page with manual add, mark used or binned. |
| 0:40 to 1:15 | Receipt input (file, paste, sample), vision extract, confirm screen, save. |
| 1:15 to 1:35 | Use soon ordering, recipes button. |
| 1:35 to 1:50 | Edge cases above, two small tests (zod validation of a messy extraction, expiry fallback table), README. |
| 1:50 to 2:00 | Final deploy with env vars, click the live flow on laptop and phone, export the session log to `agent-logs/`. |

If a box overruns, cut from the next box, never from the confirm screen or the live deploy.

## How to work in this repo

- Read this file first, then propose a plan for the first 40 minutes and wait for a yes. Use plan mode for the schema.
- Small commits with real messages, one per box at least. `pnpm build` must pass before every deploy.
- Do not add a dependency without saying what it saves. No auth library, no state library, no component kit by default.
- When the human says no to something, change course and move on; do not argue it back in.
- Say when a box is done and what was cut.

## Definition of done

- Live URL where the five steps above work end to end, including the sample receipt button.
- README: what it is (three sentences), the payer belief in one line, how to run it, the data model in a few lines, the three engineering calls, what was cut and why, and the exact pre-clock setup (this file, `.gitignore`, Vercel and Neon accounts, the API key).
- `agent-logs/` holds the unedited `/export` of the session.
- No secrets in the repo.
