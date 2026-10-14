# Codex: design stages

Everything behind the screen is built, tested and live. Your job is the look. Read this, then `AGENTS.md` for the constraints and `components/contract.ts` for the props.

- Live: https://shelflife-self.vercel.app
- Dev server (Fire's, do not start another): http://localhost:3000
- Every component with fixtures: http://localhost:3000/preview
- Press "Try a sample receipt" on `/` to get a full confirm sheet and a full fridge to style against.

The nine shells in `components/fridge/` are plain: semantic markup, a few layout classes, no visual design. Restyle them in place. Props, behaviour and the barrel exports in `components/fridge/index.ts` stay as they are.

## Stages

| Stage | Budget | Deliverable |
|---|---|---|
| 1. Foundations | 20 min | `design/DESIGN.md` (layout, colour tokens, type, spacing, icon rule, the three expiry states). Tokens as CSS variables in `app/globals.css`; replace the scaffold's `--font-geist-*` lines, which reference nothing. |
| 2. The fridge | 40 min | `ExpiryBadge`, `ItemTile`, `FridgeZone`, `Fridge`, `InputStrip`, `ConfirmSheet`. Check every state at `/preview`, then the real page at `/`. |
| 3. The dishes | 25 min | `DishesPanel`, `DishCard`, `EmptyState`. Phone layout at 390px: input strip, fridge, dishes stacked. |
| 4. Final pass | 15 min | 390px and 1280px: contrast AA, 44px tap targets, no horizontal scroll, focus states. |
| 5. Log | 10 min | Copy `~/.codex/sessions/2026/10/14/rollout-*.jsonl` to `agent-logs/codex-session.jsonl`, commit. |

Total: about 1 hr 50 min. If a stage overruns, cut from the next one. If the restyle is not finished, the plain shells ship and the README says so. Say when a stage is done and what you cut.

## The contract

`components/contract.ts` is the law. It matches `docs/PLAN.md` with one addition: an optional `onExpiry` callback on `Fridge`, `FridgeZone` and `ItemTile` so a date can be edited in the fridge. When it is provided, `ItemTile` renders a date input; keep that. Never change a prop. If the look needs one, tell Peiyan and Fire adds it.

## What must survive the restyle

- **InputStrip**: textarea, Photo button (hidden file input, `accept="image/*"`), "Try a sample receipt", "Read text" (disabled when empty, over 8,000 characters, or busy). "Reading…" while busy. `error` in a `role="alert"`. States: idle, busy, error.
- **ExpiryBadge**: `data-freshness="fresh|soon|expired"` and the text (`12d`, `3d`, `today`, `gone`). The text always shows; colour alone never carries the state.
- **ItemTile**: icon from `item.icon`, badge at the top, name, `qty × unit`, the optional date input, Used and Binned. Actions may reveal on hover but must be reachable by tap on a phone.
- **FridgeZone**: `data-zone`, `data-empty`, the label from `ZONE_LABELS`. Empty zones stay visible but faint. Items arrive ordered soonest first.
- **Fridge**: six zones in fixed order from `groupByZone`. No other logic.
- **ConfirmSheet**: `role="dialog"`, null when closed. Per line: checkbox (`isFood`), name, qty, unit, category select, expiry date. Every edit goes through `onChange`. Save reads `Save N items` and is disabled with nothing ticked or while busy. It slides over the fridge; it is rendered at the top of the left column.
- **DishesPanel**: Refresh button (label "Suggest dishes", "Refresh dishes" or "Thinking…"; disabled when busy or the fridge is empty), a quiet stale line, a "add something first" line when empty, the cards, or "No dishes yet". States: empty fridge, no dishes yet, dishes, stale, busy.
- **DishCard**: title, minutes, the items it uses with icon, name and `data-freshness` (match the fridge visually), "To buy" when `missing` has entries, numbered steps.
- **EmptyState**: one line and a sample button. Shown when the fridge is empty and no sheet is open.

## The page around the shells (Fire's file, read only)

`app/shelf.tsx` renders, top to bottom: a `main` with the heading, `InputStrip`, an occasional "Try again" button, a small manual-add form (`app/manual-add.tsx`, unstyled, behind an "Add an item by hand" link), then a grid `md:grid-cols-[2fr_1fr]` with the left column (`ConfirmSheet`, `EmptyState`, `Fridge`) and `DishesPanel` on the right. On a phone the grid stacks.

Need a class or data attribute on the page, the grid or the manual-add form? Ask Peiyan; Fire adds it in a minute. Rules in `app/globals.css` can also reach those elements.

## Placeholder mode

The Anthropic key has no credit, so the app runs labelled placeholders: paste and photo show a message, the sample button opens the confirm sheet with a stored pre-read of the sample receipt and says so, dishes report they are off. Design for the real states; the placeholders use the same components and the same `error` slot.

## Files and rules

- Yours: `design/**`, `app/globals.css`, `app/preview/**`, `components/fridge/**`.
- Not yours: `components/contract.ts`, `components/fixtures.ts`, `app/page.tsx`, `app/shelf.tsx`, `app/manual-add.tsx`, `app/actions.ts`, `app/api/**`, `lib/**`, `db/**`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`.
- Constraints: 390px and 1280px, no horizontal scroll, 44px tap targets, contrast AA, light mode only, English, no large assets. Tailwind plus CSS variables. No animation library, no component kit. `lucide-react` is the one dependency you may add, only if emoji is not enough.
- Presentational only: no fetching, no state beyond hover and open or closed. Icons come from the data.
- Stage by path, never `git add -A`. Commit only your own files, small commits with real messages.
