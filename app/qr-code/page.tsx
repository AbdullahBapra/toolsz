"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  QrCode,
  Check,
  Shield,
  Zap,
  Download,
  Copy,
  Wifi,
  User,
  Mail,
  Link,
  Type,
  Image as ImageIcon,
  X,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

type QrMode = "url" | "text" | "wifi" | "vcard" | "email";

interface QrConfig {
  fgColor: string;
  bgColor: string;
  size: number;
  margin: number;
  errorLevel: "L" | "M" | "Q" | "H";
}

interface LogoConfig {
  file: File | null;
  url: string | null;
  size: number; // percentage of QR size (20-40)
  padding: number; // px white border around logo
  bgColor: string; // padding background color
}

const QR_MODES: { id: QrMode; label: string; icon: typeof Link; desc: string }[] = [
  { id: "url", label: "URL", icon: Link, desc: "Link to any website" },
  { id: "text", label: "Text", icon: Type, desc: "Plain text message" },
  { id: "wifi", label: "WiFi", icon: Wifi, desc: "WiFi network credentials" },
  { id: "vcard", label: "vCard", icon: User, desc: "Contact information" },
  { id: "email", label: "Email", icon: Mail, desc: "Email address with subject" },
];

export default function QrCodePage() {
  const [mode, setMode] = useState<QrMode>("url");
  const [qrUrl, setQrUrl] = useState("https://example.com");
  const [qrText, setQrText] = useState("Hello, World!");
  const [qrWifi, setQrWifi] = useState({ ssid: "", password: "", encryption: "WPA" as "WPA" | "WEP" | "nopass" });
  const [qrVcard, setQrVcard] = useState({ name: "", phone: "", email: "", org: "", url: "" });
  const [qrEmail, setQrEmail] = useState({ address: "", subject: "", body: "" });
  const [config, setConfig] = useState<QrConfig>({
    fgColor: "#000000",
    bgColor: "#FFFFFF",
    size: 300,
    margin: 2,
    errorLevel: "M",
  });
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [logo, setLogo] = useState<LogoConfig>({
    file: null,
    url: null,
    size: 30,
    padding: 8,
    bgColor: "#FFFFFF",
  });
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoUrlRef = useRef<string | null>(null);

  // Cleanup logo blob URL on unmount
  useEffect(() => {
    logoUrlRef.current = logo.url;
    return () => {
      if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current);
    };
  }, [logo.url]);

  const generateQrData = useCallback((): string => {
    switch (mode) {
      case "url":
        return qrUrl;
      case "text":
        return qrText;
      case "wifi":
        return `WIFI:T:${qrWifi.encryption};S:${qrWifi.ssid};P:${qrWifi.password};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${qrVcard.name}\nTEL:${qrVcard.phone}\nEMAIL:${qrVcard.email}\nORG:${qrVcard.org}\nURL:${qrVcard.url}\nEND:VCARD`;
      case "email":
        return `mailto:${qrEmail.address}?subject=${encodeURIComponent(qrEmail.subject)}&body=${encodeURIComponent(qrEmail.body)}`;
      default:
        return qrUrl;
    }
  }, [mode, qrUrl, qrText, qrWifi, qrVcard, qrEmail]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke previous logo URL
    if (logo.url) URL.revokeObjectURL(logo.url);
    const url = URL.createObjectURL(file);
    setLogo((l) => ({ ...l, file, url }));
  }, [logo.url]);

  const handleLogoRemove = useCallback(() => {
    if (logo.url) URL.revokeObjectURL(logo.url);
    setLogo({ file: null, url: null, size: 30, padding: 8, bgColor: "#FFFFFF" });
    if (logoInputRef.current) logoInputRef.current.value = "";
  }, [logo.url]);

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      const data = generateQrData();
      if (!data.trim()) {
        setQrDataUrl(null);
        return;
      }
      try {
        const QRCode = (await import("qrcode")).default;

        const logoSrc = logo.url;
        if (logoSrc) {
          // Render with logo overlay on canvas
          const canvas = document.createElement("canvas");
          await QRCode.toCanvas(canvas, data, {
            width: config.size,
            margin: config.margin,
            errorCorrectionLevel: "H",
            color: {
              dark: config.fgColor,
              light: config.bgColor,
            },
          });

          const ctx = canvas.getContext("2d")!;
          const logoImg = new Image();
          await new Promise<void>((resolve, reject) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => reject(new Error("Failed to load logo"));
            logoImg.src = logoSrc;
          });

          const logoSizePx = Math.round(canvas.width * (logo.size / 100));
          const pad = logo.padding;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const totalSize = logoSizePx + pad * 2;

          // Draw rounded background behind logo
          const bgRadius = Math.round(pad * 1.5);
          ctx.fillStyle = logo.bgColor;
          ctx.beginPath();
          ctx.roundRect(centerX - totalSize / 2, centerY - totalSize / 2, totalSize, totalSize, bgRadius);
          ctx.fill();

          // Draw logo (clipped to rounded rect)
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(centerX - logoSizePx / 2, centerY - logoSizePx / 2, logoSizePx, logoSizePx, bgRadius - pad / 2);
          ctx.clip();
          ctx.drawImage(logoImg, centerX - logoSizePx / 2, centerY - logoSizePx / 2, logoSizePx, logoSizePx);
          ctx.restore();

          if (!cancelled) setQrDataUrl(canvas.toDataURL("image/png"));
        } else {
          // No logo — simple data URL
          const url = await QRCode.toDataURL(data, {
            width: config.size,
            margin: config.margin,
            errorCorrectionLevel: config.errorLevel,
            color: {
              dark: config.fgColor,
              light: config.bgColor,
            },
          });
          if (!cancelled) setQrDataUrl(url);
        }
      } catch {
        if (!cancelled) setQrDataUrl(null);
      }
    };
    generate();
    return () => { cancelled = true; };
  }, [generateQrData, config, logo.url, logo.size, logo.padding, logo.bgColor]);

  const handleDownload = useCallback(async (format: "png" | "svg") => {
    if (!qrDataUrl) return;
    if (format === "png") {
      const a = document.createElement("a");
      a.href = qrDataUrl;
      a.download = `qrcode.png`;
      a.click();
    } else if (logo.url && qrDataUrl) {
      // SVG with logo — embed the canvas-rendered PNG (already has logo) in an SVG wrapper
      const svgWrapper = `<svg xmlns="http://www.w3.org/2000/svg" width="${config.size}" height="${config.size}" viewBox="0 0 ${config.size} ${config.size}"><image href="${qrDataUrl}" width="${config.size}" height="${config.size}"/></svg>`;
      const blob = new Blob([svgWrapper], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.svg";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // No logo — clean SVG
      const data = generateQrData();
      const QRCode = (await import("qrcode")).default;
      const svgStr: string = await QRCode.toString(data, {
        type: "svg",
        width: config.size,
        margin: config.margin,
        errorCorrectionLevel: config.errorLevel,
        color: { dark: config.fgColor, light: config.bgColor },
      });
      const blob = new Blob([svgStr], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.svg";
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [qrDataUrl, generateQrData, config, logo.url, logo.size, logo.padding, logo.bgColor]);

  const handleCopy = useCallback(async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy data URL
      await navigator.clipboard.writeText(qrDataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [qrDataUrl]);

  const currentData = generateQrData();
  const hasContent = currentData.trim().length > 0;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={QrCode}
          title="QR Code Generator"
          description="Generate QR codes for URLs, text, WiFi, vCards, and emails — custom colors and SVG export. Free, instant, and completely private."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: Input */}
          <div className="glass-panel rounded-[16px] p-6 sm:p-8 space-y-5">
            {/* Mode tabs */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">Content Type</label>
              <div className="flex gap-2 flex-wrap">
                {QR_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      mode === m.id
                        ? "bg-primary-muted border-primary-border text-primary"
                        : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                    }`}
                  >
                    <m.icon className="w-3.5 h-3.5" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode-specific inputs */}
            {mode === "url" && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">URL</label>
                <input
                  type="url"
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            {mode === "text" && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Text</label>
                <textarea
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  rows={3}
                  placeholder="Enter your text…"
                  className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                />
              </div>
            )}

            {mode === "wifi" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Network Name (SSID)</label>
                  <input type="text" value={qrWifi.ssid} onChange={(e) => setQrWifi((w) => ({ ...w, ssid: e.target.value }))} placeholder="MyWiFi" className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Password</label>
                  <input type="text" value={qrWifi.password} onChange={(e) => setQrWifi((w) => ({ ...w, password: e.target.value }))} placeholder="Password" className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">Encryption</label>
                  <div className="flex gap-2">
                    {(["WPA", "WEP", "nopass"] as const).map((enc) => (
                      <button key={enc} onClick={() => setQrWifi((w) => ({ ...w, encryption: enc }))} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${qrWifi.encryption === enc ? "bg-primary-muted border-primary-border text-primary" : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"}`}>
                        {enc === "nopass" ? "None" : enc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mode === "vcard" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
                  <input type="text" value={qrVcard.name} onChange={(e) => setQrVcard((v) => ({ ...v, name: e.target.value }))} placeholder="John Smith" className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Phone</label>
                    <input type="tel" value={qrVcard.phone} onChange={(e) => setQrVcard((v) => ({ ...v, phone: e.target.value }))} placeholder="+1 555 1234" className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
                    <input type="email" value={qrVcard.email} onChange={(e) => setQrVcard((v) => ({ ...v, email: e.target.value }))} placeholder="john@example.com" className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Organization</label>
                    <input type="text" value={qrVcard.org} onChange={(e) => setQrVcard((v) => ({ ...v, org: e.target.value }))} placeholder="Acme Inc." className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Website</label>
                    <input type="url" value={qrVcard.url} onChange={(e) => setQrVcard((v) => ({ ...v, url: e.target.value }))} placeholder="https://example.com" className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
              </div>
            )}

            {mode === "email" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Email Address</label>
                  <input type="email" value={qrEmail.address} onChange={(e) => setQrEmail((em) => ({ ...em, address: e.target.value }))} placeholder="recipient@example.com" className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Subject</label>
                  <input type="text" value={qrEmail.subject} onChange={(e) => setQrEmail((em) => ({ ...em, subject: e.target.value }))} placeholder="Email subject" className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Body</label>
                  <textarea value={qrEmail.body} onChange={(e) => setQrEmail((em) => ({ ...em, body: e.target.value }))} rows={2} placeholder="Email body text…" className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y" />
                </div>
              </div>
            )}

            {/* Logo */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Center Logo
                </h4>
                {logo.url && (
                  <button onClick={handleLogoRemove} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                    <X className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
              {!logo.url ? (
                <div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-surface-1 hover:bg-primary-muted/30 transition-all text-xs text-foreground-secondary hover:text-primary flex items-center justify-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Upload logo image
                  </button>
                  <p className="text-xs text-foreground-muted mt-1.5">Adds a logo to the center. Error correction auto-sets to H (30%).</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-1 border border-border">
                    <img src={logo.url} alt="Logo" className="w-10 h-10 rounded object-contain bg-white" />
                    <span className="text-xs text-foreground truncate flex-1">{logo.file?.name}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Logo Size: {logo.size}%</label>
                    <input type="range" min={15} max={40} value={logo.size} onChange={(e) => setLogo((l) => ({ ...l, size: parseInt(e.target.value) }))} className="w-full" />
                    <div className="flex justify-between text-xs text-foreground-muted mt-0.5"><span>15%</span><span>40%</span></div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Padding: {logo.padding}px</label>
                    <input type="range" min={0} max={20} value={logo.padding} onChange={(e) => setLogo((l) => ({ ...l, padding: parseInt(e.target.value) }))} className="w-full" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-foreground">Padding Color</label>
                    <input type="color" value={logo.bgColor} onChange={(e) => setLogo((l) => ({ ...l, bgColor: e.target.value }))} className="w-6 h-6 rounded border border-border cursor-pointer" />
                    <input type="text" value={logo.bgColor} onChange={(e) => setLogo((l) => ({ ...l, bgColor: e.target.value }))} className="w-20 rounded-lg border border-border bg-surface-1 px-2 py-1 text-xs text-foreground font-mono" />
                  </div>
                  <div className="p-2 rounded-lg bg-primary-muted/40 border border-primary-border text-xs text-primary flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    Error correction auto-set to H (30%) for logo compatibility
                  </div>
                </div>
              )}
            </div>

            {/* Customization */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-xs font-semibold text-foreground">Customization</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Foreground</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={config.fgColor} onChange={(e) => setConfig((c) => ({ ...c, fgColor: e.target.value }))} className="w-8 h-8 rounded border border-border cursor-pointer" />
                    <input type="text" value={config.fgColor} onChange={(e) => setConfig((c) => ({ ...c, fgColor: e.target.value }))} className="flex-1 rounded-lg border border-border bg-surface-1 px-2 py-1 text-xs text-foreground font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={config.bgColor} onChange={(e) => setConfig((c) => ({ ...c, bgColor: e.target.value }))} className="w-8 h-8 rounded border border-border cursor-pointer" />
                    <input type="text" value={config.bgColor} onChange={(e) => setConfig((c) => ({ ...c, bgColor: e.target.value }))} className="flex-1 rounded-lg border border-border bg-surface-1 px-2 py-1 text-xs text-foreground font-mono" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Size: {config.size}px</label>
                  <input type="range" min={100} max={600} step={50} value={config.size} onChange={(e) => setConfig((c) => ({ ...c, size: parseInt(e.target.value) }))} className="w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Margin: {config.margin}</label>
                  <input type="range" min={0} max={8} value={config.margin} onChange={(e) => setConfig((c) => ({ ...c, margin: parseInt(e.target.value) }))} className="w-full" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Error Correction {logo.url && <span className="text-primary">(auto: H)</span>}</label>
                <div className="flex gap-2">
                  {(["L", "M", "Q", "H"] as const).map((level) => (
                    <button key={level} onClick={() => setConfig((c) => ({ ...c, errorLevel: level }))} disabled={logo.url !== null} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      (logo.url ? "H" : config.errorLevel) === level
                        ? "bg-primary-muted border-primary-border text-primary"
                        : "bg-surface-1 border-border text-foreground-secondary hover:bg-surface-2"
                    } ${logo.url ? "opacity-50 cursor-not-allowed" : ""}`}>{level} ({({ L: "7%", M: "15%", Q: "25%", H: "30%" })[level]})
                    </button>
                  ))}
                </div>
                {logo.url && <p className="text-xs text-foreground-muted mt-1">Locked to H when logo is present — ensures QR remains scannable.</p>}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="glass-panel rounded-[16px] p-6 flex flex-col items-center justify-center">
            {qrDataUrl && hasContent ? (
              <>
                <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
                  <img src={qrDataUrl} alt="QR Code" className="max-w-full" style={{ imageRendering: "pixelated" }} />
                </div>
                <div className="flex gap-2 mt-4 w-full">
                  <button onClick={() => handleDownload("png")} className="btn btn-primary inline-flex items-center gap-1.5 text-xs flex-1 justify-center">
                    <Download className="w-3.5 h-3.5" /> PNG
                  </button>
                  <button onClick={() => handleDownload("svg")} className="btn btn-secondary inline-flex items-center gap-1.5 text-xs flex-1 justify-center">
                    <Download className="w-3.5 h-3.5" /> SVG
                  </button>
                  <button onClick={handleCopy} className="btn btn-secondary inline-flex items-center gap-1.5 text-xs px-3">
                    {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <QrCode className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
                <p className="text-xs text-foreground-secondary">Enter content to generate a QR code</p>
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
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">5 QR Content Types</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Generate QR codes for URLs, plain text, WiFi credentials, vCard contacts, and email addresses. All in one tool.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Custom Logo & Colors</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Brand your QR codes with a center logo, custom colors, adjustable logo size and padding. Error correction auto-adjusts for scannability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
