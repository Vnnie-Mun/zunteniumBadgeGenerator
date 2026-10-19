# Zuntenium Badge Generator

A static web tool that renders branded contributor badges on an HTML canvas and exports them as PNG.

Live-friendly on Vercel, GitHub Pages, or any static host: no build step, no framework.

## Features

- 17 contributor roles with distinct accent colors
- Square (1080×1080), Story (1080×1920), and LinkedIn (1200×630) layouts
- Live canvas preview with cached background layers and decoded photos
- PNG download and copy-image-to-clipboard
- Suggested social caption
- Form persistence via `localStorage`

## Run locally

```bash
npx serve .
```

Then open the printed URL. ES modules require HTTP (not `file://`).

## Project layout

```
index.html          UI shell
css/styles.css      Theme tokens and layout
js/config.js        Roles, colors, helpers
js/canvas.js        Canvas renderer (pure drawing)
js/app.js           State, events, export
assets/             Brand logo
```

## Deploy

Point Vercel (or similar) at the repo root. Output is the static files as-is.
