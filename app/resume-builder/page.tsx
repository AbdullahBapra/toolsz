"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Download, User, Briefcase, GraduationCap,
  Wrench, Star, ChevronUp, ChevronDown, Eye, EyeOff, CheckCircle,
  LayoutGrid, X, AlertCircle, Languages, Trophy, Heart, BookOpen,
  Sliders, Search, RotateCcw, Save, Globe,
} from "lucide-react";
import type { ResumeData, SectionKey, Exp, Edu, Cert, Proj, Language, Award, Volunteer, Publication } from "./types";
import { ALL_SECTIONS } from "./types";
import { TEMPLATE_COMPONENTS, TEMPLATE_META } from "./templates";

// ─── Constants ────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

export const THEMES = [
  { id: "indigo",   color: "#4f46e5" },
  { id: "navy",     color: "#1e3a5f" },
  { id: "forest",   color: "#166534" },
  { id: "ruby",     color: "#9f1239" },
  { id: "slate",    color: "#334155" },
  { id: "teal",     color: "#0f766e" },
  { id: "purple",   color: "#7c3aed" },
  { id: "orange",   color: "#c2410c" },
  { id: "rose",     color: "#e11d48" },
  { id: "charcoal", color: "#1c1917" },
];

const FONTS = [
  { id: "system",    label: "System (Modern)",   value: "system-ui,'Segoe UI',sans-serif" },
  { id: "georgia",   label: "Georgia (Classic)", value: "Georgia,'Times New Roman',serif" },
  { id: "arial",     label: "Arial (Clean)",     value: "Arial,Helvetica,sans-serif" },
  { id: "garamond",  label: "Garamond (Refined)",value: "Garamond,'Times New Roman',serif" },
  { id: "trebuchet", label: "Trebuchet (Modern)", value: "'Trebuchet MS',sans-serif" },
];

const SPACINGS = [
  { id: "compact", label: "Compact", value: 0.82 },
  { id: "normal",  label: "Normal",  value: 1.0  },
  { id: "relaxed", label: "Relaxed", value: 1.22 },
];

const ACTION_VERBS = [
  "led","managed","developed","built","created","implemented","designed","increased",
  "reduced","improved","achieved","delivered","launched","optimized","established",
  "streamlined","coordinated","spearheaded","engineered","architected","deployed",
  "scaled","mentored","drove","accelerated","automated","collaborated","initiated",
];

const SECTION_LABELS: Record<SectionKey, string> = {
  summary:"Summary", experience:"Experience", education:"Education",
  skills:"Skills", certifications:"Certifications", projects:"Projects",
  languages:"Languages", awards:"Awards", volunteer:"Volunteer", publications:"Publications",
};

const SECTION_ICONS: Record<SectionKey, React.ReactNode> = {
  summary: <User className="w-3 h-3" />,
  experience: <Briefcase className="w-3 h-3" />,
  education: <GraduationCap className="w-3 h-3" />,
  skills: <Wrench className="w-3 h-3" />,
  certifications: <Star className="w-3 h-3" />,
  projects: <Globe className="w-3 h-3" />,
  languages: <Languages className="w-3 h-3" />,
  awards: <Trophy className="w-3 h-3" />,
  volunteer: <Heart className="w-3 h-3" />,
  publications: <BookOpen className="w-3 h-3" />,
};

const LANG_LEVELS = ["native","fluent","advanced","intermediate","basic"];

function buildDefault(): ResumeData {
  const sectionVisible = {} as Record<SectionKey, boolean>;
  ALL_SECTIONS.forEach(s => { sectionVisible[s] = true; });
  sectionVisible.languages = false;
  sectionVisible.awards = false;
  sectionVisible.volunteer = false;
  sectionVisible.publications = false;
  return {
    name:"Alex Johnson", title:"Senior Software Engineer",
    email:"alex@email.com", phone:"+1 (555) 012-3456",
    location:"San Francisco, CA", linkedin:"linkedin.com/in/alexjohnson",
    website:"alexjohnson.dev", github:"github.com/alexjohnson", photo:"",
    summary:"Results-driven software engineer with 6+ years building scalable web applications. Led cross-functional teams and delivered high-impact products used by millions. Passionate about clean code, performance, and developer experience.",
    experience:[
      { id:uid(), company:"TechCorp Inc.", title:"Senior Software Engineer", location:"San Francisco, CA",
        startDate:"2021-03", endDate:"", current:true,
        bullets:["Led microservices architecture serving 2M+ daily users, reducing latency by 40%","Mentored 5 engineers and established coding standards across 3 departments","Redesigned checkout flow that increased conversion rate by 18%"] },
      { id:uid(), company:"StartupXYZ", title:"Software Engineer", location:"Remote",
        startDate:"2018-06", endDate:"2021-02", current:false,
        bullets:["Built React + Node.js SaaS platform from scratch; grew to 15,000 paying customers","Integrated Stripe payments, automating billing and saving 20 hrs/week"] },
    ],
    education:[{ id:uid(), school:"UC Berkeley", degree:"Bachelor of Science", field:"Computer Science", startDate:"2014-08", endDate:"2018-05", gpa:"3.8", honors:"Magna Cum Laude" }],
    skills:["JavaScript","TypeScript","React","Node.js","Python","PostgreSQL","AWS","Docker","GraphQL","Git"],
    certifications:[{ id:uid(), name:"AWS Solutions Architect", issuer:"Amazon Web Services", date:"2022-04", url:"" }],
    projects:[{ id:uid(), name:"OpenDeploy", description:"Open-source CI/CD tool with 2,400 GitHub stars.", link:"github.com/alexj/opendeploy", tech:"Go, React, Docker" }],
    languages:[{ id:uid(), name:"English", level:"native" }, { id:uid(), name:"Spanish", level:"intermediate" }],
    awards:[{ id:uid(), title:"Engineer of the Year", issuer:"TechCorp Inc.", date:"2023-01", description:"Recognized for outstanding technical leadership." }],
    volunteer:[], publications:[],
    sectionOrder:[...ALL_SECTIONS], sectionVisible,
  };
}

// ─── ATS Score ────────────────────────────────────────────────────────────────

interface ATSBreakdown { label: string; score: number; max: number; tip: string; }

function calcATS(data: ResumeData, template: string): { total: number; items: ATSBreakdown[] } {
  const items: ATSBreakdown[] = [];
  const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  items.push({ label:"Contact Info", max:15, score:[data.name,data.email,data.phone,data.location,data.linkedin].filter(Boolean).length*3, tip:"Add name, email, phone, location, and LinkedIn." });
  const sw = wordCount(data.summary);
  items.push({ label:"Professional Summary", max:12, score:sw>=40?12:sw>=20?8:sw>0?4:0, tip:"Write a 40–60 word summary highlighting your value." });
  items.push({ label:"Work Experience", max:12, score:data.experience.length>=2?12:data.experience.length===1?7:0, tip:"Add at least 2 positions." });
  const bwv = data.experience.flatMap(e=>e.bullets.filter(Boolean)).filter(b=>ACTION_VERBS.some(v=>b.toLowerCase().startsWith(v))).length;
  const tb = data.experience.flatMap(e=>e.bullets.filter(Boolean)).length;
  items.push({ label:"Action Verbs", max:12, score:tb===0?0:Math.round((bwv/tb)*12), tip:"Start each bullet with a strong action verb (Led, Built, Reduced…)." });
  items.push({ label:"Quantified Achievements", max:10, score:Math.min(data.experience.flatMap(e=>e.bullets).filter(b=>/\d/.test(b)).length*2,10), tip:"Include numbers/% to quantify impact." });
  items.push({ label:"Education", max:8, score:data.education.length>0?8:0, tip:"Add your highest education." });
  items.push({ label:"Skills Section", max:10, score:data.skills.length>=8?10:data.skills.length>=5?7:data.skills.length>0?4:0, tip:"List 8–15 relevant skills including keywords." });
  items.push({ label:"ATS-Friendly Format", max:11, score:template==="ats"?11:template==="minimal"||template==="classic"?8:5, tip:"Use the ATS-Safe template for maximum compatibility." });
  items.push({ label:"Completeness", max:10, score:[data.github,data.website,data.certifications.length>0,data.projects.length>0].filter(Boolean).length*2.5, tip:"Add GitHub, website, certifications, and projects." });
  return { total:Math.round(Math.min(items.reduce((a,b)=>a+b.score,0),100)), items };
}

function extractKeywords(text: string): string[] {
  const stop = new Set(["the","and","or","in","of","to","a","an","for","with","that","this","is","are","was","were","be","been","have","has","had","will","would","can","could","should","at","by","from","as","on","it","its","their","they","we","our","your","you","not","but","if","so","do","did","does","may","might","must","about","up","out","which","who","what","when","how","than","more","also","any","all","some","into","over","under","through","during","before","after","other","each","both","few","very","just","then","too","well","only","per","use","using","used","make","making","made","get","getting","work","working","etc","including","such"]);
  return [...new Set(text.toLowerCase().replace(/[^\w\s]/g," ").split(/\s+/).filter(w=>w.length>2&&!stop.has(w)&&!/^\d+$/.test(w)))].slice(0,60);
}

function resumeText(data: ResumeData): string {
  return [data.summary,...data.skills,...data.experience.flatMap(e=>[e.title,e.company,...e.bullets]),...data.education.flatMap(e=>[e.degree,e.field,e.school]),...data.certifications.map(c=>c.name),...data.projects.flatMap(p=>[p.name,p.description,p.tech])].join(" ").toLowerCase();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ic = "w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-foreground-secondary/50";
const lc = "text-xs text-foreground-secondary font-medium mb-1 block";

// ─── Template Thumbnail SVG ───────────────────────────────────────────────────

function TemplateThumbnail({ id, color, w = 52, h = 68 }: { id: string; color: string; w?: number; h?: number }) {
  const g = "#e5e7eb"; const dg = "#d1d5db"; const dark = "#1f2937"; const c = color;
  const vb = "0 0 52 68";
  switch (id) {
    case "modern": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect width="52" height="14" fill={c}/><rect x="2" y="3.5" width="20" height="2.5" rx="1" fill="white" opacity=".9"/><rect x="2" y="8" width="13" height="1.5" rx=".75" fill="white" opacity=".6"/><rect y="14" width="14" height="54" fill={c} opacity=".1"/><rect x="1" y="17" width="11" height="1.5" rx=".75" fill={c} opacity=".8"/><rect x="1" y="20.5" width="9" height="1" rx=".5" fill={dg}/><rect x="1" y="23" width="10" height="1" rx=".5" fill={dg}/><rect x="1" y="27" width="11" height="1.5" rx=".75" fill={c} opacity=".8"/><rect x="1" y="30.5" width="8" height="1" rx=".5" fill={dg}/><rect x="1" y="33" width="9" height="1" rx=".5" fill={dg}/><rect x="17" y="17" width="32" height="2" rx=".75" fill={dg}/><rect x="17" y="21" width="26" height="1" rx=".5" fill={g}/><rect x="17" y="23.5" width="28" height="1" rx=".5" fill={g}/><rect x="17" y="28" width="12" height="1.5" rx=".75" fill={c} opacity=".6"/><rect x="17" y="31" width="32" height="1" rx=".5" fill={g}/><rect x="17" y="33.5" width="27" height="1" rx=".5" fill={g}/><rect x="17" y="36" width="22" height="1" rx=".5" fill={g}/><rect x="17" y="41" width="12" height="1.5" rx=".75" fill={c} opacity=".6"/><rect x="17" y="44" width="32" height="1" rx=".5" fill={g}/><rect x="17" y="46.5" width="28" height="1" rx=".5" fill={g}/></svg>;
    case "classic": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect x="11" y="4" width="30" height="3" rx="1" fill={dg}/><rect x="16" y="9" width="20" height="2" rx=".75" fill={c} opacity=".6"/><rect x="8" y="13" width="36" height=".5" fill={c}/><rect x="6" y="15.5" width="8" height="1" rx=".5" fill={g}/><rect x="22" y="15.5" width="8" height="1" rx=".5" fill={g}/><rect x="38" y="15.5" width="8" height="1" rx=".5" fill={g}/><rect x="4" y="21" width="14" height="1.5" rx=".75" fill={dg}/><rect x="4" y="24" width="44" height="1" rx=".5" fill={g}/><rect x="4" y="26.5" width="38" height="1" rx=".5" fill={g}/><rect x="4" y="29" width="40" height="1" rx=".5" fill={g}/><rect x="4" y="34" width="14" height="1.5" rx=".75" fill={dg}/><rect x="4" y="37" width="44" height="1" rx=".5" fill={g}/><rect x="4" y="39.5" width="36" height="1" rx=".5" fill={g}/><rect x="4" y="45" width="14" height="1.5" rx=".75" fill={dg}/><rect x="4" y="48" width="34" height="1" rx=".5" fill={g}/><rect x="4" y="50.5" width="40" height="1" rx=".5" fill={g}/></svg>;
    case "ats": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect x="4" y="4" width="24" height="2.5" rx=".75" fill={dg}/><rect x="4" y="8.5" width="17" height="1.5" rx=".75" fill={g}/><rect x="4" y="11.5" width="40" height=".5" fill={g}/><rect x="4" y="14" width="8" height="1" rx=".5" fill={g}/><rect x="20" y="14" width="8" height="1" rx=".5" fill={g}/><rect x="36" y="14" width="10" height="1" rx=".5" fill={g}/><rect x="4" y="19" width="12" height="1.5" rx=".75" fill={dg}/><rect x="4" y="22" width="44" height=".5" fill={g}/><rect x="4" y="24.5" width="30" height="1" rx=".5" fill={g}/><rect x="4" y="27" width="26" height="1" rx=".5" fill={g}/><rect x="4" y="29.5" width="22" height="1" rx=".5" fill={g}/><rect x="4" y="34" width="12" height="1.5" rx=".75" fill={dg}/><rect x="4" y="37" width="44" height=".5" fill={g}/><rect x="4" y="39.5" width="28" height="1" rx=".5" fill={g}/><rect x="4" y="42" width="22" height="1" rx=".5" fill={g}/><rect x="4" y="48" width="12" height="1.5" rx=".75" fill={dg}/><rect x="4" y="51" width="40" height=".5" fill={g}/><rect x="4" y="53.5" width="24" height="1" rx=".5" fill={g}/></svg>;
    case "executive": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect width="52" height="22" fill={dark}/><rect x="4" y="5" width="24" height="3" rx="1" fill="white"/><rect x="4" y="10" width="16" height="2" rx=".75" fill={c} opacity=".8"/><rect x="4" y="14" width="8" height="1" rx=".5" fill="white" opacity=".5"/><rect x="18" y="14" width="8" height="1" rx=".5" fill="white" opacity=".5"/><rect x="32" y="14" width="10" height="1" rx=".5" fill="white" opacity=".5"/><rect x="4" y="22" width="44" height="2" fill={c} opacity=".2"/><rect x="4" y="26" width="14" height="1.5" rx=".75" fill={dg}/><rect x="4" y="29" width="44" height="1" rx=".5" fill={g}/><rect x="4" y="31.5" width="38" height="1" rx=".5" fill={g}/><rect x="4" y="34" width="40" height="1" rx=".5" fill={g}/><rect x="4" y="39" width="14" height="1.5" rx=".75" fill={dg}/><rect x="4" y="42" width="44" height="1" rx=".5" fill={g}/><rect x="4" y="44.5" width="36" height="1" rx=".5" fill={g}/><rect x="4" y="50" width="14" height="1.5" rx=".75" fill={dg}/><rect x="4" y="53" width="40" height="1" rx=".5" fill={g}/><rect x="4" y="55.5" width="30" height="1" rx=".5" fill={g}/></svg>;
    case "sideline": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect width="4" height="68" fill={c}/><rect x="9" y="4" width="22" height="3" rx="1" fill={dg}/><rect x="9" y="9" width="16" height="2" rx=".75" fill={c} opacity=".6"/><rect x="9" y="13.5" width="8" height="1" rx=".5" fill={g}/><rect x="23" y="13.5" width="10" height="1" rx=".5" fill={g}/><rect x="9" y="19" width="10" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="9" y="22" width="38" height="1" rx=".5" fill={g}/><rect x="9" y="24.5" width="34" height="1" rx=".5" fill={g}/><rect x="9" y="27" width="30" height="1" rx=".5" fill={g}/><rect x="9" y="32" width="10" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="9" y="35" width="38" height="1" rx=".5" fill={g}/><rect x="9" y="37.5" width="30" height="1" rx=".5" fill={g}/><rect x="9" y="43" width="10" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="9" y="46" width="38" height="1" rx=".5" fill={g}/><rect x="9" y="48.5" width="26" height="1" rx=".5" fill={g}/></svg>;
    case "minimal": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect x="8" y="6" width="28" height="3.5" rx="1" fill={dg}/><rect x="8" y="11.5" width="18" height="2" rx=".75" fill={c} opacity=".4"/><rect x="8" y="15.5" width="36" height=".5" fill={g}/><rect x="8" y="22" width="10" height="1" rx=".5" fill={dg}/><rect x="8" y="25" width="40" height="1" rx=".5" fill={g}/><rect x="8" y="27.5" width="36" height="1" rx=".5" fill={g}/><rect x="8" y="30" width="32" height="1" rx=".5" fill={g}/><rect x="8" y="36" width="10" height="1" rx=".5" fill={dg}/><rect x="8" y="39" width="40" height="1" rx=".5" fill={g}/><rect x="8" y="41.5" width="34" height="1" rx=".5" fill={g}/><rect x="8" y="47" width="10" height="1" rx=".5" fill={dg}/><rect x="8" y="50" width="40" height="1" rx=".5" fill={g}/><rect x="8" y="52.5" width="28" height="1" rx=".5" fill={g}/></svg>;
    case "bold": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect x="4" y="4" width="26" height="4" rx="1" fill={dg}/><rect x="4" y="10" width="18" height="2" rx=".75" fill={c} opacity=".5"/><rect x="4" y="14" width="8" height="1" rx=".5" fill={g}/><rect x="18" y="14" width="8" height="1" rx=".5" fill={g}/><rect x="4" y="19" width="3" height="3" rx=".5" fill={c}/><rect x="9" y="20" width="14" height="2" rx=".75" fill={dg}/><rect x="4" y="24" width="44" height="1" rx=".5" fill={g}/><rect x="4" y="26.5" width="38" height="1" rx=".5" fill={g}/><rect x="4" y="29" width="34" height="1" rx=".5" fill={g}/><rect x="4" y="34" width="3" height="3" rx=".5" fill={c}/><rect x="9" y="35" width="14" height="2" rx=".75" fill={dg}/><rect x="4" y="39" width="44" height="1" rx=".5" fill={g}/><rect x="4" y="41.5" width="36" height="1" rx=".5" fill={g}/><rect x="4" y="47" width="3" height="3" rx=".5" fill={c}/><rect x="9" y="48" width="14" height="2" rx=".75" fill={dg}/><rect x="4" y="52" width="40" height="1" rx=".5" fill={g}/><rect x="4" y="54.5" width="32" height="1" rx=".5" fill={g}/></svg>;
    case "elegant": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect x="4" y="5" width="44" height=".5" fill={c} opacity=".4"/><rect x="11" y="7" width="30" height="3" rx="1" fill={dg}/><rect x="14" y="12" width="24" height="1.5" rx=".75" fill={c} opacity=".5"/><rect x="4" y="15" width="44" height=".5" fill={c} opacity=".4"/><rect x="8" y="17" width="8" height="1" rx=".5" fill={g}/><rect x="22" y="17" width="8" height="1" rx=".5" fill={g}/><rect x="36" y="17" width="8" height="1" rx=".5" fill={g}/><rect x="4" y="23" width="14" height="1.5" rx=".75" fill={dg}/><rect x="4" y="25" width="44" height=".5" fill={dg}/><rect x="4" y="27" width="40" height="1" rx=".5" fill={g}/><rect x="4" y="29.5" width="36" height="1" rx=".5" fill={g}/><rect x="4" y="32" width="38" height="1" rx=".5" fill={g}/><rect x="4" y="38" width="14" height="1.5" rx=".75" fill={dg}/><rect x="4" y="40" width="44" height=".5" fill={dg}/><rect x="4" y="42" width="38" height="1" rx=".5" fill={g}/><rect x="4" y="44.5" width="30" height="1" rx=".5" fill={g}/><rect x="4" y="50" width="14" height="1.5" rx=".75" fill={dg}/><rect x="4" y="52" width="44" height=".5" fill={dg}/><rect x="4" y="54" width="34" height="1" rx=".5" fill={g}/></svg>;
    case "academic": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect x="8" y="4" width="36" height="3" rx="1" fill={dg}/><rect x="12" y="9" width="28" height="1.5" rx=".75" fill={g}/><rect x="12" y="12" width="24" height="1" rx=".5" fill={g}/><rect x="4" y="16" width="44" height="1" rx=".5" fill={dg}/><rect x="4" y="20" width="16" height="1.5" rx=".75" fill={dg}/><rect x="4" y="23" width="44" height="1" rx=".5" fill={g}/><rect x="4" y="25" width="40" height="1" rx=".5" fill={g}/><rect x="4" y="27" width="38" height="1" rx=".5" fill={g}/><rect x="4" y="29" width="42" height="1" rx=".5" fill={g}/><rect x="4" y="34" width="16" height="1.5" rx=".75" fill={dg}/><rect x="4" y="37" width="44" height="1" rx=".5" fill={g}/><rect x="4" y="39" width="38" height="1" rx=".5" fill={g}/><rect x="4" y="41" width="40" height="1" rx=".5" fill={g}/><rect x="4" y="46" width="16" height="1.5" rx=".75" fill={dg}/><rect x="4" y="49" width="36" height="1" rx=".5" fill={g}/><rect x="4" y="51" width="40" height="1" rx=".5" fill={g}/><rect x="4" y="53" width="32" height="1" rx=".5" fill={g}/></svg>;
    case "corporate": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect width="52" height="16" fill={c}/><rect x="2" y="3.5" width="22" height="2.5" rx="1" fill="white" opacity=".9"/><rect x="2" y="8" width="14" height="1.5" rx=".75" fill="white" opacity=".6"/><rect x="36" y="16" width="16" height="52" fill={dark}/><rect x="38" y="19" width="11" height="1.5" rx=".75" fill="white" opacity=".6"/><rect x="38" y="22" width="9" height="1" rx=".5" fill="white" opacity=".4"/><rect x="38" y="24.5" width="10" height="1" rx=".5" fill="white" opacity=".4"/><rect x="38" y="29" width="11" height="1.5" rx=".75" fill="white" opacity=".6"/><rect x="38" y="32" width="8" height="1" rx=".5" fill="white" opacity=".4"/><rect x="2" y="19" width="14" height="1.5" rx=".75" fill={dg}/><rect x="2" y="22" width="30" height="1" rx=".5" fill={g}/><rect x="2" y="24.5" width="26" height="1" rx=".5" fill={g}/><rect x="2" y="27" width="28" height="1" rx=".5" fill={g}/><rect x="2" y="32" width="14" height="1.5" rx=".75" fill={dg}/><rect x="2" y="35" width="30" height="1" rx=".5" fill={g}/><rect x="2" y="37.5" width="24" height="1" rx=".5" fill={g}/></svg>;
    case "timeline": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect x="2" y="3" width="22" height="3" rx="1" fill={dg}/><rect x="2" y="8" width="14" height="1.5" rx=".75" fill={c} opacity=".5"/><rect x="2" y="11" width="44" height=".5" fill={c} opacity=".4"/><rect x="10" y="14" width="1" height="54" fill={c} opacity=".2"/><circle cx="10.5" cy="18" r="2" fill={c}/><rect x="15" y="16.5" width="20" height="2" rx=".75" fill={dg}/><rect x="15" y="20" width="26" height="1" rx=".5" fill={g}/><rect x="15" y="22.5" width="22" height="1" rx=".5" fill={g}/><circle cx="10.5" cy="30" r="2" fill={c}/><rect x="15" y="28.5" width="18" height="2" rx=".75" fill={dg}/><rect x="15" y="32" width="26" height="1" rx=".5" fill={g}/><rect x="15" y="34.5" width="20" height="1" rx=".5" fill={g}/><circle cx="10.5" cy="42" r="2" fill={c}/><rect x="15" y="40.5" width="20" height="2" rx=".75" fill={dg}/><rect x="15" y="44" width="26" height="1" rx=".5" fill={g}/><rect x="15" y="46.5" width="18" height="1" rx=".5" fill={g}/><circle cx="10.5" cy="54" r="2" fill={c} opacity=".5"/><rect x="15" y="52.5" width="16" height="2" rx=".75" fill={dg}/><rect x="15" y="56" width="22" height="1" rx=".5" fill={g}/></svg>;
    case "metro": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect x="38" width="14" height="68" fill={c}/><rect x="2" y="4" width="30" height="5" rx="1" fill={dg}/><rect x="2" y="11" width="20" height="2" rx=".75" fill={c} opacity=".5"/><rect x="2" y="15" width="8" height="1" rx=".5" fill={g}/><rect x="2" y="20" width="10" height="1.5" rx=".75" fill={dg}/><rect x="2" y="23" width="32" height="1" rx=".5" fill={g}/><rect x="2" y="25.5" width="28" height="1" rx=".5" fill={g}/><rect x="2" y="28" width="24" height="1" rx=".5" fill={g}/><rect x="2" y="33" width="10" height="1.5" rx=".75" fill={dg}/><rect x="2" y="36" width="32" height="1" rx=".5" fill={g}/><rect x="2" y="38.5" width="24" height="1" rx=".5" fill={g}/><rect x="40" y="5" width="10" height="1" rx=".5" fill="white" opacity=".5"/><rect x="40" y="7.5" width="8" height="1" rx=".5" fill="white" opacity=".4"/><rect x="40" y="10" width="10" height="1" rx=".5" fill="white" opacity=".4"/><rect x="40" y="16" width="10" height="1.5" rx=".75" fill="white" opacity=".6"/><rect x="40" y="19" width="8" height="1" rx=".5" fill="white" opacity=".4"/><rect x="40" y="21.5" width="9" height="1" rx=".5" fill="white" opacity=".4"/><rect x="40" y="25" width="10" height="1" rx=".5" fill="white" opacity=".4"/></svg>;
    case "compact": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect width="52" height="12" fill={dark}/><rect x="2" y="3" width="20" height="2.5" rx="1" fill="white" opacity=".9"/><rect x="2" y="7.5" width="14" height="1.5" rx=".75" fill={c} opacity=".8"/><rect x="26" y="12" width=".5" height="56" fill={g}/><rect x="2" y="15" width="10" height="1.5" rx=".75" fill={dg}/><rect x="2" y="18" width="20" height="1" rx=".5" fill={g}/><rect x="2" y="20.5" width="18" height="1" rx=".5" fill={g}/><rect x="2" y="23" width="16" height="1" rx=".5" fill={g}/><rect x="2" y="27" width="10" height="1.5" rx=".75" fill={dg}/><rect x="2" y="30" width="20" height="1" rx=".5" fill={g}/><rect x="2" y="32.5" width="16" height="1" rx=".5" fill={g}/><rect x="29" y="15" width="10" height="1.5" rx=".75" fill={dg}/><rect x="29" y="18" width="20" height="1" rx=".5" fill={g}/><rect x="29" y="20.5" width="16" height="1" rx=".5" fill={g}/><rect x="29" y="23" width="18" height="1" rx=".5" fill={g}/><rect x="29" y="27" width="10" height="1.5" rx=".75" fill={dg}/><rect x="29" y="30" width="20" height="1" rx=".5" fill={g}/><rect x="29" y="32.5" width="14" height="1" rx=".5" fill={g}/></svg>;
    case "oxford": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect x="10" y="4" width="32" height="3.5" rx="1" fill={dg}/><rect x="15" y="9.5" width="22" height="1.5" rx=".75" fill={g}/><rect x="19" y="12.5" width="14" height="1" rx=".5" fill={g}/><rect x="6" y="17.5" width="8" height="1" rx=".5" fill={g}/><rect x="22" y="17.5" width="8" height="1" rx=".5" fill={g}/><rect x="38" y="17.5" width="8" height="1" rx=".5" fill={g}/><rect x="4" y="23" width="14" height="1.5" rx=".75" fill={dg}/><rect x="4" y="25" width="44" height=".5" fill="#111"/><rect x="4" y="27" width="40" height="1" rx=".5" fill={g}/><rect x="4" y="29.5" width="36" height="1" rx=".5" fill={g}/><rect x="4" y="32" width="34" height="1" rx=".5" fill={g}/><rect x="4" y="38" width="14" height="1.5" rx=".75" fill={dg}/><rect x="4" y="40" width="44" height=".5" fill="#111"/><rect x="4" y="42" width="36" height="1" rx=".5" fill={g}/><rect x="4" y="44.5" width="30" height="1" rx=".5" fill={g}/><rect x="4" y="50" width="14" height="1.5" rx=".75" fill={dg}/><rect x="4" y="52" width="44" height=".5" fill="#111"/><rect x="4" y="54" width="32" height="1" rx=".5" fill={g}/></svg>;
    case "tech": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect width="52" height="24" fill="#0f172a"/><rect x="2" y="3" width="12" height="1.5" rx=".75" fill={c} opacity=".6"/><rect x="2" y="7" width="26" height="3" rx="1" fill="white" opacity=".9"/><rect x="2" y="12" width="18" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="2" y="16" width="8" height="1" rx=".5" fill="white" opacity=".4"/><rect x="14" y="16" width="8" height="1" rx=".5" fill="white" opacity=".4"/><rect x="2" y="19.5" width="44" height="2" rx=".5" fill={c} opacity=".2"/><rect x="2" y="27" width="10" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="14" y="27.5" width="34" height=".5" fill={g}/><rect x="4" y="30.5" width="4" height="1" rx=".5" fill={c} opacity=".5"/><rect x="10" y="30.5" width="36" height="1" rx=".5" fill={g}/><rect x="4" y="33" width="4" height="1" rx=".5" fill={c} opacity=".5"/><rect x="10" y="33" width="30" height="1" rx=".5" fill={g}/><rect x="2" y="38" width="10" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="14" y="38.5" width="34" height=".5" fill={g}/><rect x="4" y="41.5" width="4" height="1" rx=".5" fill={c} opacity=".5"/><rect x="10" y="41.5" width="32" height="1" rx=".5" fill={g}/><rect x="4" y="44" width="4" height="1" rx=".5" fill={c} opacity=".5"/><rect x="10" y="44" width="26" height="1" rx=".5" fill={g}/></svg>;
    case "cards": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#f8fafc"/><rect width="52" height="12" fill="white"/><rect x="0" y="12" width="52" height="2" fill={c}/><rect x="2" y="2" width="22" height="3" rx="1" fill={dg}/><rect x="2" y="7" width="14" height="1.5" rx=".75" fill={c} opacity=".5"/><rect x="2" y="17" width="31" height="18" rx="2" fill="white" stroke={g} strokeWidth=".5"/><rect x="4" y="19" width="10" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="4" y="22" width="27" height="1" rx=".5" fill={g}/><rect x="4" y="24.5" width="23" height="1" rx=".5" fill={g}/><rect x="4" y="27" width="25" height="1" rx=".5" fill={g}/><rect x="35" y="17" width="15" height="18" rx="2" fill="white" stroke={g} strokeWidth=".5"/><rect x="37" y="19" width="10" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="37" y="22" width="11" height="1" rx=".5" fill={g}/><rect x="37" y="24.5" width="9" height="1" rx=".5" fill={g}/><rect x="2" y="38" width="31" height="18" rx="2" fill="white" stroke={g} strokeWidth=".5"/><rect x="4" y="40" width="10" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="4" y="43" width="25" height="1" rx=".5" fill={g}/><rect x="4" y="45.5" width="23" height="1" rx=".5" fill={g}/><rect x="35" y="38" width="15" height="18" rx="2" fill="white" stroke={g} strokeWidth=".5"/><rect x="37" y="40" width="10" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="37" y="43" width="11" height="1" rx=".5" fill={g}/></svg>;
    case "nordic": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect x="6" y="6" width="30" height="4" rx="1" fill={dg}/><rect x="6" y="12" width="20" height="2" rx=".75" fill={c} opacity=".3"/><rect x="6" y="16" width="36" height="1" rx=".5" fill={g}/><rect x="4" y="24" width="8" height="1" rx=".5" fill="#9ca3af"/><rect x="15" y="24.5" width="34" height=".5" fill={g}/><rect x="4" y="27" width="40" height="1" rx=".5" fill={g}/><rect x="4" y="29.5" width="36" height="1" rx=".5" fill={g}/><rect x="4" y="32" width="32" height="1" rx=".5" fill={g}/><rect x="4" y="39" width="8" height="1" rx=".5" fill="#9ca3af"/><rect x="15" y="39.5" width="34" height=".5" fill={g}/><rect x="4" y="42" width="40" height="1" rx=".5" fill={g}/><rect x="4" y="44.5" width="34" height="1" rx=".5" fill={g}/><rect x="4" y="51" width="8" height="1" rx=".5" fill="#9ca3af"/><rect x="15" y="51.5" width="34" height=".5" fill={g}/><rect x="4" y="54" width="36" height="1" rx=".5" fill={g}/><rect x="4" y="56.5" width="28" height="1" rx=".5" fill={g}/></svg>;
    case "creative": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect width="2" height="68" fill={c}/><rect x="2" width="17" height="68" fill="#18181b"/><circle cx="10" cy="12" r="6" fill={c} opacity=".3"/><rect x="4" y="21" width="12" height="2" rx=".75" fill="white" opacity=".8"/><rect x="4" y="25" width="10" height="1" rx=".5" fill={c} opacity=".7"/><rect x="4" y="30" width="12" height="1" rx=".5" fill="white" opacity=".4"/><rect x="4" y="32.5" width="10" height="1" rx=".5" fill="white" opacity=".4"/><rect x="4" y="35" width="11" height="1" rx=".5" fill="white" opacity=".4"/><rect x="4" y="40" width="10" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="4" y="43" width="12" height="1" rx=".5" fill="white" opacity=".4"/><rect x="4" y="45.5" width="11" height="1" rx=".5" fill="white" opacity=".4"/><rect x="23" y="5" width="10" height="1.5" rx=".75" fill={c} opacity=".6"/><rect x="23" y="7" width="26" height="1" rx=".5" fill={g}/><rect x="23" y="9.5" width="22" height="1" rx=".5" fill={g}/><rect x="23" y="18" width="10" height="1.5" rx=".75" fill={c} opacity=".6"/><rect x="23" y="21" width="26" height="1" rx=".5" fill={g}/><rect x="23" y="23.5" width="22" height="1" rx=".5" fill={g}/><rect x="23" y="26" width="18" height="1" rx=".5" fill={g}/><rect x="23" y="33" width="10" height="1.5" rx=".75" fill={c} opacity=".6"/><rect x="23" y="36" width="26" height="1" rx=".5" fill={g}/><rect x="23" y="38.5" width="20" height="1" rx=".5" fill={g}/></svg>;
    case "infographic": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect width="18" height="68" fill="#f1f5f9"/><rect x="18" width=".5" height="68" fill="#e2e8f0"/><circle cx="9" cy="12" r="6" fill="none" stroke={c} strokeWidth="1.5" opacity=".5"/><rect x="1" y="23" width="7" height="1.5" rx=".75" fill={dg}/><rect x="1" y="26.5" width="14" height="2" rx="1" fill={g}/><rect x="1" y="26.5" width="11" height="2" rx="1" fill={c} opacity=".6"/><rect x="1" y="30" width="14" height="2" rx="1" fill={g}/><rect x="1" y="30" width="8" height="2" rx="1" fill={c} opacity=".6"/><rect x="1" y="33.5" width="14" height="2" rx="1" fill={g}/><rect x="1" y="33.5" width="12" height="2" rx="1" fill={c} opacity=".6"/><rect x="1" y="37" width="14" height="2" rx="1" fill={g}/><rect x="1" y="37" width="9" height="2" rx="1" fill={c} opacity=".6"/><rect x="1" y="43" width="7" height="1.5" rx=".75" fill={dg}/><rect x="1" y="46.5" width="14" height="2" rx="1" fill={g}/><rect x="1" y="46.5" width="14" height="2" rx="1" fill={c} opacity=".6"/><rect x="1" y="50" width="14" height="2" rx="1" fill={g}/><rect x="1" y="50" width="10" height="2" rx="1" fill={c} opacity=".6"/><rect x="21" y="4" width="10" height="1.5" rx=".75" fill={c} opacity=".6"/><rect x="21" y="7" width="28" height="1" rx=".5" fill={g}/><rect x="21" y="9.5" width="24" height="1" rx=".5" fill={g}/><rect x="21" y="15" width="10" height="1.5" rx=".75" fill={c} opacity=".6"/><rect x="21" y="17" width="3" height="20" fill={c} opacity=".2"/><rect x="26" y="18" width="22" height="2" rx=".75" fill={dg}/><rect x="26" y="22" width="22" height="1" rx=".5" fill={g}/><rect x="26" y="24.5" width="18" height="1" rx=".5" fill={g}/><rect x="26" y="27" width="20" height="1" rx=".5" fill={g}/></svg>;
    case "split": return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#fff"/><rect width="26" height="68" fill="#fafafa"/><rect x="26" width=".5" height="68" fill="#e5e7eb"/><rect x="2" y="4" width="18" height="3" rx="1" fill={dg}/><rect x="2" y="9" width="12" height="1.5" rx=".75" fill={c} opacity=".5"/><rect x="2" y="13" width="7" height="1" rx=".5" fill={g}/><rect x="2" y="15.5" width="7" height="1" rx=".5" fill={g}/><rect x="2" y="18" width="7" height="1" rx=".5" fill={g}/><rect x="2" y="23" width="8" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="2" y="26" width="22" height="1" rx=".5" fill={g}/><rect x="2" y="28.5" width="18" height="1" rx=".5" fill={g}/><rect x="2" y="31" width="20" height="1" rx=".5" fill={g}/><rect x="2" y="36" width="8" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="2" y="39" width="22" height="1" rx=".5" fill={g}/><rect x="2" y="41.5" width="16" height="1" rx=".5" fill={g}/><rect x="29" y="5" width="8" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="29" y="8" width="20" height="1" rx=".5" fill={g}/><rect x="29" y="10.5" width="18" height="1" rx=".5" fill={g}/><rect x="29" y="13" width="16" height="1" rx=".5" fill={g}/><rect x="29" y="18" width="8" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="29" y="21" width="20" height="1" rx=".5" fill={g}/><rect x="29" y="23.5" width="16" height="1" rx=".5" fill={g}/><rect x="29" y="26" width="14" height="1" rx=".5" fill={g}/><rect x="29" y="31" width="8" height="1.5" rx=".75" fill={c} opacity=".7"/><rect x="29" y="34" width="20" height="1" rx=".5" fill={g}/><rect x="29" y="36.5" width="14" height="1" rx=".5" fill={g}/></svg>;
    default: return <svg width={w} height={h} viewBox={vb}><rect width="52" height="68" fill="#f3f4f6"/><rect x="4" y="4" width="44" height="60" rx="3" fill="#e5e7eb"/></svg>;
  }
}

// ─── Gallery Modal ────────────────────────────────────────────────────────────

function GalleryModal({ onClose, currentTemplate, currentTheme, onSelect }: {
  onClose: () => void; currentTemplate: string; currentTheme: number;
  onSelect: (id: string, ti: number) => void;
}) {
  const [cat, setCat] = useState("All");
  const [hoverMap, setHoverMap] = useState<Record<string, number>>({});

  const cats = ["All", ...Array.from(new Set(TEMPLATE_META.map(t => t.category)))];
  const shown = cat === "All" ? TEMPLATE_META : TEMPLATE_META.filter(t => t.category === cat);

  const effectiveIdx = (id: string) => hoverMap[id] ?? currentTheme;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-surface w-full max-w-5xl rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Choose a Template</h2>
            <p className="text-xs text-foreground-secondary mt-0.5">20 unique layouts · 10 colors each · Hover a color dot to preview</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-foreground/5 text-foreground-secondary hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 px-5 py-3 border-b border-border overflow-x-auto shrink-0">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${cat === c ? "bg-primary text-white" : "bg-surface border border-border text-foreground-secondary hover:border-primary/50 hover:text-foreground"}`}
            >{c}</button>
          ))}
        </div>

        {/* Grid */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto max-h-[60vh]">
          {shown.map(tmpl => {
            const ci = effectiveIdx(tmpl.id);
            const col = THEMES[ci].color;
            const isActive = currentTemplate === tmpl.id && currentTheme === ci;
            return (
              <div key={tmpl.id}
                onClick={() => { onSelect(tmpl.id, ci); onClose(); }}
                className={`relative rounded-xl border-2 p-2 cursor-pointer transition-all hover:shadow-md ${isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"}`}
              >
                {isActive && <div className="absolute top-2 right-2 z-10"><CheckCircle className="w-4 h-4 text-primary" /></div>}
                <div className="flex justify-center mb-2 rounded-lg overflow-hidden border border-border/50 bg-white">
                  <TemplateThumbnail id={tmpl.id} color={col} w={76} h={99} />
                </div>
                <p className="text-[11px] font-bold text-foreground leading-tight">{tmpl.label}</p>
                <p className="text-[9px] text-foreground-secondary mt-0.5 leading-tight mb-2">{tmpl.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {THEMES.map((th, ti) => (
                    <button key={th.id}
                      onMouseEnter={() => setHoverMap(m => ({ ...m, [tmpl.id]: ti }))}
                      onMouseLeave={() => setHoverMap(m => { const n = { ...m }; delete n[tmpl.id]; return n; })}
                      onClick={e => { e.stopPropagation(); onSelect(tmpl.id, ti); onClose(); }}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${ci === ti ? "border-foreground scale-110" : "border-transparent hover:scale-110"}`}
                      style={{ background: th.color }} title={th.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = "info" | "work" | "edu" | "skills" | "more" | "design";

export default function ResumeBuilderPage() {
  const [data, setData] = useState<ResumeData>(() => {
    if (typeof window !== "undefined") { try { const s = localStorage.getItem("resume-builder-v2"); if (s) return JSON.parse(s); } catch {} }
    return buildDefault();
  });
  const [template, setTemplate] = useState("modern");
  const [themeIdx, setThemeIdx] = useState(0);
  const [tab, setTab] = useState<Tab>("info");
  const [skillInput, setSkillInput] = useState("");
  const [exporting, setExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.55);
  const [showPreview, setShowPreview] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [fontId, setFontId] = useState("system");
  const [spacingId, setSpacingId] = useState("normal");
  const [jobDesc, setJobDesc] = useState("");
  const [savedBadge, setSavedBadge] = useState(false);
  const [showJobMatch, setShowJobMatch] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const color = THEMES[themeIdx].color;
  const font = FONTS.find(f => f.id === fontId)?.value ?? FONTS[0].value;
  const spacing = SPACINGS.find(s => s.id === spacingId)?.value ?? 1.0;

  useEffect(() => {
    const update = () => { if (containerRef.current) { const w = containerRef.current.clientWidth - 28; setPreviewScale(Math.min(w / 794, 0.72)); } };
    update(); window.addEventListener("resize", update); return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => { const t = setTimeout(() => { localStorage.setItem("resume-builder-v2", JSON.stringify(data)); }, 800); return () => clearTimeout(t); }, [data]);

  const set = (field: keyof ResumeData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setData(d => ({ ...d, [field]: e.target.value }));

  const addExp = () => setData(d => ({ ...d, experience: [{ id:uid(), company:"", title:"", location:"", startDate:"", endDate:"", current:false, bullets:[""] }, ...d.experience] }));
  const delExp = (id: string) => setData(d => ({ ...d, experience: d.experience.filter(e => e.id !== id) }));
  const moveExp = (id: string, dir: -1|1) => setData(d => { const a = [...d.experience]; const i = a.findIndex(e => e.id === id); if (i+dir<0||i+dir>=a.length) return d; [a[i],a[i+dir]]=[a[i+dir],a[i]]; return { ...d, experience:a }; });
  const updExp = (id: string, field: keyof Exp, val: string|boolean|string[]) => setData(d => ({ ...d, experience: d.experience.map(e => e.id===id ? { ...e, [field]:val } : e) }));

  const addEdu = () => setData(d => ({ ...d, education: [{ id:uid(), school:"", degree:"", field:"", startDate:"", endDate:"", gpa:"", honors:"" }, ...d.education] }));
  const delEdu = (id: string) => setData(d => ({ ...d, education: d.education.filter(e => e.id !== id) }));
  const updEdu = (id: string, field: keyof Edu, val: string) => setData(d => ({ ...d, education: d.education.map(e => e.id===id ? { ...e, [field]:val } : e) }));

  const addSkill = useCallback(() => { const s = skillInput.trim(); if (!s||data.skills.includes(s)) { setSkillInput(""); return; } setData(d => ({ ...d, skills:[...d.skills,s] })); setSkillInput(""); }, [skillInput,data.skills]);
  const delSkill = (s: string) => setData(d => ({ ...d, skills: d.skills.filter(x => x !== s) }));

  const addCert = () => setData(d => ({ ...d, certifications:[...d.certifications,{ id:uid(), name:"", issuer:"", date:"", url:"" }] }));
  const delCert = (id: string) => setData(d => ({ ...d, certifications: d.certifications.filter(c => c.id !== id) }));
  const updCert = (id: string, field: keyof Cert, val: string) => setData(d => ({ ...d, certifications: d.certifications.map(c => c.id===id ? { ...c, [field]:val } : c) }));

  const addProj = () => setData(d => ({ ...d, projects:[...d.projects,{ id:uid(), name:"", description:"", link:"", tech:"" }] }));
  const delProj = (id: string) => setData(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) }));
  const updProj = (id: string, field: keyof Proj, val: string) => setData(d => ({ ...d, projects: d.projects.map(p => p.id===id ? { ...p, [field]:val } : p) }));

  const addLang = () => setData(d => ({ ...d, languages:[...d.languages,{ id:uid(), name:"", level:"fluent" }] }));
  const delLang = (id: string) => setData(d => ({ ...d, languages: d.languages.filter(l => l.id !== id) }));
  const updLang = (id: string, field: keyof Language, val: string) => setData(d => ({ ...d, languages: d.languages.map(l => l.id===id ? { ...l, [field]:val } : l) }));

  const addAward = () => setData(d => ({ ...d, awards:[...d.awards,{ id:uid(), title:"", issuer:"", date:"", description:"" }] }));
  const delAward = (id: string) => setData(d => ({ ...d, awards: d.awards.filter(a => a.id !== id) }));
  const updAward = (id: string, field: keyof Award, val: string) => setData(d => ({ ...d, awards: d.awards.map(a => a.id===id ? { ...a, [field]:val } : a) }));

  const addVol = () => setData(d => ({ ...d, volunteer:[...d.volunteer,{ id:uid(), org:"", role:"", startDate:"", endDate:"", current:false, description:"" }] }));
  const delVol = (id: string) => setData(d => ({ ...d, volunteer: d.volunteer.filter(v => v.id !== id) }));
  const updVol = (id: string, field: keyof Volunteer, val: string|boolean) => setData(d => ({ ...d, volunteer: d.volunteer.map(v => v.id===id ? { ...v, [field]:val } : v) }));

  const addPub = () => setData(d => ({ ...d, publications:[...d.publications,{ id:uid(), title:"", publisher:"", date:"", url:"" }] }));
  const delPub = (id: string) => setData(d => ({ ...d, publications: d.publications.filter(p => p.id !== id) }));
  const updPub = (id: string, field: keyof Publication, val: string) => setData(d => ({ ...d, publications: d.publications.map(p => p.id===id ? { ...p, [field]:val } : p) }));

  const moveSection = (key: SectionKey, dir: -1|1) => setData(d => { const a=[...d.sectionOrder]; const i=a.indexOf(key); if(i+dir<0||i+dir>=a.length) return d; [a[i],a[i+dir]]=[a[i+dir],a[i]]; return {...d,sectionOrder:a}; });
  const toggleSection = (key: SectionKey) => setData(d => ({ ...d, sectionVisible:{ ...d.sectionVisible,[key]:!d.sectionVisible[key] } }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => { const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>setData(d=>({...d,photo:ev.target?.result as string??""})); r.readAsDataURL(f); };

  const handleSave = () => { localStorage.setItem("resume-builder-v2", JSON.stringify(data)); setSavedBadge(true); setTimeout(()=>setSavedBadge(false),2000); };

  const exportPDF = async () => {
    if (!previewRef.current) return; setExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().from(previewRef.current).set({ margin:0, filename:`${(data.name||"resume").replace(/\s+/g,"-")}.pdf`, image:{type:"jpeg",quality:0.99}, html2canvas:{scale:2.5,useCORS:true,letterRendering:true,backgroundColor:"#ffffff"}, jsPDF:{unit:"mm",format:"a4",orientation:"portrait" as const} }).save();
    } finally { setExporting(false); }
  };

  const ats = useMemo(() => calcATS(data, template), [data, template]);
  const jobMatch = useMemo(() => {
    if (!jobDesc.trim()) return null;
    const jdk = extractKeywords(jobDesc); const rt = resumeText(data);
    const matched = jdk.filter(k => rt.includes(k));
    return { matched:matched.length, total:jdk.length, missing:jdk.filter(k=>!rt.includes(k)).slice(0,20) };
  }, [jobDesc, data]);

  const TemplateComp = TEMPLATE_COMPONENTS[template] ?? TEMPLATE_COMPONENTS.modern;
  const atsColor = ats.total>=75?"text-green-600":ats.total>=50?"text-yellow-600":"text-red-500";
  const atsRingColor = ats.total>=75?"#16a34a":ats.total>=50?"#ca8a04":"#ef4444";

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id:"info",   label:"Info",      icon:<User className="w-3.5 h-3.5"/> },
    { id:"work",   label:"Work",      icon:<Briefcase className="w-3.5 h-3.5"/> },
    { id:"edu",    label:"Education", icon:<GraduationCap className="w-3.5 h-3.5"/> },
    { id:"skills", label:"Skills",    icon:<Wrench className="w-3.5 h-3.5"/> },
    { id:"more",   label:"More",      icon:<Star className="w-3.5 h-3.5"/> },
    { id:"design", label:"Design",    icon:<Sliders className="w-3.5 h-3.5"/> },
  ];

  const worstItem = ats.items.filter(i => i.score < i.max).sort((a,b) => (a.score/a.max)-(b.score/b.max))[0];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {showGallery && <GalleryModal onClose={()=>setShowGallery(false)} currentTemplate={template} currentTheme={themeIdx} onSelect={(t,ti)=>{setTemplate(t);setThemeIdx(ti);}} />}

      {/* Header */}
      <div className="max-w-350 mx-auto px-4 md:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="tool-hero p-5 sm:p-7">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-sm font-semibold mb-5 transition-colors"><ArrowLeft className="w-4 h-4"/>Back to Tools</Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-primary"/>
              </div>
              <div>
                <h1 className="type-h1 font-display gradient-text mb-1">Resume / CV Builder</h1>
                <p className="text-foreground-secondary text-sm"><span className="font-medium text-primary">20 unique templates</span> · 10 colors · ATS score · Job matcher · PDF export · 100% private</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-sm font-semibold ${atsColor}`}><CheckCircle className="w-3.5 h-3.5"/>ATS {ats.total}/100</div>
              <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-foreground-secondary hover:text-foreground transition-colors"><Save className="w-4 h-4"/>{savedBadge?"Saved!":"Save"}</button>
              <button onClick={()=>setData(buildDefault())} title="Reset to sample" className="p-2 rounded-xl border border-border text-foreground-secondary hover:text-foreground transition-colors"><RotateCcw className="w-4 h-4"/></button>
              <button className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-foreground-secondary hover:text-foreground transition-colors" onClick={()=>setShowPreview(s=>!s)}>
                {showPreview?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}{showPreview?"Edit":"Preview"}
              </button>
              <button onClick={exportPDF} disabled={exporting} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-sm">
                <Download className="w-4 h-4"/>{exporting?"Generating…":"Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-350 mx-auto px-4 md:px-6 lg:px-8 pb-16">
        <div className="mt-4 flex flex-col lg:flex-row gap-5">

          {/* ── Left Panel ─────────────────────────────────────────────────── */}
          <div className={`lg:w-105 shrink-0 flex flex-col gap-4 ${showPreview?"hidden lg:flex":"flex"}`}>

            {/* Template Picker with visual thumbnails */}
            <div className="glass-card-premium p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-foreground-secondary font-semibold uppercase tracking-wide">Template</p>
                <button onClick={()=>setShowGallery(true)} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"><LayoutGrid className="w-3.5 h-3.5"/>Browse All 20</button>
              </div>
              <div className="grid grid-cols-5 gap-1.5 mb-4">
                {TEMPLATE_META.map(t => (
                  <button key={t.id} onClick={()=>setTemplate(t.id)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 transition-all ${template===t.id?"border-primary bg-primary/5 shadow-sm":"border-border hover:border-primary/40"}`}
                    title={t.desc}
                  >
                    <div className="rounded overflow-hidden border border-border/40">
                      <TemplateThumbnail id={t.id} color={color} w={36} h={47}/>
                    </div>
                    <span className={`text-[8px] font-semibold leading-none ${template===t.id?"text-primary":"text-foreground-secondary"}`}>{t.label}</span>
                  </button>
                ))}
              </div>
              {template !== "ats" && (
                <div>
                  <p className="text-[10px] text-foreground-secondary font-medium uppercase tracking-wide mb-1.5">Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {THEMES.map((th,i) => (
                      <button key={th.id} onClick={()=>setThemeIdx(i)}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${themeIdx===i?"scale-110 border-foreground":"border-transparent hover:scale-105"}`}
                        style={{ background: th.color }} title={th.id}
                      />
                    ))}
                  </div>
                </div>
              )}
              {template === "ats" && (
                <div className="flex items-start gap-2 text-xs text-green-700 bg-green-50 border border-green-200/60 rounded-lg px-3 py-2"><CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5"/>ATS-Safe uses plain formatting — no columns, no colors — for maximum compatibility.</div>
              )}
            </div>

            {/* ATS Score Widget — always visible */}
            <div className={`rounded-xl border p-3 ${ats.total>=75?"bg-green-50 border-green-200/60":ats.total>=50?"bg-yellow-50 border-yellow-200/60":"bg-red-50 border-red-200/60"}`}>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0">
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="15" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
                    <circle cx="20" cy="20" r="15" fill="none" stroke={atsRingColor} strokeWidth="4"
                      strokeDasharray={`${2*Math.PI*15*ats.total/100} ${2*Math.PI*15*(1-ats.total/100)}`}
                      strokeLinecap="round" transform="rotate(-90 20 20)"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-black" style={{color:atsRingColor}}>{ats.total}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{color:atsRingColor}}>{ats.total>=75?"Strong ATS":ats.total>=50?"Good ATS":"Weak ATS"} · {ats.total}/100</span>
                    <button onClick={()=>setTab("design")} className="text-[10px] text-primary hover:underline font-medium">Details →</button>
                  </div>
                  {worstItem && <p className="text-[10px] text-foreground-secondary mt-0.5 truncate"><AlertCircle className="w-2.5 h-2.5 inline mr-0.5"/>{worstItem.label}: {worstItem.tip.slice(0,50)}</p>}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="glass-card-premium overflow-hidden">
              <div className="flex border-b border-border overflow-x-auto">
                {TABS.map(t => (
                  <button key={t.id} onClick={()=>setTab(t.id)}
                    className={`flex items-center gap-1 px-2.5 py-2.5 text-[10px] font-semibold whitespace-nowrap border-b-2 transition-colors ${tab===t.id?"border-primary text-primary":"border-transparent text-foreground-secondary hover:text-foreground"}`}
                  >{t.icon}{t.label}</button>
                ))}
              </div>

              <div className="p-4 overflow-y-auto max-h-[calc(100vh-380px)]">

                {/* ── Info ─────────────────────────────────────────────────── */}
                {tab === "info" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-surface border border-border overflow-hidden flex items-center justify-center shrink-0">
                        {data.photo?<img src={data.photo} alt="" className="w-full h-full object-cover"/>:<User className="w-6 h-6 text-foreground-secondary/40"/>}
                      </div>
                      <div>
                        <button onClick={()=>photoInputRef.current?.click()} className="text-xs text-primary hover:underline font-medium">Upload Photo</button>
                        {data.photo&&<button onClick={()=>setData(d=>({...d,photo:""}))} className="ml-3 text-xs text-red-400 hover:text-red-600">Remove</button>}
                        <p className="text-[10px] text-foreground-secondary mt-0.5">Optional · for European-style CV</p>
                        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto}/>
                      </div>
                    </div>
                    <div><label className={lc}>Full Name</label><input className={ic} value={data.name} onChange={set("name")} placeholder="Alex Johnson"/></div>
                    <div><label className={lc}>Job Title</label><input className={ic} value={data.title} onChange={set("title")} placeholder="Senior Software Engineer"/></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={lc}>Email</label><input className={ic} value={data.email} onChange={set("email")} placeholder="you@email.com"/></div>
                      <div><label className={lc}>Phone</label><input className={ic} value={data.phone} onChange={set("phone")} placeholder="+1 555 000 0000"/></div>
                    </div>
                    <div><label className={lc}>Location</label><input className={ic} value={data.location} onChange={set("location")} placeholder="City, State"/></div>
                    <div><label className={lc}>LinkedIn</label><input className={ic} value={data.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/you"/></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={lc}>GitHub</label><input className={ic} value={data.github} onChange={set("github")} placeholder="github.com/you"/></div>
                      <div><label className={lc}>Website</label><input className={ic} value={data.website} onChange={set("website")} placeholder="yoursite.com"/></div>
                    </div>
                    <div>
                      <label className={lc}>Professional Summary</label>
                      <textarea className={`${ic} resize-none`} rows={5} value={data.summary} onChange={set("summary")} placeholder="2–4 sentences highlighting your experience, strengths, and goals. Aim for 40–60 words."/>
                      <p className="text-[10px] text-foreground-secondary mt-1">{data.summary.trim().split(/\s+/).filter(Boolean).length} words · aim for 40–60</p>
                    </div>
                  </div>
                )}

                {/* ── Work ─────────────────────────────────────────────────── */}
                {tab === "work" && (
                  <div>
                    <button onClick={addExp} className="w-full mb-4 flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-border text-xs text-foreground-secondary hover:border-primary/50 hover:text-primary transition-colors">
                      <Plus className="w-3.5 h-3.5"/>Add Position
                    </button>
                    {data.experience.map((exp, idx) => (
                      <div key={exp.id} className="mb-4 rounded-xl border border-border p-3 bg-surface/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-foreground truncate max-w-42.5">{exp.title||exp.company||`Position ${idx+1}`}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={()=>moveExp(exp.id,-1)} className="p-1 text-foreground-secondary hover:text-foreground"><ChevronUp className="w-3.5 h-3.5"/></button>
                            <button onClick={()=>moveExp(exp.id,1)} className="p-1 text-foreground-secondary hover:text-foreground"><ChevronDown className="w-3.5 h-3.5"/></button>
                            <button onClick={()=>delExp(exp.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <div><label className={lc}>Job Title</label><input className={ic} value={exp.title} onChange={e=>updExp(exp.id,"title",e.target.value)} placeholder="Software Engineer"/></div>
                            <div><label className={lc}>Company</label><input className={ic} value={exp.company} onChange={e=>updExp(exp.id,"company",e.target.value)} placeholder="Acme Inc."/></div>
                          </div>
                          <div><label className={lc}>Location</label><input className={ic} value={exp.location} onChange={e=>updExp(exp.id,"location",e.target.value)} placeholder="City, State / Remote"/></div>
                          <div className="grid grid-cols-2 gap-2">
                            <div><label className={lc}>Start</label><input type="month" className={ic} value={exp.startDate} onChange={e=>updExp(exp.id,"startDate",e.target.value)}/></div>
                            <div><label className={lc}>End</label><input type="month" className={ic} value={exp.endDate} onChange={e=>updExp(exp.id,"endDate",e.target.value)} disabled={exp.current}/></div>
                          </div>
                          <label className="flex items-center gap-2 text-xs text-foreground-secondary cursor-pointer">
                            <input type="checkbox" checked={exp.current} onChange={e=>{updExp(exp.id,"current",e.target.checked);if(e.target.checked)updExp(exp.id,"endDate","");}} className="rounded"/>Currently working here
                          </label>
                          <div>
                            <label className={lc}>Bullet Points <span className="text-foreground-secondary/50">(one per line · start with action verbs)</span></label>
                            <textarea className={`${ic} resize-none`} rows={4} value={exp.bullets.join("\n")} onChange={e=>updExp(exp.id,"bullets",e.target.value.split("\n"))} placeholder={"Led team of 5 engineers...\nReduced latency by 40%..."}/>
                            <p className="text-[10px] text-foreground-secondary mt-1">Start with Led, Built, Reduced, Improved, Launched…</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Education ─────────────────────────────────────────────── */}
                {tab === "edu" && (
                  <div>
                    <button onClick={addEdu} className="w-full mb-4 flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-border text-xs text-foreground-secondary hover:border-primary/50 hover:text-primary transition-colors">
                      <Plus className="w-3.5 h-3.5"/>Add Education
                    </button>
                    {data.education.map((edu, idx) => (
                      <div key={edu.id} className="mb-4 rounded-xl border border-border p-3 bg-surface/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-foreground">{edu.school||`School ${idx+1}`}</span>
                          <button onClick={()=>delEdu(edu.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                        <div className="flex flex-col gap-2.5">
                          <div><label className={lc}>School / University</label><input className={ic} value={edu.school} onChange={e=>updEdu(edu.id,"school",e.target.value)} placeholder="UC Berkeley"/></div>
                          <div className="grid grid-cols-2 gap-2">
                            <div><label className={lc}>Degree</label><input className={ic} value={edu.degree} onChange={e=>updEdu(edu.id,"degree",e.target.value)} placeholder="Bachelor of Science"/></div>
                            <div><label className={lc}>Field of Study</label><input className={ic} value={edu.field} onChange={e=>updEdu(edu.id,"field",e.target.value)} placeholder="Computer Science"/></div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><label className={lc}>Start</label><input type="month" className={ic} value={edu.startDate} onChange={e=>updEdu(edu.id,"startDate",e.target.value)}/></div>
                            <div><label className={lc}>End</label><input type="month" className={ic} value={edu.endDate} onChange={e=>updEdu(edu.id,"endDate",e.target.value)}/></div>
                            <div><label className={lc}>GPA</label><input className={ic} value={edu.gpa} onChange={e=>updEdu(edu.id,"gpa",e.target.value)} placeholder="3.8"/></div>
                          </div>
                          <div><label className={lc}>Honors</label><input className={ic} value={edu.honors} onChange={e=>updEdu(edu.id,"honors",e.target.value)} placeholder="Magna Cum Laude"/></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Skills ───────────────────────────────────────────────── */}
                {tab === "skills" && (
                  <div>
                    <label className={lc}>Add Skill</label>
                    <div className="flex gap-2 mb-3">
                      <input className={`${ic} flex-1`} value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();addSkill();}}} placeholder="Type skill and press Enter"/>
                      <button onClick={addSkill} className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"><Plus className="w-4 h-4"/></button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {data.skills.map(s => (
                        <span key={s} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                          {s}<button onClick={()=>delSkill(s)} className="hover:text-red-500 transition-colors">×</button>
                        </span>
                      ))}
                      {data.skills.length===0&&<p className="text-xs text-foreground-secondary italic">No skills added yet.</p>}
                    </div>
                    <p className="text-xs text-foreground-secondary mb-4">{data.skills.length} skills · Aim for 8–15 keywords</p>
                    <div className="p-3 bg-surface rounded-xl border border-border">
                      <p className="text-xs font-semibold text-foreground mb-2">Quick add by category:</p>
                      {[
                        { cat:"Frontend",  skills:["React","Vue","TypeScript","Next.js","Tailwind CSS"] },
                        { cat:"Backend",   skills:["Node.js","Python","Go","Java","PostgreSQL","Redis"] },
                        { cat:"DevOps",    skills:["AWS","Docker","Kubernetes","CI/CD","Terraform"] },
                        { cat:"Soft",      skills:["Leadership","Communication","Agile","Problem Solving"] },
                      ].map(({cat,skills})=>(
                        <div key={cat} className="mb-2">
                          <p className="text-[10px] text-foreground-secondary uppercase tracking-wide mb-1">{cat}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {skills.filter(s=>!data.skills.includes(s)).map(s=>(
                              <button key={s} onClick={()=>setData(d=>({...d,skills:[...d.skills,s]}))} className="text-[10px] px-2 py-1 rounded-full border border-border text-foreground-secondary hover:border-primary/50 hover:text-primary transition-colors">+ {s}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── More ─────────────────────────────────────────────────── */}
                {tab === "more" && (
                  <div className="flex flex-col gap-5">
                    {/* Certifications */}
                    <div>
                      <div className="flex items-center justify-between mb-2"><p className="text-xs font-semibold text-foreground uppercase tracking-wide">Certifications</p><button onClick={addCert} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="w-3 h-3"/>Add</button></div>
                      {data.certifications.map(c=>(
                        <div key={c.id} className="mb-3 rounded-xl border border-border p-3 bg-surface/30">
                          <div className="flex justify-end mb-2"><button onClick={()=>delCert(c.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button></div>
                          <div className="grid grid-cols-2 gap-2">
                            <div><label className={lc}>Name</label><input className={ic} value={c.name} onChange={e=>updCert(c.id,"name",e.target.value)} placeholder="AWS Solutions Architect"/></div>
                            <div><label className={lc}>Issuer</label><input className={ic} value={c.issuer} onChange={e=>updCert(c.id,"issuer",e.target.value)} placeholder="Amazon"/></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div><label className={lc}>Date</label><input type="month" className={ic} value={c.date} onChange={e=>updCert(c.id,"date",e.target.value)}/></div>
                            <div><label className={lc}>URL (opt.)</label><input className={ic} value={c.url} onChange={e=>updCert(c.id,"url",e.target.value)} placeholder="credly.com/..."/></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Projects */}
                    <div>
                      <div className="flex items-center justify-between mb-2"><p className="text-xs font-semibold text-foreground uppercase tracking-wide">Projects</p><button onClick={addProj} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="w-3 h-3"/>Add</button></div>
                      {data.projects.map(p=>(
                        <div key={p.id} className="mb-3 rounded-xl border border-border p-3 bg-surface/30">
                          <div className="flex justify-end mb-2"><button onClick={()=>delProj(p.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button></div>
                          <div><label className={lc}>Project Name</label><input className={ic} value={p.name} onChange={e=>updProj(p.id,"name",e.target.value)} placeholder="OpenDeploy"/></div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div><label className={lc}>Tech Stack</label><input className={ic} value={p.tech} onChange={e=>updProj(p.id,"tech",e.target.value)} placeholder="React, Node.js"/></div>
                            <div><label className={lc}>Link (opt.)</label><input className={ic} value={p.link} onChange={e=>updProj(p.id,"link",e.target.value)} placeholder="github.com/you/project"/></div>
                          </div>
                          <div className="mt-2"><label className={lc}>Description</label><textarea className={`${ic} resize-none`} rows={2} value={p.description} onChange={e=>updProj(p.id,"description",e.target.value)} placeholder="What it does, tech used, impact."/></div>
                        </div>
                      ))}
                    </div>

                    {/* Languages */}
                    <div>
                      <div className="flex items-center justify-between mb-2"><p className="text-xs font-semibold text-foreground uppercase tracking-wide">Languages</p><button onClick={addLang} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="w-3 h-3"/>Add</button></div>
                      {data.languages.map(l=>(
                        <div key={l.id} className="mb-2 flex gap-2 items-center">
                          <input className={`${ic} flex-1`} value={l.name} onChange={e=>updLang(l.id,"name",e.target.value)} placeholder="English"/>
                          <select className={`${ic} w-36`} value={l.level} onChange={e=>updLang(l.id,"level",e.target.value)}>
                            {LANG_LEVELS.map(lv=><option key={lv} value={lv}>{lv.charAt(0).toUpperCase()+lv.slice(1)}</option>)}
                          </select>
                          <button onClick={()=>delLang(l.id)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      ))}
                    </div>

                    {/* Awards */}
                    <div>
                      <div className="flex items-center justify-between mb-2"><p className="text-xs font-semibold text-foreground uppercase tracking-wide">Awards & Honors</p><button onClick={addAward} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="w-3 h-3"/>Add</button></div>
                      {data.awards.map(a=>(
                        <div key={a.id} className="mb-3 rounded-xl border border-border p-3 bg-surface/30">
                          <div className="flex justify-end mb-2"><button onClick={()=>delAward(a.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button></div>
                          <div><label className={lc}>Award Title</label><input className={ic} value={a.title} onChange={e=>updAward(a.id,"title",e.target.value)} placeholder="Engineer of the Year"/></div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div><label className={lc}>Issuer</label><input className={ic} value={a.issuer} onChange={e=>updAward(a.id,"issuer",e.target.value)} placeholder="Company / Org"/></div>
                            <div><label className={lc}>Date</label><input type="month" className={ic} value={a.date} onChange={e=>updAward(a.id,"date",e.target.value)}/></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Volunteer */}
                    <div>
                      <div className="flex items-center justify-between mb-2"><p className="text-xs font-semibold text-foreground uppercase tracking-wide">Volunteer</p><button onClick={addVol} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="w-3 h-3"/>Add</button></div>
                      {data.volunteer.map(v=>(
                        <div key={v.id} className="mb-3 rounded-xl border border-border p-3 bg-surface/30">
                          <div className="flex justify-end mb-2"><button onClick={()=>delVol(v.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button></div>
                          <div className="grid grid-cols-2 gap-2">
                            <div><label className={lc}>Role</label><input className={ic} value={v.role} onChange={e=>updVol(v.id,"role",e.target.value)} placeholder="Mentor"/></div>
                            <div><label className={lc}>Organization</label><input className={ic} value={v.org} onChange={e=>updVol(v.id,"org",e.target.value)} placeholder="Code for Good"/></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div><label className={lc}>Start</label><input type="month" className={ic} value={v.startDate} onChange={e=>updVol(v.id,"startDate",e.target.value)}/></div>
                            <div><label className={lc}>End</label><input type="month" className={ic} value={v.endDate} onChange={e=>updVol(v.id,"endDate",e.target.value)} disabled={v.current}/></div>
                          </div>
                          <label className="flex items-center gap-2 text-xs text-foreground-secondary cursor-pointer mt-1.5">
                            <input type="checkbox" checked={v.current} onChange={e=>{updVol(v.id,"current",e.target.checked);if(e.target.checked)updVol(v.id,"endDate","");}} className="rounded"/>Currently active
                          </label>
                          <div className="mt-2"><label className={lc}>Description (opt.)</label><input className={ic} value={v.description} onChange={e=>updVol(v.id,"description",e.target.value)} placeholder="Key contribution."/></div>
                        </div>
                      ))}
                    </div>

                    {/* Publications */}
                    <div>
                      <div className="flex items-center justify-between mb-2"><p className="text-xs font-semibold text-foreground uppercase tracking-wide">Publications</p><button onClick={addPub} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="w-3 h-3"/>Add</button></div>
                      {data.publications.map(p=>(
                        <div key={p.id} className="mb-3 rounded-xl border border-border p-3 bg-surface/30">
                          <div className="flex justify-end mb-2"><button onClick={()=>delPub(p.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button></div>
                          <div><label className={lc}>Title</label><input className={ic} value={p.title} onChange={e=>updPub(p.id,"title",e.target.value)} placeholder="Paper or article title"/></div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div><label className={lc}>Publisher / Journal</label><input className={ic} value={p.publisher} onChange={e=>updPub(p.id,"publisher",e.target.value)} placeholder="IEEE, Nature, etc."/></div>
                            <div><label className={lc}>Date</label><input type="month" className={ic} value={p.date} onChange={e=>updPub(p.id,"date",e.target.value)}/></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Design ───────────────────────────────────────────────── */}
                {tab === "design" && (
                  <div className="flex flex-col gap-5">
                    {/* Font */}
                    <div>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Font Family</p>
                      <div className="flex flex-col gap-1.5">
                        {FONTS.map(f=>(
                          <button key={f.id} onClick={()=>setFontId(f.id)} className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all ${fontId===f.id?"border-primary bg-primary/5":"border-border hover:border-primary/40"}`}>
                            <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${fontId===f.id?"border-primary bg-primary":"border-border"}`}/>
                            <p className="text-sm font-medium text-foreground" style={{fontFamily:f.value}}>{f.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spacing */}
                    <div>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Spacing</p>
                      <div className="flex gap-2">
                        {SPACINGS.map(sp=>(
                          <button key={sp.id} onClick={()=>setSpacingId(sp.id)} className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${spacingId===sp.id?"border-primary bg-primary text-white":"border-border text-foreground-secondary hover:border-primary/50"}`}>{sp.label}</button>
                        ))}
                      </div>
                    </div>

                    {/* Section visibility & order */}
                    <div>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Sections — Show / Reorder</p>
                      <div className="flex flex-col gap-1.5">
                        {data.sectionOrder.map((key, idx)=>(
                          <div key={key} className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${data.sectionVisible[key]?"border-border bg-surface/30":"border-border/50 bg-surface/10 opacity-50"}`}>
                            <div className="flex flex-col gap-0.5">
                              <button onClick={()=>moveSection(key,-1)} disabled={idx===0} className="p-0.5 text-foreground-secondary hover:text-foreground disabled:opacity-30"><ChevronUp className="w-3 h-3"/></button>
                              <button onClick={()=>moveSection(key,1)} disabled={idx===data.sectionOrder.length-1} className="p-0.5 text-foreground-secondary hover:text-foreground disabled:opacity-30"><ChevronDown className="w-3 h-3"/></button>
                            </div>
                            <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">{SECTION_ICONS[key]}</div>
                            <span className="flex-1 text-xs font-medium text-foreground">{SECTION_LABELS[key]}</span>
                            <button onClick={()=>toggleSection(key)} className={`p-1.5 rounded-lg transition-colors ${data.sectionVisible[key]?"text-primary bg-primary/10 hover:bg-primary/20":"text-foreground-secondary bg-surface hover:bg-foreground/5"}`}>
                              {data.sectionVisible[key]?<Eye className="w-3 h-3"/>:<EyeOff className="w-3 h-3"/>}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ATS Breakdown */}
                    <div>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">ATS Score Breakdown</p>
                      <div className="flex flex-col gap-2">
                        {ats.items.map(item=>(
                          <div key={item.label} className="p-2.5 rounded-xl border border-border bg-surface/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-foreground">{item.label}</span>
                              <span className={`text-xs font-bold ${item.score>=item.max*0.75?"text-green-600":item.score>=item.max*0.4?"text-yellow-600":"text-red-500"}`}>{Math.round(item.score)}/{item.max}</span>
                            </div>
                            <div className="h-1.5 bg-border rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{width:`${(item.score/item.max)*100}%`,background:item.score>=item.max*0.75?"#16a34a":item.score>=item.max*0.4?"#ca8a04":"#ef4444"}}/>
                            </div>
                            {item.score<item.max&&<p className="text-[10px] text-foreground-secondary mt-1 flex items-start gap-1"><AlertCircle className="w-2.5 h-2.5 shrink-0 mt-0.5"/>{item.tip}</p>}
                          </div>
                        ))}
                      </div>
                      {template!=="ats"&&<div className="mt-3 p-2.5 bg-blue-50 border border-blue-200/60 rounded-xl text-[10px] text-blue-700"><strong>Pro tip:</strong> Switch to the ATS-Safe template for applications to companies that use applicant tracking systems.</div>}
                    </div>

                    {/* Job Match */}
                    <div>
                      <button onClick={()=>setShowJobMatch(s=>!s)} className="flex items-center justify-between w-full text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                        <span className="flex items-center gap-1.5"><Search className="w-3.5 h-3.5"/>Job Keyword Matcher</span>
                        <span className="text-foreground-secondary normal-case tracking-normal font-normal">{showJobMatch?"Hide ↑":"Show ↓"}</span>
                      </button>
                      {showJobMatch&&(
                        <div>
                          <p className="text-xs text-foreground-secondary mb-2">Paste a job description to see keyword match and missing terms.</p>
                          <textarea className={`${ic} resize-none mb-3`} rows={6} value={jobDesc} onChange={e=>setJobDesc(e.target.value)} placeholder="Paste the full job description here…"/>
                          {jobMatch?(
                            <div>
                              <div className={`flex items-center gap-3 p-3 rounded-xl mb-3 ${jobMatch.matched/jobMatch.total>=0.6?"bg-green-50 border border-green-200/60":jobMatch.matched/jobMatch.total>=0.35?"bg-yellow-50 border border-yellow-200/60":"bg-red-50 border border-red-200/60"}`}>
                                <div className={`text-2xl font-black ${jobMatch.matched/jobMatch.total>=0.6?"text-green-600":jobMatch.matched/jobMatch.total>=0.35?"text-yellow-600":"text-red-500"}`}>{Math.round(jobMatch.matched/jobMatch.total*100)}%</div>
                                <div><p className="text-sm font-semibold text-foreground">Keyword Match</p><p className="text-xs text-foreground-secondary">{jobMatch.matched} of {jobMatch.total} keywords found</p></div>
                              </div>
                              {jobMatch.missing.length>0&&(
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Missing — click to add to Skills:</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {jobMatch.missing.map(kw=>(
                                      <button key={kw} onClick={()=>{if(!data.skills.includes(kw))setData(d=>({...d,skills:[...d.skills,kw]}))} } className="text-xs px-2.5 py-1 rounded-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors">+ {kw}</button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ):(
                            <p className="text-xs text-foreground-secondary text-center py-4">Paste a job description above to start matching</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* ── Right: Preview ──────────────────────────────────────────────── */}
          <div className={`flex-1 min-w-0 ${showPreview||"hidden lg:block"}`} ref={containerRef}>
            <div className="glass-card-premium p-3 sm:p-4 sticky top-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-foreground-secondary font-semibold uppercase tracking-wide">Live Preview</p>
                  <span className="text-xs text-foreground-secondary">· {Math.round(previewScale*100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-xs font-semibold ${atsColor} hidden sm:block`}>ATS: {ats.total}/100</div>
                  <button onClick={exportPDF} disabled={exporting} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
                    <Download className="w-3.5 h-3.5"/>{exporting?"Generating…":"Download PDF"}
                  </button>
                </div>
              </div>
              <div className="overflow-auto rounded-lg border border-border bg-white shadow-sm">
                <div style={{width:Math.round(794*previewScale)+2,height:Math.round(1123*previewScale)+2,overflow:"hidden"}}>
                  <div ref={previewRef} style={{transform:`scale(${previewScale})`,transformOrigin:"top left",width:794}}>
                    <TemplateComp data={data} color={color} font={font} spacing={spacing}/>
                  </div>
                </div>
              </div>
              {template!=="ats"&&(
                <p className="mt-3 text-xs text-foreground-secondary text-center">
                  Applying via ATS? <button onClick={()=>setTemplate("ats")} className="text-primary hover:underline font-medium">Switch to ATS-Safe</button>
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
