"use client";

import { useEffect, useRef, useState } from "react";
import CodeEditor from "./CodeEditor";
import { LANGUAGE_LABELS } from "../lib/highlight";
import { getBackground } from "../lib/presets";
import { isAutomaticTitle, sanitizeSocialIdentity, SOCIAL_PLATFORMS } from "../lib/snapshot";
import "./preview.css";

const dimension = (value, fallback) => Math.max(160, Math.min(4096, Number(value) || fallback));

export default function PreviewStage({ code, setCode, highlightedHtml, config, setConfig, previewRef, detectedLabel = "Plain Text", snapshotTitle, onCanvasMinimumsChange }) {
  const [dropError, setDropError] = useState("");
  const [workspaceSize, setWorkspaceSize] = useState({ width: 0, height: 0 });
  const [minimumSize, setMinimumSize] = useState({ width: 320, height: 200 });
  const [zoom, setZoom] = useState(1);
  const workspaceRef = useRef(null);
  const editorInputRef = useRef(null);
  const windowRef = useRef(null);
  const gestureRef = useRef(null);
  const width = Math.max(minimumSize.width, dimension(config.canvasWidth, 920));
  const height = Math.max(minimumSize.height, dimension(config.canvasHeight, 560));
  const padding = Math.max(0, Math.min(Number(config.padding) || 0, (Math.min(width, height) - 80) / 2));
  const frame = config.frameStyle || "macos";
  const identity = sanitizeSocialIdentity(config.socialIdentity);
  const showIdentity = identity.platform !== "none" && Boolean(identity.handle);
  const isTransparent = config.backgroundMode === "transparent";
  const shadowBlur = Math.max(0, Number(config.shadowBlur ?? 40));
  const shadowOffset = Number(config.shadowOffset ?? 14);
  const shadowOpacity = Math.max(0, Math.min(100, Number(config.shadowOpacity ?? config.shadow ?? 45))) / 100;
  const shadow = `0 ${shadowOffset}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity})`;
  const shadowPadding = isTransparent ? Math.min(160, Math.max(8, shadowBlur + Math.abs(shadowOffset) + 4)) : 0;
  const canvasOverflows = workspaceSize.width > 0 && (
    width > Math.max(0, workspaceSize.width - 72) ||
    height > Math.max(0, workspaceSize.height - 72)
  );
  const fitZoom = workspaceSize.width > 0 && workspaceSize.height > 0
    ? Math.min(1, Math.max(0.1, (workspaceSize.width - 72) / width), Math.max(0.1, (workspaceSize.height - 72) / height))
    : 1;
  const displayZoom = canvasOverflows ? Math.min(zoom, fitZoom) : zoom;
  const showZoomControls = canvasOverflows || zoom !== 1;
  const displayWidth = Math.round(width * displayZoom);
  const displayHeight = Math.round(height * displayZoom);
  const canvasBackground = getBackground({
    ...config,
    backgroundStart: config.gradientFrom ?? config.backgroundStart,
    backgroundEnd: config.gradientTo ?? config.backgroundEnd,
    backgroundAngle: config.gradientAngle ?? config.backgroundAngle,
  });

  useEffect(() => {
    const windowElement = windowRef.current;
    if (!windowElement) return undefined;
    const measureMinimums = () => {
      const next = {
        width: Math.ceil(windowElement.offsetWidth + padding * 2),
        height: Math.ceil(windowElement.offsetHeight + padding * 2),
      };
      setMinimumSize((previous) => previous.width === next.width && previous.height === next.height ? previous : next);
      onCanvasMinimumsChange?.(next);
      setConfig((previous) => {
        const canvasWidth = Math.max(previous.canvasWidth, next.width);
        const canvasHeight = Math.max(previous.canvasHeight, next.height);
        return canvasWidth === previous.canvasWidth && canvasHeight === previous.canvasHeight
          ? previous
          : { ...previous, canvasWidth, canvasHeight };
      });
    };
    measureMinimums();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measureMinimums);
    observer.observe(windowElement);
    return () => observer.disconnect();
  }, [padding, onCanvasMinimumsChange, setConfig]);

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return undefined;
    const measure = () => setWorkspaceSize({ width: workspace.clientWidth, height: workspace.clientHeight });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(workspace);
    const frameId = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(frameId);
      observer?.disconnect();
    };
  }, []);

  function updateDimensions(nextWidth, nextHeight) {
    let nextW = Math.max(minimumSize.width, Math.round(dimension(nextWidth, width)));
    let nextH = Math.max(minimumSize.height, Math.round(dimension(nextHeight, height)));
    if (config.aspectLock) {
      const ratio = width / height;
      if (nextWidth !== width) nextH = Math.round(nextW / ratio);
      else nextW = Math.round(nextH * ratio);
    }
    nextW = Math.max(minimumSize.width, dimension(nextW, width));
    nextH = Math.max(minimumSize.height, dimension(nextH, height));
    setConfig((previous) => ({ ...previous, canvasWidth: nextW, canvasHeight: nextH, autoHeight: false }));
  }

  function resize(nextWidth, nextHeight) {
    updateDimensions(nextWidth, nextHeight);
  }

  function startGesture(event, mode) {
    if (event.target.closest("input")) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current = { mode, x: event.clientX, y: event.clientY, width, height, zoom: displayZoom };
  }

  function moveGesture(event) {
    const start = gestureRef.current;
    if (!start) return;
    const dx = (event.clientX - start.x) / start.zoom;
    const dy = (event.clientY - start.y) / start.zoom;
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
      setConfig((previous) => ({ ...previous, title: file.name, titleMode: "custom" }));
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
        <div role="button" tabIndex={0} className="glyph-empty-copy" onClick={() => editorInputRef.current?.focus()} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editorInputRef.current?.focus(); } }}><strong>Paste or drop code to get started.</strong><p>Press ⌘ / Ctrl + V, drop a text file, or start typing in the preview.</p></div>
      </div>}
      {dropError && <p className="glyph-preview-error" role="alert">{dropError}</p>}
       <div ref={workspaceRef} className="glyph-preview-workspace" tabIndex={0} aria-label="Scrollable preview. Paste code or drop a text file here.">
        {showZoomControls && <div className="glyph-zoom-controls" aria-label="Canvas zoom controls">
          <button type="button" onClick={() => setZoom(Math.max(0.1, Math.round((displayZoom - 0.1) * 10) / 10))} aria-label="Zoom out">−</button>
          <output aria-live="polite">{Math.round(displayZoom * 100)}%</output>
          <button type="button" onClick={() => setZoom(Math.min(1, Math.round((displayZoom + 0.1) * 10) / 10))} aria-label="Zoom in">+</button>
        </div>}
        <div className="glyph-preview-scroll-area">
          <div className="glyph-canvas-zoom" style={{ width: displayWidth, height: displayHeight }}>
          <div className="glyph-canvas-shell" style={{ width, height, transform: `scale(${displayZoom})`, transformOrigin: "top left" }}>
            {/* Only this fixed-size element is exported. Workspace and handles are siblings. */}
              <div ref={isTransparent ? undefined : previewRef} className="glyph-capture" style={{ width, height, padding, background: canvasBackground, justifyContent: "center" }}>
              <div ref={isTransparent ? previewRef : undefined} className="glyph-window-shadow-wrap" style={{ padding: shadowPadding, borderRadius: `${config.cornerRadius ?? 14}px`, boxShadow: shadow }}>
              <div ref={(element) => { windowRef.current = element; }} className="window glyph-preview-window" data-syntax-theme={config.syntaxTheme || "glyph-dark"}
                style={{ borderRadius: `${config.cornerRadius ?? 14}px`, border: config.showBorder === false ? "none" : "1px solid var(--titlebar-border, rgba(255,255,255,.12))", boxShadow: "none", height: "auto" }}>
                 {frame !== "none" && <div className={`glyph-window-titlebar glyph-frame-${frame}`}>
                  {frame === "macos" && config.showTrafficLights !== false && <span className="glyph-window-traffic" aria-hidden="true"><i /><i /><i /></span>}
                  <div className="glyph-window-title">
                    <span><span data-html2canvas-ignore={isAutomaticTitle(config) || undefined}>{snapshotTitle}</span></span>
                    <input value={snapshotTitle} onChange={(event) => setConfig((previous) => ({ ...previous, title: event.target.value, titleMode: "custom" }))} aria-label="Window title" placeholder="Filename (optional)" spellCheck={false} data-html2canvas-ignore="true" />
                  </div>
                  {frame === "windows" && <span className="glyph-window-controls" aria-hidden="true">─ □ ×</span>}
                </div>}
                <CodeEditor code={code} highlightedHtml={highlightedHtml} onChange={setCode} inputRef={editorInputRef} fontSize={config.fontSize} showLineNumbers={config.showLineNumbers}
                  fontFamily={config.fontFamily} lineHeight={config.lineHeight} ligatures={config.ligatures} highlightedLines={config.highlightedLines} highlightColor={config.highlightColor} wrap={config.wrap} tabSize={config.tabSize} innerPadding={config.innerPadding} />
               {showIdentity && <div className="glyph-snapshot-identity" aria-label={`${SOCIAL_PLATFORMS[identity.platform]} identity`}>
                  <span className="glyph-identity-platform">{SOCIAL_PLATFORMS[identity.platform]}</span>
                  <span className="glyph-identity-handle">@{identity.handle}</span>
               </div>}
              </div>
              </div>
              {config.showWatermark && <div className="glyph-preview-watermark">Glyph</div>}
            </div>
            <button type="button" className="glyph-canvas-resize glyph-resize-width" aria-label="Resize canvas width. Use left and right arrows, Shift for 10 pixels." onPointerDown={(event) => startGesture(event, "width")} onKeyDown={(event) => resizeKey(event, "width")} {...gestureEvents} />
            <button type="button" className="glyph-canvas-resize glyph-resize-corner" aria-label="Resize canvas. Use arrow keys, Shift for 10 pixels." onPointerDown={(event) => startGesture(event, "both")} onKeyDown={(event) => resizeKey(event, "both")} {...gestureEvents}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M3 13 13 3M8 13h5V8M5 13h8" /></svg>
            </button>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
