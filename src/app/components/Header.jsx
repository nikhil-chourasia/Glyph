"use client";

import { useRef } from "react";

export default function Header({
  onExportPng,
  isExporting,
  onCopyImage,
  isCopyingImage,
  onCopyCode,
  onExportConfig,
  onImportConfig,
}) {
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        onImportConfig(json);
      } catch {
        alert("Failed to parse .glyph.json file. Please ensure it is valid JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <header className="app-header">
      <div className="brand-wrap">
        <div className="brand-logo-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <span className="brand-title">glyph</span>
        <span className="brand-tag">v1.0</span>
      </div>

      <div className="header-actions">
        {/* Quick copy code */}
        <button
          className="btn ghost btn-text-hide"
          onClick={onCopyCode}
          title="Copy raw code to clipboard"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>Copy Code</span>
        </button>

        {/* Quick copy image */}
        <button
          className="btn ghost btn-text-hide"
          onClick={onCopyImage}
          disabled={isCopyingImage}
          title="Copy rendered PNG directly to clipboard"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>{isCopyingImage ? "Copying…" : "Copy Image"}</span>
        </button>

        {/* Import & Export Glyph JSON Config */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.glyph.json"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          className="btn ghost"
          onClick={() => fileInputRef.current?.click()}
          title="Import a saved .glyph.json style"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Import</span>
        </button>

        <button
          className="btn ghost"
          onClick={onExportConfig}
          title="Save your styling configuration as .glyph.json"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Export Glyph</span>
        </button>

        {/* Minimal High-Contrast Primary Button */}
        <button
          className="btn primary"
          onClick={onExportPng}
          disabled={isExporting}
          title="Download PNG screenshot"
        >
          {isExporting ? (
            <svg
              style={{ animation: "spin 1s linear infinite" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          )}
          <span>{isExporting ? "Exporting…" : "Export PNG"}</span>
        </button>
      </div>
    </header>
  );
}
