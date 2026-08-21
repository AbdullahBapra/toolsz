"use client";

import { useState, useCallback } from "react";
import {
  Lock,
  Check,
  Shield,
  Zap,
  Copy,
  RefreshCw,
  Download,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

interface PwOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  count: number;
}

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

const AMBIGUOUS = "Il1O0o";

function generatePassword(opts: PwOptions): string {
  let chars = "";
  if (opts.uppercase) chars += CHAR_SETS.uppercase;
  if (opts.lowercase) chars += CHAR_SETS.lowercase;
  if (opts.numbers) chars += CHAR_SETS.numbers;
  if (opts.symbols) chars += CHAR_SETS.symbols;
  if (opts.excludeAmbiguous) {
    chars = chars
      .split("")
      .filter((c) => !AMBIGUOUS.includes(c))
      .join("");
  }
  if (!chars) chars = CHAR_SETS.lowercase;
  const arr = new Uint32Array(opts.length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => chars[v % chars.length]).join("");
}

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const levels = [
    { score: 0, label: "Very Weak", color: "bg-red-500" },
    { score: 1, label: "Weak", color: "bg-orange-500" },
    { score: 2, label: "Fair", color: "bg-yellow-500" },
    { score: 3, label: "Good", color: "bg-lime-500" },
    { score: 4, label: "Strong", color: "bg-green-500" },
    { score: 5, label: "Very Strong", color: "bg-emerald-500" },
  ];
  return levels[Math.min(score, 5)];
}

export default function PasswordGeneratorPage() {
  const [options, setOptions] = useState<PwOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
    count: 5,
  });
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleGenerate = useCallback(() => {
    const pws = Array.from({ length: options.count }, () => generatePassword(options));
    setPasswords(pws);
  }, [options]);

  const handleCopy = useCallback(async (pw: string, idx: number) => {
    await navigator.clipboard.writeText(pw);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }, []);

  const handleCopyAll = useCallback(async () => {
    await navigator.clipboard.writeText(passwords.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }, [passwords]);

  const handleDownload = useCallback(() => {
    const text = passwords.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "passwords.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [passwords]);

  const toggle = useCallback((key: keyof PwOptions) => {
    setOptions((o) => ({ ...o, [key]: !o[key] }));
  }, []);

  const strength = passwords.length > 0 ? getStrength(passwords[0]) : null;

  const inputCls =
    "w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Lock}
          title="Password Generator"
          description="Generate strong, crypto-secure passwords with bulk export — customizable length and character sets. Free, private, and no signup."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          {/* Left: Options */}
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Length: {options.length}
              </label>
              <input
                type="range"
                min={4}
                max={64}
                value={options.length}
                onChange={(e) =>
                  setOptions((o) => ({ ...o, length: parseInt(e.target.value) }))
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-foreground-muted mt-1">
                <span>4</span>
                <span>64</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Character Sets
              </label>
              <div className="space-y-2">
                {(
                  [
                    ["uppercase", "Uppercase (A-Z)"],
                    ["lowercase", "Lowercase (a-z)"],
                    ["numbers", "Numbers (0-9)"],
                    ["symbols", "Symbols (!@#$…)"],
                    ["excludeAmbiguous", "Exclude ambiguous (Il1O0o)"],
                  ] as [keyof PwOptions, string][]
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options[key] as boolean}
                      onChange={() => toggle(key)}
                      className="w-4 h-4 rounded border-border text-primary"
                    />
                    <span className="text-sm text-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Generate Count: {options.count}
              </label>
              <input
                type="range"
                min={1}
                max={50}
                value={options.count}
                onChange={(e) =>
                  setOptions((o) => ({ ...o, count: parseInt(e.target.value) }))
                }
                className="w-full"
              />
            </div>

            <button
              onClick={handleGenerate}
              className="btn btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Passwords
            </button>
          </div>

          {/* Right: Results */}
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 flex flex-col">
            {passwords.length > 0 ? (
              <>
                {/* Strength meter for first password */}
                {strength && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">Strength</span>
                      <span className="text-xs font-semibold" style={{ color: strength.color.includes("red") ? "#ef4444" : strength.color.includes("orange") ? "#f97316" : strength.color.includes("yellow") ? "#eab308" : strength.color.includes("lime") ? "#84cc16" : "#10b981" }}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${(strength.score + 1) * 16.67}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px]">
                  {passwords.map((pw, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg bg-surface-1 border border-border group"
                    >
                      <code className="flex-1 text-xs font-mono text-foreground break-all select-all">
                        {pw}
                      </code>
                      <button
                        onClick={() => handleCopy(pw, i)}
                        className="p-1.5 rounded-md hover:bg-surface-2 transition-colors opacity-60 group-hover:opacity-100"
                      >
                        {copiedIdx === i ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleCopyAll}
                    className="btn btn-secondary inline-flex items-center gap-1.5 text-xs flex-1 justify-center"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy All
                  </button>
                  <button
                    onClick={handleDownload}
                    className="btn btn-secondary inline-flex items-center gap-1.5 text-xs flex-1 justify-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .txt
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center py-8">
                <div>
                  <Lock className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
                  <p className="text-xs text-foreground-secondary">
                    Click Generate to create secure passwords
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Crypto-Secure Randomness
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Uses the Web Crypto API (crypto.getRandomValues) for true cryptographic randomness. Not Math.random.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Bulk Generate & Export
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Generate up to 50 passwords at once. Copy all or download as a .txt file. Exclude ambiguous characters for clarity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
