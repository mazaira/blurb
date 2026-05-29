import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const ROOT = path.resolve(import.meta.dirname);

const ONE_SHOT_DIR = "One shot tries";
const CURRENT_DIR = "current version";
const CURRENT_FILE = "index.html";

const VERSION_LABELS = {
  opus: "Opus 4.8",
  qwen: "Qwen 3.7 Max",
  "gpt5-5": "GPT 5.5",
  kimi: "Kimi 2.6",
};

const ONE_SHOT_DESCRIPTION =
  "Original outputs from a one-shot try — the same brief and source context, each rendered by a different model so we can compare layout, tone, and emphasis side by side.";

function formatLabel(id) {
  if (VERSION_LABELS[id]) return VERSION_LABELS[id];
  return id
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function listOneShotVersions() {
  const dirPath = path.join(ROOT, ONE_SHOT_DIR);
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".html"))
    .map((f) => {
      const id = f.replace(/\.html$/, "");
      return {
        id,
        label: formatLabel(id),
        path: `/v/one-shot/${id}`,
        file: path.join(ONE_SHOT_DIR, f),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function getCurrentVersion() {
  const filePath = path.join(ROOT, CURRENT_DIR, CURRENT_FILE);
  if (!fs.existsSync(filePath)) return null;
  return {
    path: "/v/current",
    file: path.join(CURRENT_DIR, CURRENT_FILE),
  };
}

function buildManifest() {
  const current = getCurrentVersion();
  return {
    current: current
      ? { path: current.path, available: true, title: "Current version" }
      : { path: "/v/current", available: false, title: "Current version" },
    compare: {
      path: "/compare.html",
      title: "Compare one-shots",
    },
    oneShot: {
      description: ONE_SHOT_DESCRIPTION,
      items: listOneShotVersions(),
    },
  };
}

/** All HTML entry points for Vite build */
function listBuildInputs() {
  const inputs = [
    { key: "main", file: "index.html" },
    { key: "compare", file: "compare.html" },
  ];
  const current = getCurrentVersion();
  if (current) inputs.push({ key: "current", file: current.file });
  const templatePath = path.join(CURRENT_DIR, "template.html");
  if (fs.existsSync(path.join(ROOT, templatePath))) {
    inputs.push({ key: "current-template", file: templatePath });
  }
  for (const v of listOneShotVersions()) {
    inputs.push({ key: `one-shot-${v.id}`, file: v.file });
  }
  return inputs;
}

function syncStaticAssets() {
  const assetsSrc = path.join(ROOT, "assets");
  const assetsDest = path.join(ROOT, "public", "assets");
  if (!fs.existsSync(assetsSrc)) return;

  fs.mkdirSync(assetsDest, { recursive: true });
  for (const entry of fs.readdirSync(assetsSrc, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const src = path.join(assetsSrc, entry.name);
    const dest = path.join(assetsDest, entry.name);
    if (entry.isDirectory()) {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

const PUBLIC = path.join(ROOT, "public");

function writeManifest() {
  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.writeFileSync(
    path.join(PUBLIC, "versions.json"),
    JSON.stringify(buildManifest(), null, 2)
  );

  const textSrc = path.join(ROOT, "text.md");
  if (fs.existsSync(textSrc)) {
    fs.copyFileSync(textSrc, path.join(PUBLIC, "text.md"));
  }

  syncStaticAssets();
}

function resolveVersionFile(collectionSlug, id) {
  if (collectionSlug === "one-shot") {
    const filePath = path.join(ROOT, ONE_SHOT_DIR, `${id}.html`);
    return fs.existsSync(filePath) ? path.join(ONE_SHOT_DIR, `${id}.html`) : null;
  }
  if (collectionSlug === "current") {
    const filePath = path.join(ROOT, CURRENT_DIR, `${id}.html`);
    return fs.existsSync(filePath) ? path.join(CURRENT_DIR, `${id}.html`) : null;
  }
  return null;
}

function versionRouteMiddleware() {
  return (req, _res, next) => {
    if (req.url?.match(/^\/v\/current\/?$/)) {
      const file = path.join(CURRENT_DIR, CURRENT_FILE);
      if (fs.existsSync(path.join(ROOT, file))) {
        req.url = `/${file.split(path.sep).join("/")}`;
      }
      return next();
    }

    const match = req.url?.match(/^\/v\/([^/]+)\/([^/?#]+)\/?$/);
    if (!match) return next();

    const relativeFile = resolveVersionFile(match[1], match[2]);
    if (relativeFile) {
      req.url = `/${relativeFile.split(path.sep).join("/")}`;
    }
    next();
  };
}

function versionsPlugin() {
  return {
    name: "blurb-versions",
    buildStart() {
      writeManifest();
    },
    configureServer(server) {
      writeManifest();
      server.middlewares.use(versionRouteMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(versionRouteMiddleware());
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
      input: Object.fromEntries(
        listBuildInputs().map(({ key, file }) => [
          key,
          path.resolve(ROOT, file),
        ])
      ),
    },
  },
});
