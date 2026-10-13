// Default editor state + named presets with a refined, minimalist aesthetic.

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
];

export const ASPECT_RATIOS = [
  { id: "auto", label: "Auto", width: null, height: null },
  { id: "16-9", label: "16:9", width: 1200, height: 675 },
  { id: "4-3", label: "4:3", width: 1000, height: 750 },
  { id: "1-1", label: "1:1", width: 800, height: 800 },
  { id: "twitter", label: "X / Post", width: 1200, height: 630 },
];

export const DEFAULT_CONFIG = {
  title: "untitled.py",
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
  obsidian: {
    id: "obsidian",
    label: "Pure Noir",
    description: "Deep monochromatic matte obsidian with subtle depth",
    config: {
      ...DEFAULT_CONFIG,
      syntaxTheme: "glyph-dark",
      background: "#0c0d11",
      shadow: 35,
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
      showTrafficLights: true,
      showWatermark: true,
      autoHeight: true,
    },
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
      showLineNumbers: true,
      showTrafficLights: true,
      showWatermark: true,
      autoHeight: true,
    },
  },
};

/** Validates and merges an imported configuration object */
export function sanitizeImportedConfig(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid config format: expected a JSON object");
  }

  const merged = { ...DEFAULT_CONFIG };

  if (typeof data.title === "string") merged.title = data.title;
  if (typeof data.language === "string") merged.language = data.language;
  if (typeof data.showLineNumbers === "boolean") merged.showLineNumbers = data.showLineNumbers;
  if (typeof data.showTrafficLights === "boolean") merged.showTrafficLights = data.showTrafficLights;
  if (typeof data.showWatermark === "boolean") merged.showWatermark = data.showWatermark;
  if (typeof data.syntaxTheme === "string" && SYNTAX_THEMES[data.syntaxTheme]) {
    merged.syntaxTheme = data.syntaxTheme;
  }
  if (typeof data.background === "string") merged.background = data.background;
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

  return merged;
}
