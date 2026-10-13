# Glyph — Project Notes & Objectives

> Internal working document. Not shipped as part of the product; kept out of
> git via `.gitignore` so it can stay blunt, informal, and easy to edit.

## 1. What Glyph is

Glyph is a fast, snappy, highly-customizable **code screenshot tool**. The
core loop:

1. User pastes/types code directly into the preview window.
2. Glyph auto-detects the language and applies syntax highlighting.
3. User tweaks the look (theme, background, padding, window chrome,
   typography, size) using the right-hand customization panel.
3. User clicks **Export PNG** and gets a crisp, shareable image of exactly
   what they see in the preview.

Inspired by tools like carbon.now.sh and ray.so, but the goal is to feel
*faster* and *snappier* — no heavy editor dependency, minimal network
weight, instant feedback on every control.

## 2. Non-negotiable product requirements (from the brief)

- [x] Paste code → **auto-detect language** → syntax highlight it.
- [x] **Export as PNG** via a visible, obvious Export button.
- [x] The **preview window must be easily resizable** (not fixed size).
- [x] A real set of **customization options**, not just placeholders.
- [x] The whole thing should feel **fast, snappy, and slick** — no
      jank, no dead buttons, no visual rough edges.

## 3. State of the project when this round of work started

The repo was a Next.js 16 (App Router) + Tailwind v4 scaffold with:

- A **static, hardcoded** code sample in `page.js` — no textarea, no way
  for a user to actually input their own code.
- **No syntax highlighting at all** — the sample was plain `<pre>` text
  colored by a single CSS rule, not language-aware.
- **No language auto-detection.**
- `html2canvas` was listed as a dependency but **never imported or used
  anywhere** — the "Export PNG" button was a dead `<button>`.
- The width/height sliders in the "Canvas" accordion were **not wired to
  any state** — moving them did nothing.
- The "Colors" swatches and background color input were **not wired to
  any state** either.
- Header had **duplicate Import/Export/Export PNG buttons** that did
  nothing and visually competed with the sidebar's own Export section.
- `globals.css` had **duplicated rule blocks** (`.toolbar`, `.btn` defined
  twice back-to-back) left over from iterative hand-edits.
- No real options for: window title/filename, traffic-light visibility,
  line numbers, font size, corner radius, shadow intensity, watermark,
  or saving/loading a configuration.
- `README.md` was the default `create-next-app` boilerplate with zero
  project-specific information.
## 4. Objectives for this pass

1. **Make the core loop real.** Code goes in (editable, in the preview
   itself), gets auto-detected + highlighted, and can be exported as a
   real PNG file.
   - Status: DONE (verified: `npm run lint` clean, `npm run build` passes,
     dev-server HTML shows `hljs-*` tokens, "Detected: Python" badge,
     editable textarea, live width/height sliders, Export PNG button
     wired to dynamically-imported `html2canvas` at 2x scale).
2. **Wire every control to real state.** Nothing in the sidebar should be
   a no-op. Presets should actually apply a bundle of settings.
   - Status: DONE (all controls in Sidebar wired to live state; presets
     "Minimal Dark", "Dark", "Clean Editor", "Presentation", "Pure Light",
     "Nordic Frost", and "Midnight Ink"
     apply coordinated styling bundles).
3. **Fill in missing, expected options**:
   - Manual language override (in case auto-detect guesses wrong) — DONE.
   - Detected-language badge/indicator — DONE.
   - Window title / filename text in the title bar (with live inline edit),
     language-aware untitled placeholders, and safe export filenames — DONE.
   - Traffic-light visibility toggle — DONE.
   - Line numbers toggle — DONE.
   - Font size control (slider from 10px to 32px) — DONE.
   - Corner radius + shadow intensity controls — DONE.
   - Compact Glyph watermark toggle — DONE.
   - Copy PNG image directly to clipboard (`navigator.clipboard.write`) — DONE.
   - Export/import full configuration as a `.glyph.json` file — DONE.
   - Aspect ratio quick-presets (Auto, 16:9, 4:3, 1:1, X, LinkedIn) — DONE.
   - Syntax themes (Glyph Dark, Glyph Light, Dracula, Night Owl, Nord) — DONE.
   - Configurable highlighted-line color and tab-size-aware tab rendering — DONE.
   - Optional text-only X / LinkedIn identity footer — DONE.
4. **Design overhaul.**
    - Status: DONE. Integrated header with prototype buttons (Import Glyph,
      Export Glyph, Export PNG, Copy Image), responsive preview
       stage with drag-to-resize handles, glassmorphism sidebar, toast
     notifications, CSS duplication removed, and cohesive purple/teal palette.
5. **No regressions.**
   - Status: DONE (`npm run lint` and `npm run build` pass cleanly with 0 errors).

## 5. Technical approach / decisions

- **Highlighting engine:** `highlight.js/lib/core` with a curated set of
  ~25 common languages registered explicitly (JS/TS/JSX, Python, Go, Rust,
  Java, C/C++/C#, Ruby, PHP, Swift, Kotlin, HTML/XML, CSS, JSON, YAML,
  Bash/Shell, SQL, Markdown, Dockerfile, GraphQL, Plaintext, etc.) — used
  via `hljs.highlightAuto()` for detection and `hljs.highlight(code,
  { language })` when the user picks a language manually. Rendered via
  `dangerouslySetInnerHTML` into a `<code>` block. This keeps the bundle
  much smaller than importing the full `highlight.js` package while still
  covering the languages people actually screenshot.
- **Syntax color themes:** rather than importing multiple `highlight.js`
  theme stylesheets (which collide, since they reuse the same
  `.hljs-*` class names), Glyph defines its own CSS custom properties per
  theme (`data-syntax-theme="..."` on the window) and maps `.hljs-*`
  classes to those variables once. This lets us swap themes instantly
  without restyling conflicts and keeps full control over the palette.
- **Editable preview:** uses the classic "transparent textarea stacked on
  top of a highlighted `<pre>`" technique (same idea as
  `react-simple-code-editor`), rather than `contentEditable`, to avoid
  cursor-jump bugs when re-highlighting on every keystroke.
- **Export:** `html2canvas` is dynamically imported only when the user
  clicks Export (keeps it out of the initial bundle), rendered at 2x
  scale for crisp output, and triggers a `.png` download via an object
  URL. The DOM we capture avoids Tailwind's utility color classes (which
  can compile to `oklch()` in Tailwind v4) since `html2canvas` cannot
  parse modern CSS color functions — all captured elements use explicit
  hex/rgba via plain CSS classes.
- **State lives in `page.js`** (single source of truth, lifted state),
  passed down to `Sidebar` and `PreviewStage`. No external state library
  needed at this size.
- **Titles and identity:** untouched `untitled` placeholders derive an extension
  from the detected or manually selected language; explicit filenames remain
  unchanged. Export basenames are sanitized with a `glyph` fallback. A nested
  `socialIdentity` config stores an optional X or LinkedIn handle as text only.
- **Typography:** the UI uses variable Figtree from `next/font/google`, while
  code and numeric values continue to use Geist Mono.

## 6. Out of scope for this pass (explicitly deferred)

- Multi-file / multi-tab screenshots.
- Collaborative/share links or any backend/persistence beyond local
  JSON export/import.
- Full custom font upload.
- Mobile-first redesign beyond the existing responsive breakpoint.

## 7. Follow-ups / future ideas

- SVG export in addition to PNG.
- Keyboard shortcuts (Cmd/Ctrl+Enter to export, Cmd/Ctrl+K for presets).
- Browser-level regression coverage for title derivation, custom identity,
  tab-size parity, and PNG capture at each export scale/theme.

## 8. Post-Objective-1 UX fixes (2026-10-13)

- Detected language moved out of the collapsed Export accordion into an
  always-visible `.lang-chip` in the preview titlebar (traffic lights
  left, language right). Old sidebar `.lang-badge` removed.
- Page overflow fixed: `min-width: 0` on `.left`, `.preview-card`, and
  `.code-editor`; `.preview-card` now scrolls internally with
  `margin: auto` centering (centers when the window fits, scrolls
  correctly when it exceeds the card — plain
  `align/justify-content: center` clips the content start in that case).
  Sidebar gets its own `overflow-y: auto`.
- Editor scroll sync: textarea `onScroll` mirrors `scrollTop/scrollLeft`
  into the highlighted `<pre>` (scrollbar hidden) and the gutter, so
  caret and tokens never drift on long/wide code.

## 9. Planned phase completion (2026-10-14)

- Automatic language-aware title extensions and sanitized PNG/JSON export names
  are implemented without replacing explicit filenames.
- The Code inspector now controls a capture-safe highlighted-line color and
  applies the selected tab size to both the textarea and highlighted layer.
- Aspect ratios use a compact responsive select; numeric controls display units
  beside values; the background picker includes additional explicit-color
  gradients.
- The default sample is a stable Python snippet with real tabs, and UI
  typography uses variable Figtree with Geist Mono retained for code.
- Layout includes optional local X / LinkedIn handle text rendered below code;
  imports, local storage, custom presets, and `.glyph.json` exports sanitize it.
- The canvas now keeps its dimensions at or above the rendered window plus outer
  padding, slider value fields size to their numeric ranges, and the empty state
  no longer includes a sample action.
- The hydration mismatch from reading custom presets during the initial render
  is fixed by loading browser storage after the deterministic first render.
- Window shadows render through a dedicated shadow wrapper that remains in the
  PNG capture path, including transparent-background exports.
