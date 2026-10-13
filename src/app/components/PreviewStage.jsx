"use client";

import { useEffect, useRef, useState } from "react";
import CodeEditor from "./CodeEditor";

export default function PreviewStage({
  code,
  setCode,
  highlightedHtml,
  config,
  setConfig,
  previewRef,
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const windowRef = useRef(null);
  const dragStartRef = useRef(null);
  const resizeStartRef = useRef(null);

  // Dragging the console window by its titlebar
  function handleMouseDownTitlebar(e) {
    // Avoid triggering drag when interacting with window title input
    if (e.target.tagName === "INPUT" || e.target.closest("input")) return;

    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  }

  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(e) {
      if (!dragStartRef.current || !previewRef.current || !windowRef.current) return;
      const { startX, startY, initialX, initialY } = dragStartRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const canvasRect = previewRef.current.getBoundingClientRect();
      const winRect = windowRef.current.getBoundingClientRect();
      const pad = Number(config.padding) || 24;

      // Maximum offset from center so window never leaves canvas bounds
      const maxOffsetX = Math.max(0, (canvasRect.width - winRect.width) / 2 - pad);
      const maxOffsetY = Math.max(0, (canvasRect.height - winRect.height) / 2 - pad);

      const targetX = initialX + deltaX;
      const targetY = initialY + deltaY;

      const clampedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, targetX));
      const clampedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, targetY));

      setPosition({ x: clampedX, y: clampedY });
    }

    function handleMouseUp() {
      setIsDragging(false);
      dragStartRef.current = null;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, config.padding, previewRef]);

  // Resizing the console window with strict canvas boundary limits
  function handleMouseDownResize(e, direction = "both") {
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: windowRef.current?.offsetWidth || config.canvasWidth,
      startHeight: windowRef.current?.offsetHeight || config.canvasHeight,
      direction,
    };
  }

  useEffect(() => {
    if (!isResizing) return;

    function handleMouseMove(e) {
      if (!resizeStartRef.current || !previewRef.current) return;
      const { startX, startY, startWidth, startHeight, direction } = resizeStartRef.current;
      const deltaX = (e.clientX - startX) * 2;
      const deltaY = (e.clientY - startY) * 2;

      const canvasRect = previewRef.current.getBoundingClientRect();
      const pad = Number(config.padding) || 24;

      // Strict limit: cannot stretch beyond canvas boundaries minus padding and position offset
      const maxLimitWidth = Math.max(340, canvasRect.width - (pad * 2) - Math.abs(position.x) * 2);
      const maxLimitHeight = Math.max(180, canvasRect.height - (pad * 2) - Math.abs(position.y) * 2);

      const requestedWidth = startWidth + deltaX;
      const clampedWidth = Math.min(maxLimitWidth, Math.max(320, requestedWidth));

      if (direction === "width") {
        setConfig((prev) => ({
          ...prev,
          canvasWidth: Math.round(clampedWidth),
        }));
      } else {
        const requestedHeight = startHeight + deltaY;
        const clampedHeight = Math.min(maxLimitHeight, Math.max(180, requestedHeight));
        setConfig((prev) => ({
          ...prev,
          canvasWidth: Math.round(clampedWidth),
          canvasHeight: Math.round(clampedHeight),
          autoHeight: false,
        }));
      }
    }

    function handleMouseUp() {
      setIsResizing(false);
      resizeStartRef.current = null;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, position, config.padding, setConfig, previewRef]);

  // Re-check and clamp console window dimensions if padding or window size changes
  useEffect(() => {
    if (!previewRef.current || !windowRef.current) return;
    const canvasRect = previewRef.current.getBoundingClientRect();
    const pad = Number(config.padding) || 24;
    const maxLimitWidth = Math.max(340, canvasRect.width - (pad * 2));

    if (config.canvasWidth > maxLimitWidth) {
      setConfig((prev) => ({
        ...prev,
        canvasWidth: Math.round(maxLimitWidth),
      }));
    }
  }, [config.padding, config.canvasWidth, setConfig, previewRef]);

  return (
    <div className="canvas-stage-wrapper">
      {/* Viewport canvas filling entire remaining space without overflow */}
      <div className="canvas-viewport">
        {/* Captured Target for html2canvas */}
        <div
          className="preview-card"
          ref={previewRef}
          style={{
            background: config.background,
            padding: `${config.padding}px`,
          }}
        >
          {/* Draggable & Resizable Console Window */}
          <div
            ref={windowRef}
            className="window"
            data-syntax-theme={config.syntaxTheme}
            style={{
              width: `${config.canvasWidth}px`,
              maxWidth: `calc(100% - ${config.padding * 2}px)`,
              height: config.autoHeight ? "auto" : `${config.canvasHeight}px`,
              maxHeight: `calc(100% - ${config.padding * 2}px)`,
              borderRadius: `${config.cornerRadius}px`,
              boxShadow: `0 14px 40px rgba(0,0,0,${config.shadow / 100})`,
              transform: `translate(${position.x}px, ${position.y}px)`,
            }}
          >
            {/* Titlebar with theme colors & drag handle */}
            <div
              className={`titlebar ${isDragging ? "dragging" : ""}`}
              onMouseDown={handleMouseDownTitlebar}
              title="Click and drag to move window"
            >
              {config.showTrafficLights ? (
                <div className="traffic">
                  <div className="dot red" />
                  <div className="dot yellow" />
                  <div className="dot green" />
                </div>
              ) : (
                <div style={{ width: 44 }} />
              )}

              <div className="titlebar-center">
                <input
                  type="text"
                  className="window-title-input"
                  value={config.title}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="untitled.py"
                  aria-label="Window title"
                  spellCheck={false}
                />
              </div>

              {/* Right drag grip indicator / spacer */}
              <div
                style={{
                  width: 44,
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  opacity: 0.35,
                  cursor: "grab",
                }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
                  <circle cx="9" cy="6" r="1.5" />
                  <circle cx="15" cy="6" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" />
                  <circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="18" r="1.5" />
                  <circle cx="15" cy="18" r="1.5" />
                </svg>
              </div>
            </div>

            {/* Editable code surface */}
            <CodeEditor
              code={code}
              highlightedHtml={highlightedHtml}
              onChange={setCode}
              fontSize={config.fontSize}
              showLineNumbers={config.showLineNumbers}
            />

            {/* Subtle resize handles bounded to canvas */}
            <div
              className="resize-handle-right"
              data-html2canvas-ignore="true"
              onMouseDown={(e) => handleMouseDownResize(e, "width")}
              title="Drag horizontally to resize width"
            />
            <div
              className="resize-handle-corner"
              data-html2canvas-ignore="true"
              onMouseDown={(e) => handleMouseDownResize(e, "both")}
              title="Drag to resize width and height"
            />
          </div>

          {/* Minimal Watermark */}
          {config.showWatermark && (
            <div className="preview-watermark">
              Made with Glyph
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
