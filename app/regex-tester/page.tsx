"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Regex,
  Check,
  Shield,
  Zap,
  Copy,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

interface MatchGroup {
  full: string;
  groups: string[];
  index: number;
}

const CHEAT_SHEET = [
  { pattern: ".", desc: "Any character (except newline)" },
  { pattern: "\\d", desc: "Digit [0-9]" },
  { pattern: "\\w", desc: "Word character [a-zA-Z0-9_]" },
  { pattern: "\\s", desc: "Whitespace" },
  { pattern: "^", desc: "Start of string" },
  { pattern: "$", desc: "End of string" },
  { pattern: "*", desc: "0 or more" },
  { pattern: "+", desc: "1 or more" },
  { pattern: "?", desc: "0 or 1 (optional)" },
  { pattern: "{n,m}", desc: "Between n and m times" },
  { pattern: "[abc]", desc: "Character class" },
  { pattern: "(…)", desc: "Capture group" },
  { pattern: "(?:…)", desc: "Non-capturing group" },
  { pattern: "(?=…)", desc: "Lookahead" },
  { pattern: "(?<=…)", desc: "Lookbehind" },
  { pattern: "|", desc: "Alternation (OR)" },
];

const COMMON_PATTERNS = [
  { label: "Email", pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, test: "user@example.com and bad@ not valid" },
  { label: "URL", pattern: /https?:\/\/[^\s<>"{}|\\^`[\]]+/g, test: "Visit https://example.com or http://test.org" },
  { label: "Phone (US)", pattern: /(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, test: "Call +1 (555) 123-4567 or 555-987-6543" },
  { label: "IP Address", pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, test: "Servers: 192.168.1.1 and 10.0.0.255" },
  { label: "Hex Color", pattern: /#[0-9a-fA-F]{3,8}\b/g, test: "Colors: #3B82F6, #ef4444, #10b98180" },
  { label: "Date (ISO)", pattern: /\d{4}[-/]\d{2}[-/]\d{2}/g, test: "Dates: 2024-01-15 and 2023/12/31" },
];

function testRegex(pattern: string, flags: string, text: string): { matches: MatchGroup[]; error: string | null } {
  try {
    if (!pattern) return { matches: [], error: null };
    const re = new RegExp(pattern, flags);
    const matches: MatchGroup[] = [];
    let m: RegExpExecArray | null;
    let guard = 0;
    while ((m = re.exec(text)) !== null && guard < 100) {
      guard++;
      matches.push({
        full: m[0],
        groups: m.slice(1).map((g) => g ?? ""),
        index: m.index,
      });
      if (!re.global) break;
    }
    return { matches, error: null };
  } catch (e) {
    return { matches: [], error: (e as Error).message };
  }
}

function highlightMatches(text: string, matches: MatchGroup[]): React.ReactNode[] {
  if (matches.length === 0) return [text];
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  matches.forEach((m, i) => {
    if (m.index > lastIdx) {
      parts.push(<span key={`t-${i}`}>{text.slice(lastIdx, m.index)}</span>);
    }
    parts.push(
      <mark key={`m-${i}`} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">
        {m.full}
      </mark>
    );
    lastIdx = m.index + m.full.length;
  });
  if (lastIdx < text.length) {
    parts.push(<span key="end">{text.slice(lastIdx)}</span>);
  }
  return parts;
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState("gi");
  const [testText, setTestText] = useState("Contact us at hello@example.com or support@company.org for help.");
  const [copied, setCopied] = useState<string | null>(null);

  const { matches, error } = useMemo(() => testRegex(pattern, flags, testText), [pattern, flags, testText]);
  const highlighted = useMemo(() => highlightMatches(testText, matches), [testText, matches]);

  const toggleFlag = useCallback((flag: string) => {
    setFlags((f) => (f.includes(flag) ? f.replace(flag, "") : f + flag));
  }, []);

  const handleCopy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handlePatternSelect = useCallback((p: RegExp, test: string) => {
    setPattern(p.source);
    setTestText(test);
    setFlags(p.flags || "gi");
  }, []);

  const flagToggles = [
    { flag: "g", label: "Global (g)", desc: "Find all matches" },
    { flag: "i", label: "Case-insensitive (i)", desc: "Ignore case" },
    { flag: "m", label: "Multiline (m)", desc: "^$ match line starts" },
    { flag: "s", label: "Dotall (s)", desc: ". matches newlines" },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Regex}
          title="Regex Tester"
          description="Test regular expressions with real-time matching, group highlighting, and cheat sheet — free, instant, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main */}
          <div className="space-y-5">
            {/* Pattern + Flags */}
            <div className="glass-panel rounded-[16px] p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Regular Expression</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center rounded-lg border border-border bg-surface-1 px-3 py-2">
                    <span className="text-foreground-muted mr-1">/</span>
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      className="flex-1 bg-transparent text-sm font-mono text-foreground focus:outline-none"
                      placeholder="Enter regex…"
                    />
                    <span className="text-foreground-muted mx-1">/</span>
                    <span className="text-xs text-primary font-mono">{flags}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(`/${pattern}/${flags}`, "regex")}
                    className="p-2 rounded-lg border border-border hover:bg-surface-2 transition-colors"
                  >
                    {copied === "regex" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-2">
                {flagToggles.map((f) => (
                  <button
                    key={f.flag}
                    onClick={() => toggleFlag(f.flag)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                      flags.includes(f.flag)
                        ? "bg-primary-muted border-primary-border text-primary"
                        : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                    }`}
                    title={f.desc}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-mono">
                  {error}
                </div>
              )}
            </div>

            {/* Test Text */}
            <div className="glass-panel rounded-[16px] p-6 space-y-3">
              <label className="block text-xs font-semibold text-foreground">Test String</label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full h-28 rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
              />

              {/* Highlighted Result */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Match Preview</label>
                <div className="p-3 rounded-lg border border-border bg-white text-sm font-mono text-foreground leading-relaxed whitespace-pre-wrap break-all">
                  {highlighted}
                </div>
              </div>
            </div>

            {/* Match Details */}
            {matches.length > 0 && (
              <div className="glass-panel rounded-[16px] p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground">Matches ({matches.length})</h4>
                </div>
                {matches.map((m, i) => (
                  <div key={i} className="p-2 rounded-lg bg-surface-1 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">Match {i + 1}</span>
                      <span className="text-xs text-foreground-muted">Index: {m.index}</span>
                    </div>
                    <code className="text-xs font-mono text-primary">{m.full}</code>
                    {m.groups.length > 0 && (
                      <div className="mt-1 flex gap-2 flex-wrap">
                        {m.groups.map((g, gi) => (
                          <span key={gi} className="px-2 py-0.5 rounded bg-primary-muted text-xs font-mono text-primary">
                            ${gi + 1}: {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Cheat Sheet + Patterns */}
          <div className="space-y-5">
            <div className="glass-panel rounded-[16px] p-4 space-y-2">
              <h4 className="text-xs font-semibold text-foreground">Common Patterns</h4>
              {COMMON_PATTERNS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePatternSelect(p.pattern, p.test)}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-surface-1 transition-colors"
                >
                  <div className="text-xs font-semibold text-foreground">{p.label}</div>
                  <div className="text-xs text-foreground-muted font-mono truncate">{p.pattern.source}</div>
                </button>
              ))}
            </div>

            <div className="glass-panel rounded-[16px] p-4 space-y-2">
              <h4 className="text-xs font-semibold text-foreground">Quick Reference</h4>
              {CHEAT_SHEET.map((c) => (
                <div key={c.pattern} className="flex items-center gap-2 px-1 py-0.5">
                  <code className="text-xs font-mono text-primary w-16 flex-shrink-0">{c.pattern}</code>
                  <span className="text-xs text-foreground-muted">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Real-Time Matching</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                See matches highlighted in real time as you type. Shows capture groups, match indices, and full details.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Cheat Sheet & Patterns</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Quick reference for regex syntax plus 6 common patterns (email, URL, phone, IP, hex color, date) ready to use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
