"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Download, Eye, EyeOff,
  Receipt, FileText, ClipboardList, Truck, ScrollText,
  Building2, Users, FileEdit, List, Calculator, MessageSquare,
  ChevronDown, ChevronUp, Upload, Palette, Check, Save, RotateCcw,
  Info, Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocType = "invoice" | "quote" | "receipt" | "po" | "delivery";
type DiscountType = "percent" | "fixed";

interface LineItem {
  id: string; description: string; qty: number; unit: string; price: number;
}

interface DocData {
  // Document
  docNumber: string; date: string; altDate: string;
  reference: string; paymentTerms: string; paymentMethod: string; trackingNumber: string;
  // From (company)
  fromName: string; fromEmail: string; fromPhone: string;
  fromAddress: string; fromWebsite: string;
  fromTaxId: string; fromRegNumber: string; fromBankDetails: string;
  logoDataUrl: string;
  // To (client)
  toName: string; toEmail: string; toPhone: string;
  toAddress: string; toTaxId: string;
  // Items
  items: LineItem[];
  // Pricing
  currency: string;
  taxLabel: string;  taxRate: number;
  tax2Label: string; tax2Rate: number; enableTax2: boolean;
  discountType: DiscountType; discount: number;
  // Content
  notes: string; terms: string;
  // Options
  accentColor: string; showSignature: boolean; showStamp: boolean;
}

// ─── Doc type config ──────────────────────────────────────────────────────────

const DOC_CFG = {
  invoice:  { title:"INVOICE",        prefix:"INV-", icon:Receipt,      dateLabel:"Invoice Date", altLabel:"Due Date",      toLabel:"Bill To",      fromLabel:"From",          showPrices:true,  showTerms:true,  showPayMethod:false, showTracking:false, color:"#2563eb" },
  quote:    { title:"QUOTE",           prefix:"QUO-", icon:FileText,     dateLabel:"Quote Date",   altLabel:"Valid Until",   toLabel:"Prepared For", fromLabel:"Prepared By",   showPrices:true,  showTerms:false, showPayMethod:false, showTracking:false, color:"#7c3aed" },
  receipt:  { title:"RECEIPT",         prefix:"REC-", icon:ScrollText,   dateLabel:"Date",         altLabel:"Payment Date",  toLabel:"Received From",fromLabel:"Received By",   showPrices:true,  showTerms:false, showPayMethod:true,  showTracking:false, color:"#059669" },
  po:       { title:"PURCHASE ORDER",  prefix:"PO-",  icon:ClipboardList,dateLabel:"Order Date",   altLabel:"Required By",   toLabel:"Vendor",       fromLabel:"Order From",    showPrices:true,  showTerms:true,  showPayMethod:false, showTracking:false, color:"#d97706" },
  delivery: { title:"DELIVERY NOTE",   prefix:"DN-",  icon:Truck,        dateLabel:"Dispatch Date",altLabel:"Delivery Date", toLabel:"Deliver To",   fromLabel:"Dispatched By", showPrices:false, showTerms:false, showPayMethod:false, showTracking:true,  color:"#0891b2" },
} as const;

// ─── Themes ───────────────────────────────────────────────────────────────────

const THEMES = [
  { id:"blueprint", name:"Blueprint",  cat:"Classic",  swatch:"#1d4ed8", accent:"#1d4ed8", header:"#1d4ed8", headerText:"#fff",    body:"#fff",     tableHead:"#1d4ed8", tableHeadText:"#fff",    border:"#bfdbfe", subtle:"#eff6ff", font:"'Helvetica Neue',Arial,sans-serif" },
  { id:"executive", name:"Executive",  cat:"Premium",  swatch:"#0f172a", accent:"#d97706", header:"#0f172a", headerText:"#fbbf24", body:"#fff",     tableHead:"#1e293b", tableHeadText:"#f9fafb", border:"#334155", subtle:"#f8fafc", font:"Georgia,'Times New Roman',serif"   },
  { id:"minimal",   name:"Minimal",    cat:"Clean",    swatch:"#374151", accent:"#374151", header:"#fff",    headerText:"#111827", body:"#fff",     tableHead:"#f3f4f6", tableHeadText:"#6b7280", border:"#e5e7eb", subtle:"#f9fafb", font:"'Helvetica Neue',Arial,sans-serif" },
  { id:"corporate", name:"Corporate",  cat:"Formal",   swatch:"#0a1628", accent:"#0a1628", header:"#0a1628", headerText:"#fff",    body:"#fff",     tableHead:"#e7ebf3", tableHeadText:"#0a1628", border:"#c5cfe6", subtle:"#f0f4f8", font:"'Helvetica Neue',Arial,sans-serif" },
  { id:"pad",       name:"Legal Pad",  cat:"Creative", swatch:"#fef9c3", accent:"#4d7c0f", header:"#fffde7", headerText:"#3f6212", body:"#fffef5",  tableHead:"#fef9c3", tableHeadText:"#4d7c0f", border:"#d9f99d", subtle:"#f7ffe4", font:"'Courier New',Courier,monospace"   },
  { id:"agency",    name:"Agency",     cat:"Modern",   swatch:"#7c3aed", accent:"#7c3aed", header:"#18181b", headerText:"#fff",    body:"#fff",     tableHead:"#f4f4f5", tableHeadText:"#3f3f46", border:"#e4e4e7", subtle:"#fafafa",  font:"'Helvetica Neue',Arial,sans-serif" },
  { id:"boutique",  name:"Boutique",   cat:"Luxury",   swatch:"#be185d", accent:"#be185d", header:"#fff",    headerText:"#1a0a12", body:"#fff",     tableHead:"#fff5f8", tableHeadText:"#be185d", border:"#fce7f0", subtle:"#fff9fb",  font:"Georgia,'Times New Roman',serif"   },
  { id:"tech",      name:"Tech",       cat:"Dark",     swatch:"#22c55e", accent:"#22c55e", header:"#161b22", headerText:"#22c55e", body:"#0d1117",  tableHead:"#161b22", tableHeadText:"#22c55e", border:"#21262d", subtle:"#161b22",  font:"'Courier New',Courier,monospace"   },
  { id:"gradient",  name:"Gradient",   cat:"SaaS",     swatch:"#6366f1", accent:"#6366f1", header:"#6366f1", headerText:"#fff",    body:"#fff",     tableHead:"#eef2ff", tableHeadText:"#4338ca", border:"#e0e7ff", subtle:"#f5f3ff",  font:"'Helvetica Neue',Arial,sans-serif" },
  { id:"classic",   name:"Classic",    cat:"Formal",   swatch:"#1e3a5f", accent:"#1e3a5f", header:"#1e3a5f", headerText:"#fff",    body:"#fff",     tableHead:"#f1f5f9", tableHeadText:"#1e3a5f", border:"#cbd5e1", subtle:"#f8fafc",  font:"Georgia,'Times New Roman',serif"   },
];

const COLOR_PRESETS = [
  { name:"Indigo",  hex:"#4f46e5" }, { name:"Blue",    hex:"#2563eb" }, { name:"Cyan",    hex:"#0891b2" },
  { name:"Teal",    hex:"#0d9488" }, { name:"Emerald", hex:"#059669" }, { name:"Amber",   hex:"#d97706" },
  { name:"Red",     hex:"#dc2626" }, { name:"Rose",    hex:"#be185d" }, { name:"Purple",  hex:"#7c3aed" },
  { name:"Navy",    hex:"#0a1628" }, { name:"Slate",   hex:"#475569" }, { name:"Black",   hex:"#111827" },
];

const TAX_PRESETS = ["VAT","GST","HST","PST","Sales Tax","Excl. Tax"];
const CURRENCIES  = ["$","€","£","¥","₹","₩","₽","A$","C$","Fr","AED","SAR","CHF","SGD","HKD","NZD","MXN","BRL","ZAR","SEK","NOK","DKK","PLN","CZK","RON"];

const TC_TEMPLATES: Record<string, string> = {
  net30:     "Payment is due within 30 days of invoice date. A late fee of 1.5% per month will be applied to overdue balances. Please include invoice number on payment.",
  net60:     "Payment is due within 60 days of invoice date. A late fee of 1.5% per month will be applied to overdue balances.",
  freelance: "50% deposit required before work begins. Remaining balance due upon project completion. All intellectual property rights transfer upon receipt of full payment. Revisions beyond 2 rounds billed at standard hourly rate.",
  consulting:"Invoices must be settled within 14 days. Client retains all rights to deliverables upon full payment. All information shared is treated as confidential.",
  eu_vat:    "VAT reverse charge applies — The recipient is liable to account for any VAT due on this supply under Article 194 of Directive 2006/112/EC.",
};

const uid = () => Math.random().toString(36).slice(2, 9);
function fmt(n: number, c: string) { return `${c}${n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`; }

function makeDefault(type: DocType): DocData {
  const cfg = DOC_CFG[type];
  const today = new Date().toISOString().split("T")[0];
  const plus30 = new Date(Date.now()+30*86400000).toISOString().split("T")[0];
  return {
    docNumber: cfg.prefix + "001", date: today, altDate: plus30,
    reference:"", paymentTerms: type==="invoice"||type==="po" ? "Net 30" : "",
    paymentMethod:"Bank Transfer", trackingNumber:"",
    fromName:"Acme Studio", fromEmail:"hello@acme.co", fromPhone:"+1 555 100-2000",
    fromAddress:"123 Main Street\nNew York, NY 10001", fromWebsite:"acme.co",
    fromTaxId:"", fromRegNumber:"",
    fromBankDetails:"Bank: Chase Bank\nAccount: 0012-3456-7890\nRouting: 021000021\nSwift: CHASUS33",
    logoDataUrl:"",
    toName:"Client Corp", toEmail:"accounts@client.com", toPhone:"+1 555 300-4000",
    toAddress:"456 Oak Avenue\nLos Angeles, CA 90001", toTaxId:"",
    items:[
      { id:uid(), description:"Professional Services", qty:1,  unit:"",    price:type==="delivery"?0:2500 },
      { id:uid(), description:"Consulting (hourly)",   qty:5,  unit:"hrs", price:type==="delivery"?0:150  },
      { id:uid(), description:"Project Management",    qty:1,  unit:"",    price:type==="delivery"?0:500  },
    ],
    currency:"$", taxLabel:"Tax", taxRate:0, tax2Label:"", tax2Rate:0, enableTax2:false,
    discountType:"percent", discount:0,
    notes: type==="receipt" ? "Payment received in full. Thank you!"
         : type==="delivery" ? "Please inspect goods upon delivery and report any damage within 24 hours."
         : type==="quote" ? "This quote is valid for 30 days. Prices are subject to change after the validity period."
         : "Thank you for your business. We appreciate the opportunity to work with you.",
    terms: TC_TEMPLATES.net30,
    accentColor:"", showSignature: type!=="receipt"&&type!=="delivery", showStamp: type==="receipt",
  };
}

const LS_PROFILE = "toolsz_bizprofile";
const LS_CLIENTS = "toolsz_bizclients";

// ─── Document Template ─────────────────────────────────────────────────────────

interface TplProps {
  data: DocData; docType: DocType; themeId: string;
  subtotal: number; tax1: number; tax2: number; discountAmt: number; total: number;
}

function DocTemplate({ data, docType, themeId, subtotal, tax1, tax2, discountAmt, total }: TplProps) {
  const rawTheme = THEMES.find(t => t.id===themeId) || THEMES[0];
  const accent = data.accentColor || rawTheme.accent;
  const t = { ...rawTheme, accent };
  const cfg = DOC_CFG[docType];
  const c = data.currency;
  const isCorporate = themeId === "corporate";
  const isMinimal   = themeId === "minimal";
  const isPad       = themeId === "pad";
  const isExec      = themeId === "executive";
  const isAgency    = themeId === "agency";
  const isBoutique  = themeId === "boutique";
  const isTech      = themeId === "tech";
  const isGradient  = themeId === "gradient";
  const isClassic   = themeId === "classic";
  const bodyFont    = "'Helvetica Neue',Arial,sans-serif";

  // ── Shared sub-renders ──────────────────────────────────────────────────────

  const Logo = data.logoDataUrl
    ? <img src={data.logoDataUrl} alt="Logo" style={{ height:48, maxWidth:140, objectFit:"contain", display:"block" }} />
    : null;

  const MetaRow = () => (
    <div style={{ display:"flex", flexWrap:"wrap" as const, gap:"3px 18px", fontSize:10.5, color:isMinimal?"#6b7280":t.id==="pad"?t.accent:"rgba(255,255,255,0.75)", fontFamily:bodyFont }}>
      <span><b style={{ opacity:0.8 }}>{cfg.dateLabel}:</b> {data.date}</span>
      <span><b style={{ opacity:0.8 }}>{cfg.altLabel}:</b> {data.altDate}</span>
      {cfg.showTerms && data.paymentTerms && <span><b style={{ opacity:0.8 }}>Terms:</b> {data.paymentTerms}</span>}
      {cfg.showPayMethod && data.paymentMethod && <span><b style={{ opacity:0.8 }}>Payment:</b> {data.paymentMethod}</span>}
      {cfg.showTracking && data.trackingNumber && <span><b style={{ opacity:0.8 }}>Tracking:</b> {data.trackingNumber}</span>}
      {data.reference && <span><b style={{ opacity:0.8 }}>Ref:</b> {data.reference}</span>}
    </div>
  );

  const FromBlock = ({ textColor = "#374151" }: { textColor?: string }) => (
    <div>
      <div style={{ fontSize:9, fontWeight:700, color:t.accent, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5, fontFamily:bodyFont }}>{cfg.fromLabel}</div>
      <div style={{ fontSize:13, fontWeight:700, color:textColor === "#fff" ? "#fff" : "#111827", fontFamily:bodyFont }}>{data.fromName}</div>
      {data.fromEmail   && <div style={{ fontSize:10.5, color:textColor, fontFamily:bodyFont, marginTop:1 }}>{data.fromEmail}</div>}
      {data.fromPhone   && <div style={{ fontSize:10.5, color:textColor, fontFamily:bodyFont }}>{data.fromPhone}</div>}
      {data.fromWebsite && <div style={{ fontSize:10.5, color:textColor, fontFamily:bodyFont }}>{data.fromWebsite}</div>}
      {data.fromAddress && <div style={{ fontSize:10.5, color:textColor, fontFamily:bodyFont, whiteSpace:"pre-wrap", marginTop:2 }}>{data.fromAddress}</div>}
      {data.fromTaxId   && <div style={{ fontSize:10, color:textColor, fontFamily:bodyFont, marginTop:2, opacity:0.8 }}>Tax ID: {data.fromTaxId}</div>}
      {data.fromRegNumber && <div style={{ fontSize:10, color:textColor, fontFamily:bodyFont, opacity:0.8 }}>Reg: {data.fromRegNumber}</div>}
    </div>
  );

  const ToBlock = () => (
    <div>
      <div style={{ fontSize:9, fontWeight:700, color:t.accent, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5, fontFamily:bodyFont }}>{cfg.toLabel}</div>
      <div style={{ fontSize:13, fontWeight:700, color:"#111827", fontFamily:bodyFont }}>{data.toName||"—"}</div>
      {data.toEmail   && <div style={{ fontSize:10.5, color:"#4b5563", fontFamily:bodyFont, marginTop:1 }}>{data.toEmail}</div>}
      {data.toPhone   && <div style={{ fontSize:10.5, color:"#4b5563", fontFamily:bodyFont }}>{data.toPhone}</div>}
      {data.toAddress && <div style={{ fontSize:10.5, color:"#4b5563", fontFamily:bodyFont, whiteSpace:"pre-wrap", marginTop:2 }}>{data.toAddress}</div>}
      {data.toTaxId   && <div style={{ fontSize:10, color:"#6b7280", fontFamily:bodyFont, marginTop:2 }}>Tax ID: {data.toTaxId}</div>}
    </div>
  );

  const cols = cfg.showPrices ? "1fr 48px 56px 80px 80px" : "1fr 70px 70px";
  const ItemsTable = () => (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:cols, background:t.tableHead, color:t.tableHeadText, padding:"8px 10px", fontSize:9, fontWeight:700, letterSpacing:0.8, fontFamily:bodyFont, borderRadius: isPad ? 0 : (isCorporate ? 0 : "4px 4px 0 0") }}>
        <span>Description</span>
        <span style={{ textAlign:"center" as const }}>Qty</span>
        {cfg.showPrices
          ? <><span style={{ textAlign:"center" as const }}>Unit</span><span style={{ textAlign:"right" as const }}>Price</span><span style={{ textAlign:"right" as const }}>Amount</span></>
          : <span style={{ textAlign:"center" as const }}>Unit</span>}
      </div>
      {data.items.map((item, i) => (
        <div key={item.id} style={{ display:"grid", gridTemplateColumns:cols, padding:"9px 10px", fontSize:11, borderBottom:`1px solid ${t.border}`, background: i%2===0 ? (isPad?t.body:"#fff") : t.subtle, fontFamily:bodyFont }}>
          <span style={{ color:"#1e293b" }}>{item.description||"—"}</span>
          <span style={{ textAlign:"center" as const, color:"#374151" }}>{item.qty}</span>
          {cfg.showPrices
            ? <><span style={{ textAlign:"center" as const, color:"#94a3b8" }}>{item.unit}</span><span style={{ textAlign:"right" as const, color:"#374151" }}>{fmt(item.price,c)}</span><span style={{ textAlign:"right" as const, fontWeight:600, color:"#1e293b" }}>{fmt(item.qty*item.price,c)}</span></>
            : <span style={{ textAlign:"center" as const, color:"#6b7280" }}>{item.unit}</span>}
        </div>
      ))}
    </div>
  );

  const Totals = () => !cfg.showPrices ? null : (
    <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}>
      <div style={{ width:240, fontFamily:bodyFont }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#6b7280", padding:"3px 0" }}><span>Subtotal</span><span>{fmt(subtotal,c)}</span></div>
        {discountAmt>0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#16a34a", padding:"3px 0" }}><span>{data.discountType==="fixed"?`Discount`:`Discount (${data.discount}%)`}</span><span>−{fmt(discountAmt,c)}</span></div>}
        {tax1>0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#6b7280", padding:"3px 0" }}><span>{data.taxLabel||"Tax"} ({data.taxRate}%)</span><span>{fmt(tax1,c)}</span></div>}
        {data.enableTax2 && tax2>0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#6b7280", padding:"3px 0" }}><span>{data.tax2Label||"Tax 2"} ({data.tax2Rate}%)</span><span>{fmt(tax2,c)}</span></div>}
        <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 12px", marginTop:10, background:t.accent, borderRadius:4, fontSize:15, fontWeight:800, color:"#fff", fontFamily:bodyFont }}>
          <span>{docType==="receipt"?"PAID":"TOTAL DUE"}</span><span>{fmt(total,c)}</span>
        </div>
      </div>
    </div>
  );

  const BankDetails = () => !data.fromBankDetails ? null : (
    <div style={{ marginTop:20, padding:"12px 14px", background:t.subtle, borderLeft:`3px solid ${t.accent}`, borderRadius:4 }}>
      <div style={{ fontSize:9, fontWeight:700, color:t.accent, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5, fontFamily:bodyFont }}>Payment Details</div>
      <div style={{ fontSize:11, color:"#374151", whiteSpace:"pre-wrap", lineHeight:1.65, fontFamily:"'Courier New',Courier,monospace" }}>{data.fromBankDetails}</div>
    </div>
  );

  const NotesAndTerms = () => (
    <>
      {data.notes && (
        <div style={{ marginTop:16, padding:"12px 14px", background:t.subtle, borderRadius:4 }}>
          <div style={{ fontSize:9, fontWeight:700, color:t.accent, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:4, fontFamily:bodyFont }}>Notes</div>
          <div style={{ fontSize:11, color:"#374151", whiteSpace:"pre-wrap", lineHeight:1.65, fontFamily:bodyFont }}>{data.notes}</div>
        </div>
      )}
      {data.terms && (
        <div style={{ marginTop:12, paddingTop:10, borderTop:`1px dashed ${t.border}` }}>
          <div style={{ fontSize:8, fontWeight:700, color:"#9ca3af", letterSpacing:2, textTransform:"uppercase" as const, marginBottom:4, fontFamily:bodyFont }}>Terms & Conditions</div>
          <div style={{ fontSize:9.5, color:"#9ca3af", lineHeight:1.6, fontFamily:bodyFont }}>{data.terms}</div>
        </div>
      )}
    </>
  );

  const SignatureLine = () => !data.showSignature ? null : (
    <div style={{ marginTop:28, display:"flex", justifyContent:"space-between", fontFamily:bodyFont }}>
      <div style={{ width:200 }}>
        <div style={{ borderTop:`1px solid #9ca3af`, paddingTop:4 }}>
          <div style={{ fontSize:9, color:"#6b7280", textTransform:"uppercase" as const, letterSpacing:1 }}>Authorized Signature</div>
          <div style={{ fontSize:9, color:"#9ca3af", marginTop:2 }}>{data.fromName}</div>
        </div>
      </div>
      <div style={{ width:160 }}>
        <div style={{ borderTop:`1px solid #9ca3af`, paddingTop:4 }}>
          <div style={{ fontSize:9, color:"#6b7280", textTransform:"uppercase" as const, letterSpacing:1 }}>Date</div>
        </div>
      </div>
    </div>
  );

  const PaidStamp = () => !data.showStamp ? null : (
    <div style={{ position:"absolute" as const, top:20, right:40, border:"4px solid #16a34a", borderRadius:6, padding:"4px 14px", transform:"rotate(-8deg)", opacity:0.7 }}>
      <div style={{ fontSize:22, fontWeight:900, color:"#16a34a", letterSpacing:3, fontFamily:bodyFont }}>PAID</div>
    </div>
  );

  // ── Corporate sidebar ───────────────────────────────────────────────────────
  if (isCorporate) {
    return (
      <div style={{ width:794, background:"#fff", fontFamily:t.font, minHeight:1123, display:"flex", position:"relative" as const }}>
        <PaidStamp />
        <div style={{ width:210, background:t.header, padding:"28px 20px 28px", display:"flex", flexDirection:"column" as const, gap:18, flexShrink:0 }}>
          {Logo && <div>{Logo}</div>}
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:"#fff", letterSpacing:0.5 }}>{data.fromName||"Company"}</div>
            {data.fromEmail   && <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>{data.fromEmail}</div>}
            {data.fromPhone   && <div style={{ fontSize:10, color:"#94a3b8" }}>{data.fromPhone}</div>}
            {data.fromWebsite && <div style={{ fontSize:10, color:"#94a3b8" }}>{data.fromWebsite}</div>}
            {data.fromAddress && <div style={{ fontSize:10, color:"#94a3b8", whiteSpace:"pre-wrap", marginTop:4, lineHeight:1.5 }}>{data.fromAddress}</div>}
            {data.fromTaxId   && <div style={{ fontSize:9.5, color:"#64748b", marginTop:4 }}>Tax ID: {data.fromTaxId}</div>}
            {data.fromRegNumber && <div style={{ fontSize:9.5, color:"#64748b" }}>Reg: {data.fromRegNumber}</div>}
          </div>
          <div style={{ marginTop:"auto" }}>
            <div style={{ fontSize:8, fontWeight:700, color:"#475569", letterSpacing:2, textTransform:"uppercase" as const, marginBottom:6, fontFamily:bodyFont }}>Document</div>
            <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{data.docNumber}</div>
            <div style={{ height:1, background:"#1e3a5f", margin:"8px 0" }} />
            <div style={{ fontSize:10, color:"#64748b" }}>{cfg.dateLabel}: {data.date}</div>
            <div style={{ fontSize:10, color:"#64748b" }}>{cfg.altLabel}: {data.altDate}</div>
            {data.reference && <div style={{ fontSize:10, color:"#64748b" }}>Ref: {data.reference}</div>}
            {cfg.showTerms && data.paymentTerms && <div style={{ fontSize:10, color:"#64748b", marginTop:4 }}>{data.paymentTerms}</div>}
          </div>
        </div>
        <div style={{ flex:1, padding:"28px 32px" }}>
          <div style={{ fontSize:24, fontWeight:900, color:t.accent, letterSpacing:2, marginBottom:18, fontFamily:bodyFont }}>{cfg.title}</div>
          <div style={{ display:"flex", gap:32, marginBottom:22, paddingBottom:18, borderBottom:`1px solid ${t.border}` }}>
            <ToBlock />
            {(cfg.showPayMethod && data.paymentMethod) && <div><div style={{ fontSize:9, fontWeight:700, color:t.accent, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5, fontFamily:bodyFont }}>Payment Method</div><div style={{ fontSize:12, color:"#374151", fontFamily:bodyFont }}>{data.paymentMethod}</div></div>}
            {(cfg.showTracking && data.trackingNumber) && <div><div style={{ fontSize:9, fontWeight:700, color:t.accent, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5, fontFamily:bodyFont }}>Tracking No.</div><div style={{ fontSize:12, color:"#374151", fontFamily:bodyFont }}>{data.trackingNumber}</div></div>}
          </div>
          <ItemsTable />
          <Totals />
          <BankDetails />
          <NotesAndTerms />
          <SignatureLine />
        </div>
      </div>
    );
  }

  // ── Minimal ─────────────────────────────────────────────────────────────────
  if (isMinimal) {
    return (
      <div style={{ width:794, background:"#fff", fontFamily:t.font, minHeight:1123, padding:"44px 52px", color:"#111", position:"relative" as const }}>
        <PaidStamp />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, paddingBottom:16, borderBottom:`2px solid #111827` }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {Logo}
            <div>
              <div style={{ fontSize:24, fontWeight:800, color:"#111827" }}>{data.fromName||"Company"}</div>
              {data.fromWebsite && <div style={{ fontSize:11, color:"#9ca3af" }}>{data.fromWebsite}</div>}
            </div>
          </div>
          <div style={{ textAlign:"right" as const }}>
            <div style={{ fontSize:22, fontWeight:200, color:"#6b7280", letterSpacing:4 }}>{cfg.title}</div>
            <div style={{ fontSize:14, fontWeight:700, color:"#111827", marginTop:4 }}>{data.docNumber}</div>
          </div>
        </div>
        <MetaRow />
        <div style={{ display:"flex", gap:40, marginTop:20, marginBottom:24, paddingBottom:16, borderBottom:`1px solid ${t.border}` }}>
          <div style={{ flex:1 }}><FromBlock /></div>
          <div style={{ flex:1 }}><ToBlock /></div>
        </div>
        <ItemsTable />
        <Totals />
        <BankDetails />
        <NotesAndTerms />
        <SignatureLine />
      </div>
    );
  }

  // ── Executive ───────────────────────────────────────────────────────────────
  if (isExec) {
    return (
      <div style={{ width:794, background:"#fff", fontFamily:t.font, minHeight:1123, color:"#111", position:"relative" as const }}>
        <PaidStamp />
        <div style={{ background:t.header, padding:"28px 44px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {Logo}
            <div>
              <div style={{ fontSize:9, color:t.headerText, letterSpacing:6, textTransform:"uppercase" as const, fontFamily:bodyFont, opacity:0.7 }}>{cfg.title}</div>
              <div style={{ fontSize:22, fontWeight:700, color:"#f8fafc" }}>{data.fromName||"Company"}</div>
            </div>
          </div>
          <div style={{ textAlign:"right" as const, fontFamily:bodyFont }}>
            <div style={{ fontSize:18, fontWeight:700, color:t.headerText }}>{data.docNumber}</div>
            <div style={{ fontSize:10.5, color:"#94a3b8", marginTop:5 }}>{cfg.dateLabel}: {data.date}</div>
            <div style={{ fontSize:10.5, color:"#94a3b8" }}>{cfg.altLabel}: {data.altDate}</div>
            {cfg.showTerms && data.paymentTerms && <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>{data.paymentTerms}</div>}
          </div>
        </div>
        <div style={{ display:"flex", gap:36, padding:"22px 44px", borderBottom:`1px solid ${t.border}` }}>
          <div style={{ flex:1 }}><FromBlock /></div>
          <div style={{ flex:1 }}><ToBlock /></div>
          {data.reference && <div style={{ flex:0.7 }}><div style={{ fontSize:9, fontWeight:700, color:t.accent, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5, fontFamily:bodyFont }}>Reference</div><div style={{ fontSize:11, color:"#374151", fontFamily:bodyFont }}>{data.reference}</div></div>}
        </div>
        <div style={{ padding:"18px 44px 0" }}>
          <ItemsTable />
          <Totals />
          <BankDetails />
          <NotesAndTerms />
          <SignatureLine />
        </div>
        <div style={{ marginTop:32, background:t.header, height:5 }} />
      </div>
    );
  }

  // ── Agency ──────────────────────────────────────────────────────────────────
  if (isAgency) {
    return (
      <div style={{ width:794, background:"#fff", fontFamily:t.font, minHeight:1123, color:"#111", position:"relative" as const }}>
        <PaidStamp />
        <div style={{ display:"flex", minHeight:80 }}>
          <div style={{ background:t.header, padding:"22px 28px", flex:"0 0 310px", display:"flex", flexDirection:"column" as const, justifyContent:"center" }}>
            {Logo && <div style={{ marginBottom:8 }}>{Logo}</div>}
            <div style={{ fontSize:16, fontWeight:900, color:"#fff" }}>{data.fromName||"Company"}</div>
            {data.fromEmail   && <div style={{ fontSize:9.5, color:"#71717a", marginTop:3 }}>{data.fromEmail}</div>}
            {data.fromPhone   && <div style={{ fontSize:9.5, color:"#71717a" }}>{data.fromPhone}</div>}
            {data.fromWebsite && <div style={{ fontSize:9.5, color:"#71717a" }}>{data.fromWebsite}</div>}
            {data.fromAddress && <div style={{ fontSize:9.5, color:"#52525b", whiteSpace:"pre-wrap", marginTop:4, lineHeight:1.5 }}>{data.fromAddress}</div>}
            {data.fromTaxId   && <div style={{ fontSize:9, color:"#52525b", marginTop:4 }}>Tax ID: {data.fromTaxId}</div>}
          </div>
          <div style={{ flex:1, background:"#fafafa", padding:"22px 28px", display:"flex", flexDirection:"column" as const, justifyContent:"center", borderBottom:`4px solid ${accent}` }}>
            <div style={{ fontSize:8, fontWeight:700, color:accent, letterSpacing:3, textTransform:"uppercase" as const, marginBottom:4, fontFamily:bodyFont }}>{cfg.title}</div>
            <div style={{ fontSize:26, fontWeight:900, color:"#111827", letterSpacing:-0.5, fontFamily:bodyFont }}>{data.docNumber}</div>
            <div style={{ display:"flex", gap:16, marginTop:6, fontSize:10, color:"#6b7280", flexWrap:"wrap" as const, fontFamily:bodyFont }}>
              <span>{cfg.dateLabel}: <b style={{ color:"#374151" }}>{data.date}</b></span>
              <span>{cfg.altLabel}: <b style={{ color:"#374151" }}>{data.altDate}</b></span>
              {cfg.showTerms && data.paymentTerms && <span>Terms: <b style={{ color:"#374151" }}>{data.paymentTerms}</b></span>}
              {data.reference && <span>Ref: <b style={{ color:"#374151" }}>{data.reference}</b></span>}
              {cfg.showTracking && data.trackingNumber && <span>Tracking: <b style={{ color:"#374151" }}>{data.trackingNumber}</b></span>}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:32, padding:"18px 36px", borderBottom:`1px solid ${t.border}` }}>
          <div style={{ flex:1 }}><ToBlock /></div>
          {cfg.showPayMethod && data.paymentMethod && <div style={{ flex:0.6 }}>
            <div style={{ fontSize:9, fontWeight:700, color:accent, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5, fontFamily:bodyFont }}>Payment</div>
            <div style={{ fontSize:11, color:"#374151", fontFamily:bodyFont }}>{data.paymentMethod}</div>
          </div>}
        </div>
        <div style={{ padding:"18px 36px 0" }}>
          <ItemsTable />
          <Totals />
          <BankDetails />
          <NotesAndTerms />
          <SignatureLine />
        </div>
      </div>
    );
  }

  // ── Boutique ─────────────────────────────────────────────────────────────────
  if (isBoutique) {
    return (
      <div style={{ width:794, background:"#fff", fontFamily:t.font, minHeight:1123, color:"#111", position:"relative" as const }}>
        <PaidStamp />
        <div style={{ textAlign:"center" as const, padding:"32px 60px 18px" }}>
          {Logo && <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}>{Logo}</div>}
          <div style={{ fontSize:10, letterSpacing:6, textTransform:"uppercase" as const, color:accent, fontFamily:bodyFont, marginBottom:5, opacity:0.7 }}>{data.fromWebsite||data.fromEmail}</div>
          <div style={{ fontSize:22, fontWeight:400, color:"#1a0a12", letterSpacing:2 }}>{data.fromName||"Company"}</div>
          <div style={{ fontSize:10, color:"#9ca3af", marginTop:4, fontFamily:bodyFont }}>
            {[data.fromPhone, data.fromAddress?.split("\n")[0]].filter(Boolean).join("  ·  ")}
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, margin:"14px auto" }}>
            <div style={{ flex:1, height:0.5, background:accent, maxWidth:100 }} />
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:4, textTransform:"uppercase" as const, color:accent, fontFamily:bodyFont }}>{cfg.title}</div>
            <div style={{ flex:1, height:0.5, background:accent, maxWidth:100 }} />
          </div>
          <div style={{ fontSize:11, color:"#6b7280", fontFamily:bodyFont }}>
            {data.docNumber}&nbsp;·&nbsp;{data.date}{data.altDate && ` · ${cfg.altLabel}: ${data.altDate}`}
          </div>
        </div>
        <div style={{ display:"flex", gap:40, padding:"18px 60px", borderTop:`0.5px solid ${t.border}`, borderBottom:`0.5px solid ${t.border}` }}>
          <div style={{ flex:1 }}><FromBlock /></div>
          <div style={{ flex:1 }}>
            <ToBlock />
            {cfg.showTerms && data.paymentTerms && <div style={{ fontSize:10, color:"#6b7280", fontFamily:bodyFont, marginTop:8 }}>Terms: {data.paymentTerms}</div>}
            {data.reference && <div style={{ fontSize:10, color:"#6b7280", fontFamily:bodyFont }}>Ref: {data.reference}</div>}
            {cfg.showPayMethod && data.paymentMethod && <div style={{ fontSize:10, color:"#6b7280", fontFamily:bodyFont }}>Payment: {data.paymentMethod}</div>}
          </div>
        </div>
        <div style={{ padding:"18px 60px 0" }}>
          <ItemsTable />
          <Totals />
          <BankDetails />
          <NotesAndTerms />
          <SignatureLine />
        </div>
      </div>
    );
  }

  // ── Tech (dark terminal) ─────────────────────────────────────────────────────
  if (isTech) {
    const dim = "#8b949e"; const bright = "#e6edf3"; const green = accent;
    return (
      <div style={{ width:794, background:"#0d1117", fontFamily:"'Courier New',Courier,monospace", minHeight:1123, color:bright, position:"relative" as const }}>
        <div style={{ position:"absolute" as const, top:20, right:40, border:"4px solid #22c55e", borderRadius:6, padding:"4px 14px", transform:"rotate(-8deg)", opacity:0.7, display:data.showStamp?"block":"none" }}>
          <div style={{ fontSize:22, fontWeight:900, color:"#22c55e", letterSpacing:3 }}>PAID</div>
        </div>
        <div style={{ background:"#161b22", borderBottom:"1px solid #30363d", padding:"20px 36px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#ff5f57" }} />
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#ffbd2e" }} />
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#28c941" }} />
            <span style={{ marginLeft:8, fontSize:10, color:"#484f58" }}>{cfg.title.toLowerCase()}.pdf — {data.docNumber}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div>
              {Logo && <div style={{ marginBottom:8 }}>{Logo}</div>}
              <div style={{ fontSize:8, color:dim, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:3 }}>// from</div>
              <div style={{ fontSize:16, fontWeight:700, color:green }}>{data.fromName||"Company"}</div>
              {data.fromEmail   && <div style={{ fontSize:9.5, color:dim, marginTop:2 }}>{data.fromEmail}</div>}
              {data.fromPhone   && <div style={{ fontSize:9.5, color:dim }}>{data.fromPhone}</div>}
            </div>
            <div style={{ textAlign:"right" as const }}>
              <div style={{ fontSize:8, color:dim, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:3 }}>// document</div>
              <div style={{ fontSize:16, fontWeight:700, color:bright }}>{data.docNumber}</div>
              <div style={{ fontSize:9.5, color:dim, marginTop:2 }}>{cfg.dateLabel}: {data.date}</div>
              <div style={{ fontSize:9.5, color:dim }}>{cfg.altLabel}: {data.altDate}</div>
              {cfg.showTerms && data.paymentTerms && <div style={{ fontSize:9.5, color:dim }}>Terms: {data.paymentTerms}</div>}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:32, padding:"18px 36px", borderBottom:"1px solid #21262d" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:8, color:green, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5 }}>// {cfg.toLabel}</div>
            <div style={{ fontSize:12, fontWeight:700, color:bright }}>{data.toName||"—"}</div>
            {data.toEmail   && <div style={{ fontSize:10, color:dim, marginTop:2 }}>{data.toEmail}</div>}
            {data.toPhone   && <div style={{ fontSize:10, color:dim }}>{data.toPhone}</div>}
            {data.toAddress && <div style={{ fontSize:10, color:dim, whiteSpace:"pre-wrap", marginTop:3, lineHeight:1.5 }}>{data.toAddress}</div>}
            {data.toTaxId   && <div style={{ fontSize:9.5, color:dim, marginTop:3 }}>Tax ID: {data.toTaxId}</div>}
          </div>
          <div style={{ flex:0.6 }}>
            <div style={{ fontSize:8, color:green, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5 }}>// meta</div>
            {data.reference && <div style={{ fontSize:10, color:dim }}>ref: {data.reference}</div>}
            {cfg.showTracking && data.trackingNumber && <div style={{ fontSize:10, color:dim }}>tracking: {data.trackingNumber}</div>}
            {cfg.showPayMethod && data.paymentMethod && <div style={{ fontSize:10, color:dim }}>payment: {data.paymentMethod}</div>}
          </div>
        </div>
        <div style={{ padding:"16px 36px 0" }}>
          <div style={{ display:"grid", gridTemplateColumns:cfg.showPrices?"1fr 48px 56px 80px 80px":"1fr 70px 70px", background:"#161b22", padding:"8px 10px", fontSize:9, fontWeight:700, letterSpacing:1, color:green, borderBottom:"1px solid #21262d" }}>
            <span>// description</span>
            <span style={{ textAlign:"center" as const }}>qty</span>
            {cfg.showPrices
              ? <><span style={{ textAlign:"center" as const }}>unit</span><span style={{ textAlign:"right" as const }}>price</span><span style={{ textAlign:"right" as const }}>total</span></>
              : <span style={{ textAlign:"center" as const }}>unit</span>}
          </div>
          {data.items.map((item, i) => (
            <div key={item.id} style={{ display:"grid", gridTemplateColumns:cfg.showPrices?"1fr 48px 56px 80px 80px":"1fr 70px 70px", padding:"9px 10px", fontSize:11, borderBottom:"1px solid #21262d", background:i%2===0?"#0d1117":"#0e1117" }}>
              <span style={{ color:bright }}>{item.description||"—"}</span>
              <span style={{ textAlign:"center" as const, color:dim }}>{item.qty}</span>
              {cfg.showPrices
                ? <><span style={{ textAlign:"center" as const, color:"#484f58" }}>{item.unit}</span><span style={{ textAlign:"right" as const, color:dim }}>{fmt(item.price,c)}</span><span style={{ textAlign:"right" as const, fontWeight:600, color:green }}>{fmt(item.qty*item.price,c)}</span></>
                : <span style={{ textAlign:"center" as const, color:dim }}>{item.unit}</span>}
            </div>
          ))}
          {cfg.showPrices && (
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:16 }}>
              <div style={{ width:240 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:dim, padding:"3px 0" }}><span>subtotal</span><span>{fmt(subtotal,c)}</span></div>
                {discountAmt>0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#22c55e", padding:"3px 0" }}><span>discount</span><span>−{fmt(discountAmt,c)}</span></div>}
                {tax1>0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:dim, padding:"3px 0" }}><span>{data.taxLabel} ({data.taxRate}%)</span><span>{fmt(tax1,c)}</span></div>}
                {data.enableTax2 && tax2>0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:dim, padding:"3px 0" }}><span>{data.tax2Label} ({data.tax2Rate}%)</span><span>{fmt(tax2,c)}</span></div>}
                <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 12px", marginTop:10, background:"#161b22", border:`1px solid ${green}`, borderRadius:4, fontSize:14, fontWeight:800, color:green }}>
                  <span>{docType==="receipt"?"PAID":"TOTAL"}</span><span>{fmt(total,c)}</span>
                </div>
              </div>
            </div>
          )}
          {data.fromBankDetails && (
            <div style={{ marginTop:20, padding:"12px 14px", background:"#161b22", borderLeft:`3px solid ${green}`, borderRadius:4 }}>
              <div style={{ fontSize:9, fontWeight:700, color:green, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5 }}>// payment_details</div>
              <div style={{ fontSize:11, color:dim, whiteSpace:"pre-wrap", lineHeight:1.65 }}>{data.fromBankDetails}</div>
            </div>
          )}
          {data.notes && (
            <div style={{ marginTop:16, padding:"12px 14px", background:"#161b22", borderRadius:4 }}>
              <div style={{ fontSize:9, fontWeight:700, color:green, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:4 }}>// notes</div>
              <div style={{ fontSize:11, color:dim, whiteSpace:"pre-wrap", lineHeight:1.65 }}>{data.notes}</div>
            </div>
          )}
          {data.terms && (
            <div style={{ marginTop:12, paddingTop:10, borderTop:"1px dashed #21262d" }}>
              <div style={{ fontSize:8, fontWeight:700, color:dim, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:4 }}>// terms_and_conditions</div>
              <div style={{ fontSize:9.5, color:"#484f58", lineHeight:1.6 }}>{data.terms}</div>
            </div>
          )}
          {data.showSignature && (
            <div style={{ marginTop:28, display:"flex", justifyContent:"space-between" }}>
              <div style={{ width:200 }}><div style={{ borderTop:"1px solid #21262d", paddingTop:4 }}>
                <div style={{ fontSize:9, color:dim, textTransform:"uppercase" as const, letterSpacing:1 }}>Authorized Signature</div>
                <div style={{ fontSize:9, color:"#484f58", marginTop:2 }}>{data.fromName}</div>
              </div></div>
              <div style={{ width:160 }}><div style={{ borderTop:"1px solid #21262d", paddingTop:4 }}>
                <div style={{ fontSize:9, color:dim, textTransform:"uppercase" as const, letterSpacing:1 }}>Date</div>
              </div></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Gradient (SaaS) ──────────────────────────────────────────────────────────
  if (isGradient) {
    const gradBg = `linear-gradient(135deg, ${accent} 0%, ${accent}cc 50%, ${accent}99 100%)`;
    return (
      <div style={{ width:794, background:"#fff", fontFamily:t.font, minHeight:1123, color:"#111", position:"relative" as const }}>
        <PaidStamp />
        <div style={{ background:gradBg, padding:"28px 44px", position:"relative" as const, overflow:"hidden" }}>
          <div style={{ position:"absolute" as const, top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
          <div style={{ position:"absolute" as const, bottom:-20, left:80, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative" as const, zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {Logo}
              <div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.6)", letterSpacing:4, textTransform:"uppercase" as const, fontFamily:bodyFont, marginBottom:3 }}>{cfg.title}</div>
                <div style={{ fontSize:22, fontWeight:800, color:"#fff", letterSpacing:-0.5 }}>{data.fromName||"Company"}</div>
                {data.fromWebsite && <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)", marginTop:2, fontFamily:bodyFont }}>{data.fromWebsite}</div>}
              </div>
            </div>
            <div style={{ textAlign:"right" as const, fontFamily:bodyFont }}>
              <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:-1 }}>{data.docNumber}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)", marginTop:4 }}>{cfg.dateLabel}: {data.date}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)" }}>{cfg.altLabel}: {data.altDate}</div>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:32, padding:"24px 44px", borderBottom:`1px solid ${t.border}` }}>
          <div style={{ flex:1 }}><FromBlock /></div>
          <div style={{ flex:1 }}><ToBlock /></div>
          <div style={{ flex:0.7 }}>
            <div style={{ fontSize:9, fontWeight:700, color:accent, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5, fontFamily:bodyFont }}>Details</div>
            {cfg.showTerms && data.paymentTerms && <div style={{ fontSize:10.5, color:"#6b7280", fontFamily:bodyFont }}>Terms: {data.paymentTerms}</div>}
            {data.reference && <div style={{ fontSize:10.5, color:"#6b7280", fontFamily:bodyFont }}>Ref: {data.reference}</div>}
            {cfg.showPayMethod && data.paymentMethod && <div style={{ fontSize:10.5, color:"#6b7280", fontFamily:bodyFont }}>Payment: {data.paymentMethod}</div>}
            {cfg.showTracking && data.trackingNumber && <div style={{ fontSize:10.5, color:"#6b7280", fontFamily:bodyFont }}>Tracking: {data.trackingNumber}</div>}
          </div>
        </div>
        <div style={{ padding:"18px 44px 0" }}>
          <ItemsTable />
          <Totals />
          <BankDetails />
          <NotesAndTerms />
          <SignatureLine />
        </div>
        <div style={{ marginTop:32, height:6, background:gradBg }} />
      </div>
    );
  }

  // ── Classic (letterhead) ─────────────────────────────────────────────────────
  if (isClassic) {
    return (
      <div style={{ width:794, background:"#fff", fontFamily:t.font, minHeight:1123, color:"#111", position:"relative" as const }}>
        <PaidStamp />
        <div style={{ textAlign:"center" as const, padding:"28px 56px 14px", borderBottom:`2px solid ${accent}` }}>
          {Logo && <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}>{Logo}</div>}
          <div style={{ fontSize:22, fontWeight:700, color:accent, letterSpacing:0.5, fontFamily:t.font }}>{data.fromName||"Company"}</div>
          <div style={{ fontSize:10, color:"#6b7280", marginTop:5, fontFamily:bodyFont, letterSpacing:0.5 }}>
            {[data.fromAddress?.split("\n")[0], data.fromPhone, data.fromEmail, data.fromWebsite].filter(Boolean).join("  ·  ")}
          </div>
          {(data.fromTaxId||data.fromRegNumber) && (
            <div style={{ fontSize:9.5, color:"#9ca3af", marginTop:3, fontFamily:bodyFont }}>
              {data.fromTaxId ? `VAT: ${data.fromTaxId}` : ""}
              {data.fromTaxId && data.fromRegNumber ? "  ·  " : ""}
              {data.fromRegNumber ? `Reg: ${data.fromRegNumber}` : ""}
            </div>
          )}
        </div>
        <div style={{ background:accent, padding:"7px 56px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:3, textTransform:"uppercase" as const, color:"#fff", fontFamily:bodyFont }}>{cfg.title}</div>
          <div style={{ textAlign:"right" as const, fontFamily:bodyFont }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{data.docNumber}</div>
            <div style={{ fontSize:9.5, color:"rgba(255,255,255,0.75)", marginTop:2 }}>{cfg.dateLabel}: {data.date} · {cfg.altLabel}: {data.altDate}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:40, padding:"20px 56px", borderBottom:`1px solid ${t.border}` }}>
          <div style={{ flex:1 }}><ToBlock /></div>
          <div style={{ flex:0.8 }}>
            <div style={{ fontSize:9, fontWeight:700, color:accent, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5, fontFamily:bodyFont }}>Details</div>
            {cfg.showTerms && data.paymentTerms && <div style={{ fontSize:10.5, color:"#6b7280", fontFamily:bodyFont, lineHeight:1.8 }}>Payment Terms: {data.paymentTerms}</div>}
            {data.reference && <div style={{ fontSize:10.5, color:"#6b7280", fontFamily:bodyFont, lineHeight:1.8 }}>Reference: {data.reference}</div>}
            {cfg.showPayMethod && data.paymentMethod && <div style={{ fontSize:10.5, color:"#6b7280", fontFamily:bodyFont, lineHeight:1.8 }}>Payment: {data.paymentMethod}</div>}
            {cfg.showTracking && data.trackingNumber && <div style={{ fontSize:10.5, color:"#6b7280", fontFamily:bodyFont, lineHeight:1.8 }}>Tracking: {data.trackingNumber}</div>}
          </div>
        </div>
        <div style={{ padding:"18px 56px 0" }}>
          <ItemsTable />
          <Totals />
          <BankDetails />
          <NotesAndTerms />
          <SignatureLine />
        </div>
      </div>
    );
  }

  // ── Blueprint + Legal Pad ───────────────────────────────────────────────────
  const padStyle = isPad;
  return (
    <div style={{ width:794, background:padStyle?t.body:"#fff", fontFamily:t.font, minHeight:1123, color:"#111", position:"relative" as const }}>
      {padStyle && <div style={{ position:"absolute" as const, left:52, top:0, bottom:0, width:2, background:"#fca5a5" }} />}
      <PaidStamp />
      {/* Header */}
      <div style={{ background:t.header, padding: padStyle ? "24px 40px 22px 72px" : "26px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom: padStyle ? `2px solid ${t.accent}` : "none" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {Logo}
          <div>
            <div style={{ fontSize: padStyle?20:26, fontWeight:800, color:t.headerText, letterSpacing: padStyle?0.5:1 }}>{data.fromName||"Company"}</div>
            {data.fromWebsite && <div style={{ fontSize:10, color:padStyle?t.accent:"rgba(255,255,255,0.6)" }}>{data.fromWebsite}</div>}
          </div>
        </div>
        <div style={{ textAlign:"right" as const }}>
          <div style={{ fontSize:padStyle?16:12, fontWeight:700, color:padStyle?t.accent:"rgba(255,255,255,0.7)", letterSpacing: padStyle?3:0, fontFamily:bodyFont }}>{cfg.title}</div>
          <div style={{ fontSize:padStyle?11:16, fontWeight:700, color:t.headerText, marginTop:3, fontFamily:bodyFont }}>{data.docNumber}</div>
        </div>
      </div>
      {/* Meta row */}
      <div style={{ padding: padStyle?"8px 40px 0 72px":"8px 40px 0" }}>
        <MetaRow />
      </div>
      {/* FROM / TO */}
      <div style={{ display:"flex", gap:36, padding: padStyle?"18px 40px 14px 72px":"18px 40px 14px", borderBottom:`1px solid ${t.border}` }}>
        <div style={{ flex:1 }}><FromBlock /></div>
        <div style={{ flex:1 }}><ToBlock /></div>
        {(cfg.showPayMethod && data.paymentMethod) && <div style={{ flex:0.7 }}><div style={{ fontSize:9, fontWeight:700, color:t.accent, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5, fontFamily:bodyFont }}>Payment</div><div style={{ fontSize:11, color:"#374151", fontFamily:bodyFont }}>{data.paymentMethod}</div></div>}
        {(cfg.showTracking && data.trackingNumber) && <div style={{ flex:0.7 }}><div style={{ fontSize:9, fontWeight:700, color:t.accent, letterSpacing:2, textTransform:"uppercase" as const, marginBottom:5, fontFamily:bodyFont }}>Tracking</div><div style={{ fontSize:11, color:"#374151", fontFamily:bodyFont }}>{data.trackingNumber}</div></div>}
      </div>
      {/* Body */}
      <div style={{ padding: padStyle?"18px 40px 0 72px":"18px 40px 0" }}>
        <ItemsTable />
        <Totals />
        <BankDetails />
        <NotesAndTerms />
        <SignatureLine />
      </div>
    </div>
  );
}

// ─── Template Thumbnail ───────────────────────────────────────────────────────

function TemplateThumbnail({ theme: th, selected }: { theme: typeof THEMES[0]; selected: boolean }) {
  const isDark  = th.id === "tech";
  const isSide  = th.id === "corporate";
  const isCtr   = th.id === "boutique" || th.id === "classic";
  const isGrad2 = th.id === "gradient";
  const isPad2  = th.id === "pad";
  const isMin2  = th.id === "minimal";
  const lineClr = isDark ? "#21262d" : "#e5e7eb";
  const bg      = isDark ? "#0d1117" : "#fff";
  const acc     = th.accent;

  return (
    <div style={{ width:64, height:90, background:bg, borderRadius:5, overflow:"hidden", position:"relative", border:selected ? `2px solid ${acc}` : "2px solid #e5e7eb", flexShrink:0, transition:"border-color .15s" }}>
      {isSide ? (
        <div style={{ position:"absolute" as const, left:0, top:0, bottom:0, width:17, background:th.header }} />
      ) : isCtr ? (
        <div style={{ padding:"8px 5px 0", display:"flex", flexDirection:"column" as const, alignItems:"center", gap:2.5 }}>
          <div style={{ height:2.5, background:"#d1d5db", width:"65%", borderRadius:1 }} />
          <div style={{ height:1,   background:acc,       width:"40%", borderRadius:1 }} />
          <div style={{ height:2,   background:acc,       width:"55%", borderRadius:1, opacity:0.4 }} />
        </div>
      ) : isMin2 ? (
        <div style={{ height:14, borderBottom:"2px solid #111827", display:"flex", alignItems:"flex-end", padding:"0 5px 3px", justifyContent:"space-between" }}>
          <div style={{ height:2, background:"#d1d5db", width:"38%", borderRadius:1 }} />
          <div style={{ height:2, background:"#d1d5db", width:"18%", borderRadius:1 }} />
        </div>
      ) : (
        <div style={{ height:18, background:isGrad2 ? `linear-gradient(135deg, ${acc}, ${acc}99)` : th.header, position:"relative" as const, display:"flex", alignItems:"center", padding:"0 5px", justifyContent:"space-between" }}>
          {isPad2 && <div style={{ position:"absolute" as const, left:8, top:0, bottom:0, width:1, background:"#fca5a5" }} />}
          <div style={{ height:2.5, background:"rgba(255,255,255,0.4)", width:"32%", borderRadius:1 }} />
          <div style={{ height:5,   background:"rgba(255,255,255,0.25)", width:"18%", borderRadius:1 }} />
        </div>
      )}
      <div style={{ padding: isSide ? "5px 4px 0 21px" : "5px 5px 0", display:"flex", flexDirection:"column" as const, gap:3 }}>
        <div style={{ height:1.5, background:lineClr, width:"80%", borderRadius:1 }} />
        <div style={{ height:1.5, background:lineClr, width:"64%", borderRadius:1 }} />
        <div style={{ height:1.5, background:lineClr, width:"72%", borderRadius:1 }} />
        <div style={{ height:1.5, background:lineClr, width:"55%", borderRadius:1 }} />
        <div style={{ height:1.5, background:lineClr, width:"78%", borderRadius:1, marginTop:1 }} />
        <div style={{ height:1.5, background:lineClr, width:"60%", borderRadius:1 }} />
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:3 }}>
          <div style={{ height:8, background:acc, width:"33%", borderRadius:2, opacity:0.85 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Accordion form section ───────────────────────────────────────────────────

function Section({ icon, title, summary, open, onToggle, children }: {
  icon: React.ReactNode; title: string; summary?: string;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-surface/30">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface/60 transition-colors"
        onClick={onToggle}
      >
        <span className="text-primary">{icon}</span>
        <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
        {summary && !open && <span className="text-xs text-foreground-secondary truncate max-w-[140px]">{summary}</span>}
        {open ? <ChevronUp className="w-4 h-4 text-foreground-secondary shrink-0" /> : <ChevronDown className="w-4 h-4 text-foreground-secondary shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-border">{children}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ic = "w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-foreground-secondary/50";
const lc = "text-xs text-foreground-secondary font-medium mb-1 block";

const DOC_TABS: { id: DocType; label: string }[] = [
  { id:"invoice", label:"Invoice" },
  { id:"quote",   label:"Quote" },
  { id:"receipt", label:"Receipt" },
  { id:"po",      label:"Purchase Order" },
  { id:"delivery",label:"Delivery Note" },
];

type SectionId = "company"|"client"|"document"|"items"|"pricing"|"notes";

export default function BusinessDocsPage() {
  const [docType,    setDocType]    = useState<DocType>("invoice");
  const [data,       setData]       = useState<DocData>(() => makeDefault("invoice"));
  const [themeId,    setThemeId]    = useState("blueprint");
  const [openSec,    setOpenSec]    = useState<SectionId>("company");
  const [exporting,  setExporting]  = useState(false);
  const [showPreview,setShowPreview]= useState(false);
  const [previewScale,setScale]     = useState(0.55);
  const [savedMsg,   setSavedMsg]   = useState("");
  const [clients,    setClients]    = useState<string[]>([]);

  const previewRef  = useRef<HTMLDivElement>(null);
  const containerRef= useRef<HTMLDivElement>(null);
  const logoInputRef= useRef<HTMLInputElement>(null);

  const cfg = DOC_CFG[docType];

  // Totals
  const subtotal    = cfg.showPrices ? data.items.reduce((s,i) => s+i.qty*i.price, 0) : 0;
  const discountAmt = data.discountType==="fixed" ? data.discount : subtotal*(data.discount/100);
  const base        = subtotal - discountAmt;
  const tax1        = base * (data.taxRate/100);
  const tax2        = data.enableTax2 ? base*(data.tax2Rate/100) : 0;
  const total       = base + tax1 + tax2;

  // Scale preview
  useEffect(() => {
    const upd = () => {
      if (containerRef.current) setScale(Math.min((containerRef.current.clientWidth-24)/794, 0.72));
    };
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  // Load localStorage
  useEffect(() => {
    try {
      const profile = localStorage.getItem(LS_PROFILE);
      if (profile) {
        const p = JSON.parse(profile);
        setData(d => ({ ...d, ...p }));
      }
      const saved = localStorage.getItem(LS_CLIENTS);
      if (saved) setClients(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleSec = (s: SectionId) => setOpenSec(p => p===s ? ("" as SectionId) : s);

  const switchDoc = (t: DocType) => {
    setDocType(t);
    const def = makeDefault(t);
    setData(d => ({
      ...def,
      fromName:d.fromName, fromEmail:d.fromEmail, fromPhone:d.fromPhone,
      fromAddress:d.fromAddress, fromWebsite:d.fromWebsite,
      fromTaxId:d.fromTaxId, fromRegNumber:d.fromRegNumber,
      fromBankDetails:d.fromBankDetails, logoDataUrl:d.logoDataUrl,
      toName:d.toName, toEmail:d.toEmail, toPhone:d.toPhone,
      toAddress:d.toAddress, toTaxId:d.toTaxId,
      currency:d.currency, accentColor:d.accentColor,
    }));
  };

  const set = <K extends keyof DocData>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
      setData(d => ({ ...d, [k]: e.target.value }));

  const setBool = <K extends keyof DocData>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setData(d => ({ ...d, [k]: e.target.checked }));

  const setNum = <K extends keyof DocData>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setData(d => ({ ...d, [k]: parseFloat(e.target.value)||0 }));

  const updItem = (id: string, f: keyof LineItem, v: string|number) =>
    setData(d => ({ ...d, items: d.items.map(i => i.id===id ? {...i,[f]:v} : i) }));
  const addItem = () => setData(d => ({ ...d, items:[...d.items, {id:uid(),description:"",qty:1,unit:"",price:0}] }));
  const delItem = (id: string) => setData(d => ({ ...d, items:d.items.filter(i=>i.id!==id) }));

  const uploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setData(d => ({ ...d, logoDataUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    const profile = { fromName:data.fromName, fromEmail:data.fromEmail, fromPhone:data.fromPhone,
      fromAddress:data.fromAddress, fromWebsite:data.fromWebsite,
      fromTaxId:data.fromTaxId, fromRegNumber:data.fromRegNumber,
      fromBankDetails:data.fromBankDetails, logoDataUrl:data.logoDataUrl,
      currency:data.currency, accentColor:data.accentColor };
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
    setSavedMsg("Saved!");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const saveClient = () => {
    if (!data.toName) return;
    const updated = [data.toName, ...clients.filter(c=>c!==data.toName)].slice(0,8);
    setClients(updated);
    localStorage.setItem(LS_CLIENTS, JSON.stringify(updated));
  };

  const autoIncrement = () => {
    const match = data.docNumber.match(/^([A-Z-]*)(\d+)$/);
    if (match) setData(d => ({ ...d, docNumber: match[1] + String(parseInt(match[2])+1).padStart(match[2].length,"0") }));
  };

  const setDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate()+days);
    setData(prev => ({ ...prev, altDate: d.toISOString().split("T")[0] }));
  };

  const exportPDF = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().from(previewRef.current).set({
        margin:0, filename:`${data.docNumber}.pdf`,
        image:{ type:"jpeg", quality:0.98 },
        html2canvas:{ scale:2, useCORS:true, backgroundColor:"#ffffff" },
        jsPDF:{ unit:"mm", format:"a4", orientation:"portrait" as const },
      }).save();
    } finally { setExporting(false); }
  };

  const DocIcon = cfg.icon;

  return (
    <div className="min-h-[calc(100vh-8rem)]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="tool-hero p-5 sm:p-7">
          <Link href="/pdf-tools" className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-sm font-semibold mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to PDF Tools
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
                <DocIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="type-h1 font-display gradient-text mb-1">Business Document Generator</h1>
                <p className="text-foreground-secondary text-sm">Invoice · Quote · Receipt · Purchase Order · Delivery Note — logo upload · VAT/GST · bank details · custom branding · PDF export</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-foreground-secondary hover:text-foreground transition-colors" onClick={() => setShowPreview(s=>!s)}>
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? "Edit" : "Preview"}
              </button>
              <button onClick={exportPDF} disabled={exporting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-sm">
                <Download className="w-4 h-4" />{exporting ? "Generating…" : "Download PDF"}
              </button>
            </div>
          </div>

          {/* Doc type tabs */}
          <div className="flex gap-1.5 flex-wrap mt-5 pt-5 border-t border-border">
            {DOC_TABS.map(tab => {
              const Icon = DOC_CFG[tab.id].icon;
              return (
                <button key={tab.id} onClick={() => switchDoc(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    docType===tab.id ? "bg-primary text-white border-primary shadow-sm" : "border-border text-foreground-secondary hover:border-primary/40 hover:text-foreground"
                  }`}>
                  <Icon className="w-3.5 h-3.5" />{tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-16">
        <div className="mt-4 flex flex-col lg:flex-row gap-5">

          {/* ── Left: Form ─────────────────────────────────────────────────── */}
          <div className={`lg:w-[420px] shrink-0 flex flex-col gap-3 ${showPreview ? "hidden lg:flex" : "flex"}`}>

            {/* Template Gallery + Color */}
            <div className="glass-card-premium p-4">
              <p className="text-xs text-foreground-secondary font-semibold uppercase tracking-wide mb-3">Template</p>
              <div className="grid grid-cols-5 gap-2 mb-1">
                {THEMES.map(th => (
                  <button key={th.id} onClick={() => setThemeId(th.id)}
                    className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all ${themeId===th.id ? "bg-primary/5 ring-2 ring-offset-1" : "hover:bg-surface/60"}`}
                    style={{ ringColor: th.accent } as React.CSSProperties}>
                    <TemplateThumbnail theme={th} selected={themeId===th.id} />
                    <span className="text-[9px] font-semibold leading-tight text-center" style={{ color: themeId===th.id ? th.accent : undefined }}>{th.name}</span>
                    <span className="text-[8px] text-foreground-secondary/60">{th.cat}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-foreground-secondary font-semibold uppercase tracking-wide mb-2.5 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" />Brand Color</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {COLOR_PRESETS.map(p => (
                    <button key={p.hex} title={p.name} onClick={() => setData(d=>({...d,accentColor:p.hex}))}
                      className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110 shrink-0"
                      style={{ background:p.hex, borderColor:data.accentColor===p.hex ? "#111" : "rgba(0,0,0,0.1)" }} />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={data.accentColor || THEMES.find(t=>t.id===themeId)?.accent || "#2563eb"}
                    onChange={e => setData(d=>({...d,accentColor:e.target.value}))}
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer p-0.5 bg-surface shrink-0" />
                  <span className="text-xs text-foreground-secondary">Custom color</span>
                  {data.accentColor && <button onClick={() => setData(d=>({...d,accentColor:""}))} className="text-xs text-foreground-secondary hover:text-foreground ml-1">Reset</button>}
                </div>
              </div>
            </div>

            {/* Accordion sections */}
            <Section icon={<Building2 className="w-4 h-4" />} title="Your Business"
              summary={data.fromName} open={openSec==="company"} onToggle={() => toggleSec("company")}>
              <div className="flex flex-col gap-3 mt-3">
                {/* Logo upload */}
                <div>
                  <label className={lc}>Logo (PNG, JPG, SVG)</label>
                  <div className="flex items-center gap-3">
                    {data.logoDataUrl
                      ? <div className="flex items-center gap-2">
                          <img src={data.logoDataUrl} alt="Logo" className="h-10 max-w-[120px] object-contain rounded border border-border" />
                          <button onClick={() => setData(d=>({...d,logoDataUrl:""}))} className="text-xs text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      : <button onClick={() => logoInputRef.current?.click()}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs text-foreground-secondary hover:border-primary/50 hover:text-primary transition-colors">
                          <Upload className="w-3.5 h-3.5" />Upload Logo
                        </button>
                    }
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lc}>Company Name</label><input className={ic} value={data.fromName} onChange={set("fromName")} /></div>
                  <div><label className={lc}>Website</label><input className={ic} value={data.fromWebsite} onChange={set("fromWebsite")} placeholder="acme.co" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lc}>Email</label><input className={ic} value={data.fromEmail} onChange={set("fromEmail")} /></div>
                  <div><label className={lc}>Phone</label><input className={ic} value={data.fromPhone} onChange={set("fromPhone")} /></div>
                </div>
                <div><label className={lc}>Address</label><textarea className={`${ic} resize-none`} rows={2} value={data.fromAddress} onChange={set("fromAddress")} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lc}>VAT / Tax ID</label><input className={ic} value={data.fromTaxId} onChange={set("fromTaxId")} placeholder="VAT123456" /></div>
                  <div><label className={lc}>Reg. Number</label><input className={ic} value={data.fromRegNumber} onChange={set("fromRegNumber")} placeholder="Co. 12345678" /></div>
                </div>
                <div>
                  <label className={lc}>Bank / Payment Details</label>
                  <textarea className={`${ic} resize-none font-mono text-xs`} rows={4} value={data.fromBankDetails} onChange={set("fromBankDetails")} placeholder={"Bank: \nAccount: \nIBAN/Routing: \nSWIFT/BIC: "} />
                </div>
                <button onClick={saveProfile} className="flex items-center gap-2 text-xs text-primary hover:underline font-semibold w-fit">
                  <Save className="w-3.5 h-3.5" />{savedMsg || "Save my info (remembered next visit)"}
                  {savedMsg && <Check className="w-3.5 h-3.5 text-green-500" />}
                </button>
              </div>
            </Section>

            <Section icon={<Users className="w-4 h-4" />} title={cfg.toLabel}
              summary={data.toName} open={openSec==="client"} onToggle={() => toggleSec("client")}>
              <div className="flex flex-col gap-3 mt-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={lc.replace("mb-1","")}>Name</label>
                    <button onClick={saveClient} className="text-xs text-foreground-secondary hover:text-primary flex items-center gap-1"><Save className="w-3 h-3" />Save client</button>
                  </div>
                  <input className={ic} value={data.toName} onChange={set("toName")} list="client-list" />
                  <datalist id="client-list">{clients.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lc}>Email</label><input className={ic} value={data.toEmail} onChange={set("toEmail")} /></div>
                  <div><label className={lc}>Phone</label><input className={ic} value={data.toPhone} onChange={set("toPhone")} /></div>
                </div>
                <div><label className={lc}>Address</label><textarea className={`${ic} resize-none`} rows={2} value={data.toAddress} onChange={set("toAddress")} /></div>
                <div><label className={lc}>Client VAT / Tax ID (optional)</label><input className={ic} value={data.toTaxId} onChange={set("toTaxId")} placeholder="EU VAT, GST Number…" /></div>
              </div>
            </Section>

            <Section icon={<FileEdit className="w-4 h-4" />} title="Document Details"
              summary={`${data.docNumber} · ${data.altDate}`} open={openSec==="document"} onToggle={() => toggleSec("document")}>
              <div className="flex flex-col gap-3 mt-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1"><label className={lc}>Document Number</label><input className={ic} value={data.docNumber} onChange={set("docNumber")} /></div>
                  <button onClick={autoIncrement} title="Auto-increment number" className="px-3 py-2 rounded-lg border border-border text-xs text-foreground-secondary hover:border-primary/40 hover:text-primary transition-colors shrink-0 mb-0.5">+1</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lc}>{cfg.dateLabel}</label><input type="date" className={ic} value={data.date} onChange={set("date")} /></div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={lc.replace("mb-1","")}>{cfg.altLabel}</label>
                      <div className="flex gap-1">
                        {[7,14,30,60].map(d => (
                          <button key={d} onClick={() => setDueDate(d)} className="text-[10px] px-1.5 py-0.5 rounded border border-border text-foreground-secondary hover:border-primary/40 hover:text-primary transition-colors">+{d}</button>
                        ))}
                      </div>
                    </div>
                    <input type="date" className={ic} value={data.altDate} onChange={set("altDate")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lc}>Reference / PO No.</label><input className={ic} value={data.reference} onChange={set("reference")} placeholder="Project / PO reference" /></div>
                  {cfg.showTerms && <div><label className={lc}>Payment Terms</label><input className={ic} value={data.paymentTerms} onChange={set("paymentTerms")} placeholder="Net 30" /></div>}
                  {cfg.showPayMethod && <div><label className={lc}>Payment Method</label><input className={ic} value={data.paymentMethod} onChange={set("paymentMethod")} /></div>}
                  {cfg.showTracking && <div><label className={lc}>Tracking Number</label><input className={ic} value={data.trackingNumber} onChange={set("trackingNumber")} /></div>}
                </div>
              </div>
            </Section>

            <Section icon={<List className="w-4 h-4" />} title="Line Items"
              summary={`${data.items.length} item${data.items.length!==1?"s":""} · ${data.currency}${subtotal.toFixed(2)}`}
              open={openSec==="items"} onToggle={() => toggleSec("items")}>
              <div className="mt-3">
                {/* Column headers */}
                <div className={`grid gap-1.5 mb-1 px-0.5 text-[10px] font-semibold text-foreground-secondary uppercase tracking-wide ${cfg.showPrices ? "grid-cols-[1fr_44px_52px_74px_26px]" : "grid-cols-[1fr_44px_52px_26px]"}`}>
                  <span>Description</span><span className="text-center">Qty</span><span className="text-center">Unit</span>{cfg.showPrices&&<span className="text-right">Price</span>}<span />
                </div>
                <div className="flex flex-col gap-1.5">
                  {data.items.map(item => (
                    <div key={item.id} className={`grid gap-1.5 items-center ${cfg.showPrices ? "grid-cols-[1fr_44px_52px_74px_26px]" : "grid-cols-[1fr_44px_52px_26px]"}`}>
                      <input className={ic} value={item.description} onChange={e => updItem(item.id,"description",e.target.value)} placeholder="Description" />
                      <input type="number" min={1} className={ic} value={item.qty} onChange={e => updItem(item.id,"qty",parseInt(e.target.value)||1)} />
                      <input className={ic} value={item.unit} onChange={e => updItem(item.id,"unit",e.target.value)} placeholder="unit" />
                      {cfg.showPrices && <input type="number" min={0} step={0.01} className={ic} value={item.price} onChange={e => updItem(item.id,"price",parseFloat(e.target.value)||0)} />}
                      <button onClick={() => delItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
                <button onClick={addItem} className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-xs text-foreground-secondary hover:border-primary/50 hover:text-primary transition-colors">
                  <Plus className="w-3.5 h-3.5" />Add Item
                </button>
              </div>
            </Section>

            {cfg.showPrices && (
              <Section icon={<Calculator className="w-4 h-4" />} title="Pricing & Tax"
                summary={`Total: ${data.currency}${total.toFixed(2)}`}
                open={openSec==="pricing"} onToggle={() => toggleSec("pricing")}>
                <div className="flex flex-col gap-3 mt-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={lc}>Currency</label>
                      <select className={ic} value={data.currency} onChange={set("currency")}>
                        {CURRENCIES.map(cu => <option key={cu} value={cu}>{cu}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lc}>Tax Label</label>
                      <select className={ic} value={data.taxLabel}
                        onChange={e => setData(d=>({...d, taxLabel:e.target.value}))}>
                        {TAX_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                        <option value={data.taxLabel}>{data.taxLabel}</option>
                      </select>
                    </div>
                    <div><label className={lc}>Tax Rate (%)</label><input type="number" min={0} max={100} step={0.5} className={ic} value={data.taxRate} onChange={setNum("taxRate")} /></div>
                  </div>
                  {/* Second tax */}
                  <label className="flex items-center gap-2 text-xs text-foreground-secondary cursor-pointer">
                    <input type="checkbox" checked={data.enableTax2} onChange={setBool("enableTax2")} className="rounded" />
                    Add second tax (e.g. GST + PST, dual VAT)
                  </label>
                  {data.enableTax2 && (
                    <div className="grid grid-cols-2 gap-2 pl-5 border-l-2 border-primary/20">
                      <div><label className={lc}>2nd Tax Label</label><input className={ic} value={data.tax2Label} onChange={set("tax2Label")} placeholder="PST" /></div>
                      <div><label className={lc}>2nd Tax Rate (%)</label><input type="number" min={0} max={100} step={0.5} className={ic} value={data.tax2Rate} onChange={setNum("tax2Rate")} /></div>
                    </div>
                  )}
                  {/* Discount */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={lc}>Discount Type</label>
                      <select className={ic} value={data.discountType}
                        onChange={e => setData(d=>({...d, discountType: e.target.value as DiscountType}))}>
                        <option value="percent">Percent (%)</option>
                        <option value="fixed">Fixed ({data.currency})</option>
                      </select>
                    </div>
                    <div><label className={lc}>Discount Amount</label><input type="number" min={0} step={0.01} className={ic} value={data.discount} onChange={setNum("discount")} /></div>
                    <div className="flex flex-col justify-end pb-0.5">
                      <div className="text-xs text-foreground-secondary">Subtotal <span className="text-foreground font-semibold">{data.currency}{subtotal.toFixed(2)}</span></div>
                      <div className="text-sm font-bold text-foreground mt-0.5">Total {data.currency}{total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </Section>
            )}

            <Section icon={<MessageSquare className="w-4 h-4" />} title="Notes, Terms & Options"
              open={openSec==="notes"} onToggle={() => toggleSec("notes")}>
              <div className="flex flex-col gap-3 mt-3">
                <div><label className={lc}>Notes</label><textarea className={`${ic} resize-none`} rows={3} value={data.notes} onChange={set("notes")} placeholder="Notes to client, payment instructions…" /></div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={lc.replace("mb-1","")}>Terms & Conditions</label>
                    <select className="text-xs border border-border rounded-lg px-2 py-1 bg-surface text-foreground-secondary focus:outline-none"
                      value="" onChange={e => { if(e.target.value) setData(d=>({...d,terms:TC_TEMPLATES[e.target.value]})); }}>
                      <option value="">Use template…</option>
                      <option value="net30">Net 30 Standard</option>
                      <option value="net60">Net 60</option>
                      <option value="freelance">Freelance / Creative</option>
                      <option value="consulting">Consulting</option>
                      <option value="eu_vat">EU VAT Reverse Charge</option>
                    </select>
                  </div>
                  <textarea className={`${ic} resize-none text-xs`} rows={4} value={data.terms} onChange={set("terms")} placeholder="Your terms and conditions…" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs text-foreground-secondary cursor-pointer">
                    <input type="checkbox" checked={data.showSignature} onChange={setBool("showSignature")} className="rounded" />
                    Show signature line
                  </label>
                  <label className="flex items-center gap-2 text-xs text-foreground-secondary cursor-pointer">
                    <input type="checkbox" checked={data.showStamp} onChange={setBool("showStamp")} className="rounded" />
                    Show "PAID" stamp
                  </label>
                </div>
              </div>
            </Section>
          </div>

          {/* ── Right: Preview ─────────────────────────────────────────────── */}
          <div className={`flex-1 min-w-0 ${showPreview || "hidden lg:block"}`} ref={containerRef}>
            <div className="glass-card-premium p-3 sticky top-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="text-xs text-foreground-secondary font-semibold uppercase tracking-wide">Live Preview — {cfg.title}</p>
                <button onClick={exportPDF} disabled={exporting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-sm">
                  <Download className="w-4 h-4" />{exporting ? "Generating…" : "Download PDF"}
                </button>
              </div>
              <div className="overflow-hidden rounded-lg border border-border shadow-sm"
                style={{ width:Math.round(794*previewScale), height:Math.round(1123*previewScale) }}>
                <div ref={previewRef} style={{ transform:`scale(${previewScale})`, transformOrigin:"top left", width:794 }}>
                  <DocTemplate data={data} docType={docType} themeId={themeId}
                    subtotal={subtotal} tax1={tax1} tax2={tax2} discountAmt={discountAmt} total={total} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FAQ / SEO Section ───────────────────────────────────────────── */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="type-h2 font-display gradient-text text-center mb-2">Free Business Document Generator FAQ</h2>
          <p className="text-center text-foreground-secondary text-sm mb-10">Everything you need to know about creating professional invoices, quotes, and receipts.</p>
          <div className="grid gap-4">
            {[
              { q:"Does this add a watermark?", a:"No watermarks, ever. Your PDF is 100% clean and ready to send to clients. No signup required either." },
              { q:"Can I add my company logo?", a:"Yes — click 'Upload Logo' in the Your Business section. Supports PNG, JPG, and SVG. Your logo appears in the PDF header." },
              { q:"Does it support VAT, GST, and HST?", a:"Yes. You can set any tax label (VAT, GST, HST, PST, Sales Tax) and tax rate. There's also a second tax rate option for Canadian GST+PST, dual-rate VAT, and similar systems." },
              { q:"How do I add bank transfer details?", a:"In the 'Your Business' section, paste your full bank details (IBAN, SWIFT/BIC, routing number, etc.) into the Bank/Payment Details field. They appear in the PDF so clients know exactly how to pay you." },
              { q:"Will it remember my company info?", a:"Click 'Save my info' in the Your Business section. Your name, email, address, bank details, and logo are stored in your browser's local storage and loaded automatically next time." },
              { q:"Can I use this for EU VAT invoices?", a:"Yes. Add your VAT number and client's VAT ID in the respective fields. Use the 'EU VAT Reverse Charge' terms template for B2B cross-border EU invoices." },
              { q:"What's the difference between the 10 templates?", a:"Blueprint (classic blue), Executive (dark gold, premium), Minimal (ultra-clean), Corporate (navy sidebar), Legal Pad (warm cream), Agency (split dark/light header), Boutique (centered serif luxury), Tech (dark terminal), Gradient (SaaS purple gradient), Classic (traditional letterhead). All support your brand color." },
              { q:"Can I create a quote and convert it to an invoice?", a:"Switch between document types using the tabs at the top. Your company and client info is preserved when you switch, so you can create a quote and then switch to Invoice when ready to bill." },
            ].map(({q,a}) => (
              <div key={q} className="glass-card-premium p-5">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{q}</h3>
                    <p className="text-sm text-foreground-secondary leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature highlights for SEO */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { icon:<Sparkles className="w-5 h-5" />, label:"10 Pro Templates" },
              { icon:<Upload className="w-5 h-5" />, label:"Logo Upload" },
              { icon:<Palette className="w-5 h-5" />, label:"Custom Brand Color" },
              { icon:<Save className="w-5 h-5" />, label:"Saves Company Info" },
              { icon:<Receipt className="w-5 h-5" />, label:"VAT / GST / HST" },
              { icon:<FileText className="w-5 h-5" />, label:"5 Document Types" },
              { icon:<Calculator className="w-5 h-5" />, label:"Dual Tax Rates" },
              { icon:<Download className="w-5 h-5" />, label:"PDF — No Watermark" },
            ].map(({icon,label}) => (
              <div key={label} className="glass-card-premium p-4 flex flex-col items-center gap-2">
                <span className="text-primary">{icon}</span>
                <span className="text-xs font-semibold text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
