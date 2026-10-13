"use client";

import { useEffect, useRef, useState } from "react";

function Icon({ children }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

export default function Header({
  onExportPng,
  isExporting,
  onCopyImage,
  isCopyingImage,
  onCopyCode,
  onExportConfig,
  onTriggerImport,
  theme,
  themePreference,
  onToggleTheme,
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const menuItemsRef = useRef([]);

  useEffect(() => {
    function closeMenu(event) {
      if (!menuRef.current?.contains(event.target)) setExportOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  useEffect(() => {
    if (exportOpen) menuItemsRef.current[0]?.focus();
  }, [exportOpen]);

  function handleMenuKeyDown(event) {
    const items = menuItemsRef.current.filter(Boolean);
    const current = items.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setExportOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      items[(current + direction + items.length) % items.length]?.focus();
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      items[event.key === "Home" ? 0 : items.length - 1]?.focus();
    }
  }

  return (
    <header className="app-header">
      <div className="brand-wrap">
        <div className="brand-logo-mark" aria-hidden="true"><span>g</span></div>
        <div>
          <div className="brand-title">glyph</div>
          <div className="brand-subtitle">code snapshots, refined</div>
        </div>
      </div>

      <div className="header-center">
        <button className="btn ghost header-import" onClick={onTriggerImport} title="Import a Glyph configuration">
          <Icon><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" /><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></Icon>
          <span>Import</span>
        </button>
      </div>
      <div className="header-actions">
        <button className="icon-button" onClick={onToggleTheme} title={`${themePreference === "system" ? "System" : themePreference} theme · switch to ${theme === "dark" ? "light" : "dark"}`} aria-label={`${themePreference === "system" ? "System" : themePreference} theme. Switch to ${theme === "dark" ? "light" : "dark"} interface`}>
          {theme === "dark" ? <Icon><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></Icon> : <Icon><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5 8.5 8.5 0 1 0 20.5 14.6Z" /></Icon>}
        </button>
        <div className="export-menu-wrap" ref={menuRef}>
           <button ref={triggerRef} className="btn primary export-trigger" onClick={() => setExportOpen((open) => !open)} aria-expanded={exportOpen} aria-haspopup="menu" aria-controls="glyph-export-menu">
            <Icon><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></Icon>
            <span>Export</span><span className="chevron">⌄</span>
          </button>
           {exportOpen && <div className="export-menu" id="glyph-export-menu" role="menu" onKeyDown={handleMenuKeyDown}>
             <button ref={(element) => { menuItemsRef.current[0] = element; }} onClick={() => { onExportPng(); setExportOpen(false); }} disabled={isExporting} role="menuitem"><span className="menu-icon">↓</span><span><b>{isExporting ? "Rendering PNG…" : "Export PNG"}</b><small>Download the current canvas</small></span><kbd>⌘ E</kbd></button>
             <button ref={(element) => { menuItemsRef.current[1] = element; }} onClick={() => { onCopyImage(); setExportOpen(false); }} disabled={isCopyingImage} role="menuitem"><span className="menu-icon">▧</span><span><b>{isCopyingImage ? "Copying image…" : "Copy image"}</b><small>Send PNG to clipboard</small></span></button>
             <div className="menu-divider" />
             <button ref={(element) => { menuItemsRef.current[2] = element; }} onClick={() => { onExportConfig(); setExportOpen(false); }} role="menuitem"><span className="menu-icon">✦</span><span><b>Export Glyph</b><small>Save code and styling as JSON</small></span></button>
             <button ref={(element) => { menuItemsRef.current[3] = element; }} onClick={() => { onCopyCode(); setExportOpen(false); }} role="menuitem"><span className="menu-icon">&lt;/&gt;</span><span><b>Copy code</b><small>Copy the raw source</small></span><kbd>⌘ ⇧ C</kbd></button>
          </div>}
        </div>
      </div>
    </header>
  );
}
