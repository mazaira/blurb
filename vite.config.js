import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const ROOT = path.resolve(import.meta.dirname);

function listVersions() {
  return fs
    .readdirSync(ROOT)
    .filter((f) => f.endsWith(".html") && f !== "index.html")
    .map((f) => {
      const id = f.replace(/\.html$/, "");
      return {
        id,
        label: formatLabel(id),
        path: `/v/${id}`,
        file: f,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

const VERSION_LABELS = {
  opus: "Opus 4.8",
  qwen: "Qwen 3.7 Max",
  "gpt5-5": "GPT 5.5",
  kimi: "Kimi 2.6",
};

function formatLabel(id) {
  if (VERSION_LABELS[id]) return VERSION_LABELS[id];
  return id
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function versionsPlugin() {
  return {
    name: "blurb-versions",
    configureServer(server) {
      server.middlewares.use("/api/versions", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(listVersions()));
      });

      server.middlewares.use((req, _res, next) => {
        const match = req.url?.match(/^\/v\/([^/?#]+)\/?$/);
        if (!match) return next();

        const file = `${match[1]}.html`;
        if (fs.existsSync(path.join(ROOT, file))) {
          req.url = `/${file}`;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/versions", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(listVersions()));
      });

      server.middlewares.use((req, _res, next) => {
        const match = req.url?.match(/^\/v\/([^/?#]+)\/?$/);
        if (!match) return next();

        const file = `${match[1]}.html`;
        if (fs.existsSync(path.join(ROOT, file))) {
          req.url = `/${file}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  root: ROOT,
  plugins: [versionsPlugin()],
  server: {
    port: 5173,
    open: "/",
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(ROOT, "index.html"),
        ...Object.fromEntries(
          listVersions().map((v) => [v.id, path.resolve(ROOT, v.file)])
        ),
      },
    },
  },
});
