import hljs from "highlight.js/lib/core";

import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import ruby from "highlight.js/lib/languages/ruby";
import php from "highlight.js/lib/languages/php";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";
import bash from "highlight.js/lib/languages/bash";
import yaml from "highlight.js/lib/languages/yaml";
import sql from "highlight.js/lib/languages/sql";
import markdown from "highlight.js/lib/languages/markdown";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import graphql from "highlight.js/lib/languages/graphql";
import ini from "highlight.js/lib/languages/ini";
import scss from "highlight.js/lib/languages/scss";
import plaintext from "highlight.js/lib/languages/plaintext";

const registry = {
  javascript,
  typescript,
  xml,
  css,
  scss,
  json,
  python,
  go,
  rust,
  java,
  c,
  cpp,
  csharp,
  ruby,
  php,
  swift,
  kotlin,
  bash,
  yaml,
  sql,
  markdown,
  dockerfile,
  graphql,
  ini,
  plaintext,
};

let registered = false;

/** Registers the curated language set with highlight.js exactly once. */
function ensureRegistered() {
  if (registered) return;
  for (const [name, def] of Object.entries(registry)) {
    hljs.registerLanguage(name, def);
  }
  // Friendly aliases so auto-detect + manual selection line up with how
  // people actually refer to these languages.
  hljs.registerAliases(["js", "jsx", "mjs", "cjs"], { languageName: "javascript" });
  hljs.registerAliases(["ts", "tsx"], { languageName: "typescript" });
  hljs.registerAliases(["html", "svg", "xhtml"], { languageName: "xml" });
  hljs.registerAliases(["yml"], { languageName: "yaml" });
  hljs.registerAliases(["sh", "shell", "zsh"], { languageName: "bash" });
  hljs.registerAliases(["c++"], { languageName: "cpp" });
  hljs.registerAliases(["cs"], { languageName: "csharp" });
  hljs.registerAliases(["md"], { languageName: "markdown" });
  hljs.registerAliases(["docker"], { languageName: "dockerfile" });
  hljs.registerAliases(["text", "txt"], { languageName: "plaintext" });
  registered = true;
}

/** Human-friendly labels for the language picker + detected-language badge. */
export const LANGUAGE_LABELS = {
  auto: "Auto-detect",
  javascript: "JavaScript",
  typescript: "TypeScript",
  xml: "HTML / XML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  python: "Python",
  go: "Go",
  rust: "Rust",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  bash: "Bash / Shell",
  yaml: "YAML",
  sql: "SQL",
  markdown: "Markdown",
  dockerfile: "Dockerfile",
  graphql: "GraphQL",
  ini: "INI / TOML",
  plaintext: "Plain Text",
};

export const LANGUAGE_OPTIONS = Object.keys(registry);

/**
 * Highlights `code`. When `language` is "auto" (or omitted), highlight.js's
 * heuristic auto-detection is used and the detected language is returned
 * alongside the highlighted HTML. Otherwise the given language is forced.
 */
export function highlightCode(code, language = "auto") {
  ensureRegistered();

  if (!code) {
    return { html: "", detectedLanguage: "plaintext" };
  }

  if (language && language !== "auto" && registry[language]) {
    const result = hljs.highlight(code, { language, ignoreIllegals: true });
    return { html: result.value, detectedLanguage: language };
  }

  const result = hljs.highlightAuto(code, LANGUAGE_OPTIONS);
  return {
    html: result.value,
    detectedLanguage: result.language || "plaintext",
  };
}
