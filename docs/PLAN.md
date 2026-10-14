# Shelf Life: build plan

## Where this plan came from

This plan was written on Wed 14 Oct 2026, before the two hour clock, in a planning conversation between Peiyan and Claude (Fire) inside Peiyan's personal notes workspace. That conversation produced no code for this repo; it produced the product choice, the scope, the data model, the two agent working rules and the briefs in this folder, `CLAUDE.md` and `AGENTS.md`. Its transcript is private (it is the workspace Peiyan runs his life from) and is not part of the submission. The build itself happens in two fresh agent sessions opened inside this repo, Claude Code and Codex, whose unedited logs are submitted in `agent-logs/`.

Decisions taken in that conversation:

- The product is Peiyan's own idea, from a problem at home: photograph or paste a grocery receipt, confirm the items, keep a fridge inventory with estimated expiry, see what to use soon, get told what to cook.
- This build is the submission, not a rehearsal.
- Two agents inside the window: Claude Code builds the data, the flow and plain component shells; Codex owns the look and restyles the shells in place from minute 45. Both logs are submitted.
- Voice input is cut to Next. Calorie tracking is cut to Next.
- Dishes are generated on demand and cached against the current inventory.
- Pre-clock files in this repo: `CLAUDE.md`, `AGENTS.md`, `docs/PLAN.md`, `.gitignore`, and `samples/receipt-1.jpg` (a real receipt). Accounts made before the clock: GitHub, Vercel, Neon, Anthropic API key. Nothing else exists before the first scaffold commit.

## The one screen

```
┌──────────────────────────────────────────────────────────────┐
│ InputStrip: [ paste receipt text… ] [📷 Photo] [Try sample]   │
├────────────────────────────────────┬─────────────────────────┤
│ Fridge                             │ DishesPanel             │
│  freezer   [🥟 2d] [🧊 88d]         │  [Refresh dishes]       │
│  top shelf [🥛 3d] [🥚 9d] [🧀 12d] │  DishCard: title,       │
│  middle    [🍗 today] [🥩 1d]       │   uses, missing, steps  │
│  drawer    [🥦 2d] [🍅 4d]          │  DishCard …             │
│  door      [🧃 20d]                 │  DishCard …             │
│  cupboard  [🍞 3d] [🍝 300d]        │                         │
└────────────────────────────────────┴─────────────────────────┘
ConfirmSheet slides over the fridge after an extraction; nothing is saved until Save.
Phone (390px): InputStrip, Fridge, then DishesPanel stacked. Desktop (1280px): two columns.
```

Zone mapping (fixed, Codex styles it, Fire computes it in `lib/zones.ts`): frozen → freezer · dairy → top shelf · meat_fish, other → middle shelf · produce → drawer · drinks → door · dry, bakery → cupboard. Empty zones render faint, never disappear.

Freshness (derived in `lib/expiry.ts`): `fresh` (more than 3 days), `soon` (0 to 3 days), `expired` (past). Badge text always carries a label: `12d`, `3d`, `today`, `gone`. Colour alone never carries the state.

## Component contract

Fire writes `components/contract.ts` in the first 15 minutes. Codex builds against it. Nobody changes a prop without saying so; if the look needs one, Peiyan relays and Fire adds it.

```ts
export type Category = 'dairy'|'produce'|'meat_fish'|'bakery'|'frozen'|'dry'|'drinks'|'other'
export type Zone = 'freezer'|'top'|'middle'|'drawer'|'door'|'cupboard'
export type Freshness = 'fresh'|'soon'|'expired'
export interface FridgeItem { id: string; name: string; qty: number; unit?: string; category: Category; boughtOn: string; expiresOn: string; daysLeft: number; freshness: Freshness; icon: string }
export interface ExtractedLine { name: string; qty: number; unit?: string; category: Category; shelfLifeDays: number; isFood: boolean }
export interface Dish { title: string; minutes: number; usesItemIds: string[]; missing: string[]; steps: string[] }

// presentational: Codex owns the look, Fire owns the data
InputStrip   { onText(text: string); onImage(file: File); onSample(); busy: boolean; error?: string }
Fridge       { items: FridgeItem[]; onUsed(id); onBinned(id) }          // groups by zone via lib/zones.ts
FridgeZone   { zone: Zone; items: FridgeItem[]; onUsed; onBinned }
ItemTile     { item: FridgeItem; onUsed(); onBinned() }
ExpiryBadge  { daysLeft: number; freshness: Freshness }
ConfirmSheet { lines: ExtractedLine[]; open: boolean; onChange(lines); onSave(); onCancel(); busy: boolean }
DishesPanel  { dishes: Dish[] | null; stale: boolean; onRefresh(); busy: boolean; items: FridgeItem[] }
DishCard     { dish: Dish; items: FridgeItem[] }
EmptyState   { onSample() }
```

Fixtures: `components/fixtures.ts` (12 items across all zones and all three freshness states, 3 dishes, 6 extracted lines including one non-food line and one multibuy). `app/preview/page.tsx` renders every component with the fixtures. It is Codex's playground and it ships; harmless.

Icons: emoji strings from `lib/icons.ts`, a category default plus name overrides (milk, egg, cheese, butter, chicken, beef, fish, bread, apple, banana, tomato, onion, rice, pasta, juice, beer). Codex may swap to `lucide-react` if emoji is not enough; that is the one dependency he may add.

## Data model

- `households`: `id`, `token` (unique, random, 32+ chars), `created_at`, `suggestions` jsonb, `suggestions_key` text, `suggestions_at`. The key is a sha1 of the sorted in-stock item ids plus their expiry dates; the panel shows `stale` when the current key differs from the stored one.
- `receipts`: `id`, `household_id`, `source` (`image` | `text` | `sample`), `extracted` jsonb (validated model output), `created_at`
- `items`: `id`, `household_id`, `receipt_id` (nullable, manual adds), `name`, `qty` numeric, `unit` nullable, `category` enum, `bought_on` date, `expires_on` date, `status` enum (`in_stock`, `used`, `binned`), `created_at`, `updated_at`

Indexes on `items(household_id, status, expires_on)` and `households(token)`.

## Ownership by path

Both agents work in the same working tree. Stage by path, commit only your own paths, small commits with real messages.

| Fire (Claude Code) | Codex |
|---|---|
| `app/page.tsx`, `app/layout.tsx`, `app/actions.ts`, `app/api/**` | `app/globals.css` (tokens, base styles) |
| `lib/**` (db, ai, expiry, zones, icons), `drizzle/**`, `db/**` | `components/fridge/**` from minute 45 (the shells Fire made) |
| `components/contract.ts`, `components/fixtures.ts`, the first plain shells in `components/fridge/**` (until minute 40) | `design/**` (spec, mockup), `app/preview/**` |
| `README.md`, tests, `agent-logs/claude-session.md` | `agent-logs/codex-session.jsonl` |

Rules: Codex never edits `contract.ts`. Fire does not touch `components/fridge/**` after minute 45 except to wire callbacks. One dev server, Fire's; Codex reads it at `/preview` and `/`. No new dependency without saying what it saves.

## Time boxes

| Time | Fire | Codex |
|---|---|---|
| 0:00 to 0:15 | Scaffold (Next.js App Router, TypeScript, Tailwind, pnpm), `contract.ts`, `fixtures.ts`, first commit, hello deployed on Vercel | Reads `AGENTS.md`, writes `design/DESIGN.md` (layout, tokens, type, spacing, icon rule, states), starts `design/mockup.html` from the fixtures |
| 0:15 to 0:40 | Schema pushed to Neon, household cookie, actions (add, used, binned), plain shells for every contract component, `/preview`, manual add works on `/` | Finishes the mockup, tokens in `app/globals.css`, checks the shells at `/preview` |
| 0:40 to 1:10 | InputStrip logic (text, image with client side JPEG re-encode, sample), vision extraction validated with zod, ConfirmSheet logic, save | Restyles `Fridge`, `FridgeZone`, `ItemTile`, `ExpiryBadge`, `InputStrip`, `ConfirmSheet` in place, props untouched |
| 1:10 to 1:35 | Dishes action, cache key, `stale`, real data wired into every component | `DishesPanel`, `DishCard`, `EmptyState`, phone layout at 390px |
| 1:35 to 1:50 | Edge cases (HEIC, no items, API failure, double submit, bad cookie, oversized paste), two tests, README | Final pass at 390px and 1280px, contrast, tap targets |
| 1:50 to 2:00 | Env on Vercel, final deploy, laptop and phone click through, `/export agent-logs/claude-session.md`, commit | Copies the session file from `~/.codex/sessions/2026/10/<day>/rollout-*.jsonl` to `agent-logs/codex-session.jsonl`, commit |

If a box overruns, cut from the next box, never the confirm sheet or the live deploy. If Codex's restyle is not done by 1:50, the plain shells ship and the README says so.

## Pre-flight (Peiyan, before the clock)

1. `npx vercel login`; a Neon Postgres store on the Vercel project; `DATABASE_URL` in hand.
2. Key check: `curl -s https://api.anthropic.com/v1/models -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01" | head -c 200`
3. A photo of a real receipt at `samples/receipt-1.jpg`.
4. Two terminals in this repo: `claude` and `codex`. Note the start time. First message to each: read your brief and propose your first 40 minutes; the clock starts on the yes.
5. `gh repo edit peiyan03/shelflife --visibility public` before sending.

## Definition of done

- Live URL where the flow works end to end: paste text or add a photo or press the sample button → confirm → items in the fridge with badges → mark used or binned → Refresh dishes returns three dishes built around the soonest items → reload keeps everything (cookie) → the panel shows stale after an item changes.
- `pnpm build` clean; the two tests pass.
- README: what it is in three sentences, the payer belief in one line, how to run it, the data model, the three engineering calls (expiry is an editable estimate with a category fallback; the photo is not stored; no auth, a household cookie), what was cut and why (voice, calories, barcode, reminders, accounts, image storage), and the exact pre-clock setup listed at the top of this file.
- `agent-logs/` holds both transcripts, unedited.

## Submission

Reply on the thread "Re: Your Algosoup take-home" with the repo URL, the live URL and both logs, plus one line asking for the intro call that was never rescheduled.
