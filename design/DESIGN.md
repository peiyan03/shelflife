# Shelf Life design

A kitchen notebook: warm paper, forest ink, food emoji and lightly irregular fridge corners. Clear controls and editable receipt rows carry trust; decoration stays on the frame.

## Layout
Receipt input spans the page. At 768px and above the fridge and dishes use the existing 2:1 grid, within a 1200px page. Below that they stack. Six labelled shelves remain visible, including empty shelves. Tiles form two columns on phones and three where space permits. Confirm is a bounded native modal, aligned over the fridge on desktop and inset on phones; its rows scroll while the actions stay visible.

## Tokens and type
Paper #f5f2e9; surface #fffdf7; ink #233b31; muted #59665b; rule #c9cec0; accent #2f5943. System sans for controls and body, Georgia for editorial headings. No font downloads or added dependencies. Spacing scale: 4, 8, 12, 16, 24, 32, 48px. Main headings 36px desktop, 30px phone; body 15px. All actionable controls at least 44px high.

## Icons and tiles
Render item.icon verbatim at 32px. Never infer icons or grouping. Expiry badge leads at the top, then emoji, name and quantity. Native details exposes date, Used and Binned with keyboard and touch; hover also exposes the actions on fine pointers. Ingredient chips repeat icons, names and freshness colours.

## Expiry
Fresh: #e5eee4 / #31503b. Soon: #fff0c9 / #76500b. Expired: #f8e0d9 / #8c3528. Preserve 12d, 3d, today, gone and add accessible state text. A visible legend explains the palette. Dates are explicitly estimates.

## Other states
Busy buttons disable and retain readable text. Errors appear in a bordered warm alert. Stale dishes show a quiet amber cue. Empty inventory invites a sample; empty shelves remain faint without fading text below readable contrast. No fetching, new business state, dependencies or contract changes. Reduced-motion disables sheet entrance.

## Scope
Restyle only design/**, app/globals.css, app/preview/** and components/fridge/**. Fire owns deployment and application flow. The separate static mockup is cut because the live fixture preview is already available.
