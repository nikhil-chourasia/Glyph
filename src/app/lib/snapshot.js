// Keep automatic titles derived from the current language, not stored detection.
const EXTENSIONS = {
  javascript: "js", typescript: "ts", python: "py", xml: "html", css: "css",
  scss: "scss", json: "json", go: "go", rust: "rs", java: "java", c: "c",
  cpp: "cpp", csharp: "cs", ruby: "rb", php: "php", swift: "swift",
  kotlin: "kt", bash: "sh", yaml: "yml", sql: "sql", markdown: "md",
  dockerfile: "dockerfile", graphql: "graphql", ini: "ini", plaintext: "txt",
};

export function isAutomaticTitle(config) {
  return config.titleMode !== "custom" && /^untitled(?:\.[a-z0-9]+)?$/i.test((config.title || "untitled").trim());
}

export function getSnapshotTitle(config, detectedLanguage) {
  if (!isAutomaticTitle(config)) return config.title || "";
  const language = config.language === "auto" ? detectedLanguage : config.language;
  return `untitled.${EXTENSIONS[language] || "txt"}`;
}

export function getExportBasename(config) {
  if (isAutomaticTitle(config)) return "glyph";
  const title = String(config.title || "").trim();
  const basename = title.replace(/\.[^/.\\]+$/, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, "-")
    .replace(/^[.\s-]+|[.\s-]+$/g, "").slice(0, 100).replace(/[.\s-]+$/g, "");
  if (!basename || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(basename)) return "glyph";
  return basename;
}

export const SOCIAL_PLATFORMS = { none: "None", x: "X", linkedin: "LinkedIn" };
export const DEFAULT_SOCIAL_IDENTITY = { platform: "none", handle: "" };

// A nested identity leaves room for future local display options. Only these
// text fields are accepted today; URLs, avatars and unknown fields are ignored.
export function sanitizeSocialIdentity(value) {
  const platform = ["x", "linkedin"].includes(value?.platform) ? value.platform : "none";
  const text = typeof value?.handle === "string" ? value.handle.trim().replace(/^@+/, "").slice(0, 80) : "";
  const handle = /^[\p{L}\p{N}_.-]+$/u.test(text) ? text : "";
  return { platform, handle };
}

export const DEFAULT_HIGHLIGHT_COLOR = "#818cf8";
export function sanitizeHighlightColor(value) {
  if (typeof value !== "string") return DEFAULT_HIGHLIGHT_COLOR;
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(value)) return `#${[...value.slice(1)].map((digit) => digit + digit).join("")}`.toLowerCase();
  return DEFAULT_HIGHLIGHT_COLOR;
}

export function getHighlightBackground(value) {
  const hex = sanitizeHighlightColor(value).slice(1);
  const rgb = [0, 2, 4].map((start) => parseInt(hex.slice(start, start + 2), 16));
  return `rgba(${rgb.join(", ")}, 0.16)`;
}
