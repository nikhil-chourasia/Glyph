"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import PreviewStage from "./components/PreviewStage";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import { LANGUAGE_LABELS, highlightCode } from "./lib/highlight";
import {
  DEFAULT_CONFIG,
  sanitizeImportedConfig,
} from "./lib/presets";

const DEFAULT_CODE = `def prepare_data(oecdBli, gdpPerCapita):
    oecdBli = oecdBli.set_index('Country')
    gdpPerCapita = gdpPerCapita.set_index('COUNTRY')
    gdpPerCapita = gdpPerCapita.rename(columns={'2025': 'GDP per capita'})
    gdpPerCapita = gdpPerCapita[['GDP per capita']]
    oecdBli = oecdBli[oecdBli['Indicator'] == "Life satisfaction"]
    oecdBli = oecdBli[['OBS_VALUE']]
    fullStats = gdpPerCapita.join(oecdBli, how='inner')
    fullStats = fullStats.rename(columns={'OBS_VALUE': 'Life satisfaction'})
    return fullStats`;

const STORAGE_KEY = "glyph_app_state_v1";

export default function Home() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [config, setConfigState] = useState(DEFAULT_CONFIG);
  const [activePreset, setActivePreset] = useState("default");
  const [themePreference, setThemePreference] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("dark");
  const configHistoryRef = useRef([]);
  const hasLoadedStateRef = useRef(false);

  function setConfig(updater) {
    setConfigState((previous) => {
      const next = typeof updater === "function" ? updater(previous) : updater;
      if (next !== previous && JSON.stringify(next) !== JSON.stringify(previous)) {
        configHistoryRef.current = [...configHistoryRef.current.slice(-49), previous];
      }
      return next;
    });
  }

  function undoConfig() {
    const previous = configHistoryRef.current.pop();
    if (previous) setConfigState(previous);
  }

  // Toast notifications
  const [toasts, setToasts] = useState([]);
  function addToast(message, type = "info") {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }
  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.code === "string") {
          setCode(parsed.code);
        }
        if (parsed.config && typeof parsed.config === "object") {
          setConfig(sanitizeImportedConfig(parsed.config));
        }
        if (parsed.activePreset) {
          setActivePreset(parsed.activePreset);
        }
        if (["system", "light", "dark"].includes(parsed.themePreference || parsed.theme)) {
          setThemePreference(parsed.themePreference || parsed.theme);
        }
      }
    } catch {
      // ignore localStorage parse issues
    } finally {
      hasLoadedStateRef.current = true;
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!hasLoadedStateRef.current) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ code, config, activePreset, themePreference })
      );
    } catch {
      // ignore storage write errors
    }
  }, [code, config, activePreset, themePreference]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const applyTheme = () => {
      const nextTheme = themePreference === "system" ? (media.matches ? "light" : "dark") : themePreference;
      setResolvedTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
    };
    applyTheme();
    media.addEventListener?.("change", applyTheme);
    return () => media.removeEventListener?.("change", applyTheme);
  }, [themePreference]);

  // Syntax highlighting & language detection
  const { html: highlightedHtml, detectedLanguage } = useMemo(
    () => highlightCode(code, config.language),
    [code, config.language]
  );

  const detectedLabel =
    LANGUAGE_LABELS[detectedLanguage] ?? detectedLanguage ?? "Plain Text";

  // PNG Export & Clipboard refs/states
  const previewRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [exportError, setExportError] = useState("");

  // Clean filename for export
  const cleanTitle = useMemo(() => {
    if (!config.title) return "glyph";
    const withoutExt = config.title.replace(/\.[^/.]+$/, "").trim();
    return withoutExt.length > 0 ? withoutExt : "glyph";
  }, [config.title]);

  // Export as PNG
  async function handleExportPng() {
    if (!previewRef.current || isExporting) return;
    setIsExporting(true);
    setExportError("");

    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const { default: html2canvas } = await import("html2canvas");
      const scale = Number(config.exportScale) || 2;
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `${cleanTitle}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      addToast(`Exported ${cleanTitle}.png (${scale}x)`, "success");
    } catch {
      setExportError("Export failed. Please try again.");
      addToast("Export failed. Please check browser console.", "error");
    } finally {
      setIsExporting(false);
    }
  }

  // Copy PNG image directly to clipboard
  async function handleCopyImage() {
    if (!previewRef.current || isCopyingImage) return;
    setIsCopyingImage(true);

    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const { default: html2canvas } = await import("html2canvas");
      const scale = Number(config.exportScale) || 2;
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          addToast("Failed to render image blob.", "error");
          setIsCopyingImage(false);
          return;
        }

        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            addToast("Image copied to clipboard!", "success");
          } else {
            addToast("Clipboard image copying not supported in this browser.", "info");
          }
        } catch {
          addToast("Clipboard permission denied or unavailable.", "error");
        } finally {
          setIsCopyingImage(false);
        }
      }, "image/png");
    } catch {
      setIsCopyingImage(false);
      addToast("Failed to copy image.", "error");
    }
  }

  // Copy raw code to clipboard
  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(code);
      addToast("Code copied to clipboard!", "success");
    } catch {
      addToast("Failed to copy code to clipboard.", "error");
    }
  }

  // Export Glyph Configuration (.glyph.json)
  function handleExportConfig() {
    try {
      const exportData = {
        name: "glyph-config",
        version: 1,
        exportedAt: new Date().toISOString(),
        config,
        code,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${cleanTitle}.glyph.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      addToast("Exported styling config (.glyph.json)!", "success");
    } catch {
      addToast("Failed to export config.", "error");
    }
  }

  // Import Glyph Configuration (.glyph.json)
  function handleImportConfig(data) {
    try {
      const importedConfig = sanitizeImportedConfig(data.config || data);
      setConfig(importedConfig);
      if (typeof data.code === "string") {
        setCode(data.code);
      }
      setActivePreset(null);
      addToast("Configuration imported successfully!", "success");
    } catch (err) {
      addToast(err.message || "Failed to import configuration.", "error");
    }
  }

  // Hidden file input trigger for Import Glyph
  const hiddenImportInputRef = useRef(null);
  function handleTriggerImport() {
    hiddenImportInputRef.current?.click();
  }

  function handleFileImportChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        handleImportConfig(json);
      } catch {
        addToast("Invalid JSON file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // Keyboard shortcuts (Cmd/Ctrl + E to export PNG, Cmd/Ctrl + Shift + C to copy image)
  const exportPngRef = useRef(handleExportPng);
  exportPngRef.current = handleExportPng;
  const copyImageRef = useRef(handleCopyImage);
  copyImageRef.current = handleCopyImage;

  useEffect(() => {
    function handleKeyDown(e) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && (e.key === "e" || e.key === "E")) {
        e.preventDefault();
        exportPngRef.current?.();
      } else if (isMeta && e.shiftKey && (e.key === "c" || e.key === "C")) {
         e.preventDefault();
         copyImageRef.current?.();
       } else if (isMeta && (e.key === "z" || e.key === "Z") && !e.shiftKey) {
         if (e.target.closest?.("input, textarea, [contenteditable='true']")) return;
         e.preventDefault();
         undoConfig();
       }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Hidden file input for import */}
      <input
        ref={hiddenImportInputRef}
        type="file"
        accept=".json,.glyph.json"
        style={{ display: "none" }}
        onChange={handleFileImportChange}
      />

      {/* Main Header */}
      <Header
        onExportPng={handleExportPng}
        isExporting={isExporting}
        onCopyImage={handleCopyImage}
        isCopyingImage={isCopyingImage}
        onCopyCode={handleCopyCode}
        onExportConfig={handleExportConfig}
        onTriggerImport={handleTriggerImport}
        theme={resolvedTheme}
        themePreference={themePreference}
        onToggleTheme={() => setThemePreference((current) => current === "system" ? "light" : current === "light" ? "dark" : "system")}
      />

      {/* Main Workspace Body */}
      <div className="app-body">
        <PreviewStage
          code={code}
          setCode={setCode}
          highlightedHtml={highlightedHtml}
          config={config}
          setConfig={setConfig}
          previewRef={previewRef}
          detectedLabel={detectedLabel}
          onTrySample={() => setCode('const greeting = "Hello, world!";\nconsole.log(greeting);')}
        />

        <Sidebar
          config={config}
          setConfig={setConfig}
          activePreset={activePreset}
          setActivePreset={setActivePreset}
          detectedLabel={detectedLabel}
          onExportPng={handleExportPng}
          isExporting={isExporting}
          exportError={exportError}
          onCopyImage={handleCopyImage}
          isCopyingImage={isCopyingImage}
          onCopyCode={handleCopyCode}
          onExportConfig={handleExportConfig}
          onTriggerImport={handleTriggerImport}
          onResetAll={() => {
            setConfig({ ...DEFAULT_CONFIG });
          }}
        />
      </div>

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </main>
  );
}
