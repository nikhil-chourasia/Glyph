# Glyph ⚡

> Fast, snappy, and slick code screenshots. Paste code, tweak styling, export crisp PNGs.

Inspired by tools like Carbon and Ray.so, Glyph is engineered for speed, responsiveness, and aesthetic precision.

![Glyph Preview](Glyph%20Design%20%20Prototype.png)

---

## Features

- **Editable In-Preview Code Surface**: Type or paste directly into the preview window without cursor jumps or lag.
- **Auto Language Detection & Manual Override**: Over 25 curated programming languages registered with Highlight.js, plus auto-detection.
- **Crisp High-DPI PNG Export**: Export at 1x, 2x (Retina), or 3x (Ultra HD) scales using dynamic-loaded `html2canvas`.
- **Direct Clipboard Actions**: Copy rendered PNG directly to clipboard (`navigator.clipboard.write`) or copy raw code in one click.
- **Dynamic Syntax Themes**:
  - Glyph Dark
  - Dracula
  - Night Owl
  - Nord
  - Glyph Light
- **Customizable Window Chrome**:
  - Inline editable window title / filename (`untitled.py`, etc.)
  - macOS traffic lights toggle
  - Line numbers gutter toggle
  - Discreet "Made with Glyph" watermark toggle
- **Responsive Stage & Resizing Handles**:
  - Interactive drag-to-resize handles (width & corner handles on the preview window)
  - Dimension sliders (width & height) with live numeric readouts
  - Quick aspect ratios: Auto (content-fit), 16:9, 4:3, 1:1, Twitter/X (1200×630)
- **Rich Presets & Configuration Export/Import**:
  - Coordinated presets: *Default*, *Dark*, *Code*, *Presentation*, *Cyberpunk*, *Nordic*
  - Save your custom styling as `.glyph.json` and reload it anytime
- **Local Persistence & Keyboard Shortcuts**:
  - Remembers your current code and preferences via `localStorage`
  - Shortcuts: `Cmd/Ctrl + E` or `Cmd/Ctrl + S` to Export PNG

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Syntax Highlighting**: `highlight.js/lib/core` with curated languages and CSS custom property themes
- **Image Capture**: `html2canvas` (dynamically imported on export)
- **Styling**: Vanilla CSS design system with curated HSL/HEX gradients, glassmorphism, and micro-interactions

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
