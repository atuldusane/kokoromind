# Kokoromind design system

Derived with ui-ux-pro-max (claymorphism / Baloo 2 recommendation), then fitted to Kokoromind's own art and logo.
Implemented in `assets/css/tokens.css`. Pages must use tokens, not raw hex values.

## UI style: "the children's exhibition"
skill match: Editorial Grid / Magazine. Framed work, gallery labels, large pull quotes, asymmetric columns, flat craft-paper colour. Children's artwork supplies the detail, so the interface stays plain.
Torn-paper edges join large colour areas. The leaf-stamped butterfly is the only character animation.

Deviations from the generated recommendation, and why:
- Body font is Atkinson Hyperlegible Next, not Comic Neue: it was drawn for legibility at small sizes.
- Pink is darkened from #EC4899 to #CF1468 so white button text passes 4.5:1.
- The corporate trust/logo-carousel page pattern was rejected; the page leads with work children make.
- Motion is CSS + IntersectionObserver instead of GSAP, so there is no animation library to download.

## Colour
| Role | Token | Hex |
|---|---|---|
| Text, headings | --ink | #14215C |
| Secondary text | --ink-soft | #46507C |
| Surface | --paper | #FFFFFF |
| Quiet section | --mist | #F1F7FE |
| Divider | --line | #D5E3F4 |
| Hero paper | --sky / --sky-soft | #93CDF8 / #DCEFFE |
| Action | --pink / --pink-deep / --pink-soft | #CF1468 / #A80D53 / #FFE1EE |
| Highlight | --sun / --sun-soft | #FFC93C / #FFF1C4 |
| Nature, success | --leaf / --leaf-soft | #1B7F45 / #DDF4E2 |
| Accent | --grape / --grape-soft | #6A2DB0 / #EDE3FB |
| Error | --danger | #C0262D |

**Five colour families only: ink, white, sky (incl. tints), sun, pink.** Pink is for the one primary action and one chart bar. Brand icons (WhatsApp, Instagram, email) are drawn in ink, not their brand colours. Leaf and grape are retired. Sun never carries white text.

## Type
- Headings: **Baloo 2** 600-800, line-height 1.08, balanced wrapping.
- Body, labels, captions: **Atkinson Hyperlegible Next** 400-700, 17px / 1.6. Never below 15px.
- Self-hosted woff2. The rupee sign comes from the Atkinson extended subset.
- Words are real text. Poster images with baked-in lettering are cropped to the artwork and captioned in HTML.
- Scale: 15, 17, 20, 24, 32, 44, 64px (fluid for the top three).

## Spacing
4, 8, 12, 16, 24, 32, 48, 64, 96, 128px (`--s1` to `--s10`). Section padding 64px mobile, 112px desktop. Content width 1180px; 20px gutters.

## Buttons
Flat pill, minimum 52px high (56px on sales pages), 700 weight, no shadow. Hover deepens the fill; press scales to .98. Primary pink, secondary white, community ink. Focus: 3px ink outline (white on dark), 3px offset.

## Cards
Radius 28px, no outline, `--lift` shadow or flat tint. Starter and Explorer are white with a line border and an outlined button; the Full Bundle is sun with the only solid pink button. Three bullets per pack. On phones the Full Bundle comes first. Artwork tiles are 4:3 on radius 20px.

## Charts
Order: #CF1468, #2477C9, #1B7F45, #6A2DB0, #965600. Horizontal bars, direct labels, zero baseline. Never rely on colour alone.

## Motion
150ms press, 300ms state. Only artwork animates in: it is set down on the table (550ms, small tilt settling to zero). Headings and text never fade up. Animate transform and opacity only.
Videos are muted, load when near the viewport, and have a visible pause control. Reduced motion shows final states and posters.
Content is visible without JavaScript.

## Anti-patterns
- Emoji as interface icons
- Gradient text, purple-pink gradients, glass panels
- Posters with tiny lettering used as thumbnails
- Invented ratings, countdowns, fake scarcity, or a crossed-out price that was never charged
- Medical or guaranteed developmental claims on sales pages
- Identifiable children without parental consent
- Autoplaying sound, bouncing loops, scroll-jacking
- Text below 15px, or text over busy artwork
- Hover-only information; targets below 44px
- Rainbow colour on controls: colour belongs to the art

## Motion budget (homepage)
- Butterflies: 3 on desktop, 2 on phones, one colour, kept to the page edges, fade away from text. Off with reduced motion; a header button turns them off.
- Carousels: 5 seconds per item, pause on touch, hover, keyboard focus and the pause button.
- The hero butterfly only hovers; nothing flies across the hero.
- Headings and text never fade in on scroll.

## Prices
Regional prices and checkout links live in `assets/js/pricing.js`. Crossed-out prices (India only): Starter ₹299, Explorer ₹499, Full Bundle ₹1,500. Only show a crossed-out price that was genuinely charged.
