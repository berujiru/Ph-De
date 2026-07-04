# Icon Library

Hand-authored SVG icon components for the rally motif — no external icon packages.

- All icons live in `index.tsx` as named exports taking `IconProps` (`size?`, `className?`).
- Style rules: 24×24 viewBox, `stroke="currentColor"`, strokeWidth 2, round caps/joins, `fill="none"`.
- Flat `currentColor` fills are allowed only where line art can't read at size (coin star, skull eyes, filled star).
- Keep path data simple: 2–6 paths per icon, consistent visual weight.
- Color comes from CSS `color` at the usage site — pick theme tokens by meaning (gold = currency, danger = loss, accent = primary action).
- Damage-type icons are also exposed via `damageTypeIcons`, keyed by the `damageType` ids in `src/game/data/balance.ts`.
- To add an icon: copy an existing component, keep the `SvgIcon` wrapper, follow the rules above, export it by name.
