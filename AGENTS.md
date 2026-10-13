# Glyph contributor guide

This document records the current product behavior, implementation shape, and
checks for the Glyph repository. The application lives at the repository root.

## Product purpose

Glyph is a browser-based code screenshot tool. The primary loop is:

1. Type, paste, or drop code into the preview.
2. Let Glyph auto-detect the language, or choose a language manually.
3. Adjust the canvas, background, window chrome, code styling, layout, and
   export scale in the Inspector.
4. Download or copy a PNG of the rendered snapshot, or save the code and
   styling as a `.glyph.json` configuration.

The product is intentionally client-side: there is no API, backend, account,
or collaboration flow in the current implementation.

## Build journey

- Git history begins with the Create Next App scaffold (`cc25de6`), whose
  `src/app/page.js` was the stock Next demo.
- The internal build notes in `GLYPH_PROJECT.md` record the state before the
  current implementation pass: a hardcoded code sample, no editable input or
  language-aware highlighting, an unused `html2canvas` dependency, sliders and
  color controls that were not connected to state, duplicate no-op header
  actions, and no title, frame, line-number, watermark, or configuration
  persistence options.
- The current pass turned the core loop into a client-side editor. The page
  owns the state, Highlight.js provides curated language support, the preview
  is an editable layered editor, controls are wired through `Sidebar`, and
  `html2canvas` is loaded only when an image is exported.
- The same internal notes contain an older follow-up list. Drag handles,
  keyboard shortcuts, and `localStorage` persistence listed there are now
  implemented; use the current source and the follow-up section below as the
  source of truth.

## Stack and architecture

- Next.js 16 App Router with React 19; JavaScript/JSX source is under `src/`.
- `src/app/layout.jsx` loads variable Figtree for the UI and Geist Mono for code and
  numeric values, global CSS, and page metadata.
- `src/app/page.js` is the client component and single source of truth. It
  composes `Header`, `PreviewStage`, `Sidebar`, and `Toast`.
- `src/app/components/Header.jsx` provides import, theme, and export actions.
- `src/app/components/PreviewStage.jsx` owns the workspace interactions:
  code drop/paste, the fixed-position canvas window, resize gestures, language
  display, and the empty state.
- `src/app/components/CodeEditor.jsx` renders the editable code surface.
- `src/app/components/Sidebar.jsx` renders presets and the Inspector controls.
- `src/app/components/Toast.jsx` renders live status messages.
- `src/app/lib/highlight.js` contains the Highlight.js registry and language
  labels. `src/app/lib/presets.js` contains defaults, presets, background
  generation, and imported-config validation. `src/app/lib/snapshot.js`
  contains title, export-basename, identity, and highlight-color helpers;
  `src/app/lib/sample.js` contains the representative starter code.
- `src/app/globals.css` contains the app shell, controls, tokens, syntax token
  colors, responsive rules, focus styling, and reduced-motion rules.
  `src/app/components/preview.css` contains preview/editor-specific layout and
  capture styling.
- Tailwind v4 is configured through `postcss.config.mjs`, but the product UI
  is primarily implemented with the CSS in `globals.css` and `preview.css`.
  There is no external state library.

## State flow

`Home` in `src/app/page.js` owns:

- `code`, initially the Python sample in `DEFAULT_CODE`;
- `config`, initialized from `DEFAULT_CONFIG`;
- `activePreset`;
- `themePreference` (`system`, `light`, or `dark`) and its resolved theme;
- toast messages and export/copy status/error state.

`setConfig` accepts a value or updater, records up to 50 prior config values,
and avoids adding history for JSON-equivalent updates. `Cmd/Ctrl+Z` calls the
config undo path unless focus is in an input, textarea, or editable element, so
the code textarea keeps its native text-editing undo behavior.

The page derives highlighted HTML and the detected language with
`highlightCode(code, config.language)`, then passes the result and state
callbacks to `PreviewStage` and `Sidebar`. Preset application replaces the
configuration with a sanitized preset bundle; individual controls update one
field and clear the active preset. The header cycles the interface theme and
`matchMedia("(prefers-color-scheme: light)")` resolves the system choice into
`html[data-theme]`.

## Syntax highlighting

`src/app/lib/highlight.js` imports `highlight.js/lib/core` and registers a
curated set of 25 languages once: JavaScript, TypeScript, XML/HTML, CSS, SCSS,
JSON, Python, Go, Rust, Java, C, C++, C#, Ruby, PHP, Swift, Kotlin, Bash,
YAML, SQL, Markdown, Dockerfile, GraphQL, INI, and plaintext. Common aliases
such as `js`, `jsx`, `ts`, `tsx`, `html`, `yml`, `sh`, `c++`, `cs`, `md`, and
`txt` are also registered.

- With `config.language === "auto"`, `hljs.highlightAuto` detects a language
  from the registered options.
- A manual language uses `hljs.highlight` and bypasses auto-detection.
- Empty code falls back to plaintext.
- The highlighted HTML is split into logical lines by `CodeEditor.jsx`; open
  Highlight.js spans are closed and reopened across newlines so line heights,
  line numbers, scrolling, and highlighted-line backgrounds stay aligned.
- The HTML is rendered into the visual `<pre>` with
  `dangerouslySetInnerHTML`; it comes from Highlight.js and should remain
  treated as generated, not user-authored markup.

Syntax themes are Glyph Dark, Glyph Light, Dracula, Night Owl, and Nord. They
do not import competing Highlight.js stylesheets. Instead,
`globals.css` assigns `--tok-*` custom properties on
`.window[data-syntax-theme]` and maps `.hljs-*` classes to those properties.

## Preview and editor behavior

`PreviewStage` creates a fixed-size canvas shell from `canvasWidth` and
`canvasHeight`. The normal capture target is the `.glyph-capture` element
inside that shell; for transparent backgrounds the capture target switches to
the `.glyph-window-shadow-wrap` so the exported PNG contains the window and its
capture-safe shadow without the surrounding canvas. The workspace, scroll
area, zoom controls, resize handles, and surrounding controls are siblings and
are not part of the exported image.

The preview supports:

- direct typing and paste into the transparent textarea;
- paste anywhere in the stage when focus is not already in an input;
- dropping plain text/code files up to 2 MB (files containing NUL bytes and
  image, audio, or video MIME types are rejected); a dropped file also becomes
  the window title;
- an empty-state paste/drop/type prompt with direct editor focus;
- inline editing of the window title;
- automatic language-aware titles for untouched untitled placeholders, safe
  export names, and explicit user filenames;
- macOS, Windows, minimal, or no frame; optional traffic lights, line
  numbers, compact watermark, border, and highlighted lines with a configurable
  capture-safe accent color;
- optional text-only X or LinkedIn handle below the code, with no remote avatar
  or network request;
- automatic or explicit height, width/height sliders, aspect-ratio presets,
  aspect locking, outer/inner padding, background swatches/solid/gradient/
  transparent modes, and 1x/2x/3x export scale;
- a fixed, centered code window and pointer/keyboard canvas resize handles;
- canvas dimensions are clamped to the rendered window size plus twice the
  configured outer padding, so resizing cannot crop the window;
- workspace zoom controls appear when the configured canvas is larger than the
  available viewport; zoom changes the editor view only and never the export
  dimensions;

The editor uses a transparent textarea stacked over highlighted `<pre>` lines,
rather than `contentEditable`. `CodeEditor.jsx` mirrors textarea scroll offsets
to the highlighted layer and gutter, observes row sizes with `ResizeObserver`,
and inserts a tab character when Tab is pressed according to `tabSize`. The
same tab-size CSS value is applied to both layers, so existing tab-indented
code visibly responds to the control. This avoids
cursor jumps during re-highlighting while keeping the visible tokens and caret
in the same geometry.

## PNG export and parity constraints

`page.js` dynamically imports `html2canvas` only inside the export/copy-image
render helper. Before capture it waits for `document.fonts.ready`, temporarily
removes workspace zoom transforms, captures `previewRef.current`, uses
`backgroundColor: null`, `useCORS: true`, `logging: false`, and the configured
1/2/3 scale. Download export uses a sanitized title as `<title>.png`; image
copy renders the same capture to a PNG blob and uses
`navigator.clipboard.write` with a `ClipboardItem` when supported.

Keep these constraints when changing the preview:

- The captured DOM must remain the same visual DOM users see. Put workspace
  chrome, resize handles, and editor interaction-only elements outside the
  capture target.
- The transparent editing textarea and inline title input carry
  `data-html2canvas-ignore="true"`; the highlighted `<pre>` is what gets
  rendered into the image.
- The window shadow is rendered on `.glyph-window-shadow-wrap`; keep that
  wrapper in the capture path and do not reintroduce an overflow boundary on
  `.glyph-capture` that clips it.
- Use explicit hex/rgba-compatible colors in the capture path. The internal
  notes specifically call out that html2canvas cannot parse modern Tailwind v4
  `oklch()` colors, so preview capture styles use the CSS values in
  `globals.css`/`preview.css` instead of relying on utility color output.
- Wait for fonts before comparing or exporting images. Changes to font metrics,
  line height, padding, wrapping, token styling, or theme variables can change
  both the on-screen image and its PNG geometry.

## Glyph JSON import/export

Export is implemented in `page.js` as a browser download containing:

```json
{
  "name": "glyph-config",
  "version": 1,
  "exportedAt": "<ISO timestamp>",
  "config": {},
  "code": "..."
}
```

The file name is `<clean title>.glyph.json`. The hidden file input accepts
`.json` and `.glyph.json`. Import accepts either the wrapper above or a raw
config object, sanitizes it with `sanitizeImportedConfig` in
`src/app/lib/presets.js`, restores optional code, clears
the active preset, and reports malformed files through a toast.

Sanitization starts from `DEFAULT_CONFIG`, allows only known languages/themes,
limits dimensions and numeric controls, strips angle brackets from titles,
validates generated color forms, filters highlighted-line text, and accepts
only the nested text-only X/LinkedIn identity model. Automatic titles are
derived from the detected or selected language; explicit filenames keep their
custom mode and export basenames fall back to `glyph` when unsafe. Import does
not restore the active preset or the separate light/dark interface-theme
preference; the syntax theme, highlight color, title mode, and social identity
are part of `config`.

## Persistence

After the initial mount, `page.js` saves code, config, active preset, and
interface theme preference under the `glyph_app_state_v1`
  `localStorage` key. Invalid saved JSON and storage read/write failures are
ignored so the editor can still start.

`Sidebar.jsx` stores user-created preset bundles separately under
`glyph_custom_presets_v1`; each bundle is sanitized when read. This is local
browser persistence only. `.glyph.json` is the portable manual format; there
is no server persistence.

## Responsive design

Desktop uses a flexible preview stage beside a 340px Inspector. The workspace
scrolls horizontally/vertically when a canvas is larger than the available
stage, while centering it when it fits. The Inspector has its own scroll area.

At widths up to 900px, the Inspector becomes a bottom sheet over the preview,
with an open/close control and a bounded height; the preview remains visible
behind it. At widths up to 480px, the header and sheet use smaller dimensions
and the Import/Export labels collapse. The preview workspace and stage have
dedicated mobile sizing in `src/app/components/preview.css` and
`src/app/globals.css`. `prefers-reduced-motion: reduce` shortens animations
and transitions.

## Keyboard and accessibility behavior

- `Cmd/Ctrl+E` exports a PNG.
- `Cmd/Ctrl+Shift+C` copies the rendered image.
- `Cmd/Ctrl+Z` undoes config changes when focus is outside editable fields.
- Tab inserts a tab using the configured display width in the code editor; Escape then
  Tab, or Shift+Tab, allows normal focus navigation out of the editor.
- Resize handles support arrow keys; Shift changes movement to 10px steps.
- The export menu supports Escape, Up/Down, Home, and End navigation and
  returns focus to its trigger on Escape.
- Controls use labels, `aria-label`, `aria-expanded`, `aria-pressed`, switch
  semantics, live toast announcements, and visible `:focus-visible` rings.
  The code input has an accessible label and an offscreen help description.

## Design tokens

The token source is `src/app/globals.css`:

- app/surface tokens: `--bg-app`, `--bg-surface`,
  `--bg-surface-elevated`, and `--bg-surface-hover`;
- border and text tokens: `--border-subtle`, `--border-strong`,
  `--border-focus`, `--text-primary`, `--text-secondary`, `--text-muted`,
  and `--text-faint`;
- accent/workspace tokens: `--accent`, `--accent-strong`, `--accent-soft`,
  `--workspace-bg`, `--workspace-dot`, `--checker-a`, and `--checker-b`;
- typography tokens: `--font-sans` and `--font-mono`, backed by variable
  Figtree and Geist Mono from `layout.jsx`;
- capture/window tokens set per syntax theme include `--code-bg`, `--code-fg`,
  title-bar colors, and `--tok-keyword`, `--tok-string`, `--tok-number`,
  `--tok-comment`, `--tok-function`, `--tok-title`, `--tok-type`,
  `--tok-builtin`, `--tok-attr`, `--tok-variable`, `--tok-operator`,
  `--tok-punct`, and `--tok-literal`.

`html[data-theme="light"]` overrides app, surface, border, text, and workspace
tokens. Keep new visual controls on these variables where possible, and keep
capture-specific colors compatible with the PNG constraints above.

## Verification commands

Run these from `/home/nightwing/Documents/glyph`:

```bash
npm install       # first-time dependency setup
npm run dev       # development server at http://localhost:3000
npm run lint      # ESLint
npm run build     # production build
npm run start     # serve the completed production build
```

Checks run while preparing this guide:

- `npm run lint` passed with no lint errors.
- `npm run build` passed and prerendered `/` and `/_not-found`.
- Both commands emitted the same non-blocking `baseline-browser-mapping`
  warning: its data is more than two months old.

There is no test script and no `test`, `__tests__`, or `e2e` suite in the
repository. PNG parity, clipboard behavior, file dropping, and responsive
interactions therefore still need browser-level verification when they change.

The latest implementation pass also runs focused Node smoke checks for language
detection, automatic title extensions, safe export basenames, highlight-color
sanitization, Tab-size configuration, and text-only social-identity validation.
These checks complement rather than replace browser-level PNG and responsive
verification.

## Known limitations and current follow-up work

Recent polish completed after the initial redesign includes a bounded Inspector
stacking context, variable Figtree UI typography, compact aspect-ratio and button
typography, hidden native number-input spinners, a centered non-draggable code
window, synchronized Tab-size rendering/insertion, explicit line-number
toggle handling, and a caret-only code-editor focus treatment. Preserve these
behaviors when changing the surrounding controls.

Current limitations and explicitly deferred scope:

- Auto-detection is a Highlight.js heuristic and can be overridden manually;
  it is not a parser or compiler check.
- PNG export depends on browser rendering and html2canvas support. Clipboard
  image copy depends on browser permissions and `ClipboardItem`; unsupported
  or denied operations produce a toast.
- There is no SVG export, multi-file or multi-tab workflow, collaboration or
  share-link backend, custom font upload, or server-side persistence.
- The current mobile treatment is a responsive bottom-sheet Inspector, not a
  separate mobile-first product redesign.
- Automated regression tests are not yet present. Follow-up coverage should
  exercise language override/detection, every control, JSON round-tripping,
  capture parity at each scale/theme, file-drop limits, and keyboard paths.
- The `baseline-browser-mapping` dependency data warning should be addressed
  during a dependency maintenance pass rather than hidden from checks.

The remaining product follow-up is therefore to decide which deferred export,
multi-file, collaboration, font, and mobile capabilities belong in the next
scope, while adding browser-level regression coverage for the existing core
loop. Keep `GLYPH_PROJECT.md`'s completed/future lists synchronized with the
source as those decisions are made.
