"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Download, Receipt, Eye, EyeOff,
  Save, RotateCcw, Upload, CreditCard, Building2, Hash,
  ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem { id: string; description: string; qty: number; price: number; taxRate: number; }
interface BankDetails { accountName: string; bankName: string; iban: string; swift: string; routingNumber: string; }
interface InvoiceData {
  invoiceNumber: string; poNumber: string; date: string; dueDate: string; paymentTerms: string;
  fromName: string; fromEmail: string; fromAddress: string; fromPhone: string; fromVatId: string;
  toName: string; toEmail: string; toAddress: string; toPhone: string; toVatId: string;
  items: LineItem[]; globalTaxRate: number; discount: number; notes: string; paymentLink: string;
  currency: string; logoText: string; logo: string; markPaid: boolean;
  bank: BankDetails;
}

// ─── Themes & Constants ───────────────────────────────────────────────────────

const THEMES = [
  { id:"modern",     name:"Modern",     swatch:"#6366f1" },
  { id:"executive",  name:"Executive",  swatch:"#0f172a" },
  { id:"minimal",    name:"Minimal",    swatch:"#111827" },
  { id:"corporate",  name:"Corporate",  swatch:"#0a1628" },
  { id:"pad",        name:"Legal Pad",  swatch:"#ca8a04" },
  { id:"saas",       name:"SaaS",       swatch:"#0f766e" },
  { id:"freelancer", name:"Freelancer", swatch:"#7c3aed" },
  { id:"agency",     name:"Agency",     swatch:"#dc2626" },
  { id:"nordic",     name:"Nordic",     swatch:"#1e3a5f" },
  { id:"tech",       name:"Tech",       swatch:"#0f172a" },
];

const CURRENCIES = ["$","€","£","¥","₹","₩","₽","A$","C$","Fr","CHF","AED","SAR","SEK","NOK","DKK"];
const uid = () => Math.random().toString(36).slice(2,9);
const ic = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-400";
const lc = "text-xs text-gray-500 font-medium mb-1 block";

const DEFAULT: InvoiceData = {
  invoiceNumber:"INV-001", poNumber:"", date:new Date().toISOString().split("T")[0],
  dueDate:new Date(Date.now()+30*86400000).toISOString().split("T")[0], paymentTerms:"Net 30",
  fromName:"Acme Studio", fromEmail:"billing@acme.co", fromAddress:"123 Main St\nNew York, NY 10001\nUnited States",
  fromPhone:"+1 (555) 100-2000", fromVatId:"",
  toName:"Client Corp", toEmail:"accounts@clientcorp.com", toAddress:"456 Oak Ave\nLos Angeles, CA 90001",
  toPhone:"+1 (555) 300-4000", toVatId:"",
  items:[
    {id:uid(),description:"Brand Strategy & Consulting",qty:1,price:3500,taxRate:0},
    {id:uid(),description:"UI/UX Design (hourly)",qty:12,price:150,taxRate:0},
    {id:uid(),description:"Project Management",qty:1,price:500,taxRate:0},
  ],
  globalTaxRate:0, discount:0,
  notes:"Payment due within 30 days. Please include invoice number on your payment.\nThank you for your business!",
  paymentLink:"", currency:"$", logoText:"", logo:"", markPaid:false,
  bank:{accountName:"",bankName:"",iban:"",swift:"",routingNumber:""},
};

// ─── Format helpers ───────────────────────────────────────────────────────────

const fmt = (n: number, c: string) => `${c}${n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

function calcTotals(data: InvoiceData) {
  const subtotal=data.items.reduce((s,i)=>s+i.qty*i.price,0);
  const disc=data.discount>0?(subtotal*data.discount/100):0;
  const taxable=subtotal-disc;
  // If items have per-line tax rates, use them; otherwise use global
  const hasPerLine=data.items.some(i=>i.taxRate>0);
  const tax=hasPerLine
    ? data.items.reduce((s,i)=>{const line=i.qty*i.price; const after=line*(1-data.discount/100)||line; return s+after*(i.taxRate/100);},(0))
    : taxable*(data.globalTaxRate/100);
  const total=taxable+tax;
  return {subtotal,disc,tax,total};
}

interface TplProps { data: InvoiceData; subtotal: number; tax: number; disc: number; total: number; }

// ─── PAID stamp overlay helper ────────────────────────────────────────────────

const PAID_OVERLAY = {
  position:"absolute" as const, top:"50%", left:"50%",
  transform:"translate(-50%,-50%) rotate(-28deg)",
  fontSize:88, fontWeight:900, color:"#16a34a", opacity:0.12,
  border:"12px solid #16a34a", borderRadius:12, padding:"4px 24px",
  letterSpacing:12, pointerEvents:"none" as const,
};

// ─── Template 1: Modern (indigo header) ───────────────────────────────────────

function ModernTpl({ data, subtotal, tax, disc, total }: TplProps) {
  const c=data.currency;
  return (
    <div style={{width:794,background:"#fff",fontFamily:"'Helvetica Neue',Arial,sans-serif",minHeight:1123,color:"#111",position:"relative"}}>
      {data.markPaid && <div style={PAID_OVERLAY}>PAID</div>}
      <div style={{background:"#6366f1",padding:"28px 40px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          {data.logo ? <img src={data.logo} alt="" style={{maxHeight:40,maxWidth:120,objectFit:"contain",marginBottom:6}} /> : data.logoText ? <div style={{fontSize:13,color:"#c7d2fe"}}>{data.logoText}</div> : null}
          <div style={{fontSize:30,fontWeight:800,color:"#fff",letterSpacing:1}}>INVOICE</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{data.invoiceNumber}</div>
          {data.poNumber&&<div style={{fontSize:10,color:"#c7d2fe",marginTop:2}}>PO: {data.poNumber}</div>}
          <div style={{fontSize:11,color:"#c7d2fe",marginTop:4}}>Date: {data.date}</div>
          <div style={{fontSize:11,color:"#c7d2fe"}}>Due: {data.dueDate}</div>
          {data.paymentTerms&&<div style={{fontSize:10,color:"#a5b4fc",marginTop:2}}>{data.paymentTerms}</div>}
        </div>
      </div>
      <div style={{display:"flex",padding:"24px 40px",borderBottom:"1px solid #e5e7eb",gap:40}}>
        {[{label:"From",name:data.fromName,email:data.fromEmail,phone:data.fromPhone,addr:data.fromAddress,vat:data.fromVatId},
          {label:"Bill To",name:data.toName,email:data.toEmail,phone:data.toPhone,addr:data.toAddress,vat:data.toVatId}].map(p=>(
          <div key={p.label} style={{flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:"#6366f1",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>{p.label}</div>
            <div style={{fontSize:13,fontWeight:700}}>{p.name}</div>
            <div style={{fontSize:11,color:"#4b5563",marginTop:2}}>{p.email}</div>
            {p.phone&&<div style={{fontSize:11,color:"#4b5563"}}>{p.phone}</div>}
            {p.vat&&<div style={{fontSize:10,color:"#6b7280",marginTop:2}}>VAT/Tax ID: {p.vat}</div>}
            <div style={{fontSize:11,color:"#4b5563",marginTop:2,whiteSpace:"pre-wrap"}}>{p.addr}</div>
          </div>
        ))}
      </div>
      <InvoiceTable data={data} subtotal={subtotal} tax={tax} disc={disc} total={total} accent="#6366f1"/>
      <InvoiceFooter data={data} total={total}/>
    </div>
  );
}

// ─── Template 2: Executive (dark serif) ───────────────────────────────────────

function ExecutiveTpl({ data, subtotal, tax, disc, total }: TplProps) {
  const c=data.currency;
  return (
    <div style={{width:794,background:"#fff",fontFamily:"Georgia,'Times New Roman',serif",minHeight:1123,color:"#111",position:"relative"}}>
      {data.markPaid && <div style={PAID_OVERLAY}>PAID</div>}
      <div style={{background:"#0f172a",padding:"32px 44px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          {data.logo?<img src={data.logo} alt="" style={{maxHeight:36,objectFit:"contain",marginBottom:4}}/>:null}
          {data.logoText&&<div style={{fontSize:11,color:"#94a3b8",letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>{data.logoText}</div>}
          <div style={{fontSize:9,color:"#fbbf24",letterSpacing:6,textTransform:"uppercase",fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>INVOICE</div>
          <div style={{fontSize:26,fontWeight:700,color:"#f8fafc",marginTop:4}}>{data.fromName}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:20,fontWeight:700,color:"#fbbf24",fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>{data.invoiceNumber}</div>
          {data.poNumber&&<div style={{fontSize:10,color:"#64748b",marginTop:2,fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>PO: {data.poNumber}</div>}
          <div style={{fontSize:11,color:"#94a3b8",marginTop:6,fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>Issued: {data.date}</div>
          <div style={{fontSize:11,color:"#94a3b8",fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>Due: {data.dueDate}</div>
        </div>
      </div>
      <div style={{display:"flex",padding:"28px 44px",gap:40,borderBottom:"1px solid #1f2937"}}>
        {[{label:"From",name:data.fromName,email:data.fromEmail,phone:data.fromPhone,addr:data.fromAddress,vat:data.fromVatId},
          {label:"Bill To",name:data.toName,email:data.toEmail,phone:data.toPhone,addr:data.toAddress,vat:data.toVatId}].map(p=>(
          <div key={p.label} style={{flex:1}}>
            <div style={{fontSize:9,fontWeight:700,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>{p.label}</div>
            {p.name&&<div style={{fontSize:14,fontWeight:700,color:"#111827",fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>{p.name}</div>}
            <div style={{fontSize:12,color:"#374151",fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>{p.email}</div>
            {p.phone&&<div style={{fontSize:12,color:"#374151",fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>{p.phone}</div>}
            {p.vat&&<div style={{fontSize:10,color:"#6b7280",fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>VAT/Tax ID: {p.vat}</div>}
            <div style={{fontSize:12,color:"#374151",marginTop:2,whiteSpace:"pre-wrap",fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>{p.addr}</div>
          </div>
        ))}
      </div>
      <InvoiceTable data={data} subtotal={subtotal} tax={tax} disc={disc} total={total} accent="#fbbf24" dark="#0f172a"/>
      <InvoiceFooter data={data} total={total}/>
    </div>
  );
}

// ─── Template 3: Minimal ──────────────────────────────────────────────────────

function MinimalTpl({ data, subtotal, tax, disc, total }: TplProps) {
  return (
    <div style={{width:794,background:"#fff",fontFamily:"'Helvetica Neue',Arial,sans-serif",minHeight:1123,color:"#111",padding:"48px 52px",position:"relative"}}>
      {data.markPaid && <div style={PAID_OVERLAY}>PAID</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32,paddingBottom:24,borderBottom:"2px solid #111827"}}>
        <div>
          {data.logo?<img src={data.logo} alt="" style={{maxHeight:40,objectFit:"contain",marginBottom:6}}/>:null}
          <div style={{fontSize:26,fontWeight:700,color:"#111827"}}>{data.fromName||"Your Company"}</div>
          {data.logoText&&<div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>{data.logoText}</div>}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:22,fontWeight:300,color:"#6b7280",letterSpacing:2}}>INVOICE</div>
          <div style={{fontSize:14,fontWeight:700,color:"#111827",marginTop:4}}>{data.invoiceNumber}</div>
          {data.poNumber&&<div style={{fontSize:10,color:"#9ca3af"}}>PO: {data.poNumber}</div>}
        </div>
      </div>
      <div style={{display:"flex",gap:40,marginBottom:28,fontSize:11,color:"#6b7280"}}>
        <div><span style={{fontWeight:600,color:"#374151"}}>Date: </span>{data.date}</div>
        <div><span style={{fontWeight:600,color:"#374151"}}>Due: </span>{data.dueDate}</div>
        {data.paymentTerms&&<div><span style={{fontWeight:600,color:"#374151"}}>Terms: </span>{data.paymentTerms}</div>}
      </div>
      <div style={{display:"flex",gap:52,marginBottom:32}}>
        {[{label:"FROM",name:data.fromName,email:data.fromEmail,phone:data.fromPhone,addr:data.fromAddress,vat:data.fromVatId},
          {label:"TO",name:data.toName,email:data.toEmail,phone:data.toPhone,addr:data.toAddress,vat:data.toVatId}].map(p=>(
          <div key={p.label} style={{flex:1}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:"#9ca3af",marginBottom:6,textTransform:"uppercase"}}>{p.label}</div>
            <div style={{fontSize:13,fontWeight:700,color:"#111827"}}>{p.name}</div>
            <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{p.email}</div>
            {p.phone&&<div style={{fontSize:11,color:"#6b7280"}}>{p.phone}</div>}
            {p.vat&&<div style={{fontSize:10,color:"#9ca3af"}}>Tax ID: {p.vat}</div>}
            <div style={{fontSize:11,color:"#6b7280",marginTop:2,whiteSpace:"pre-wrap"}}>{p.addr}</div>
          </div>
        ))}
      </div>
      <InvoiceTable data={data} subtotal={subtotal} tax={tax} disc={disc} total={total} accent="#111827" minimal/>
      <InvoiceFooter data={data} total={total}/>
    </div>
  );
}

// ─── Template 4: SaaS (clean teal, Stripe-inspired) ──────────────────────────

function SaaSTpl({ data, subtotal, tax, disc, total }: TplProps) {
  return (
    <div style={{width:794,background:"#f0fdf4",fontFamily:"'Helvetica Neue',Arial,sans-serif",minHeight:1123,color:"#111",position:"relative"}}>
      {data.markPaid && <div style={PAID_OVERLAY}>PAID</div>}
      <div style={{background:"#fff",padding:"32px 44px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"3px solid #0f766e"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {data.logo?<img src={data.logo} alt="" style={{maxHeight:44,objectFit:"contain"}}/>:<div style={{width:44,height:44,background:"#0f766e",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:800}}>{(data.fromName||"A").charAt(0)}</div>}
          <div>
            <div style={{fontSize:16,fontWeight:700,color:"#0f172a"}}>{data.fromName}</div>
            {data.logoText&&<div style={{fontSize:11,color:"#64748b"}}>{data.logoText}</div>}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:11,color:"#0f766e",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Invoice</div>
          <div style={{fontSize:22,fontWeight:800,color:"#0f172a",marginTop:2}}>{data.invoiceNumber}</div>
          {data.poNumber&&<div style={{fontSize:10,color:"#64748b"}}>PO: {data.poNumber}</div>}
          <div style={{fontSize:11,color:"#64748b",marginTop:4}}>Issued {data.date} · Due {data.dueDate}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:0,padding:"24px 44px",borderBottom:"1px solid #d1fae5"}}>
        {[{label:"From",name:data.fromName,email:data.fromEmail,phone:data.fromPhone,addr:data.fromAddress,vat:data.fromVatId},
          {label:"Billed To",name:data.toName,email:data.toEmail,phone:data.toPhone,addr:data.toAddress,vat:data.toVatId}].map((p,idx)=>(
          <div key={p.label} style={{flex:1,paddingLeft:idx===1?44:0,borderLeft:idx===1?"1px solid #d1fae5":undefined}}>
            <div style={{fontSize:9,fontWeight:700,color:"#0f766e",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>{p.label}</div>
            <div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{p.name}</div>
            <div style={{fontSize:11,color:"#475569",marginTop:2}}>{p.email}</div>
            {p.phone&&<div style={{fontSize:11,color:"#475569"}}>{p.phone}</div>}
            {p.vat&&<div style={{fontSize:10,color:"#64748b"}}>Tax ID: {p.vat}</div>}
            <div style={{fontSize:11,color:"#475569",marginTop:2,whiteSpace:"pre-wrap"}}>{p.addr}</div>
          </div>
        ))}
      </div>
      <InvoiceTable data={data} subtotal={subtotal} tax={tax} disc={disc} total={total} accent="#0f766e"/>
      <InvoiceFooter data={data} total={total}/>
    </div>
  );
}

// ─── Template 5: Freelancer (warm purple) ────────────────────────────────────

function FreelancerTpl({ data, subtotal, tax, disc, total }: TplProps) {
  return (
    <div style={{width:794,background:"#fff",fontFamily:"'Helvetica Neue',Arial,sans-serif",minHeight:1123,color:"#111",position:"relative"}}>
      {data.markPaid && <div style={PAID_OVERLAY}>PAID</div>}
      <div style={{padding:"36px 48px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          {data.logo?<img src={data.logo} alt="" style={{maxHeight:48,objectFit:"contain",marginBottom:8}}/>:null}
          <div style={{fontSize:28,fontWeight:800,color:"#7c3aed"}}>{data.fromName||"Your Name"}</div>
          {data.fromEmail&&<div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{data.fromEmail}</div>}
          {data.fromPhone&&<div style={{fontSize:12,color:"#6b7280"}}>{data.fromPhone}</div>}
          {data.fromVatId&&<div style={{fontSize:10,color:"#9ca3af"}}>Tax ID: {data.fromVatId}</div>}
          <div style={{fontSize:11,color:"#9ca3af",marginTop:2,whiteSpace:"pre-wrap"}}>{data.fromAddress}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{background:"#7c3aed",color:"#fff",fontWeight:800,fontSize:20,padding:"10px 24px",borderRadius:50,letterSpacing:2,display:"inline-block"}}>INVOICE</div>
          <div style={{fontSize:15,fontWeight:700,color:"#111827",marginTop:10}}>{data.invoiceNumber}</div>
          {data.poNumber&&<div style={{fontSize:10,color:"#9ca3af"}}>PO: {data.poNumber}</div>}
          <div style={{fontSize:11,color:"#6b7280",marginTop:4}}>Date: {data.date}</div>
          <div style={{fontSize:11,color:"#6b7280"}}>Due: {data.dueDate}</div>
          {data.paymentTerms&&<div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>{data.paymentTerms}</div>}
        </div>
      </div>
      <div style={{margin:"24px 48px",padding:"16px 20px",background:"#faf5ff",borderRadius:10,display:"flex",gap:40}}>
        <div style={{flex:1}}>
          <div style={{fontSize:9,color:"#7c3aed",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>Billed To</div>
          <div style={{fontSize:13,fontWeight:700,color:"#1e1b4b"}}>{data.toName}</div>
          <div style={{fontSize:11,color:"#6b7280"}}>{data.toEmail}</div>
          {data.toPhone&&<div style={{fontSize:11,color:"#6b7280"}}>{data.toPhone}</div>}
          {data.toVatId&&<div style={{fontSize:10,color:"#9ca3af"}}>Tax ID: {data.toVatId}</div>}
          <div style={{fontSize:11,color:"#6b7280",whiteSpace:"pre-wrap"}}>{data.toAddress}</div>
        </div>
      </div>
      <InvoiceTable data={data} subtotal={subtotal} tax={tax} disc={disc} total={total} accent="#7c3aed"/>
      <InvoiceFooter data={data} total={total}/>
    </div>
  );
}

// ─── Template 6: Agency (bold red left bar) ───────────────────────────────────

function AgencyTpl({ data, subtotal, tax, disc, total }: TplProps) {
  return (
    <div style={{width:794,background:"#fff",fontFamily:"'Helvetica Neue',Arial,sans-serif",minHeight:1123,color:"#111",display:"flex",flexDirection:"row",position:"relative"}}>
      {data.markPaid && <div style={PAID_OVERLAY}>PAID</div>}
      <div style={{width:8,background:"#dc2626",minHeight:1123,flexShrink:0}}/>
      <div style={{flex:1}}>
        <div style={{padding:"36px 40px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"1px solid #fee2e2",paddingBottom:24,marginBottom:24}}>
          <div>
            {data.logo?<img src={data.logo} alt="" style={{maxHeight:40,objectFit:"contain",marginBottom:6}}/>:null}
            <div style={{fontSize:28,fontWeight:900,color:"#0f172a",letterSpacing:-1}}>{data.fromName||"Agency Name"}</div>
            {data.logoText&&<div style={{fontSize:11,color:"#dc2626",fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginTop:2}}>{data.logoText}</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:13,color:"#dc2626",fontWeight:800,letterSpacing:2,textTransform:"uppercase"}}>Invoice</div>
            <div style={{fontSize:22,fontWeight:800,color:"#0f172a",marginTop:2}}>{data.invoiceNumber}</div>
            {data.poNumber&&<div style={{fontSize:10,color:"#9ca3af"}}>PO: {data.poNumber}</div>}
            <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{data.date} → {data.dueDate}</div>
            {data.paymentTerms&&<div style={{fontSize:10,color:"#9ca3af"}}>{data.paymentTerms}</div>}
          </div>
        </div>
        <div style={{display:"flex",gap:32,padding:"0 40px",marginBottom:24}}>
          {[{label:"From",name:data.fromName,email:data.fromEmail,phone:data.fromPhone,addr:data.fromAddress,vat:data.fromVatId},
            {label:"To",name:data.toName,email:data.toEmail,phone:data.toPhone,addr:data.toAddress,vat:data.toVatId}].map(p=>(
            <div key={p.label} style={{flex:1}}>
              <div style={{fontSize:9,color:"#dc2626",fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{p.label}</div>
              <div style={{fontSize:13,fontWeight:700}}>{p.name}</div>
              <div style={{fontSize:11,color:"#475569"}}>{p.email}</div>
              {p.phone&&<div style={{fontSize:11,color:"#475569"}}>{p.phone}</div>}
              {p.vat&&<div style={{fontSize:10,color:"#9ca3af"}}>Tax ID: {p.vat}</div>}
              <div style={{fontSize:11,color:"#475569",whiteSpace:"pre-wrap"}}>{p.addr}</div>
            </div>
          ))}
        </div>
        <InvoiceTable data={data} subtotal={subtotal} tax={tax} disc={disc} total={total} accent="#dc2626" padH={40}/>
        <InvoiceFooter data={data} total={total} padH={40}/>
      </div>
    </div>
  );
}

// ─── Template 7: Nordic (ultra-minimal Scandinavian) ─────────────────────────

function NordicTpl({ data, subtotal, tax, disc, total }: TplProps) {
  return (
    <div style={{width:794,background:"#fafafa",fontFamily:"'Helvetica Neue',Arial,sans-serif",minHeight:1123,color:"#1e293b",padding:"52px 56px",position:"relative"}}>
      {data.markPaid && <div style={PAID_OVERLAY}>PAID</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:44,borderBottom:"1px solid #e2e8f0",paddingBottom:24}}>
        <div>
          {data.logo?<img src={data.logo} alt="" style={{maxHeight:36,objectFit:"contain",marginBottom:8}}/>:null}
          <div style={{fontSize:30,fontWeight:700,color:"#0f172a",letterSpacing:-1}}>{data.fromName||"Your Company"}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:30,fontWeight:200,color:"#1e3a5f",letterSpacing:8}}>INVOICE</div>
          <div style={{fontSize:13,color:"#64748b",marginTop:4}}>{data.invoiceNumber}</div>
          {data.poNumber&&<div style={{fontSize:10,color:"#94a3b8"}}>PO {data.poNumber}</div>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:24,marginBottom:44,fontSize:11}}>
        <div>
          <div style={{fontSize:9,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Billed From</div>
          <div style={{fontWeight:600,color:"#0f172a"}}>{data.fromName}</div>
          <div style={{color:"#64748b"}}>{data.fromEmail}</div>
          {data.fromPhone&&<div style={{color:"#64748b"}}>{data.fromPhone}</div>}
          {data.fromVatId&&<div style={{color:"#94a3b8"}}>VAT: {data.fromVatId}</div>}
          <div style={{color:"#64748b",whiteSpace:"pre-wrap"}}>{data.fromAddress}</div>
        </div>
        <div>
          <div style={{fontSize:9,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Billed To</div>
          <div style={{fontWeight:600,color:"#0f172a"}}>{data.toName}</div>
          <div style={{color:"#64748b"}}>{data.toEmail}</div>
          {data.toPhone&&<div style={{color:"#64748b"}}>{data.toPhone}</div>}
          {data.toVatId&&<div style={{color:"#94a3b8"}}>VAT: {data.toVatId}</div>}
          <div style={{color:"#64748b",whiteSpace:"pre-wrap"}}>{data.toAddress}</div>
        </div>
        <div>
          <div style={{fontSize:9,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Details</div>
          <div><span style={{color:"#94a3b8"}}>Issued </span><span style={{fontWeight:600,color:"#0f172a"}}>{data.date}</span></div>
          <div><span style={{color:"#94a3b8"}}>Due </span><span style={{fontWeight:600,color:"#0f172a"}}>{data.dueDate}</span></div>
          {data.paymentTerms&&<div style={{color:"#64748b"}}>{data.paymentTerms}</div>}
        </div>
      </div>
      <InvoiceTable data={data} subtotal={subtotal} tax={tax} disc={disc} total={total} accent="#1e3a5f" minimal padH={0}/>
      <InvoiceFooter data={data} total={total} padH={0}/>
    </div>
  );
}

// ─── Template 8: Legal Pad ────────────────────────────────────────────────────

function PadTpl({ data, subtotal, tax, disc, total }: TplProps) {
  return (
    <div style={{width:794,background:"#fefce8",fontFamily:"'Courier New',Courier,monospace",minHeight:1123,color:"#1a1a1a",padding:"40px 40px",position:"relative"}}>
      {data.markPaid && <div style={PAID_OVERLAY}>PAID</div>}
      <div style={{borderBottom:"3px solid #ca8a04",paddingBottom:16,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            {data.logo?<img src={data.logo} alt="" style={{maxHeight:36,objectFit:"contain",marginBottom:4}}/>:null}
            <div style={{fontSize:26,fontWeight:700,color:"#ca8a04"}}>INVOICE</div>
            <div style={{fontSize:14,fontWeight:600,color:"#1a1a1a"}}>{data.fromName}</div>
            {data.fromVatId&&<div style={{fontSize:10,color:"#78716c"}}>Tax ID: {data.fromVatId}</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:13,fontWeight:600}}>{data.invoiceNumber}</div>
            {data.poNumber&&<div style={{fontSize:11,color:"#78716c"}}>PO: {data.poNumber}</div>}
            <div style={{fontSize:11,color:"#78716c"}}>Date: {data.date}</div>
            <div style={{fontSize:11,color:"#78716c"}}>Due: {data.dueDate}</div>
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:40,marginBottom:20,fontSize:11}}>
        {[{label:"From",name:data.fromName,email:data.fromEmail,phone:data.fromPhone,addr:data.fromAddress},{label:"To",name:data.toName,email:data.toEmail,phone:data.toPhone,addr:data.toAddress}].map(p=>(
          <div key={p.label} style={{flex:1,border:"1px solid #ca8a04",padding:"12px 14px",borderRadius:4,background:"#fffef0"}}>
            <div style={{fontSize:9,fontWeight:700,color:"#ca8a04",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{p.label}</div>
            <div style={{fontWeight:700}}>{p.name}</div>
            <div style={{color:"#78716c"}}>{p.email}</div>
            {p.phone&&<div style={{color:"#78716c"}}>{p.phone}</div>}
            <div style={{color:"#78716c",whiteSpace:"pre-wrap"}}>{p.addr}</div>
          </div>
        ))}
      </div>
      <InvoiceTable data={data} subtotal={subtotal} tax={tax} disc={disc} total={total} accent="#ca8a04" padH={0}/>
      <InvoiceFooter data={data} total={total} padH={0}/>
    </div>
  );
}

// ─── Template 9: Tech (dark header + monospace) ───────────────────────────────

function TechTpl({ data, subtotal, tax, disc, total }: TplProps) {
  return (
    <div style={{width:794,background:"#fff",fontFamily:"'Courier New',Courier,monospace",minHeight:1123,color:"#0f172a",position:"relative"}}>
      {data.markPaid && <div style={PAID_OVERLAY}>PAID</div>}
      <div style={{background:"#0f172a",padding:"28px 40px"}}>
        <div style={{color:"#64748b",fontSize:11,marginBottom:8}}>{"// invoice document"}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            {data.logo?<img src={data.logo} alt="" style={{maxHeight:32,objectFit:"contain",marginBottom:4}}/>:null}
            <div style={{fontSize:22,fontWeight:700,color:"#38bdf8"}}>{data.fromName||"company"}</div>
            {data.fromEmail&&<div style={{fontSize:11,color:"#94a3b8"}}>{data.fromEmail}</div>}
            {data.fromVatId&&<div style={{fontSize:10,color:"#64748b"}}>tax_id: "{data.fromVatId}"</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,color:"#38bdf8",fontWeight:700,marginBottom:4}}>INVOICE #{data.invoiceNumber}</div>
            {data.poNumber&&<div style={{fontSize:10,color:"#64748b"}}>po: {data.poNumber}</div>}
            <div style={{fontSize:11,color:"#94a3b8"}}>date: {data.date}</div>
            <div style={{fontSize:11,color:"#94a3b8"}}>due: {data.dueDate}</div>
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:32,padding:"20px 40px",borderBottom:"1px solid #e2e8f0",background:"#f8fafc"}}>
        {[{label:"from",name:data.fromName,email:data.fromEmail,phone:data.fromPhone,addr:data.fromAddress},
          {label:"to",name:data.toName,email:data.toEmail,phone:data.toPhone,addr:data.toAddress}].map(p=>(
          <div key={p.label} style={{flex:1}}>
            <div style={{fontSize:9,color:"#94a3b8",letterSpacing:1,marginBottom:4}}>{"// "+p.label}</div>
            <div style={{fontSize:12,fontWeight:600,color:"#0f172a"}}>{p.name}</div>
            <div style={{fontSize:11,color:"#475569"}}>{p.email}</div>
            {p.phone&&<div style={{fontSize:11,color:"#475569"}}>{p.phone}</div>}
            <div style={{fontSize:11,color:"#475569",whiteSpace:"pre-wrap"}}>{p.addr}</div>
          </div>
        ))}
      </div>
      <InvoiceTable data={data} subtotal={subtotal} tax={tax} disc={disc} total={total} accent="#0ea5e9"/>
      <InvoiceFooter data={data} total={total}/>
    </div>
  );
}

// ─── Template 10: Corporate ───────────────────────────────────────────────────

function CorporateTpl({ data, subtotal, tax, disc, total }: TplProps) {
  return (
    <div style={{width:794,background:"#fff",fontFamily:"'Helvetica Neue',Arial,sans-serif",minHeight:1123,color:"#111",position:"relative"}}>
      {data.markPaid && <div style={PAID_OVERLAY}>PAID</div>}
      <div style={{background:"#0a1628",padding:"28px 40px 20px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          {data.logo?<img src={data.logo} alt="" style={{maxHeight:36,objectFit:"contain",marginBottom:8}}/>:null}
          <div style={{fontSize:24,fontWeight:700,color:"#f8fafc"}}>{data.fromName}</div>
          {data.fromVatId&&<div style={{fontSize:10,color:"#64748b"}}>Tax ID: {data.fromVatId}</div>}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:"#3b82f6",fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>Invoice</div>
          <div style={{fontSize:22,fontWeight:800,color:"#f8fafc",marginTop:4}}>{data.invoiceNumber}</div>
          {data.poNumber&&<div style={{fontSize:10,color:"#64748b"}}>PO: {data.poNumber}</div>}
          <div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>Date: {data.date}</div>
          <div style={{fontSize:11,color:"#94a3b8"}}>Due: {data.dueDate}</div>
        </div>
      </div>
      <div style={{background:"#1e293b",height:4}}/>
      <div style={{display:"flex",padding:"20px 40px",gap:40,borderBottom:"1px solid #e2e8f0"}}>
        {[{label:"FROM",name:data.fromName,email:data.fromEmail,phone:data.fromPhone,addr:data.fromAddress,vat:data.fromVatId},
          {label:"BILL TO",name:data.toName,email:data.toEmail,phone:data.toPhone,addr:data.toAddress,vat:data.toVatId}].map(p=>(
          <div key={p.label} style={{flex:1}}>
            <div style={{fontSize:9,fontWeight:700,color:"#3b82f6",letterSpacing:2,marginBottom:4}}>{p.label}</div>
            <div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{p.name}</div>
            <div style={{fontSize:11,color:"#475569"}}>{p.email}</div>
            {p.phone&&<div style={{fontSize:11,color:"#475569"}}>{p.phone}</div>}
            {p.vat&&<div style={{fontSize:10,color:"#94a3b8"}}>Tax ID: {p.vat}</div>}
            <div style={{fontSize:11,color:"#475569",whiteSpace:"pre-wrap"}}>{p.addr}</div>
          </div>
        ))}
      </div>
      <InvoiceTable data={data} subtotal={subtotal} tax={tax} disc={disc} total={total} accent="#3b82f6" dark="#0a1628"/>
      <InvoiceFooter data={data} total={total}/>
    </div>
  );
}

// ─── Shared InvoiceTable ──────────────────────────────────────────────────────

function InvoiceTable({ data, subtotal, tax, disc, total, accent="#4f46e5", dark, minimal, padH=40 }: TplProps&{accent?:string;dark?:string;minimal?:boolean;padH?:number}) {
  const c=data.currency;
  const ph=padH;
  const hasPerLine=data.items.some(i=>i.taxRate>0);
  return (
    <div>
      <div style={{padding:`0 ${ph}px`,marginTop:20}}>
        <div style={{display:"grid",gridTemplateColumns:hasPerLine?"1fr 50px 80px 60px 90px":"1fr 60px 90px 90px",background:dark??accent,color:"#fff",padding:"8px 10px",borderRadius:minimal?"0":"6px 6px 0 0",fontSize:9,fontWeight:700,letterSpacing:0.5}}>
          <span>Description</span><span style={{textAlign:"center"}}>Qty</span><span style={{textAlign:"right"}}>Unit Price</span>
          {hasPerLine&&<span style={{textAlign:"center"}}>Tax%</span>}
          <span style={{textAlign:"right"}}>Amount</span>
        </div>
        {data.items.map((item,i)=>{
          const lineTax=hasPerLine?item.qty*item.price*(item.taxRate/100):0;
          return (
            <div key={item.id} style={{display:"grid",gridTemplateColumns:hasPerLine?"1fr 50px 80px 60px 90px":"1fr 60px 90px 90px",padding:"9px 10px",fontSize:11,borderBottom:"1px solid #e5e7eb",background:i%2===0?"#fff":"#f8fafc"}}>
              <span style={{color:"#1e293b"}}>{item.description||"—"}</span>
              <span style={{textAlign:"center",color:"#374151"}}>{item.qty}</span>
              <span style={{textAlign:"right",color:"#374151"}}>{fmt(item.price,c)}</span>
              {hasPerLine&&<span style={{textAlign:"center",color:"#94a3b8"}}>{item.taxRate>0?`${item.taxRate}%`:"—"}</span>}
              <span style={{textAlign:"right",fontWeight:600,color:"#1e293b"}}>{fmt(item.qty*item.price,c)}</span>
            </div>
          );
        })}
      </div>
      <div style={{padding:`16px ${ph}px`,display:"flex",justifyContent:"flex-end"}}>
        <div style={{width:250}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11,color:"#6b7280"}}><span>Subtotal</span><span>{fmt(subtotal,c)}</span></div>
          {disc>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11,color:"#16a34a"}}><span>Discount ({data.discount}%)</span><span>−{fmt(disc,c)}</span></div>}
          {tax>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11,color:"#6b7280"}}><span>Tax</span><span>{fmt(tax,c)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",marginTop:8,background:accent,borderRadius:6,fontSize:15,fontWeight:700,color:"#fff"}}>
            <span>Total</span><span>{fmt(total,c)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceFooter({ data, total, padH=40 }: {data:InvoiceData;total:number;padH?:number}) {
  const c=data.currency;
  const hasBankDetails=data.bank.iban||data.bank.swift||data.bank.routingNumber||data.bank.accountName;
  return (
    <div style={{padding:`8px ${padH}px 32px`}}>
      {hasBankDetails&&(
        <div style={{marginBottom:12,padding:"12px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6}}>
          <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>Bank / Payment Details</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 24px",fontSize:11,color:"#374151"}}>
            {data.bank.accountName&&<span><strong>Account: </strong>{data.bank.accountName}</span>}
            {data.bank.bankName&&<span><strong>Bank: </strong>{data.bank.bankName}</span>}
            {data.bank.iban&&<span><strong>IBAN: </strong>{data.bank.iban}</span>}
            {data.bank.swift&&<span><strong>SWIFT/BIC: </strong>{data.bank.swift}</span>}
            {data.bank.routingNumber&&<span><strong>Routing: </strong>{data.bank.routingNumber}</span>}
          </div>
        </div>
      )}
      {data.paymentLink&&(
        <div style={{marginBottom:12,fontSize:11,color:"#4f46e5"}}>
          Pay online: <span style={{textDecoration:"underline"}}>{data.paymentLink}</span>
        </div>
      )}
      {data.notes&&(
        <div style={{padding:"12px 14px",background:"#f8fafc",borderLeft:"3px solid #e2e8f0",borderRadius:4}}>
          <div style={{fontSize:9,fontWeight:700,color:"#9ca3af",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Notes</div>
          <div style={{fontSize:11,color:"#374151",whiteSpace:"pre-wrap",lineHeight:1.6}}>{data.notes}</div>
        </div>
      )}
    </div>
  );
}

const TEMPLATE_MAP: Record<string, React.ComponentType<TplProps>> = {
  modern:ModernTpl, executive:ExecutiveTpl, minimal:MinimalTpl, saas:SaaSTpl,
  freelancer:FreelancerTpl, agency:AgencyTpl, nordic:NordicTpl,
  pad:PadTpl, tech:TechTpl, corporate:CorporateTpl,
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InvoiceGeneratorPage() {
  const [data, setData]=useState<InvoiceData>(()=>{
    if (typeof window!=="undefined") { try { const s=localStorage.getItem("invoice-v3"); if(s) return JSON.parse(s); } catch {} }
    return DEFAULT;
  });
  const [theme, setTheme]=useState("modern");
  const [exporting, setExporting]=useState(false);
  const [showPreview, setShowPreview]=useState(false);
  const [previewScale, setPreviewScale]=useState(0.55);
  const [savedBadge, setSavedBadge]=useState(false);
  const [showBank, setShowBank]=useState(false);
  const [showAdvanced, setShowAdvanced]=useState(false);

  const previewRef=useRef<HTMLDivElement>(null);
  const containerRef=useRef<HTMLDivElement>(null);
  const logoRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{
    const update=()=>{ if(containerRef.current){ const w=containerRef.current.clientWidth-24; setPreviewScale(Math.min(w/794,0.72)); } };
    update(); window.addEventListener("resize",update); return ()=>window.removeEventListener("resize",update);
  },[]);

  useEffect(()=>{ const t=setTimeout(()=>localStorage.setItem("invoice-v3",JSON.stringify(data)),600); return ()=>clearTimeout(t); },[data]);

  const set=(field: keyof InvoiceData)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>setData(d=>({...d,[field]:e.target.value}));
  const setBank=(field: keyof BankDetails)=>(e: React.ChangeEvent<HTMLInputElement>)=>setData(d=>({...d,bank:{...d.bank,[field]:e.target.value}}));

  const addItem=()=>setData(d=>({...d,items:[...d.items,{id:uid(),description:"",qty:1,price:0,taxRate:0}]}));
  const delItem=(id:string)=>setData(d=>({...d,items:d.items.filter(i=>i.id!==id)}));
  const updItem=(id:string,field:keyof LineItem,val:string|number)=>setData(d=>({...d,items:d.items.map(i=>i.id===id?{...i,[field]:val}:i)}));
  const moveItem=(id:string,dir:-1|1)=>setData(d=>{const a=[...d.items];const i=a.findIndex(x=>x.id===id);if(i+dir<0||i+dir>=a.length)return d;[a[i],a[i+dir]]=[a[i+dir],a[i]];return{...d,items:a};});

  const handleLogo=(e: React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>setData(d=>({...d,logo:ev.target?.result as string??""})); r.readAsDataURL(f);
  };

  const handleSave=()=>{ localStorage.setItem("invoice-v3",JSON.stringify(data)); setSavedBadge(true); setTimeout(()=>setSavedBadge(false),2000); };

  const exportPDF=async()=>{
    if(!previewRef.current) return; setExporting(true);
    try {
      const html2pdf=(await import("html2pdf.js")).default;
      await html2pdf().from(previewRef.current).set({margin:0,filename:`${data.invoiceNumber||"invoice"}.pdf`,image:{type:"jpeg",quality:0.99},html2canvas:{scale:2.5,useCORS:true,letterRendering:true,backgroundColor:"#ffffff"},jsPDF:{unit:"mm",format:"a4",orientation:"portrait" as const}}).save();
    } finally { setExporting(false); }
  };

  const {subtotal,disc,tax,total}=calcTotals(data);
  const TplComp=TEMPLATE_MAP[theme]??ModernTpl;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="max-w-350 mx-auto px-4 md:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="tool-hero p-5 sm:p-7">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-sm font-semibold mb-5 transition-colors"><ArrowLeft className="w-4 h-4"/>Back to Tools</Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0"><Receipt className="w-5 h-5 text-primary"/></div>
              <div>
                <h1 className="type-h1 font-display gradient-text mb-1">Invoice Generator</h1>
                <p className="text-foreground-secondary text-sm"><span className="font-medium text-primary">10 professional templates</span> · VAT/Tax ID · Bank details · Logo upload · PAID stamp · PDF export · Auto-saves</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={()=>setData(d=>({...d,markPaid:!d.markPaid}))} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${data.markPaid?"bg-green-50 border-green-200/60 text-green-700":"border-border text-foreground-secondary hover:text-foreground"}`}>
                {data.markPaid?"✓ PAID":"Mark PAID"}
              </button>
              <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-foreground-secondary hover:text-foreground transition-colors"><Save className="w-4 h-4"/>{savedBadge?"Saved!":"Save"}</button>
              <button onClick={()=>setData(DEFAULT)} className="p-2 rounded-xl border border-border text-foreground-secondary hover:text-foreground transition-colors"><RotateCcw className="w-4 h-4"/></button>
              <button className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-foreground-secondary" onClick={()=>setShowPreview(s=>!s)}>{showPreview?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}{showPreview?"Edit":"Preview"}</button>
              <button onClick={exportPDF} disabled={exporting} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-sm"><Download className="w-4 h-4"/>{exporting?"Generating…":"Download PDF"}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-350 mx-auto px-4 md:px-6 lg:px-8 pb-16 mt-4">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── Left: Editor ───────────────────────────────────────────────── */}
          <div className={`lg:w-105 shrink-0 flex flex-col gap-4 ${showPreview?"hidden lg:flex":"flex"}`}>

            {/* Template picker */}
            <div className="glass-card-premium p-4">
              <p className="text-xs text-foreground-secondary font-semibold uppercase tracking-wide mb-3">Template</p>
              <div className="flex flex-wrap gap-2">
                {THEMES.map(t=>(
                  <button key={t.id} onClick={()=>setTheme(t.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${theme===t.id?"border-primary bg-primary/5 text-primary":"border-border text-foreground-secondary hover:border-primary/40 hover:text-foreground"}`}>
                    <span className="w-3 h-3 rounded-full shrink-0" style={{background:t.swatch}}/>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable form */}
            <div className="glass-card-premium p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
              <div className="flex flex-col gap-5">

                {/* Invoice metadata */}
                <section>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5"><Hash className="w-3 h-3"/>Invoice Details</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div><label className={lc}>Invoice #</label><input className={ic} value={data.invoiceNumber} onChange={set("invoiceNumber")} placeholder="INV-001"/></div>
                    <div><label className={lc}>PO Number</label><input className={ic} value={data.poNumber} onChange={set("poNumber")} placeholder="PO-2024-001"/></div>
                    <div><label className={lc}>Invoice Date</label><input type="date" className={ic} value={data.date} onChange={set("date")}/></div>
                    <div><label className={lc}>Due Date</label><input type="date" className={ic} value={data.dueDate} onChange={set("dueDate")}/></div>
                    <div className="col-span-2"><label className={lc}>Payment Terms</label><input className={ic} value={data.paymentTerms} onChange={set("paymentTerms")} placeholder="Net 30"/></div>
                    <div><label className={lc}>Currency</label><select className={ic} value={data.currency} onChange={set("currency")}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></div>
                  </div>
                </section>

                {/* Logo */}
                <section>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5"><Upload className="w-3 h-3"/>Logo</p>
                  <div className="flex items-center gap-3">
                    {data.logo&&<img src={data.logo} alt="" className="h-10 object-contain rounded border border-border"/>}
                    <div>
                      <button onClick={()=>logoRef.current?.click()} className="text-xs text-primary hover:underline font-medium">{data.logo?"Change logo":"Upload logo"}</button>
                      {data.logo&&<button onClick={()=>setData(d=>({...d,logo:""}))} className="ml-3 text-xs text-red-400 hover:text-red-600">Remove</button>}
                      <p className="text-[10px] text-foreground-secondary mt-0.5">PNG/JPG · transparent bg works best</p>
                    </div>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo}/>
                  </div>
                  <div className="mt-2"><label className={lc}>Tagline / Logo text (fallback)</label><input className={ic} value={data.logoText} onChange={set("logoText")} placeholder="Creative Studio LLC"/></div>
                </section>

                {/* From / To */}
                {[
                  {key:"from" as const,title:"Your Details (From)"},
                  {key:"to" as const,title:"Client Details (Bill To)"},
                ].map(({key,title})=>(
                  <section key={key}>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5"><Building2 className="w-3 h-3"/>{title}</p>
                    <div className="flex flex-col gap-2.5">
                      <div><label className={lc}>Company / Name</label><input className={ic} value={data[`${key}Name`]} onChange={set(`${key}Name`)} placeholder="Acme Studio"/></div>
                      <div><label className={lc}>Email</label><input className={ic} value={data[`${key}Email`]} onChange={set(`${key}Email`)} placeholder="billing@acme.co"/></div>
                      <div><label className={lc}>Phone (opt.)</label><input className={ic} value={data[`${key}Phone`]} onChange={set(`${key}Phone`)} placeholder="+1 555 000 0000"/></div>
                      <div><label className={lc}>Address</label><textarea className={`${ic} resize-none`} rows={2} value={data[`${key}Address`]} onChange={set(`${key}Address`)} placeholder="123 Main St, City, Country"/></div>
                      <div><label className={lc}>VAT / Tax ID (opt.) <span className="text-foreground-secondary/50">— required for EU invoices</span></label><input className={ic} value={data[`${key}VatId`]} onChange={set(`${key}VatId`)} placeholder="GB123456789 / DE123456789"/></div>
                    </div>
                  </section>
                ))}

                {/* Line Items */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Line Items</p>
                    <button onClick={addItem} className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"><Plus className="w-3 h-3"/>Add</button>
                  </div>
                  {data.items.map((item,idx)=>(
                    <div key={item.id} className="mb-3 rounded-xl border border-border p-3 bg-surface/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground truncate max-w-36">{item.description||`Item ${idx+1}`}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={()=>moveItem(item.id,-1)} className="p-0.5 text-foreground-secondary hover:text-foreground"><ChevronUp className="w-3 h-3"/></button>
                          <button onClick={()=>moveItem(item.id,1)} className="p-0.5 text-foreground-secondary hover:text-foreground"><ChevronDown className="w-3 h-3"/></button>
                          <button onClick={()=>delItem(item.id)} className="p-0.5 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </div>
                      <div><label className={lc}>Description</label><input className={ic} value={item.description} onChange={e=>updItem(item.id,"description",e.target.value)} placeholder="Service or product"/></div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div><label className={lc}>Qty</label><input type="number" className={ic} min={0} value={item.qty} onChange={e=>updItem(item.id,"qty",parseFloat(e.target.value)||0)}/></div>
                        <div><label className={lc}>Unit Price</label><input type="number" className={ic} min={0} value={item.price} onChange={e=>updItem(item.id,"price",parseFloat(e.target.value)||0)}/></div>
                        <div><label className={lc}>Tax % (per-line)</label><input type="number" className={ic} min={0} max={100} step={0.5} value={item.taxRate} onChange={e=>updItem(item.id,"taxRate",parseFloat(e.target.value)||0)} placeholder="0"/></div>
                      </div>
                      <p className="text-right text-xs text-foreground-secondary mt-1.5">Line total: <strong>{data.currency}{(item.qty*item.price).toLocaleString("en-US",{minimumFractionDigits:2})}</strong></p>
                    </div>
                  ))}
                </section>

                {/* Totals config */}
                <section>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Taxes & Discount</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div><label className={lc}>Global Tax %</label><input type="number" className={ic} min={0} max={100} step={0.5} value={data.globalTaxRate} onChange={set("globalTaxRate")} placeholder="0 — or use per-line tax"/></div>
                    <div><label className={lc}>Discount %</label><input type="number" className={ic} min={0} max={100} step={0.5} value={data.discount} onChange={set("discount")} placeholder="0"/></div>
                  </div>
                </section>

                {/* Totals preview */}
                <section className="rounded-xl border border-border p-3 bg-surface/30">
                  <div className="flex justify-between text-xs text-foreground-secondary mb-1"><span>Subtotal</span><span>{data.currency}{subtotal.toLocaleString("en-US",{minimumFractionDigits:2})}</span></div>
                  {disc>0&&<div className="flex justify-between text-xs text-green-600 mb-1"><span>Discount ({data.discount}%)</span><span>−{data.currency}{disc.toLocaleString("en-US",{minimumFractionDigits:2})}</span></div>}
                  {tax>0&&<div className="flex justify-between text-xs text-foreground-secondary mb-1"><span>Tax</span><span>{data.currency}{tax.toLocaleString("en-US",{minimumFractionDigits:2})}</span></div>}
                  <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-border"><span>Total</span><span className="text-primary">{data.currency}{total.toLocaleString("en-US",{minimumFractionDigits:2})}</span></div>
                </section>

                {/* Bank details */}
                <section>
                  <button onClick={()=>setShowBank(s=>!s)} className="flex items-center justify-between w-full text-xs font-semibold text-foreground uppercase tracking-wide mb-0">
                    <span className="flex items-center gap-1.5"><CreditCard className="w-3 h-3"/>Bank / Payment Details</span>
                    <span className="text-foreground-secondary normal-case tracking-normal font-normal">{showBank?"Hide ↑":"Show ↓"}</span>
                  </button>
                  {showBank&&(
                    <div className="mt-3 flex flex-col gap-2.5">
                      <div><label className={lc}>Account Name</label><input className={ic} value={data.bank.accountName} onChange={setBank("accountName")} placeholder="Acme Studio Ltd"/></div>
                      <div><label className={lc}>Bank Name</label><input className={ic} value={data.bank.bankName} onChange={setBank("bankName")} placeholder="Barclays / Chase / Deutsche Bank"/></div>
                      <div><label className={lc}>IBAN</label><input className={ic} value={data.bank.iban} onChange={setBank("iban")} placeholder="GB29 NWBK 6016 1331 9268 19"/></div>
                      <div><label className={lc}>SWIFT / BIC</label><input className={ic} value={data.bank.swift} onChange={setBank("swift")} placeholder="NWBKGB2L"/></div>
                      <div><label className={lc}>Routing # (US)</label><input className={ic} value={data.bank.routingNumber} onChange={setBank("routingNumber")} placeholder="021000021"/></div>
                      <div><label className={lc}>Payment Link (Stripe / PayPal / etc.)</label><input className={ic} value={data.paymentLink} onChange={set("paymentLink")} placeholder="https://pay.stripe.com/..."/></div>
                    </div>
                  )}
                </section>

                {/* Notes */}
                <section>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Notes</p>
                  <textarea className={`${ic} resize-none`} rows={3} value={data.notes} onChange={set("notes")} placeholder="Payment instructions, thank you message, terms…"/>
                </section>

              </div>
            </div>
          </div>

          {/* ── Right: Preview ──────────────────────────────────────────────── */}
          <div className={`flex-1 min-w-0 ${showPreview||"hidden lg:block"}`} ref={containerRef}>
            <div className="glass-card-premium p-3 sm:p-4 sticky top-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="text-xs text-foreground-secondary font-semibold uppercase tracking-wide">Live Preview · {Math.round(previewScale*100)}%</p>
                <button onClick={exportPDF} disabled={exporting} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
                  <Download className="w-3.5 h-3.5"/>{exporting?"Generating…":"Download PDF"}
                </button>
              </div>
              <div className="overflow-auto rounded-lg border border-border bg-white shadow-sm">
                <div style={{width:Math.round(794*previewScale)+2,height:Math.round(1123*previewScale)+2,overflow:"hidden"}}>
                  <div ref={previewRef} style={{transform:`scale(${previewScale})`,transformOrigin:"top left",width:794}}>
                    <TplComp data={data} subtotal={subtotal} tax={tax} disc={disc} total={total}/>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
