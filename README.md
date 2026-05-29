# Depa seed blurb versions

Local preview server for deck / blurb HTML variants.

## Quick start

```bash
npm install
npm run dev
```

Opens [http://localhost:5173](http://localhost:5173) with a version picker. Each variant is at `/v/<name>` (e.g. `/v/opus` → `opus.html`).

## Adding a version

1. Add `your-version.html` in this folder.
2. It shows up on the home page automatically — no config change needed.

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

`vercel.json` rewrites `/v/:id` to `/:id.html` in production. The version list is generated as `public/versions.json` at build time.

## Files

- `text.md` — source copy
- `*.html` — deck variants (excluding `index.html`)
