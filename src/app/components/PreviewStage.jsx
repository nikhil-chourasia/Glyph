"use client";

import { useRef, useState } from "react";
import CodeEditor from "./CodeEditor";
import { LANGUAGE_LABELS } from "../lib/highlight";
import { getBackground } from "../lib/presets";
import "./preview.css";

const dimension = (value, fallback) => Math.max(160, Math.min(4096, Number(value) || fallback));

export default function PreviewStage({ code, setCode, highlightedHtml, config, setConfig, previewRef, detectedLabel = "Plain Text", onTrySample }) {
  const [dropError, setDropError] = useState("");
  const editorInputRef = useRef(null);
  const gestureRef = useRef(null);
  const width = dimension(config.canvasWidth, 920);
  const height = dimension(config.canvasHeight, 560);
  const padding = Math.max(0, Math.min(Number(config.padding) || 0, (Math.min(width, height) - 80) / 2));
  const frame = config.frameStyle || "macos";
  const canvasBackground = getBackground({
    ...config,
    backgroundStart: config.gradientFrom ?? config.backgroundStart,
    backgroundEnd: config.gradientTo ?? config.backgroundEnd,
    backgroundAngle: config.gradientAngle ?? config.backgroundAngle,
  });

  function updateDimensions(nextWidth, nextHeight) {
    let nextW = Math.round(dimension(nextWidth, width));
    let nextH = Math.round(dimension(nextHeight, height));
    if (config.aspectLock) {
      const ratio = width / height;
      if (nextWidth !== width) nextH = Math.round(nextW / ratio);
      else nextW = Math.round(nextH * ratio);
    }
    nextW = dimension(nextW, width);
    nextH = dimension(nextH, height);
    setConfig((previous) => ({ ...previous, canvasWidth: nextW, canvasHeight: nextH, autoHeight: false }));
  }

  function resize(nextWidth, nextHeight) {
    updateDimensions(nextWidth, nextHeight);
  }

  function startGesture(event, mode) {
    if (event.target.closest("input")) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current = { mode, x: event.clientX, y: event.clientY, width, height };
  }

  function moveGesture(event) {
    const start = gestureRef.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    resize(start.width + dx, start.mode === "width" ? start.height : start.height + dy);
  }

  const gestureEvents = {
    onPointerMove: moveGesture,
    onPointerUp: () => { gestureRef.current = null; },
    onPointerCancel: () => { gestureRef.current = null; },
    onLostPointerCapture: () => { gestureRef.current = null; },
  };

  function resizeKey(event, mode) {
    const step = event.shiftKey ? 10 : 1;
    const dx = event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0;
    const dy = mode === "both" ? event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0 : 0;
    if (dx || dy) { event.preventDefault(); resize(width + dx, height + dy); }
  }

  async function handleDrop(event) {
    event.preventDefault();
    setDropError("");
    const file = event.dataTransfer.files[0];
    if (!file) {
      const text = event.dataTransfer.getData("text/plain");
      if (text) setCode(text);
      return;
    }
    if (file.size > 2 * 1024 * 1024) { setDropError("Choose a text or code file smaller than 2 MB."); return; }
    try {
      const text = await file.text();
      if (text.includes("\0") || /^(image|audio|video)\//.test(file.type)) {
        setDropError("That file does not look like text. Drop a code or text file instead.");
        return;
      }
      setCode(text);
      setConfig((previous) => ({ ...previous, title: file.name }));
    } catch { setDropError("Could not read this file. Try pasting its text instead."); }
  }

  return (
    <section className="glyph-preview-stage" aria-label="Code snapshot workspace"
      onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }} onDrop={handleDrop}
      onPaste={(event) => {
        if (event.target.closest("textarea, input")) return;
        const text = event.clipboardData.getData("text/plain");
        if (text) { event.preventDefault(); setCode(text); }
      }}>
      <div className="glyph-preview-toolbar">
        <div className="glyph-preview-language">
          <span className="glyph-detected-language">{config.language === "auto" || !config.language ? "Detected" : "Language"}: {detectedLabel}</span>
          <select aria-label="Code language" value={config.language || "auto"} onChange={(event) => setConfig((previous) => ({ ...previous, language: event.target.value }))}>
            {Object.entries(LANGUAGE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <span className="glyph-preview-size">{width} × {height} px</span>
      </div>
      {!code && <div className="glyph-preview-empty">
        <div role="button" tabIndex={0} className="glyph-empty-copy" onClick={() => editorInputRef.current?.focus()} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editorInputRef.current?.focus(); } }}><strong>Your next great snippet starts here.</strong><p>Paste with ⌘ / Ctrl + V, drop a text file, or start typing below.</p></div>
        <button type="button" onClick={() => onTrySample ? onTrySample() : setCode('const greeting = "Hello, world!";\nconsole.log(greeting);')}>Try a sample</button>
      </div>}
      {dropError && <p className="glyph-preview-error" role="alert">{dropError}</p>}
      <div className="glyph-preview-workspace" tabIndex={0} aria-label="Scrollable preview. Paste code or drop a text file here.">
        <div className="glyph-preview-scroll-area">
          <div className="glyph-canvas-shell" style={{ width, height }}>
            {/* Only this fixed-size element is exported. Workspace and handles are siblings. */}
              <div ref={previewRef} className="glyph-capture" style={{ width, height, padding, background: canvasBackground, justifyContent: "center" }}>
              <div className="window glyph-preview-window" data-syntax-theme={config.syntaxTheme || "glyph-dark"}
                style={{ borderRadius: `${config.cornerRadius ?? 14}px`, border: config.showBorder === false ? "none" : "1px solid var(--titlebar-border, rgba(255,255,255,.12))", boxShadow: `0 ${config.shadowOffset ?? 14}px ${config.shadowBlur ?? 40}px rgba(0,0,0,${Math.max(0, Math.min(100, config.shadowOpacity ?? config.shadow ?? 45)) / 100})`, height: config.autoHeight === false ? "100%" : "auto" }}>
                 {frame !== "none" && <div className={`glyph-window-titlebar glyph-frame-${frame}`}>
                  {frame === "macos" && config.showTrafficLights !== false && <span className="glyph-window-traffic" aria-hidden="true"><i /><i /><i /></span>}
                  <div className="glyph-window-title">
                    <span>{config.title || "untitled"}</span>
                    <input value={config.title || ""} onChange={(event) => setConfig((previous) => ({ ...previous, title: event.target.value }))} aria-label="Window title" placeholder="untitled" spellCheck={false} data-html2canvas-ignore="true" />
                  </div>
                  {frame === "windows" && <span className="glyph-window-controls" aria-hidden="true">─ □ ×</span>}
                </div>}
                <CodeEditor code={code} highlightedHtml={highlightedHtml} onChange={setCode} inputRef={editorInputRef} fontSize={config.fontSize} showLineNumbers={config.showLineNumbers}
                  fontFamily={config.fontFamily} lineHeight={config.lineHeight} ligatures={config.ligatures} highlightedLines={config.highlightedLines} wrap={config.wrap} tabSize={config.tabSize} innerPadding={config.innerPadding} />
              </div>
              {config.showWatermark && <div className="glyph-preview-watermark">Made with Glyph</div>}
            </div>
            <button type="button" className="glyph-canvas-resize glyph-resize-width" aria-label="Resize canvas width. Use left and right arrows, Shift for 10 pixels." onPointerDown={(event) => startGesture(event, "width")} onKeyDown={(event) => resizeKey(event, "width")} {...gestureEvents} />
            <button type="button" className="glyph-canvas-resize glyph-resize-corner" aria-label="Resize canvas. Use arrow keys, Shift for 10 pixels." onPointerDown={(event) => startGesture(event, "both")} onKeyDown={(event) => resizeKey(event, "both")} {...gestureEvents}>↘</button>
          </div>
        </div>
      </div>
      <div className="glyph-preview-footer">
        <span>100% preview · Scroll to explore · Esc then Tab leaves the editor</span>
      </div>
    </section>
  );
}
