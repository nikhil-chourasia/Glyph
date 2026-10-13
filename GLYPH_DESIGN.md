You are a senior product designer and front-end engineer. Redesign the UI of
"Glyph", a code-screenshot tool, with a clean, slick, modern, minimalist look.
The product goal is GRANULAR customization: the user pastes code, the language
is auto-detected, they fine-tune every visual detail, and export a snapshot.

## Stack and constraints
- Next.js (App Router), JavaScript, Tailwind CSS (PostCSS), Geist font via
  next/font. Code lives in src/app. Deployed on Vercel.
- FIRST read the existing code in src/app (page.js, layout.js, globals.css and
  any components) and summarize how state, rendering and PNG export currently
  work. Keep all existing functionality: paste code, language detection,
  presets (Default, Dark, Code, Presentation), canvas width/height, background
  color, Import Glyph, Export Glyph (JSON config), Export PNG.
- Do NOT add heavy dependencies. Prefer Tailwind + CSS variables. Small,
  well-justified libs only (e.g. a syntax highlighter or color picker if
  one isn't already used).
- Do not break the PNG export. The preview canvas must render identically to
  the exported image.

## Design direction
- Vibe: Linear / Vercel / Raycast. Quiet, precise, confident. Content-first;
  the code snapshot is the hero and the UI chrome stays out of its way.
- Dark-first with a polished light theme. Define all colors as CSS variables
  (tokens) and support system preference plus a manual toggle.
- Neutral palette (near-black / off-white), ONE restrained accent color.
  Use 1px low-contrast borders and subtle elevation instead of heavy shadows.
- Typography: Geist Sans for UI, Geist Mono for code and numeric values.
  Small, tight type scale (11-14px for controls), generous whitespace,
  consistent 4/8px spacing grid, 8-12px radii.
- Motion: subtle and fast (120-200ms ease-out). Smooth control-to-preview
  updates, gentle hover/focus states, no gimmicks. Respect
  prefers-reduced-motion.

## Layout
- Header: slim bar with logo/wordmark on the left. Import on the left or
  center, a single primary "Export" button (dropdown: PNG, SVG if feasible,
  Glyph config, Copy to clipboard) on the right. Remove the duplicated export
  buttons.
- Main: two zones.
  1. Center stage: a large preview on a subtle dotted/checkerboard
     "workspace" backdrop, with the snapshot centered. Show a small
     detected-language badge (with a dropdown to override it) near the
     preview. The code is editable directly in the preview.
  2. Right sidebar (~320px): the Customize panel, as collapsible sections.
     On mobile it becomes a bottom sheet.
- Empty state: when no code is pasted, show a friendly drop/paste zone with
  a keyboard hint (Cmd/Ctrl+V) and a "Try a sample" option.

## Customize panel (the core feature, make it feel granular and effortless)
Organize into collapsible groups with compact controls (sliders paired with
numeric inputs, segmented controls, toggles, swatch pickers):
- Presets: visual thumbnail cards, plus "Save current as preset".
- Canvas: width, height, aspect ratio lock, common sizes (Twitter/X,
  LinkedIn, 16:9, 1:1), padding, export scale (1x/2x/3x).
- Background: solid, gradient (angle + stops), transparent; optional
  noise/blur.
- Window: frame style (macOS, Windows, minimal, none), corner radius, shadow
  (blur, offset, opacity), border, title/filename text.
- Code: theme picker (live preview swatches), font family, font size, line
  height, ligatures, line numbers toggle, line highlighting, wrap, tab size.
- Layout: alignment, inner padding, watermark toggle.
- Reset per group and reset all. Every change updates the preview instantly.
- Persist settings to localStorage; keep Export Glyph / Import Glyph as
  portable JSON.

## UX polish
- Keyboard shortcuts (Cmd/Ctrl+E export, Cmd/Ctrl+Shift+C copy image,
  Cmd/Ctrl+Z undo) with a small shortcut hint.
- Visible focus rings, ARIA labels, full keyboard navigation, WCAG AA contrast.
- Toasts for export and copy success.
- Fully responsive, tested at 375px, 768px, and 1440px.
- Loading and skeleton states should be unobtrusive.

## Deliverables
1. A short plan listing the files you'll create or change, and the design
   tokens (colors, type scale, spacing, radii).
2. Refactor into small reusable components (Header, Preview, Sidebar,
   ControlGroup, Slider, ColorInput, Segmented, Toggle, etc.).
3. Implement the redesign incrementally, running the app after each step.
4. Verify: language detection, every control updating the preview, PNG
   export parity, and Import/Export Glyph round-trip.
5. Finish with a summary of what changed and any follow-up ideas.

Quality bar: it should look like a polished product, not a template. Prefer
fewer, better-aligned elements over more decoration. When unsure, choose
restraint.