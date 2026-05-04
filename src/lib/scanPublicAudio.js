import fs from "fs/promises";
import path from "path";

/** Skip these extensions — not playable as background/SFX in this app. */
const SKIP_EXT = new Set([
  ".txt",
  ".md",
  ".json",
  ".xml",
  ".html",
  ".htm",
  ".css",
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".map",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
  ".pdf",
  ".zip",
  ".yml",
  ".yaml",
  ".csv",
  ".gitignore",
  ".gitkeep",
]);

/**
 * @typedef {Object} MediaItem
 * @property {string} id   - Full file name on disk (unique key)
 * @property {string} label - Display name without extension
 * @property {string} src  - URL path under site root
 */

/**
 * @param {string} filename
 * @returns {string}
 */
function displayStem(filename) {
  const ext = path.extname(filename);
  if (!ext) return filename;
  return filename.slice(0, -ext.length);
}

/**
 * List files in `public/<subdir>/` as playable entries. Anything that is not a
 * skipped extension (e.g. .txt) becomes a button — including files with no extension.
 * @param {string} subdir  e.g. "music" or "sfx"
 * @returns {Promise<MediaItem[]>}
 */
export async function scanPublicAudio(subdir) {
  const abs = path.join(process.cwd(), "public", subdir);
  let entries;
  try {
    entries = await fs.readdir(abs, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = entries
    .filter((e) => e.isFile() && !e.name.startsWith("."))
    .map((e) => e.name)
    .filter((name) => !SKIP_EXT.has(path.extname(name).toLowerCase()))
    .sort((a, b) => {
      const sa = displayStem(a);
      const sb = displayStem(b);
      const cmp = sa.localeCompare(sb, undefined, { sensitivity: "base" });
      if (cmp !== 0) return cmp;
      return a.localeCompare(b, undefined, { sensitivity: "base" });
    });

  return files.map((filename) => ({
    id: filename,
    label: displayStem(filename),
    src: `/${subdir}/${encodeURIComponent(filename)}`,
  }));
}

/**
 * @returns {Promise<{ music: MediaItem[], sfx: MediaItem[] }>}
 */
export async function loadMediaLibrary() {
  const [music, sfx] = await Promise.all([
    scanPublicAudio("music"),
    scanPublicAudio("sfx"),
  ]);
  return { music, sfx };
}
