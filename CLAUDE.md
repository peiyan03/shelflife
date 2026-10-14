# Shelf Life

Take-home for Algosoup. **Two hour hard cap.** Before the clock this repo holds only context: this file, `AGENTS.md` (the Codex brief), `docs/PLAN.md` (the full plan and where it came from), `.gitignore` and `samples/receipt-1.jpg`. Everything else is built inside the window by two agents, Claude Code (you, "Fire") and Codex, and both unedited session logs are submitted in `agent-logs/`.

Read this file, then `docs/PLAN.md`. Propose your first 40 minutes and wait for a yes. The clock starts on that yes.

## The product

You photograph a grocery receipt (or paste its text). The app reads it, you confirm the items, and they land in your fridge inventory with an estimated expiry. The fridge shows what to use soon, and one button tells you what to cook with it.

Built from a real problem at home: food bought, forgotten, thrown away. The belief: UK households bin roughly a thousand pounds of food a year, so a few pounds a month to stop that is an easy sale. One line of that in the README is enough, no market research.

It is a **web product**: one URL on Vercel, works in a laptop browser first (drag a photo, or paste text), the same page on a phone uses the camera through the normal file input. No app store, nothing installed.

## The one screen

Input strip on top (paste text, photo, "Try a sample receipt"), the fridge on the left, the dishes panel on the right, stacked in that order on a phone. The confirm sheet slides over the fridge after an extraction. Layout drawing, zone mapping and freshness rules are in `docs/PLAN.md`; the short form:

- Six zones in fixed order: freezer, top shelf, middle shelf, drawer, door, cupboard. `lib/zones.ts` maps category to zone (frozen → freezer, dairy → top, meat_fish and other → middle, produce → drawer, drinks → door, dry and bakery → cupboard). Empty zones render faint.
- Each tile: emoji icon from `lib/icons.ts`, name, quantity, expiry badge on top. Freshness from `lib/expiry.ts`: `fresh` (more than 3 days), `soon` (0 to 3), `expired`. The badge text always carries a label (`12d`, `3d`, `today`, `gone`).
- Dishes: Refresh button, up to three dish cards, cached on the household against a key of the in-stock items, `stale` when the key no longer matches.

## Core flow (all of this must work live)

1. **Add a receipt.** Drag or pick an image, or paste the receipt text. The **"Try a sample receipt"** button loads `samples/receipt-1.jpg` and runs the real flow, so a grader with no receipt in hand sees the loop in one click.
2. **Extract.** One Claude vision call returns line items: `name`, `qty`, `unit`, `category`, `shelfLifeDays`, `isFood`. Non-food lines are shown but unticked.
3. **Confirm.** The user edits names, quantities and expiry dates, unticks junk, then saves. **Nothing is written to the inventory before this step.** Receipt text is messy (abbreviations, multibuys, bags, deposits) and the confirm screen is where the product earns trust.
4. **Inventory.** Items grouped by zone, "use soon" first inside a zone, expired marked. Tap to mark **used** or **binned**. Manual add exists so the app works before the camera does.
5. **What can I cook.** On demand: one Claude call over the in-stock items returns three recipes that use the soonest-expiring items first, each with the items it uses and the one or two things to buy. Cached until the inventory changes.

## Cut, on purpose (name these in the README under "Next")

Voice input, calorie tracking (a `meals` table logging what was cooked with the recipe's estimated kcal is the natural slot), barcode scanning, push or email reminders, real expiry data from product labels, user accounts and shared households, storing the receipt images.

## Three engineering calls

- **Expiry is an estimate and the UI says so.** Receipts carry no dates. The model proposes `shelfLifeDays` per item; a category table is the fallback and the sanity bound: dairy 7, produce 5, meat_fish 3, bakery 4, frozen 90, dry 365, drinks 30, other 7. Every date is editable on the confirm screen and in the inventory.
- **The photo is not stored.** It is sent to Claude once; what is kept is the extracted JSON on a `receipts` row. Less infrastructure, better privacy, say why in the README.
- **No auth.** A `household` row is created on first visit and its token lives in an httpOnly cookie. Every query is scoped by that household. Accounts are the first thing to add after the window.

## Component contract

You write `components/contract.ts` in the first 15 minutes, exactly as laid out in `docs/PLAN.md`, plus `components/fixtures.ts` and `app/preview/page.tsx` rendering every component with the fixtures. Codex builds the look against that contract. **Never change a prop without saying so to Peiyan;** if Codex needs one, add it and say what changed.

## Working beside Codex

- Ownership by path is in `docs/PLAN.md`. Yours: `app/page.tsx`, `app/layout.tsx`, `app/actions.ts`, `app/api/**`, `lib/**`, `drizzle/**`, `db/**`, `components/contract.ts`, `components/fixtures.ts`, `README.md`, tests, `agent-logs/claude-session.md`. Codex's: `design/**`, `app/globals.css`, `app/preview/**`, and `components/fridge/**` from minute 45.
- By minute 40 every contract component exists in `components/fridge/**` as a **plain shell**: correct props, minimal semantic markup, no styling beyond what Tailwind defaults give. Codex restyles them in place from minute 45; after that you touch those files only to wire callbacks.
- You run the one dev server. Stage by path, never `git add -A`; commit only your own paths, small commits with real messages.

## Data model (Postgres on Neon, Drizzle)

- `households`: `id`, `token` (unique, random, 32+ chars), `created_at`, `suggestions` jsonb, `suggestions_key` text, `suggestions_at`
- `receipts`: `id`, `household_id`, `source` (`image` | `text` | `sample`), `extracted` jsonb (validated), `created_at`
- `items`: `id`, `household_id`, `receipt_id` (nullable), `name`, `qty` numeric, `unit` nullable, `category` enum (dairy, produce, meat_fish, bakery, frozen, dry, drinks, other), `bought_on` date, `expires_on` date, `status` enum (in_stock, used, binned), `created_at`, `updated_at`

Indexes on `items(household_id, status, expires_on)` and `households(token)`.

## Stack and conventions

- Next.js (App Router, TypeScript), Tailwind, pnpm. Server actions or route handlers, whichever is simpler for the step. Small plain components; no UI kit.
- Drizzle ORM with `drizzle-kit push` against Neon. `DATABASE_URL` from Vercel's Neon integration.
- `@anthropic-ai/sdk`. Model `claude-sonnet-5-5` for both the receipt read and the recipes; drop to `claude-haiku-5-5` only if latency hurts. Ask for structured JSON (tool use with a schema, or a strict JSON instruction) and **validate with zod** before anything touches the database. Load the `claude-api` skill before wiring the SDK.
- Env: `ANTHROPIC_API_KEY`, `DATABASE_URL`. Never committed. `.env.local` locally, `vercel env` for production.

## Edge cases that must be handled

- **HEIC from iPhone.** Claude vision takes jpeg, png, gif, webp only. Re-encode on the client with a canvas to JPEG (max 1600 px long edge, quality 0.8) before upload. Reject anything over 5 MB after re-encode with a plain message.
- **Photo with no items** (blurry, not a receipt): show "could not read a receipt" and keep the user on the page, no empty save.
- **API failure or timeout:** one retry, then a clear message; the pasted text or chosen file is not lost.
- **Double submit:** disable the button while a request is in flight; the save action is idempotent per receipt.
- **Bad or missing household cookie:** create a new household, never 500.
- **Oversized paste:** cap receipt text at 8,000 characters with a message.

## Time boxes (your column; Codex's is in `AGENTS.md`)

| Time | Box |
|---|---|
| 0:00 to 0:15 | Scaffold, `contract.ts`, `fixtures.ts`, first commit, "hello" deployed on Vercel. A live URL exists at minute 15. |
| 0:15 to 0:40 | Schema pushed, household cookie, actions (add, used, binned), plain shells for every contract component, `/preview`, manual add works on `/`. |
| 0:40 to 1:10 | Receipt input (file with JPEG re-encode, paste, sample), vision extract with zod, confirm sheet logic, save. |
| 1:10 to 1:35 | Dishes action, cache key, `stale`, real data wired into every component. |
| 1:35 to 1:50 | Edge cases above, two small tests (zod validation of a messy extraction, expiry fallback table), README. |
| 1:50 to 2:00 | Env on Vercel, final deploy, click the live flow on laptop and phone, `/export agent-logs/claude-session.md`, commit. |

If a box overruns, cut from the next box, never from the confirm sheet or the live deploy.

## How to work in this repo

- Read this file and `docs/PLAN.md` first, then propose a plan for the first 40 minutes and wait for a yes. Use plan mode for the schema.
- `pnpm build` must pass before every deploy.
- Do not add a dependency without saying what it saves. No auth library, no state library, no component kit.
- When the human says no to something, change course and move on; do not argue it back in.
- Say when a box is done and what was cut.

## Definition of done

- Live URL where the five steps above work end to end, including the sample receipt button.
- README: what it is (three sentences), the payer belief in one line, how to run it, the data model in a few lines, the three engineering calls, what was cut and why, and the exact pre-clock setup (the context files named at the top, the accounts, the API key).
- `agent-logs/` holds both unedited session logs.
- No secrets in the repo.
