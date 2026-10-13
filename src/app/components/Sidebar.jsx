"use client";

import { useEffect, useMemo, useState } from "react";
import { SYNTAX_THEMES, BACKGROUND_SWATCHES, ASPECT_RATIOS, PRESETS, DEFAULT_CONFIG, FRAME_STYLES, FONT_FAMILIES, getBackground, sanitizeImportedConfig } from "../lib/presets";
import { LANGUAGE_LABELS, LANGUAGE_OPTIONS } from "../lib/highlight";
import { SOCIAL_PLATFORMS, sanitizeHighlightColor } from "../lib/snapshot";

const CUSTOM_KEY = "glyph_custom_presets_v1";
function readCustomPresets() {
  if (typeof window === "undefined") return {};
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "{}");
    return Object.fromEntries(Object.entries(saved).filter(([, item]) => item && typeof item === "object").map(([id, item]) => [id, { ...item, config: sanitizeImportedConfig(item.config) }]));
  } catch { return {}; }
}
const THEME_PREVIEW_COLORS = { "glyph-dark": ["#b6a1ff", "#82d9ad", "#8bb8ff"], dracula: ["#ff79c6", "#50fa7b", "#8be9fd"], "night-owl": ["#c792ea", "#ecc48d", "#82aaff"], nord: ["#81a1c1", "#a3be8c", "#88c0d0"], "glyph-light": ["#7c3aed", "#059669", "#2563eb"] };

export function ControlGroup({ label, children }) { return <div className="control-group"><span className="field-label">{label}</span>{children}</div>; }
export function Toggle({ label, checked, onChange }) { return <button type="button" className="toggle-row" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}><span>{label}</span><span className={`switch-track ${checked ? "active" : ""}`}><span className="switch-thumb" /></span></button>; }
export function Segmented({ label, value, options, onChange }) { return <ControlGroup label={label}><div className="segmented" role="group" aria-label={label}>{options.map(([key, text]) => <button type="button" key={key} className={value === key ? "active" : ""} aria-pressed={value === key} onClick={() => onChange(key)}>{text}</button>)}</div></ControlGroup>; }
export function Slider({ label, value, min, max, step = 1, suffix = "", onChange }) {
  const change = (raw) => { const next = Number(raw); if (Number.isFinite(next)) onChange(Math.max(Number(min), Math.min(Number(max), next))); };
  const valueWidth = Math.max(30, String(max).replace(".", "").length * 7 + 8);
  return <div className="field-col">
    <span className="field-label">{label}</span>
    <div className="slider-input-row">
      <input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(e) => change(e.target.value)} />
      <span className="number-with-unit">
        <input className="number-input" style={{ "--number-value-width": `${valueWidth}px` }} aria-label={`${label} value${suffix ? ` (${suffix.trim()})` : ""}`} type="number" min={min} max={max} step={step} value={value} onChange={(e) => change(e.target.value)} />
        {suffix && <span className="number-unit" aria-hidden="true">{suffix.trim()}</span>}
      </span>
    </div>
  </div>;
}
export function ColorInput({ label, value, onChange, onBlur }) { const color = /^#[0-9a-f]{6}$/i.test(value) ? value : sanitizeHighlightColor(value); return <div className="field-col"><span className="field-label">{label}</span><div className="custom-color-row"><input type="color" className="color-picker-input" value={color} onChange={(e) => onChange(e.target.value)} aria-label={`${label} picker`} /><input className="text-input" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} aria-label={label} /></div></div>; }

function Section({ id, title, hint, open, onToggle, onReset, children }) { return <section className={`control-section ${open ? "is-open" : ""}`}><button className="section-trigger" onClick={onToggle} aria-expanded={open} aria-controls={`section-${id}`}><span className="section-heading"><span className="section-index">{id}</span><span>{title}</span></span><span className="section-hint">{open ? "" : hint}<span className="section-chevron">{open ? "−" : "+"}</span></span></button>{open && <div className="section-body" id={`section-${id}`}>{children}{onReset && <button className="reset-link" onClick={onReset}>Reset section</button>}</div>}</section>; }

export default function Sidebar({ config, setConfig, activePreset, setActivePreset, detectedLabel, snapshotTitle, canvasMinimums = { width: 320, height: 200 }, onResetAll }) {
  const [open, setOpen] = useState({ presets: true, canvas: true, background: true, window: false, code: true, layout: false, language: false });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [custom, setCustom] = useState({});
  const [presetName, setPresetName] = useState("");
  useEffect(() => {
    const frame = requestAnimationFrame(() => setCustom(readCustomPresets()));
    return () => cancelAnimationFrame(frame);
  }, []);
  const allPresets = useMemo(() => ({ ...PRESETS, ...custom }), [custom]);
  const update = (field, value) => { setActivePreset(null); setConfig((prev) => ({ ...prev, [field]: value, ...(field === "title" ? { titleMode: "custom" } : {}) })); };
  const updateIdentity = (field, value) => { setActivePreset(null); setConfig((prev) => ({ ...prev, socialIdentity: { ...prev.socialIdentity, [field]: value } })); };
  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const applyPreset = (key) => { setActivePreset(key); setConfig(sanitizeImportedConfig(allPresets[key].config)); };
  const reset = () => { setActivePreset("default"); if (onResetAll) onResetAll(); else setConfig({ ...DEFAULT_CONFIG }); };
  const resetGroup = (keys) => { setActivePreset(null); setConfig((prev) => ({ ...prev, ...keys.reduce((next, key) => ({ ...next, [key]: DEFAULT_CONFIG[key] }), {}) })); };
  const updateDimension = (field, value) => {
    const isWidth = field === "canvasWidth";
    const minimum = isWidth ? canvasMinimums.width : canvasMinimums.height;
    const maximum = Math.max(isWidth ? 2400 : 2000, minimum);
    const next = Math.max(minimum, Math.min(maximum, Number(value) || (isWidth ? 920 : 560)));
    setActivePreset(null);
    setConfig((previous) => {
      if (!previous.aspectLock) return { ...previous, [field]: next, autoHeight: false };
      const ratio = previous.canvasWidth / previous.canvasHeight;
      return field === "canvasWidth"
        ? { ...previous, canvasWidth: next, canvasHeight: Math.max(canvasMinimums.height, Math.min(2000, Math.round(next / ratio))), autoHeight: false }
        : { ...previous, canvasWidth: Math.max(canvasMinimums.width, Math.min(2400, Math.round(next * ratio))), canvasHeight: next, autoHeight: false };
    });
  };
  const selectRatio = (ratio) => { setActivePreset(null); if (ratio.id === "auto") update("autoHeight", true); else setConfig((prev) => ({ ...prev, canvasWidth: ratio.width, canvasHeight: ratio.height, autoHeight: false })); };
  const savePreset = () => { const label = presetName.trim().slice(0, 40); if (!label) return; const id = `custom-${Date.now()}`; const next = { ...custom, [id]: { id, label, description: "Saved locally", config: sanitizeImportedConfig(config) } }; setCustom(next); setPresetName(""); try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(next)); } catch { /* storage is optional */ } };
  const currentLang = config.language === "auto" ? `Auto · ${detectedLabel}` : (LANGUAGE_LABELS[config.language] || config.language);
  const frameOptions = FRAME_STYLES.map((x) => [x, x === "macos" ? "macOS" : x[0].toUpperCase() + x.slice(1)]);
  const currentRatio = config.autoHeight ? "auto" : (ASPECT_RATIOS.find((r) => r.width === config.canvasWidth && r.height === config.canvasHeight)?.id || "custom");

  return <aside className={`right-sidebar ${mobileOpen ? "mobile-open" : ""}`}><div className="mobile-sheet-grab" aria-hidden="true" /><div className="sidebar-header"><div><span className="eyebrow">Customize</span><h2>Inspector</h2></div><div className="sidebar-header-actions"><button className="reset-all" onClick={reset}>Reset all</button><button type="button" className="mobile-sheet-toggle" onClick={() => setMobileOpen((value) => !value)} aria-expanded={mobileOpen} aria-controls="glyph-customize-panel">{mobileOpen ? "Close" : "Open"}<span aria-hidden="true">{mobileOpen ? "↓" : "↑"}</span></button></div></div><div className="sidebar-content" id="glyph-customize-panel">
    <Section id="01" title="Presets" hint={`${Object.keys(allPresets).length} styles`} open={open.presets} onToggle={() => toggle("presets")}><div className="preset-grid">{Object.entries(allPresets).map(([key, item]) => <button key={key} className={`preset-card ${activePreset === key ? "active" : ""}`} onClick={() => applyPreset(key)}><span className={`preset-preview preset-${key}`}><i /><i /><i /></span><span className="preset-name">{item.label}</span><span className="preset-desc">{item.description}</span></button>)}</div><div className="save-preset"><input className="text-input" value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="Preset name" aria-label="Preset name" /><button className="reset-link" onClick={savePreset}>Save current</button></div></Section>
    <Section id="02" title="Canvas" hint={`${config.canvasWidth} × ${config.autoHeight ? "auto" : config.canvasHeight}`} open={open.canvas} onToggle={() => toggle("canvas")} onReset={() => resetGroup(["canvasWidth", "canvasHeight", "autoHeight", "aspectLock", "padding", "exportScale"])}>
      <label className="field-col"><span className="field-label">Aspect ratio</span><select className="select-input" value={currentRatio} onChange={(e) => selectRatio(ASPECT_RATIOS.find((r) => r.id === e.target.value))}>
        {currentRatio === "custom" && <option value="custom" disabled>Custom dimensions</option>}
        {ASPECT_RATIOS.map((ratio) => <option key={ratio.id} value={ratio.id}>{ratio.label}</option>)}
      </select></label>
      <Toggle label="Lock aspect ratio" checked={config.aspectLock} onChange={(v) => update("aspectLock", v)} />
       <Slider label="Width" value={config.canvasWidth} min={canvasMinimums.width} max={Math.max(2400, canvasMinimums.width)} step={10} suffix=" px" onChange={(v) => updateDimension("canvasWidth", v)} />
      <Toggle label="Auto height" checked={config.autoHeight} onChange={(v) => update("autoHeight", v)} />
       {!config.autoHeight && <Slider label="Height" value={config.canvasHeight} min={canvasMinimums.height} max={Math.max(2000, canvasMinimums.height)} step={10} suffix=" px" onChange={(v) => updateDimension("canvasHeight", v)} />}
      <Slider label="Outer padding" value={config.padding} min={0} max={160} step={4} suffix=" px" onChange={(v) => update("padding", v)} />
      <Segmented label="Export scale" value={config.exportScale} options={[[1, "1×"], [2, "2×"], [3, "3×"]]} onChange={(v) => update("exportScale", v)} />
    </Section>
    <Section id="03" title="Background" hint={config.backgroundMode || "legacy"} open={open.background} onToggle={() => toggle("background")} onReset={() => resetGroup(["background", "backgroundMode", "backgroundAngle", "backgroundStart", "backgroundEnd"])}><Segmented label="Mode" value={config.backgroundMode} options={[["legacy", "Swatches"], ["solid", "Solid"], ["gradient", "Gradient"], ["transparent", "Clear"]]} onChange={(v) => update("backgroundMode", v)} />{config.backgroundMode === "legacy" && <div className="swatches-grid">{BACKGROUND_SWATCHES.map((s) => <button type="button" key={s.id} className={`swatch-btn ${config.background === s.value ? "active" : ""}`} style={{ background: s.value }} title={s.label} aria-label={s.label} onClick={() => update("background", s.value)}>{config.background === s.value && "✓"}</button>)}</div>}{config.backgroundMode === "solid" && <ColorInput label="Color" value={config.backgroundStart} onChange={(v) => update("backgroundStart", v)} />}{config.backgroundMode === "gradient" && <><Slider label="Angle" value={config.backgroundAngle} min={0} max={360} suffix="°" onChange={(v) => update("backgroundAngle", v)} /><ColorInput label="Start" value={config.backgroundStart} onChange={(v) => update("backgroundStart", v)} /><ColorInput label="End" value={config.backgroundEnd} onChange={(v) => update("backgroundEnd", v)} /></>}<div className="field-label">Preview: <code>{getBackground(config)}</code></div></Section>
    <Section id="04" title="Window" hint={snapshotTitle} open={open.window} onToggle={() => toggle("window")} onReset={() => resetGroup(["title", "titleMode", "frameStyle", "showTrafficLights", "cornerRadius", "shadow", "shadowBlur", "shadowOffset", "shadowOpacity", "showBorder"])}>
      <label className="field-col"><span className="field-label">Filename</span><input className="text-input" type="text" value={snapshotTitle} onChange={(e) => update("title", e.target.value)} /></label>
      <Segmented label="Frame style" value={config.frameStyle} options={frameOptions} onChange={(v) => update("frameStyle", v)} />
      <Toggle label="Traffic lights" checked={config.showTrafficLights} onChange={(v) => update("showTrafficLights", v)} />
      <Slider label="Corner radius" value={config.cornerRadius} min={0} max={48} step={2} suffix=" px" onChange={(v) => update("cornerRadius", v)} />
      <Slider label="Shadow blur" value={config.shadowBlur} min={0} max={120} suffix=" px" onChange={(v) => update("shadowBlur", v)} />
      <Slider label="Shadow offset" value={config.shadowOffset} min={0} max={80} suffix=" px" onChange={(v) => update("shadowOffset", v)} />
      <Slider label="Shadow opacity" value={config.shadowOpacity} min={0} max={100} suffix="%" onChange={(v) => update("shadowOpacity", v)} />
      <Toggle label="Border" checked={config.showBorder} onChange={(v) => update("showBorder", v)} />
    </Section>
    <Section id="05" title="Code" hint={`${config.fontSize}px · ${SYNTAX_THEMES[config.syntaxTheme]}`} open={open.code} onToggle={() => toggle("code")} onReset={() => resetGroup(["syntaxTheme", "fontFamily", "fontSize", "lineHeight", "ligatures", "showLineNumbers", "highlightedLines", "highlightColor", "wrap", "tabSize"])}>
      <div className="field-col"><span className="field-label">Syntax theme</span><div className="theme-grid">{Object.entries(SYNTAX_THEMES).map(([key, label]) => <button type="button" key={key} className={`theme-card ${config.syntaxTheme === key ? "active" : ""}`} onClick={() => update("syntaxTheme", key)}><span className="theme-dots">{(THEME_PREVIEW_COLORS[key] || []).map((color) => <i key={color} style={{ background: color }} />)}</span><span>{label}</span></button>)}</div></div>
      <Segmented label="Font family" value={config.fontFamily} options={FONT_FAMILIES.map((x) => [x, x === "geist" ? "Geist" : "Mono"])} onChange={(v) => update("fontFamily", v)} />
      <Slider label="Font size" value={config.fontSize} min={10} max={32} suffix=" px" onChange={(v) => update("fontSize", v)} />
      <Slider label="Line height" value={config.lineHeight} min={1} max={3} step={0.1} onChange={(v) => update("lineHeight", v)} />
      <Toggle label="Ligatures" checked={config.ligatures} onChange={(v) => update("ligatures", v)} />
      <Toggle label="Line numbers" checked={Boolean(config.showLineNumbers)} onChange={(v) => update("showLineNumbers", v)} />
      <label className="field-col"><span className="field-label">Highlighted lines</span><input className="text-input" value={config.highlightedLines} onChange={(e) => update("highlightedLines", e.target.value)} placeholder="1, 3-5" /></label>
      <ColorInput label="Highlight color" value={config.highlightColor} onChange={(v) => update("highlightColor", v)} onBlur={() => update("highlightColor", sanitizeHighlightColor(config.highlightColor))} />
      <Toggle label="Wrap lines" checked={config.wrap} onChange={(v) => update("wrap", v)} />
      <Slider label="Tab size" value={config.tabSize} min={2} max={8} step={1} suffix=" spaces" onChange={(v) => update("tabSize", Math.round(v))} />
    </Section>
    <Section id="06" title="Layout" hint={`${config.innerPadding}px padding`} open={open.layout} onToggle={() => toggle("layout")} onReset={() => resetGroup(["innerPadding", "showWatermark", "socialIdentity"])}>
      <Slider label="Inner padding" value={config.innerPadding} min={0} max={120} step={4} suffix=" px" onChange={(v) => update("innerPadding", v)} />
      <Toggle label="Watermark" checked={Boolean(config.showWatermark)} onChange={(v) => update("showWatermark", v)} />
      <label className="field-col"><span className="field-label">Social identity</span><select className="select-input" value={config.socialIdentity.platform} onChange={(e) => updateIdentity("platform", e.target.value)}>
        {Object.entries(SOCIAL_PLATFORMS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select></label>
      {config.socialIdentity.platform !== "none" && <label className="field-col"><span className="field-label">Handle</span><input className="text-input" value={config.socialIdentity.handle} maxLength={80} onChange={(e) => updateIdentity("handle", e.target.value)} placeholder="@yourname" spellCheck={false} autoCapitalize="off" aria-describedby="identity-help" /><span className="field-help" id="identity-help">Your username or profile slug. Shown as text below the code.</span></label>}
    </Section>
    <Section id="07" title="Language" hint={currentLang} open={open.language} onToggle={() => toggle("language")} onReset={() => resetGroup(["language"])}><label className="field-col"><span className="field-label">Highlighting mode</span><select className="select-input" value={config.language} onChange={(e) => update("language", e.target.value)}><option value="auto">Auto-detect · {detectedLabel}</option><optgroup label="Supported languages">{LANGUAGE_OPTIONS.map((lang) => <option key={lang} value={lang}>{LANGUAGE_LABELS[lang] || lang}</option>)}</optgroup></select></label></Section>
  </div></aside>;
}
