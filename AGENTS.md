# Shelf Life: Codex brief

You are the design lead on a two hour take-home. Claude Code ("Fire") builds the data, the flow and the plain component shells. You own the look. Read this file, then `CLAUDE.md` for the product rules and `docs/PLAN.md` for the full plan, then propose your first 40 minutes to Peiyan and wait for a yes.

## The product in three sentences

You paste or photograph a grocery receipt, confirm the items, and they land in your fridge inventory with an estimated expiry. The fridge shows what to use soon. One button tells you what to cook with it.

## The one screen

Input strip at the top (text area, photo button, "Try a sample receipt"). Below it the fridge on the left and the dishes panel on the right; on a phone (390px) they stack in that order. A confirm sheet slides over the fridge after an extraction, nothing is saved until Save. The look is yours. The constraints are not.

## The fridge

Six zones in this order: freezer, top shelf, middle shelf, drawer, door, cupboard. Items arrive already grouped (`lib/zones.ts`); you never compute the grouping. Empty zones stay visible but faint. Each item is a tile: icon (an emoji string from the data, `item.icon`), name, quantity, and an expiry badge at the top of the tile. Tap or hover reveals two actions, Used and Binned.

Expiry badge: three states that the data gives you, `fresh` (more than 3 days), `soon` (0 to 3 days), `expired`. The text is always present (`12d`, `3d`, `today`, `gone`); colour alone never carries the state.

## The dishes panel

A Refresh button, a `stale` flag (inventory changed since the dishes were made) that needs a visible but quiet cue, and up to three dish cards: title, minutes, the items it uses (match them to the fridge visually), the one or two things missing, three to five short steps. Empty state when there are no dishes yet.

## Contract

`components/contract.ts` is the law. Build every component against those props with the fixtures in `components/fixtures.ts`; `app/preview/page.tsx` renders them all for you. Do not change a prop. If the look needs one, tell Peiyan and Fire adds it.

Components: `InputStrip`, `Fridge`, `FridgeZone`, `ItemTile`, `ExpiryBadge`, `ConfirmSheet`, `DishesPanel`, `DishCard`, `EmptyState`.

## What you own, what you do not

Yours: `design/**` (write `design/DESIGN.md` first: layout, colour tokens, type, spacing, icon rule, the three expiry states), `app/globals.css`, `app/preview/**`, and from minute 45 the files in `components/fridge/**` that Fire has shelled. Not yours: `app/page.tsx`, `app/actions.ts`, `app/api/**`, `lib/**`, `drizzle/**`, `components/contract.ts`, `components/fixtures.ts`, `README.md`.

Stage by path, commit only your own files, small commits with real messages. Fire runs the one dev server; look at `/preview` and `/`.

## Constraints (mechanism, not taste)

- Works at 390px and 1280px, no horizontal scroll, tap targets 44px, contrast AA.
- Tailwind plus CSS variables in `globals.css`. No animation library, no component kit. `lucide-react` is the one dependency you may add, and only if emoji is not enough.
- Light mode only. English. Fast: no large assets.
- Presentational only: no fetching, no state beyond hover and open or closed.

## Time

| Time | You |
|---|---|
| 0:00 to 0:15 | Read, `design/DESIGN.md`, start `design/mockup.html` from the fixtures |
| 0:15 to 0:40 | Finish the mockup, tokens in `globals.css`, check the shells at `/preview` |
| 0:40 to 1:10 | Restyle Fridge, FridgeZone, ItemTile, ExpiryBadge, InputStrip, ConfirmSheet in place |
| 1:10 to 1:35 | DishesPanel, DishCard, EmptyState, phone layout |
| 1:35 to 1:50 | Final pass at both widths |
| 1:50 to 2:00 | Copy your session file from `~/.codex/sessions/2026/10/<day>/rollout-*.jsonl` to `agent-logs/codex-session.jsonl`, commit |

If you run late, the plain shells ship and the README says so. Say when a box is done and what you cut.
