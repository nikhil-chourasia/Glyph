"use client";

import { useRef } from "react";

/**
 * An editable code surface: a transparent <textarea> stacked exactly on top
 * of a syntax-highlighted <pre><code>. Typing updates the textarea (plain
 * text, so the native caret/selection behaviour stays correct) while the
 * highlighted layer underneath re-renders from the parent's `highlightedHtml`.
 * This avoids the cursor-jump bugs that come with re-highlighting a
 * contentEditable element on every keystroke.
 */
export default function CodeEditor({
  code,
  highlightedHtml,
  onChange,
  fontSize,
  showLineNumbers,
}) {
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const gutterRef = useRef(null);

  const lineCount = code ? code.split("\n").length : 1;

  // Keep the highlighted layer (and the line-number gutter) glued to the
  // textarea's scroll position so caret and tokens never drift apart when
  // code is longer/wider than the window.
  function handleScroll(e) {
    const { scrollTop, scrollLeft } = e.target;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = textareaRef.current;
      const { selectionStart, selectionEnd } = el;
      const next = `${code.slice(0, selectionStart)}  ${code.slice(selectionEnd)}`;
      onChange(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = selectionStart + 2;
      });
    }
  }

  return (
    <div className="code-editor" style={{ fontSize: `${fontSize}px` }}>
      {showLineNumbers && (
        <div className="code-editor-gutter" ref={gutterRef} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="code-editor-gutter-row">
              {i + 1}
            </div>
          ))}
        </div>
      )}
      <div className="code-editor-stack">
        <pre className="code-editor-highlight" ref={preRef} aria-hidden="true">
          <code
            className="hljs"
            dangerouslySetInnerHTML={{ __html: `${highlightedHtml}\n` }}
          />
        </pre>
        <textarea
          ref={textareaRef}
          className="code-editor-input"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="Paste or type your code here..."
        />
      </div>
    </div>
  );
}
