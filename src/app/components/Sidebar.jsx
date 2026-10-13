"use client";

import {
  SYNTAX_THEMES,
  BACKGROUND_SWATCHES,
  ASPECT_RATIOS,
  PRESETS,
  DEFAULT_CONFIG,
} from "../lib/presets";
import { LANGUAGE_LABELS, LANGUAGE_OPTIONS } from "../lib/highlight";

const THEME_PREVIEW_COLORS = {
  "glyph-dark": ["#c084fc", "#4ade80", "#60a5fa"],
  "dracula": ["#ff79c6", "#50fa7b", "#8be9fd"],
  "night-owl": ["#c792ea", "#ecc48d", "#82aaff"],
  "nord": ["#81a1c1", "#a3be8c", "#88c0d0"],
  "glyph-light": ["#7c3aed", "#059669", "#2563eb"],
};

export default function Sidebar({
  config,
  setConfig,
  activePreset,
  setActivePreset,
  detectedLabel,
  onExportPng,
  isExporting,
  exportError,
  onCopyImage,
  isCopyingImage,
  onCopyCode,
  onExportConfig,
  onTriggerImport,
}) {
  function updateConfig(field, value) {
    setActivePreset(null);
    setConfig((prev) => ({ ...prev, [field]: value }));
  }

  function handleApplyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    setActivePreset(presetKey);
    setConfig((prev) => ({
      ...prev,
      ...preset.config,
    }));
  }

  function handleReset() {
    setActivePreset("default");
    setConfig({ ...DEFAULT_CONFIG });
  }

  function handleAspectRatioSelect(ratio) {
    if (ratio.id === "auto") {
      setConfig((prev) => ({
        ...prev,
        autoHeight: true,
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        canvasWidth: ratio.width,
        canvasHeight: ratio.height,
        autoHeight: false,
      }));
    }
    setActivePreset(null);
  }

  const currentLangDisplay =
    config.language === "auto" ? `Auto: ${detectedLabel}` : (LANGUAGE_LABELS[config.language] || config.language);

  return (
    <aside className="right-sidebar">
      {/* Inspector Top Bar with Language Mark */}
      <div className="sidebar-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="sidebar-title">Inspector</span>
          {/* Language mark moved from code box to inspector header */}
          <span className="lang-chip" title={`Language: ${currentLangDisplay}`}>
            {currentLangDisplay}
          </span>
        </div>
        <button
          className="btn subtle"
          onClick={handleReset}
          title="Reset to defaults"
          style={{ fontSize: 11 }}
        >
          Reset
        </button>
      </div>

      <div className="sidebar-content">
        {/* Section 1: Presets */}
        <div className="inspector-section">
          <div className="section-label">
            <span>Presets</span>
          </div>
          <div className="preset-grid">
            {Object.entries(PRESETS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={`preset-card ${activePreset === key ? "active" : ""}`}
                onClick={() => handleApplyPreset(key)}
              >
                <div className="preset-name">{item.label}</div>
                <div className="preset-desc">{item.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Frame & Canvas */}
        <div className="inspector-section">
          <div className="section-label">
            <span>Frame & Canvas</span>
          </div>

          {/* Aspect Ratio */}
          <div className="field-col">
            <div className="field-label">
              <span>Aspect Ratio</span>
            </div>
            <div className="aspect-pill-group">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  className={`aspect-pill ${
                    ratio.id === "auto" && config.autoHeight
                      ? "active"
                      : !config.autoHeight &&
                        config.canvasWidth === ratio.width &&
                        config.canvasHeight === ratio.height
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleAspectRatioSelect(ratio)}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Width */}
          <div className="field-col">
            <div className="field-label">
              <span>Width</span>
              <span className="field-value-badge">{config.canvasWidth}px</span>
            </div>
            <input
              type="range"
              min="440"
              max="1800"
              step="10"
              value={config.canvasWidth}
              onChange={(e) => updateConfig("canvasWidth", Number(e.target.value))}
            />
          </div>

          {/* Auto Height */}
          <label className="switch-label">
            <span>Auto Height</span>
            <div
              className={`switch-track ${config.autoHeight ? "active" : ""}`}
              onClick={() => updateConfig("autoHeight", !config.autoHeight)}
            >
              <div className="switch-thumb" />
            </div>
          </label>

          {!config.autoHeight && (
            <div className="field-col">
              <div className="field-label">
                <span>Height</span>
                <span className="field-value-badge">{config.canvasHeight}px</span>
              </div>
              <input
                type="range"
                min="240"
                max="1400"
                step="10"
                value={config.canvasHeight}
                onChange={(e) => updateConfig("canvasHeight", Number(e.target.value))}
              />
            </div>
          )}

          {/* Padding */}
          <div className="field-col">
            <div className="field-label">
              <span>Padding</span>
              <span className="field-value-badge">{config.padding}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="120"
              step="4"
              value={config.padding}
              onChange={(e) => updateConfig("padding", Number(e.target.value))}
            />
          </div>

          {/* Backdrop Swatches */}
          <div className="field-col">
            <div className="field-label">
              <span>Backdrop</span>
            </div>
            <div className="swatches-grid">
              {BACKGROUND_SWATCHES.map((swatch) => (
                <button
                  key={swatch.id}
                  type="button"
                  className={`swatch-btn ${config.background === swatch.value ? "active" : ""}`}
                  style={{ background: swatch.value }}
                  title={swatch.label}
                  onClick={() => updateConfig("background", swatch.value)}
                >
                  {config.background === swatch.value && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="field-col">
            <div className="custom-color-row">
              <input
                type="color"
                className="color-picker-input"
                value={config.background.startsWith("#") ? config.background : "#181920"}
                onChange={(e) => updateConfig("background", e.target.value)}
                title="Pick a solid color"
              />
              <input
                type="text"
                className="text-input"
                value={config.background}
                onChange={(e) => updateConfig("background", e.target.value)}
                placeholder="e.g. #0c0d11 or linear-gradient(...)"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Window Chrome */}
        <div className="inspector-section">
          <div className="section-label">
            <span>Window Chrome</span>
          </div>

          {/* Filename */}
          <div className="field-col">
            <div className="field-label">
              <span>Filename</span>
            </div>
            <input
              type="text"
              className="text-input"
              value={config.title}
              onChange={(e) => updateConfig("title", e.target.value)}
              placeholder="untitled.py"
            />
          </div>

          {/* Traffic Lights Toggle */}
          <label className="switch-label">
            <span>Traffic Lights</span>
            <div
              className={`switch-track ${config.showTrafficLights ? "active" : ""}`}
              onClick={() => updateConfig("showTrafficLights", !config.showTrafficLights)}
            >
              <div className="switch-thumb" />
            </div>
          </label>

          {/* Line Numbers Toggle */}
          <label className="switch-label">
            <span>Line Numbers</span>
            <div
              className={`switch-track ${config.showLineNumbers ? "active" : ""}`}
              onClick={() => updateConfig("showLineNumbers", !config.showLineNumbers)}
            >
              <div className="switch-thumb" />
            </div>
          </label>

          {/* Watermark Toggle */}
          <label className="switch-label">
            <span>Watermark</span>
            <div
              className={`switch-track ${config.showWatermark ? "active" : ""}`}
              onClick={() => updateConfig("showWatermark", !config.showWatermark)}
            >
              <div className="switch-thumb" />
            </div>
          </label>
        </div>

        {/* Section 4: Style & Typography */}
        <div className="inspector-section">
          <div className="section-label">
            <span>Style & Typography</span>
          </div>

          {/* Syntax Themes */}
          <div className="field-col">
            <div className="field-label">
              <span>Syntax Theme</span>
            </div>
            <div className="theme-select-grid">
              {Object.entries(SYNTAX_THEMES).map(([themeKey, themeLabel]) => (
                <button
                  key={themeKey}
                  type="button"
                  className={`theme-card ${config.syntaxTheme === themeKey ? "active" : ""}`}
                  onClick={() => updateConfig("syntaxTheme", themeKey)}
                >
                  <div className="theme-card-left">
                    <div className="theme-preview-dots">
                      {(THEME_PREVIEW_COLORS[themeKey] || ["#999", "#888", "#777"]).map((c, i) => (
                        <div
                          key={i}
                          className="theme-preview-dot"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{themeLabel}</span>
                  </div>
                  {config.syntaxTheme === themeKey && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, color: "#ffffff" }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="field-col">
            <div className="field-label">
              <span>Font Size</span>
              <span className="field-value-badge">{config.fontSize}px</span>
            </div>
            <input
              type="range"
              min="11"
              max="26"
              step="1"
              value={config.fontSize}
              onChange={(e) => updateConfig("fontSize", Number(e.target.value))}
            />
          </div>

          {/* Corner Radius */}
          <div className="field-col">
            <div className="field-label">
              <span>Corner Radius</span>
              <span className="field-value-badge">{config.cornerRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="36"
              step="2"
              value={config.cornerRadius}
              onChange={(e) => updateConfig("cornerRadius", Number(e.target.value))}
            />
          </div>

          {/* Shadow Intensity */}
          <div className="field-col">
            <div className="field-label">
              <span>Shadow</span>
              <span className="field-value-badge">{config.shadow}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={config.shadow}
              onChange={(e) => updateConfig("shadow", Number(e.target.value))}
            />
          </div>
        </div>

        {/* Section 5: Language Selection */}
        <div className="inspector-section">
          <div className="section-label">
            <span>Language</span>
            <span className="lang-chip">{currentLangDisplay}</span>
          </div>
          <div className="field-col">
            <select
              className="select-input"
              value={config.language}
              onChange={(e) => updateConfig("language", e.target.value)}
            >
              <option value="auto">Auto-detect ({detectedLabel})</option>
              <optgroup label="Supported Languages">
                {LANGUAGE_OPTIONS.map((langKey) => (
                  <option key={langKey} value={langKey}>
                    {LANGUAGE_LABELS[langKey] || langKey}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Section 6: Export & Share */}
        <div className="inspector-section">
          <div className="section-label">
            <span>Export & Share</span>
          </div>

          {/* Resolution */}
          <div className="field-col">
            <div className="field-label">
              <span>Resolution</span>
            </div>
            <div className="aspect-pill-group">
              {[
                { scale: 1, label: "1x" },
                { scale: 2, label: "2x (Retina)" },
                { scale: 3, label: "3x" },
              ].map((item) => (
                <button
                  key={item.scale}
                  type="button"
                  className={`aspect-pill ${config.exportScale === item.scale ? "active" : ""}`}
                  onClick={() => updateConfig("exportScale", item.scale)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export PNG */}
          <button
            className="btn primary"
            style={{ width: "100%", padding: "9px 14px" }}
            onClick={onExportPng}
            disabled={isExporting}
          >
            {isExporting ? (
              <span>Generating PNG…</span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Export PNG ({config.exportScale}x)</span>
              </>
            )}
          </button>

          {/* Quick Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <button
              className="btn ghost"
              onClick={onCopyImage}
              disabled={isCopyingImage}
              title="Copy rendered PNG image"
            >
              Copy Image
            </button>
            <button
              className="btn ghost"
              onClick={onCopyCode}
              title="Copy raw code"
            >
              Copy Code
            </button>
          </div>

          {/* Config JSON Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 2 }}>
            <button
              className="btn subtle"
              style={{ fontSize: 11, border: "1px solid var(--border-subtle)" }}
              onClick={onExportConfig}
              title="Export this style as .glyph.json"
            >
              Export JSON
            </button>
            <button
              className="btn subtle"
              style={{ fontSize: 11, border: "1px solid var(--border-subtle)" }}
              onClick={onTriggerImport}
              title="Import .glyph.json"
            >
              Import JSON
            </button>
          </div>

          {exportError && <div className="export-error">{exportError}</div>}
        </div>
      </div>
    </aside>
  );
}
