// Default editor state + named presets with a refined, minimalist aesthetic.
import { DEFAULT_HIGHLIGHT_COLOR, DEFAULT_SOCIAL_IDENTITY, isAutomaticTitle, sanitizeHighlightColor, sanitizeSocialIdentity } from "./snapshot.js";

export const SYNTAX_THEMES = {
  "glyph-dark": "Glyph Dark",
  "glyph-light": "Glyph Light",
  dracula: "Dracula",
  "night-owl": "Night Owl",
  nord: "Nord",
};

export const BACKGROUND_SWATCHES = [
  { id: "obsidian", label: "Obsidian", value: "#0c0d11" },
  { id: "charcoal", label: "Charcoal", value: "linear-gradient(145deg, #181920, #0f1015)" },
  { id: "slate", label: "Slate Grey", value: "linear-gradient(145deg, #1e2430, #141821)" },
  { id: "midnight", label: "Midnight Blue", value: "linear-gradient(145deg, #10192e, #0b101d)" },
  { id: "graphite", label: "Graphite", value: "linear-gradient(145deg, #27272a, #18181b)" },
  { id: "minimal-purple", label: "Velvet Ink", value: "linear-gradient(145deg, #241835, #140d21)" },
  { id: "minimal-teal", label: "Deep Cyan", value: "linear-gradient(145deg, #0b2228, #07151a)" },
  { id: "warm-neutral", label: "Warm Taupe", value: "linear-gradient(145deg, #242220, #171514)" },
  { id: "snow", label: "Minimal Light", value: "linear-gradient(145deg, #f1f5f9, #e2e8f0)" },
  { id: "aurora-subtle", label: "Subtle Dusk", value: "linear-gradient(145deg, #1a2238, #1c1936)" },
  { id: "lavender", label: "Lavender", value: "linear-gradient(135deg, #ddd6fe, #a5b4fc)" },
  { id: "seafoam", label: "Seafoam", value: "linear-gradient(135deg, #ccfbf1, #67e8f9)" },
  { id: "sunset", label: "Sunset", value: "linear-gradient(135deg, #fdba74, #f9a8d4)" },
  { id: "rose", label: "Rosewood", value: "linear-gradient(145deg, #572b42, #291a2e)" },
  { id: "forest", label: "Forest", value: "linear-gradient(145deg, #204c40, #102b2a)" },
  { id: "sand", label: "Warm Sand", value: "linear-gradient(135deg, #f5e6cf, #d6c3ad)" },
];

export const ASPECT_RATIOS = [
  { id: "auto", label: "Auto", width: null, height: null },
  { id: "16-9", label: "16:9", width: 1200, height: 675 },
  { id: "4-3", label: "4:3", width: 1000, height: 750 },
  { id: "1-1", label: "1:1", width: 800, height: 800 },
  { id: "twitter", label: "X / Post", width: 1200, height: 630 },
  { id: "linkedin", label: "LinkedIn", width: 1200, height: 627 },
];

export const FRAME_STYLES = ["macos", "windows", "minimal", "none"];
export const FONT_FAMILIES = ["geist", "monospace"];

export const DEFAULT_CONFIG = {
  title: "untitled",
  titleMode: "auto",
  language: "auto",
  showLineNumbers: false,
  showTrafficLights: true,
  showWatermark: true,
  syntaxTheme: "glyph-dark",
  background: BACKGROUND_SWATCHES[1].value, // Charcoal gradient
  canvasWidth: 920,
  canvasHeight: 560,
  autoHeight: true,
  padding: 48,
  fontSize: 14,
  cornerRadius: 14,
  shadow: 45,
  exportScale: 2,
  aspectLock: false,
  backgroundMode: "legacy",
  backgroundAngle: 145,
  backgroundStart: "#181920",
  backgroundEnd: "#0f1015",
  frameStyle: "macos",
  shadowBlur: 40,
  shadowOffset: 14,
  shadowOpacity: 45,
  showBorder: false,
  fontFamily: "geist",
  lineHeight: 1.5,
  ligatures: true,
  highlightedLines: "",
  highlightColor: DEFAULT_HIGHLIGHT_COLOR,
  wrap: false,
  tabSize: 4,
  alignment: "center",
  innerPadding: 24,
  socialIdentity: { ...DEFAULT_SOCIAL_IDENTITY },
};

export const PRESETS = {
  default: {
    id: "default",
    label: "Minimal Dark",
    description: "Refined charcoal backdrop with clean Glyph Dark syntax",
    config: {
      ...DEFAULT_CONFIG,
      syntaxTheme: "glyph-dark",
      background: BACKGROUND_SWATCHES[1].value,
      padding: 48,
      fontSize: 14,
      cornerRadius: 14,
      shadow: 45,
      showLineNumbers: false,
      showTrafficLights: true,
      showWatermark: true,
      autoHeight: true,
    },
  },
  dark: {
    id: "dark",
    label: "Dark",
    description: "Deep charcoal canvas with a restrained editor frame",
    config: { ...DEFAULT_CONFIG, background: BACKGROUND_SWATCHES[0].value, backgroundMode: "legacy", shadow: 50, shadowOpacity: 50 },
  },
  obsidian: {
    id: "obsidian",
    label: "Pure Noir",
    description: "Deep monochromatic matte obsidian with subtle depth",
    config: {
      ...DEFAULT_CONFIG,
      syntaxTheme: "glyph-dark",
      background: "#0c0d11",
      shadow: 35,
      shadowOpacity: 35,
      cornerRadius: 12,
      padding: 40,
      fontSize: 14,
      showLineNumbers: false,
      showTrafficLights: true,
      showWatermark: true,
      autoHeight: true,
    },
  },
  code: {
    id: "code",
    label: "Clean Editor",
    description: "Precise developer setup with line numbers and Night Owl theme",
    config: {
      ...DEFAULT_CONFIG,
      syntaxTheme: "night-owl",
      background: BACKGROUND_SWATCHES[3].value,
      showLineNumbers: true,
      padding: 36,
      fontSize: 13,
      cornerRadius: 10,
      shadow: 35,
      shadowOpacity: 35,
      showTrafficLights: true,
      showWatermark: true,
      autoHeight: true,
    },
  },
  presentation: {
    id: "presentation",
    label: "Presentation",
    description: "Large, spacious 16:9 layout for sharing code",
    config: { ...DEFAULT_CONFIG, canvasWidth: 1200, canvasHeight: 675, autoHeight: false, padding: 64, fontSize: 16, background: BACKGROUND_SWATCHES[3].value, backgroundMode: "legacy", showLineNumbers: false },
  },
  light: {
    id: "light",
    label: "Pure Light",
    description: "High-clarity paper white aesthetic for crisp documentation",
    config: {
      ...DEFAULT_CONFIG,
      syntaxTheme: "glyph-light",
      background: BACKGROUND_SWATCHES[8].value,
      padding: 56,
      fontSize: 15,
      cornerRadius: 16,
      shadow: 30,
      shadowOpacity: 30,
      showLineNumbers: false,
      showTrafficLights: true,
      showWatermark: true,
      autoHeight: true,
    },
  },
  nordic: {
    id: "nordic",
    label: "Nordic Frost",
    description: "Cool arctic tones with Nord syntax and understated slate",
    config: {
      ...DEFAULT_CONFIG,
      syntaxTheme: "nord",
      background: BACKGROUND_SWATCHES[2].value,
      padding: 44,
      fontSize: 14,
      cornerRadius: 14,
      shadow: 40,
      shadowOpacity: 40,
      showLineNumbers: false,
      showTrafficLights: true,
      showWatermark: true,
      autoHeight: true,
    },
  },
  dracula: {
    id: "dracula",
    label: "Midnight Ink",
    description: "Subtle dark palette with classic Dracula syntax highlighting",
    config: {
      ...DEFAULT_CONFIG,
      syntaxTheme: "dracula",
      background: BACKGROUND_SWATCHES[5].value,
      padding: 44,
      fontSize: 14,
      cornerRadius: 14,
      shadow: 45,
      shadowOpacity: 45,
      showLineNumbers: true,
      showTrafficLights: true,
      showWatermark: true,
      autoHeight: true,
    },
  },
};

// A CSS value consumed by the preview (and deliberately limited to generated values).
export function getBackground(config = {}) {
  const mode = config.backgroundMode || "legacy";
  if (mode === "transparent") return "transparent";
  if (mode === "solid") return config.backgroundStart || config.background || DEFAULT_CONFIG.background;
  if (mode === "gradient") {
    const angle = Number.isFinite(Number(config.backgroundAngle)) ? Number(config.backgroundAngle) : 145;
    return `linear-gradient(${angle}deg, ${config.backgroundStart || "#181920"}, ${config.backgroundEnd || "#0f1015"})`;
  }
  return config.background || DEFAULT_CONFIG.background;
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const number = (value, fallback, min, max) => typeof value === "number" && Number.isFinite(value) ? clamp(value, min, max) : fallback;
const safeText = (value, fallback, max = 200) => typeof value === "string" ? value.replace(/[<>]/g, "").slice(0, max) : fallback;
const safeColor = (value, fallback) => typeof value === "string" && (/^#[0-9a-f]{3,8}$/i.test(value) || /^rgba?\(\s*[\d .,]+\)$/i.test(value)) ? value : fallback;
const SUPPORTED_LANGUAGES = new Set(["auto", "javascript", "typescript", "xml", "css", "scss", "json", "python", "go", "rust", "java", "c", "cpp", "csharp", "ruby", "php", "swift", "kotlin", "bash", "yaml", "sql", "markdown", "dockerfile", "graphql", "ini", "plaintext"]);

/** Validates and merges an imported configuration object */
export function sanitizeImportedConfig(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid config format: expected a JSON object");
  }

  const merged = { ...DEFAULT_CONFIG };

  if (typeof data.title === "string") merged.title = safeText(data.title, merged.title, 120);
  // Legacy untitled filenames remain automatic; explicit new titles, including
  // a deliberately entered "untitled.py", retain their custom mode.
  merged.titleMode = data.titleMode === "custom" || !isAutomaticTitle(merged) ? "custom" : "auto";
  if (typeof data.language === "string" && SUPPORTED_LANGUAGES.has(data.language)) merged.language = data.language;
  if (typeof data.showLineNumbers === "boolean") merged.showLineNumbers = data.showLineNumbers;
  if (typeof data.showTrafficLights === "boolean") merged.showTrafficLights = data.showTrafficLights;
  if (typeof data.showWatermark === "boolean") merged.showWatermark = data.showWatermark;
  if (typeof data.syntaxTheme === "string" && SYNTAX_THEMES[data.syntaxTheme]) {
    merged.syntaxTheme = data.syntaxTheme;
  }
  if (typeof data.background === "string" && (data.background.length < 300) && (/^#[0-9a-f]{3,8}$/i.test(data.background) || /^linear-gradient\([^;{}]*\)$/i.test(data.background))) merged.background = data.background;
  if (typeof data.canvasWidth === "number" && !isNaN(data.canvasWidth)) {
    merged.canvasWidth = Math.max(320, Math.min(2400, data.canvasWidth));
  }
  if (typeof data.canvasHeight === "number" && !isNaN(data.canvasHeight)) {
    merged.canvasHeight = Math.max(200, Math.min(2000, data.canvasHeight));
  }
  if (typeof data.autoHeight === "boolean") merged.autoHeight = data.autoHeight;
  if (typeof data.padding === "number" && !isNaN(data.padding)) {
    merged.padding = Math.max(0, Math.min(160, data.padding));
  }
  if (typeof data.fontSize === "number" && !isNaN(data.fontSize)) {
    merged.fontSize = Math.max(10, Math.min(32, data.fontSize));
  }
  if (typeof data.cornerRadius === "number" && !isNaN(data.cornerRadius)) {
    merged.cornerRadius = Math.max(0, Math.min(48, data.cornerRadius));
  }
  if (typeof data.shadow === "number" && !isNaN(data.shadow)) {
    merged.shadow = Math.max(0, Math.min(100, data.shadow));
  }
  if (typeof data.exportScale === "number" && [1, 2, 3].includes(data.exportScale)) {
    merged.exportScale = data.exportScale;
  }

  if (typeof data.aspectLock === "boolean") merged.aspectLock = data.aspectLock;
  if (["legacy", "solid", "gradient", "transparent"].includes(data.backgroundMode)) merged.backgroundMode = data.backgroundMode;
  merged.backgroundAngle = number(data.backgroundAngle, merged.backgroundAngle, 0, 360);
  merged.backgroundStart = safeColor(data.backgroundStart, merged.backgroundStart);
  merged.backgroundEnd = safeColor(data.backgroundEnd, merged.backgroundEnd);
  if (FRAME_STYLES.includes(data.frameStyle)) merged.frameStyle = data.frameStyle;
  merged.shadowBlur = number(data.shadowBlur, merged.shadowBlur, 0, 120);
  merged.shadowOffset = number(data.shadowOffset, merged.shadowOffset, 0, 80);
  merged.shadowOpacity = number(data.shadowOpacity, typeof data.shadow === "number" ? clamp(data.shadow, 0, 100) : merged.shadowOpacity, 0, 100);
  if (typeof data.showBorder === "boolean") merged.showBorder = data.showBorder;
  if (FONT_FAMILIES.includes(data.fontFamily)) merged.fontFamily = data.fontFamily;
  merged.lineHeight = number(data.lineHeight, merged.lineHeight, 1, 3);
  if (typeof data.ligatures === "boolean") merged.ligatures = data.ligatures;
  if (typeof data.highlightedLines === "string") merged.highlightedLines = data.highlightedLines.replace(/[^0-9,\-\s]/g, "").slice(0, 200);
  merged.highlightColor = sanitizeHighlightColor(data.highlightColor);
  if (typeof data.wrap === "boolean") merged.wrap = data.wrap;
  merged.tabSize = Math.round(number(data.tabSize, merged.tabSize, 2, 8));
  if (["left", "center", "right"].includes(data.alignment)) merged.alignment = data.alignment;
  merged.innerPadding = number(data.innerPadding, merged.innerPadding, 0, 120);
  merged.socialIdentity = sanitizeSocialIdentity(data.socialIdentity);

  return merged;
}
