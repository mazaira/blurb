# Depa seed blurb versions

Local preview server for deck / blurb HTML variants.

## Quick start

```bash
npm install
npm run dev
```

Opens [http://localhost:5173](http://localhost:5173) on the **current deck**. The version picker is at [/menu](http://localhost:5173/menu).

## Folder layout

| Folder | Purpose |
| --- | --- |
| `assets/` | Logo and shared images → served at `/assets/` |
| `One shot tries/` | First-pass AI deck variants |
| `current version/` | Active deck (`index.html`) + `template.html` |
| `text.md` | Source copy (project root, Markdown) |
| `source.html` | Rendered view of `text.md` at `/source.html` |
| `compare.html` | Side-by-side view of all one-shot decks |
| `menu.html` | Version picker and links |

Routes:

- `/` → `current version/index.html` (default)
- `/menu` → version picker
- `/v/one-shot/opus` → `One shot tries/opus.html`
- `/v/current` → redirects to `/` (legacy)
- `/compare.html` → four one-shots side by side

## Adding a version

1. Add `your-version.html` under `One shot tries/` or `current version/`.
2. It shows up on `/menu` automatically — no config change needed.

## Logo

Drop `logo.svg` or `logo.png` into `assets/`.

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Dev server with hot reload           |
| `npm run build` | Static build to `dist/`              |
| `npm run preview` | Serve the production build locally |

## Deploy to Vercel

Import the repo (or `vercel` CLI from this folder). Vercel detects Vite automatically:

- **Build command:** `npm run build`
- **Output directory:** `dist`

`vercel.json` rewrites `/` to the current deck and `/menu` to the picker. The version list is generated as `public/versions.json` at build time.

## Files

- `text.md` — source copy (root)
- `current version/template.html` — deck scaffold
- `One shot tries/*.html` — archived one-shot decks
- `current version/*.html` — working deck(s)
- `assets/` — logo and shared static files
