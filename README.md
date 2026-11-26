# Kokoromind website

Live at https://kokoromind.in (GitHub Pages, published from the `main` branch).

## Run it on your computer

```bash
python3 -m http.server 8765 --directory /path/to/kokoromind
```

Then open http://localhost:8765/

## Where things are

| What | File |
|---|---|
| The page | `index.html` |
| Prices per country, and SuperProfile links | `assets/js/pricing.js` (top of the file) |
| Styles | `assets/css/tokens.css` (colours, fonts) and `assets/css/courses.css` |
| Carousels, filters, videos | `assets/js/courses.js` |
| Flying butterflies | `assets/js/butterflies.js` |
| Design rules | `design-system/kokoromind/MASTER.md` |

`/courses/` forwards to the homepage so older links keep working.
`sw.js` only removes an old offline helper from browsers that installed it; it can be deleted after a few months.

Original photos and full videos are kept locally in `assets2/`, which is not published.
