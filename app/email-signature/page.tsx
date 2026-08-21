"use client";

import { useState, useCallback } from "react";
import {
  Mail,
  Check,
  Shield,
  Zap,
  Download,
  RotateCcw as ResetIcon,
  Copy,
  User,
  Briefcase,
  Phone,
  Globe,
  Image as ImageIcon,
  Palette,
  Code,
  Eye,
  Info,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import ToolHero from "@/app/components/ToolHero";

interface SignatureData {
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  avatarUrl: string;
  // Social
  linkedin: string;
  twitter: string;
  github: string;
}

type ColorTheme = "blue" | "green" | "purple" | "red" | "orange" | "slate" | "custom";

const COLOR_THEMES: { id: ColorTheme; label: string; primary: string; bg: string; border: string }[] = [
  { id: "blue", label: "Blue", primary: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  { id: "green", label: "Green", primary: "#22C55E", bg: "#F0FDF4", border: "#BBF7D0" },
  { id: "purple", label: "Purple", primary: "#A855F7", bg: "#FAF5FF", border: "#E9D5FF" },
  { id: "red", label: "Red", primary: "#EF4444", bg: "#FEF2F2", border: "#FECACA" },
  { id: "orange", label: "Orange", primary: "#F97316", bg: "#FFF7ED", border: "#FED7AA" },
  { id: "slate", label: "Slate", primary: "#475569", bg: "#F8FAFC", border: "#CBD5E1" },
];

function getThemeColors(theme: ColorTheme, customColor: string) {
  if (theme === "custom") {
    return {
      primary: customColor,
      bg: customColor + "15",
      border: customColor + "60",
    };
  }
  const found = COLOR_THEMES.find((t) => t.id === theme);
  return found ? { primary: found.primary, bg: found.bg, border: found.border } : COLOR_THEMES[0];
}

function generateHTML(data: SignatureData, theme: ColorTheme, customColor: string, layout: "horizontal" | "vertical"): string {
  const colors = getThemeColors(theme, customColor);
  const socialLinks: { url: string; label: string }[] = [];
  if (data.linkedin) socialLinks.push({ url: data.linkedin, label: "LinkedIn" });
  if (data.twitter) socialLinks.push({ url: data.twitter, label: "Twitter" });
  if (data.github) socialLinks.push({ url: data.github, label: "GitHub" });

  const socialHtml = socialLinks.length > 0
    ? `<div style="margin-top:8px;display:flex;gap:12px;">
${socialLinks.map((s) => `<a href="${s.url}" target="_blank" style="color:${colors.primary};font-size:12px;text-decoration:none;">${s.label}</a>`).join("\n")}
</div>`
    : "";

  if (layout === "horizontal") {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333333;">
  <tr>
    ${data.avatarUrl ? `<td style="padding-right:16px;vertical-align:top;">
      <img src="${data.avatarUrl}" alt="${data.fullName}" width="80" height="80" style="border-radius:50%;border:2px solid ${colors.border};" />
    </td>` : ""}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-bottom:2px;">
            <span style="font-size:16px;font-weight:bold;color:${colors.primary};">${data.fullName || "Your Name"}</span>
          </td>
        </tr>
        ${data.jobTitle || data.company ? `<tr>
          <td style="padding-bottom:4px;">
            <span style="font-size:13px;color:#666666;">${[data.jobTitle, data.company].filter(Boolean).join(" at ")}</span>
          </td>
        </tr>` : ""}
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" border="0" style="font-size:12px;color:#888888;">
              ${data.email ? `<tr><td style="padding:1px 0;"><a href="mailto:${data.email}" style="color:${colors.primary};text-decoration:none;">${data.email}</a></td></tr>` : ""}
              ${data.phone ? `<tr><td style="padding:1px 0;"><a href="tel:${data.phone}" style="color:#888888;text-decoration:none;">${data.phone}</a></td></tr>` : ""}
              ${data.website ? `<tr><td style="padding:1px 0;"><a href="${data.website.startsWith("http") ? data.website : "https://" + data.website}" target="_blank" style="color:${colors.primary};text-decoration:none;">${data.website.replace(/^https?:\/\//, "")}</a></td></tr>` : ""}
            </table>
          </td>
        </tr>
        ${socialHtml ? `<tr><td>${socialHtml}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;
  }

  // Vertical layout
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333333;max-width:400px;">
  ${data.avatarUrl ? `<tr><td style="padding-bottom:12px;text-align:center;">
    <img src="${data.avatarUrl}" alt="${data.fullName}" width="80" height="80" style="border-radius:50%;border:2px solid ${colors.border};" />
  </td></tr>` : ""}
  <tr><td style="text-align:center;">
    <span style="font-size:16px;font-weight:bold;color:${colors.primary};">${data.fullName || "Your Name"}</span>
  </td></tr>
  ${data.jobTitle || data.company ? `<tr><td style="text-align:center;padding-top:2px;">
    <span style="font-size:13px;color:#666666;">${[data.jobTitle, data.company].filter(Boolean).join(" at ")}</span>
  </td></tr>` : ""}
  <tr><td style="text-align:center;padding-top:8px;">
    <table cellpadding="0" cellspacing="0" border="0" align="center" style="font-size:12px;color:#888888;">
      ${data.email ? `<tr><td style="padding:1px 0;text-align:center;"><a href="mailto:${data.email}" style="color:${colors.primary};text-decoration:none;">${data.email}</a></td></tr>` : ""}
      ${data.phone ? `<tr><td style="padding:1px 0;text-align:center;"><a href="tel:${data.phone}" style="color:#888888;text-decoration:none;">${data.phone}</a></td></tr>` : ""}
      ${data.website ? `<tr><td style="padding:1px 0;text-align:center;"><a href="${data.website.startsWith("http") ? data.website : "https://" + data.website}" target="_blank" style="color:${colors.primary};text-decoration:none;">${data.website.replace(/^https?:\/\//, "")}</a></td></tr>` : ""}
    </table>
  </td></tr>
  ${socialHtml ? `<tr><td style="text-align:center;padding-top:8px;">${socialHtml.replace('display:flex;gap:12px;', '')}</td></tr>` : ""}
</table>`;
}

type Layout = "horizontal" | "vertical";

const defaultData: SignatureData = {
  fullName: "",
  jobTitle: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  avatarUrl: "",
  linkedin: "",
  twitter: "",
  github: "",
};

export default function EmailSignaturePage() {
  const { addToast } = useToast();
  const [data, setData] = useState<SignatureData>({ ...defaultData });
  const [theme, setTheme] = useState<ColorTheme>("blue");
  const [customColor, setCustomColor] = useState("#3B82F6");
  const [layout, setLayout] = useState<Layout>("horizontal");
  const [copied, setCopied] = useState<"html" | "code" | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "html">("preview");

  const updateField = useCallback((field: keyof SignatureData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const htmlOutput = generateHTML(data, theme, customColor, layout);

  const handleCopyHTML = useCallback(async () => {
    try {
      // Copy as rich text (HTML) and plain text fallback
      const blob = new Blob([htmlOutput], { type: "text/html" });
      const textBlob = new Blob([htmlOutput], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blob,
          "text/plain": textBlob,
        }),
      ]);
      setCopied("html");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback: copy as plain text
      try {
        await navigator.clipboard.writeText(htmlOutput);
        setCopied("html");
        setTimeout(() => setCopied(null), 2000);
      } catch {
        addToast("error", "Failed to copy. Please use the code view and copy manually.");
      }
    }
  }, [htmlOutput, addToast]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      setCopied("code");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = htmlOutput;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied("code");
      setTimeout(() => setCopied(null), 2000);
    }
  }, [htmlOutput]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([htmlOutput], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-signature.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [htmlOutput]);

  const handleReset = useCallback(() => {
    setData({ ...defaultData });
    setTheme("blue");
    setCustomColor("#3B82F6");
    setLayout("horizontal");
    setActiveTab("preview");
  }, []);

  const inputFields: { key: keyof SignatureData; label: string; icon: typeof User; placeholder: string }[] = [
    { key: "fullName", label: "Full Name", icon: User, placeholder: "John Smith" },
    { key: "jobTitle", label: "Job Title", icon: Briefcase, placeholder: "Senior Developer" },
    { key: "company", label: "Company", icon: Briefcase, placeholder: "Acme Inc." },
    { key: "email", label: "Email", icon: Mail, placeholder: "john@acme.com" },
    { key: "phone", label: "Phone", icon: Phone, placeholder: "+1 (555) 123-4567" },
    { key: "website", label: "Website", icon: Globe, placeholder: "acme.com" },
  ];

  const socialFields: { key: keyof SignatureData; label: string; placeholder: string }[] = [
    { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/yourname" },
    { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/yourname" },
    { key: "github", label: "GitHub", placeholder: "https://github.com/yourname" },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={Mail}
          title="Email Signature Generator"
          description="Create professional email signatures with custom colors and copy-paste HTML output — free, instant, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Dev Tools"
        />
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Personal Information
              </h3>
              <div className="space-y-3">
                {inputFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-foreground-secondary mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={data[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                Profile Photo
              </h3>
              <input
                type="url"
                value={data.avatarUrl}
                onChange={(e) => updateField("avatarUrl", e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-foreground-muted mt-1">
                Optional. Use a square image URL for best results.
              </p>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Social Links
              </h3>
              <div className="space-y-3">
                {socialFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-foreground-secondary mb-1">
                      {field.label}
                    </label>
                    <input
                      type="url"
                      value={data[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Theme & Layout */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Theme & Layout
              </h3>

              {/* Color theme */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-foreground-secondary mb-2">
                  Color Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                        theme === t.id ? "border-primary scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: t.primary }}
                      aria-label={t.label}
                    >
                      {theme === t.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                  <button
                    onClick={() => setTheme("custom")}
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                      theme === "custom" ? "border-primary scale-110" : "border-border"
                    }`}
                    style={{
                      background: theme === "custom" ? customColor : "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                    }}
                    aria-label="Custom color"
                  >
                    {theme === "custom" && <Check className="w-4 h-4 text-white" />}
                  </button>
                </div>
                {theme === "custom" && (
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="mt-2 w-12 h-8 rounded border border-border cursor-pointer"
                  />
                )}
              </div>

              {/* Layout */}
              <div>
                <label className="block text-xs font-medium text-foreground-secondary mb-2">
                  Layout
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLayout("horizontal")}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      layout === "horizontal"
                        ? "bg-primary-muted border-primary-border text-primary"
                        : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                    }`}
                  >
                    Horizontal
                  </button>
                  <button
                    onClick={() => setLayout("vertical")}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      layout === "vertical"
                        ? "bg-primary-muted border-primary-border text-primary"
                        : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                    }`}
                  >
                    Centered
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            {/* Tab buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  activeTab === "preview"
                    ? "bg-primary-muted border-primary-border text-primary"
                    : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={() => setActiveTab("html")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  activeTab === "html"
                    ? "bg-primary-muted border-primary-border text-primary"
                    : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                }`}
              >
                <Code className="w-3.5 h-3.5" /> HTML Code
              </button>
            </div>

            {/* Preview / HTML */}
            <div className="glass-panel rounded-[16px] p-6">
              {activeTab === "preview" ? (
                <>
                  <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    Live Preview
                  </h3>
                  <div
                    className="bg-white rounded-xl p-6 border border-border min-h-[200px]"
                    dangerouslySetInnerHTML={{ __html: htmlOutput }}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Code className="w-4 h-4 text-primary" />
                      HTML Source
                    </h3>
                    <button
                      onClick={handleCopyCode}
                      className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"
                    >
                      {copied === "code" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Code
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-surface-1 rounded-xl p-4 text-xs font-mono text-foreground-secondary overflow-x-auto max-h-96 overflow-y-auto border border-border">
                    {htmlOutput}
                  </pre>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCopyHTML}
                className="btn btn-primary inline-flex items-center justify-center gap-2 w-full"
              >
                {copied === "html" ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Signature (Paste into Email)
                  </>
                )}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="btn btn-secondary inline-flex items-center gap-2 flex-1"
                >
                  <Download className="w-4 h-4" /> Download .html
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 flex-1"
                >
                  <ResetIcon className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="glass-panel rounded-[16px] p-6">
              <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                How to add your signature
              </h4>
              <div className="text-xs text-foreground-muted leading-relaxed space-y-2">
                <div>
                  <strong className="text-foreground">Gmail:</strong> Settings → See all settings →
                  General → Signature → Create new → Paste (Ctrl+V)
                </div>
                <div>
                  <strong className="text-foreground">Outlook:</strong> Settings → View all Outlook
                  settings → Mail → Compose and reply → Email signature → Paste
                </div>
                <div>
                  <strong className="text-foreground">Apple Mail:</strong> Preferences → Signatures →
                  Create new → Paste into the editor
                </div>
                <div>
                  <strong className="text-foreground">Thunderbird:</strong> Account Settings →
                  Signatures → Use HTML → Paste code
                </div>
              </div>
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Table-Based HTML — Universal Compatibility
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                The generated HTML uses table-based layout with inline styles,
                ensuring your signature renders correctly in Gmail, Outlook,
                Apple Mail, Thunderbird, and every major email client.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">
                Copy-Paste Ready
              </h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Click once to copy your signature as rich text — then paste it
                directly into your email client&apos;s signature editor. No coding
                required. Works instantly in Gmail, Outlook, and more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
