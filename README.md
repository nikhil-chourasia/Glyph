# Glyph ⚡

> Fast, snappy, and slick code screenshots. Paste code, tweak styling, export crisp PNGs.

Inspired by tools like Carbon and Ray.so, Glyph is engineered for speed, responsiveness, and aesthetic precision.

![Glyph Preview](Glyph%20Design%20%20Prototype.png)

---

## Features

- **Editable In-Preview Code Surface**: Type or paste directly into the preview window without cursor jumps or lag.
- **Auto Language Detection & Manual Override**: Over 25 curated programming languages registered with Highlight.js, plus auto-detection.
- **Crisp High-DPI PNG Export**: Export at 1x, 2x (Retina), or 3x (Ultra HD) scales using dynamic-loaded `html2canvas`.
- **Direct Clipboard Actions**: Copy the rendered PNG directly to the clipboard (`navigator.clipboard.write`).
- **Dynamic Syntax Themes**:
  - Glyph Dark
  - Dracula
  - Night Owl
  - Nord
  - Glyph Light
- **Customizable Window Chrome**:
  - Inline editable window title / filename with automatic language extensions
  - Optional text-only X or LinkedIn handle below the code
  - macOS traffic lights toggle
  - Line numbers gutter toggle
  - Discreet compact Glyph watermark toggle
- **Editor Customization**: Configure tab display size, line highlighting and
  its color, wrapping, typography, and syntax theme.
- **Responsive Stage & Resizing Handles**:
  - Interactive drag-to-resize handles for the canvas width and corner dimensions
  - Dimension sliders (width & height) with compact px readouts
  - Quick aspect ratios: Auto, 16:9, 4:3, 1:1, Twitter/X (1200×630), LinkedIn
- **Rich Presets & Configuration Export/Import**:
  - Coordinated presets: *Minimal Dark*, *Dark*, *Pure Noir*, *Clean Editor*,
    *Presentation*, *Pure Light*, *Nordic Frost*, and *Midnight Ink*
  - Save your custom styling as `.glyph.json` and reload it anytime
- **Local Persistence & Keyboard Shortcuts**:
  - Remembers your current code and preferences via `localStorage`
  - Shortcuts: `Cmd/Ctrl + E` to export PNG, `Cmd/Ctrl + Shift + C` to copy image

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Syntax Highlighting**: `highlight.js/lib/core` with curated languages and CSS custom property themes
- **Image Capture**: `html2canvas` (dynamically imported on export)
- **Styling**: Vanilla CSS design system with explicit capture-safe colors, gradients, and micro-interactions

---

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Run linting and production build verification:
   ```bash
   npm run lint
   npm run build
   ```

---

## License

MIT
