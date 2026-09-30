# Harbor

Simple, editorial, and spare. Light pink canvas, one red, lots of air. Looks like a modern watchlist, not a dashboard.

`DESIGN.md` is the only look. To change it later, edit hex values here and in `app/globals.css` `:root` (for example `--primary`). Do not add a second design file.

## Apply (once)

After shadcn init, paste the token values from `themes/harbor.css` into the `:root { ... }` block in `app/globals.css`. Keep imports, `@theme`, and the base layer.

Tell Cursor: *Follow `DESIGN.md`. Use theme tokens only (`bg-primary`, `text-muted-foreground`). Do not hardcode colors.*

## Colors
- Background: `#FDF2F4`
- Surface / cards: `#FFFFFF`
- Text: `#111111`
- Muted text: `#737373`
- Border: `#EDEDED`
- Brand: `#E11D48`
- Brand hover: `#BE123C`
- Brand on color: `#FFFFFF`
- Success: `#15803D`
- Danger: `#BE123C`

## Type
- Font: Poppins, system-ui, sans-serif
- Page title: 28–32px, weight 600, tight tracking
- Section title: 18px, weight 500
- Body: 16px, weight 400, line-height 1.55
- Small / meta: 13px, `#737373`

## Shape and space
- Radius: 12px on cards and inputs, 999px on buttons (pill)
- No card shadow
- Page padding: 24–32px
- Space between sections: 40px
- Max content width: 720px, centered

## Components
- **Nav:** top bar, light pink, thin bottom border, logo left, links right
- **Primary button:** solid brand red, white text, pill shape, no gradient
- **Secondary button:** white, red border and red text
- **Cards:** white surface, 1px border, no shadow, poster on the left
- **Posters:** TMDB catalog image when lookup works; initial-letter placeholder if not
- **Forms:** labels above fields, clear focus ring in brand red

## Do
- Lots of whitespace
- One brand color only (red)
- Left-align body text
- Keep lists quiet — title, who, when, one action

## Don’t
- Gradients, glass, neon, or dark mode
- More than one accent color
- Decorative illustrations unless asked
- Gray card fills or heavy shadows
