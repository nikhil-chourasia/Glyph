"use client";

import { useId, useLayoutEffect, useMemo, useRef } from "react";

// highlight.js spans can cross newlines. Close/reopen them so each logical
// line is independently measurable without losing multiline token colors.
function splitHighlight(html) {
  const open = [];
  const lines = [];
  let line = "";
  for (const part of html.split(/(<span\b[^>]*>|<\/span>|\n)/g)) {
    if (part === "\n") {
      lines.push(line + "</span>".repeat(open.length));
      line = open.join("");
    } else {
      if (part.startsWith("<span")) open.push(part);
      if (part === "</span>") open.pop();
      line += part;
    }
  }
  lines.push(line + "</span>".repeat(open.length));
  return lines;
}

function isHighlighted(number, ranges) {
  return String(ranges || "").split(",").some((range) => {
    const match = range.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    return match && number >= Number(match[1]) && number <= Number(match[2] || match[1]);
  });
}

export default function CodeEditor({
  code = "", highlightedHtml = "", onChange, fontSize = 14,
  showLineNumbers = false, fontFamily = "geist", lineHeight = 1.6,
  ligatures = true, highlightedLines = "", wrap = false, tabSize = 2, inputRef,
  innerPadding = 20,
}) {
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const gutterRef = useRef(null);
  const escapeTabRef = useRef(false);
  const helpId = useId();
  const tabWidth = Math.max(2, Math.min(8, Number(tabSize) || 4));
  const lines = useMemo(() => splitHighlight(highlightedHtml), [highlightedHtml]);

  // Measure actual wrapped rows rather than guessing with character counts.
  useLayoutEffect(() => {
    const pre = preRef.current;
    const gutter = gutterRef.current;
    function sync() {
      if (gutter) {
        Array.from(pre.children).forEach((row, index) => {
          if (gutter.children[index]) gutter.children[index].style.height = `${row.getBoundingClientRect().height}px`;
        });
      }
      if (textareaRef.current) {
        pre.scrollTop = textareaRef.current.scrollTop;
        pre.scrollLeft = textareaRef.current.scrollLeft;
        if (gutter) gutter.scrollTop = textareaRef.current.scrollTop;
      }
    }
    sync();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(sync);
    observer.observe(pre);
    Array.from(pre.children).forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [lines, showLineNumbers, fontSize, lineHeight, wrap, fontFamily, innerPadding]);

  function handleScroll(event) {
    const { scrollTop, scrollLeft } = event.currentTarget;
    preRef.current.scrollTop = scrollTop;
    preRef.current.scrollLeft = scrollLeft;
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      escapeTabRef.current = true;
      return;
    }
    if (event.key !== "Tab") {
      escapeTabRef.current = false;
      return;
    }
    if (escapeTabRef.current || event.shiftKey) {
      escapeTabRef.current = false;
      return;
    }
    event.preventDefault();
    const element = event.currentTarget;
    const { selectionStart, selectionEnd } = element;
    const spaces = " ".repeat(tabWidth);
    onChange(`${code.slice(0, selectionStart)}${spaces}${code.slice(selectionEnd)}`);
    requestAnimationFrame(() => element.setSelectionRange(selectionStart + spaces.length, selectionStart + spaces.length));
  }

  return (
    <div className="glyph-code-editor" style={{
      fontSize: `${fontSize}px`, lineHeight,
      fontFamily: fontFamily === "monospace" ? "ui-monospace, SFMono-Regular, Consolas, monospace" : "var(--font-geist-mono), ui-monospace, monospace",
      fontVariantLigatures: ligatures ? "normal" : "none",
       tabSize: tabWidth, padding: `${innerPadding}px`,
       "--editor-tab-size": tabWidth,
      "--editor-white-space": wrap ? "pre-wrap" : "pre",
      "--editor-wrap": wrap ? "anywhere" : "normal",
    }}>
      <span id={helpId} className="glyph-preview-sr-only" data-html2canvas-ignore="true">Tab inserts indentation. Press Escape then Tab to leave the editor, or use Shift+Tab.</span>
      {showLineNumbers && <div className="glyph-code-gutter" ref={gutterRef} aria-hidden="true">
        {lines.map((_, index) => <div key={index}>{index + 1}</div>)}
      </div>}
      <div className="glyph-code-stack">
        <pre className="glyph-code-highlight" ref={preRef} aria-hidden="true">
          {lines.map((line, index) => <code key={index}
            className={`hljs glyph-code-line${isHighlighted(index + 1, highlightedLines) ? " is-highlighted" : ""}`}
            dangerouslySetInnerHTML={{ __html: line || "\u200b" }} />)}
        </pre>
        <textarea ref={(element) => { textareaRef.current = element; if (inputRef) inputRef.current = element; }} className="glyph-code-input" value={code}
          onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown}
          onScroll={handleScroll} onBlur={() => { escapeTabRef.current = false; }}
          spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap={wrap ? "soft" : "off"}
           aria-label="Code to screenshot" aria-describedby={helpId} data-html2canvas-ignore="true" />
      </div>
    </div>
  );
}
