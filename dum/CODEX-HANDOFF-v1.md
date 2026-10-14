# Codex handoff: design implementation

Written by Fire (Claude Code) at 0:25 on the clock. Read this, then `AGENTS.md` for your constraints and `components/contract.ts` for the props. Everything you need to build against already exists and runs.

## Where we are

- Live: https://shelflife-self.vercel.app. Dev server (Fire's): http://localhost:3000. Preview of every component with fixtures: http://localhost:3000/preview (also live at `/preview`).
- All data and flow work is done and deployed: receipt in (paste, photo, sample), extraction, confirm sheet, fridge with used/binned/expiry edit, manual add, dishes with cache and stale flag, household cookie, edge cases, tests, README.
- The Anthropic key has no credit, so the app runs in a labelled placeholder mode: paste and photo show a message, the sample button opens the confirm sheet with a stored pre-read of the sample receipt (14 lines) and says so, dishes say they are off. Design for the real states; the placeholder uses the same `error` slot and the same components.
- The nine shells are in `components/fridge/`. They are plain: semantic markup, a few layout classes, no visual design. They are yours to restyle in place from now on. Fire will not touch them again except to wire a callback if one is missing.

## Plan summary (your column)

| Time | You |
|---|---|
| now to 1:10 | `design/DESIGN.md` if not written, tokens in `app/globals.css`, restyle `Fridge`, `FridgeZone`, `ItemTile`, `ExpiryBadge`, `InputStrip`, `ConfirmSheet` in place, props untouched |
| 1:10 to 1:35 | `DishesPanel`, `DishCard`, `EmptyState`, phone layout at 390px |
| 1:35 to 1:50 | Final pass at 390px and 1280px: contrast AA, 44px tap targets, no horizontal scroll |
| 1:50 to 2:00 | Copy your session file from `~/.codex/sessions/2026/10/14/rollout-*.jsonl` to `agent-logs/codex-session.jsonl`, commit |

If you run late, the plain shells ship and the README says so. Say when a box is done and what you cut.

## The contract

`components/contract.ts` is the law. It matches `docs/PLAN.md` with one addition, declared from minute 0: an optional `onExpiry` callback on `Fridge`, `FridgeZone` and `ItemTile` (`(id, expiresOn) => void`, or `(expiresOn) => void` on the tile) so a date can be edited in the fridge. When it is provided the tile renders a date input; keep that.

Do not change a prop. If the look needs one, tell Peiyan and Fire adds it.

Keep `components/fridge/index.ts` exporting all nine components by the same names; the page imports from the barrel.

## What each shell does today (keep the behaviour, change the look)

- **InputStrip** (`'use client'`): owns the textarea text in local state, a hidden `<input type="file" accept="image/*">` behind a Photo button, a "Try a sample receipt" button, and a "Read text" button disabled when empty, over 8,000 characters, or busy. Shows "Reading…" when `busy`, the 8,000 message when too long, and `error` in a `role="alert"`. States to design: idle, busy, error.
- **ExpiryBadge**: a `<span data-freshness="fresh|soon|expired">` with text from `badgeLabel` (`12d`, `3d`, `today`, `gone`). The text must stay; colour alone never carries the state.
- **ItemTile** (`'use client'`): `<li data-freshness=…>` with the emoji icon (`item.icon`), the badge at the top, name, `qty × unit`, the optional date input, and Used and Binned buttons. Reveal the two actions on hover or tap; on a phone they must be reachable without hover.
- **FridgeZone** (`'use client'`): `<section data-zone=… data-empty=…>` with the zone label from `ZONE_LABELS` and a `<ul>` of tiles, or "Empty". Empty zones stay visible but faint. Items arrive already ordered soonest first.
- **Fridge** (`'use client'`): six `FridgeZone`s in fixed order via `groupByZone`. Never computes anything else.
- **ConfirmSheet** (`'use client'`): returns null when `open` is false. A `role="dialog"` with a title, a one-line note that dates are estimates, one row per line (checkbox bound to `isFood`, name, qty, unit, category select, expiry date input mapped to and from `shelfLifeDays`), and Save (`Save N items`, disabled when nothing is ticked or busy) and Cancel. It is controlled: every edit goes through `onChange(lines)`. Slide it over the fridge; it is rendered just above the fridge inside the left column.
- **DishesPanel** (`'use client'`): heading, Refresh button (label changes between "Suggest dishes", "Refresh dishes" and "Thinking…"; disabled when busy or when `items` is empty), a quiet stale line when `stale`, a "Add something to the fridge first" line when no items, the `DishCard`s, or "No dishes yet". States to design: no items, no dishes yet, dishes, stale, busy.
- **DishCard**: title, minutes, the items it uses rendered with their icon and name and `data-freshness` (match them to the fridge visually), "To buy" line when `missing` is not empty, and an ordered list of steps.
- **EmptyState** (`'use client'`): one line and a "Try a sample receipt" button. Shown in the left column when the fridge is empty and no sheet is open.

## The screen around the shells (Fire's files, do not edit)

`app/shelf.tsx` renders, in order:

```
<main class="flex flex-col gap-4 p-4">
  <h1>Shelf Life</h1>
  <InputStrip … />
  [Try again button, only after a failed read]
  <ManualAdd />                      // app/manual-add.tsx, a small unstyled form behind an "Add an item by hand" link
  <div class="grid gap-6 md:grid-cols-[2fr_1fr]">
    <section class="flex flex-col gap-4">   // left column
      <ConfirmSheet … />
      <EmptyState … />                       // only when empty
      <Fridge … />
    </section>
    <DishesPanel … />                        // right column; stacks under the fridge on a phone
  </div>
</main>
```

If you need a class or data attribute on `main`, the grid, the columns or the manual add form, ask Peiyan and Fire adds it in one minute. Global rules in `app/globals.css` (yours) can also reach them.

## Your files

- `design/**`: `DESIGN.md` (layout, colour tokens, type, spacing, icon rule, the three expiry states), `mockup.html` if you still want one.
- `app/globals.css`: tokens as CSS variables, base styles. It still holds the scaffold's `--font-geist-*` variables, which reference nothing; replace them. Tailwind 4 is loaded with `@import "tailwindcss"`; use `@theme` for tokens if you like.
- `app/preview/**`: your playground; it ships.
- `components/fridge/**`: the nine shells plus the barrel.

Not yours: `components/contract.ts`, `components/fixtures.ts`, `app/page.tsx`, `app/shelf.tsx`, `app/manual-add.tsx`, `app/actions.ts`, `app/api/**`, `lib/**`, `db/**`, `README.md`.

## Constraints (mechanism, not taste)

- Works at 390px and 1280px, no horizontal scroll, tap targets 44px, contrast AA, light mode only, English, fast.
- Tailwind plus CSS variables. No animation library, no component kit. `lucide-react` is the one dependency you may add, only if emoji is not enough, and say what it saves.
- Presentational only: no fetching, no state beyond hover and open or closed (InputStrip's textarea text is the one exception and already exists).
- Icons come from the data (`item.icon`), do not compute them.

## Working rules

- Stage by path, never `git add -A`. Commit only your own files, small commits with real messages.
- Fire runs the one dev server on 3000. Do not start another. Hot reload picks up your edits.
- Check `/preview` for every state and `/` for the real page. The sample button on `/` gives you a full confirm sheet and a full fridge to look at.
- Do not edit `AGENTS.md`, `CLAUDE.md` or `docs/PLAN.md`.
