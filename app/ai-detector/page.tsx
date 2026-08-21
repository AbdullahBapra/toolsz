"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Upload, Download, RefreshCw, ScanSearch, AlertTriangle,
  CheckCircle, HelpCircle, Brain, BarChart3, Activity,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Signal {
  name: string; detail: string; contribution: number;
  direction: "ai"|"real"|"neutral"; module: string;
}
interface ExifData {
  make?: string; model?: string; latitude?: number; longitude?: number;
  iso?: number; fNumber?: number; exposureTime?: number; focalLength?: number; software?: string;
}
interface DetectionResult {
  heuristicScore: number; nnScore: number|null; finalScore: number;
  verdict: string; verdictColor: string; confidence: "Low"|"Medium"|"High"|"Very High";
  signals: Signal[]; fileName: string; fileSize: number; width: number; height: number;
  format: string; thumbUrl: string; exif: ExifData|null;
  dctArtifact: number; frequencyScore: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LOADING_MSGS = [
  "Reading file metadata…","Checking EXIF camera data…","Running DCT frequency analysis…",
  "Measuring noise fingerprint…","Analyzing pixel smoothness…","Checking AI dimension patterns…",
  "Computing block uniformity…","Scanning color channel correlation…","Preparing neural net input…","Finalizing heuristic verdict…",
];
const AI_WIDTHS = new Set([512,576,640,704,768,832,896,960,1024,1152,1216,1280,1344,1408,1472,1536,2048,3072,4096]);
const CLIP_LABELS = [
  "an AI-generated synthetic photorealistic image created by a diffusion model such as Midjourney Stable Diffusion or DALL-E",
  "a real photograph taken by a human photographer with a digital camera or smartphone",
];
const MODULE_COLORS: Record<string,string> = {
  EXIF:"#6366f1", Format:"#0ea5e9", Dimensions:"#f59e0b",
  Noise:"#ec4899", Texture:"#8b5cf6", Frequency:"#14b8a6", Color:"#84cc16",
  "Neural Network":"#a855f7",
};

// ─── Pixel / Frequency Analysis ───────────────────────────────────────────────

function computeLaplacianVariance(g: Float32Array, w: number, h: number): number {
  let s=0, s2=0, n=0;
  for (let y=1;y<h-1;y++) for (let x=1;x<w-1;x++) {
    const i=y*w+x; const l=g[i-w]+g[i+w]+g[i-1]+g[i+1]-4*g[i]; s+=l; s2+=l*l; n++;
  }
  const m=s/n; return s2/n-m*m;
}

function computeNoiseRMS(g: Float32Array, w: number, h: number): number {
  const b=new Float32Array(w*h);
  for (let y=1;y<h-1;y++) for (let x=1;x<w-1;x++) {
    const i=y*w+x; b[i]=(g[i-w-1]+g[i-w]+g[i-w+1]+g[i-1]+g[i]+g[i+1]+g[i+w-1]+g[i+w]+g[i+w+1])/9;
  }
  let s=0,n=0; for (let i=w+1;i<(h-1)*w-1;i++) { const d=g[i]-b[i]; s+=d*d; n++; } return Math.sqrt(s/n);
}

function computeBlockUniformity(g: Float32Array, w: number, h: number): number {
  const B=16; const vars: number[]=[];
  for (let by=0;by<h-B;by+=B) for (let bx=0;bx<w-B;bx+=B) {
    let s=0,s2=0,c=0;
    for (let dy=0;dy<B;dy++) for (let dx=0;dx<B;dx++) { const v=g[(by+dy)*w+(bx+dx)]; s+=v; s2+=v*v; c++; }
    const m=s/c; vars.push(s2/c-m*m);
  }
  if (!vars.length) return 0.5; return vars.filter(v=>v<30).length/vars.length;
}

// DCT-based high-frequency artifact detection (AI upsampling leaves grid artifacts)
function computeDCTArtifact(g: Float32Array, w: number, h: number): number {
  const N=8; let score=0; let blocks=0;
  for (let by=0;by<h-N;by+=N) for (let bx=0;bx<w-N;bx+=N) {
    const dct=new Float32Array(N*N);
    for (let u=0;u<N;u++) for (let v=0;v<N;v++) {
      let sum=0;
      for (let x=0;x<N;x++) for (let y=0;y<N;y++) {
        sum+=g[(by+y)*w+(bx+x)]*Math.cos((2*x+1)*u*Math.PI/16)*Math.cos((2*y+1)*v*Math.PI/16);
      }
      const cu=u===0?1/Math.sqrt(2):1; const cv=v===0?1/Math.sqrt(2):1;
      dct[u*N+v]=(cu*cv/4)*sum;
    }
    let hf=0,total=0;
    for (let u=0;u<N;u++) for (let v=0;v<N;v++) { const e=dct[u*N+v]**2; total+=e; if(u+v>=6) hf+=e; }
    if (total>0) score+=hf/total; blocks++;
  }
  return blocks>0 ? score/blocks : 0;
}

function computeChannelCorrelation(data: Uint8ClampedArray, wh: number): number {
  let sr=0,sg=0,srg=0,sr2=0,sg2=0; const s=Math.floor(wh/4);
  for (let i=0;i<s*4*4;i+=16) { const r=data[i],gv=data[i+1]; sr+=r; sg+=gv; sr2+=r*r; sg2+=gv*gv; srg+=r*gv; }
  const mr=sr/s,mg=sg/s; const vR=sr2/s-mr*mr; const vG=sg2/s-mg*mg;
  if (vR<1||vG<1) return 0.5; return Math.abs(srg/s-mr*mg)/Math.sqrt(vR*vG);
}

async function readExif(file: File): Promise<ExifData|null> {
  try {
    const exifr=(await import("exifr")).default;
    const raw=await exifr.parse(file,{tiff:true,exif:true,gps:true,xmp:false,iptc:false,icc:false,
      pick:["Make","Model","GPSLatitude","GPSLongitude","ISO","FNumber","ExposureTime","FocalLength","Software"]});
    if (!raw) return null;
    return {make:raw.Make,model:raw.Model,latitude:raw.GPSLatitude,longitude:raw.GPSLongitude,
      iso:raw.ISO,fNumber:raw.FNumber,exposureTime:raw.ExposureTime,focalLength:raw.FocalLength,software:raw.Software};
  } catch { return null; }
}

function analyzeCanvas(img: HTMLImageElement) {
  const MAX=512; const sc=Math.min(1,MAX/Math.max(img.naturalWidth,img.naturalHeight));
  const w=Math.round(img.naturalWidth*sc); const h=Math.round(img.naturalHeight*sc);
  const c=document.createElement("canvas"); c.width=w; c.height=h;
  const ctx=c.getContext("2d")!; ctx.drawImage(img,0,0,w,h);
  const {data}=ctx.getImageData(0,0,w,h);
  const gray=new Float32Array(w*h);
  for (let i=0;i<w*h;i++) gray[i]=0.299*data[i*4]+0.587*data[i*4+1]+0.114*data[i*4+2];
  return {
    noise: computeNoiseRMS(gray,w,h),
    sharpness: Math.min(100,Math.round(Math.sqrt(Math.max(0,computeLaplacianVariance(gray,w,h)))/2)),
    blockUniformity: computeBlockUniformity(gray,w,h),
    dctArtifact: computeDCTArtifact(gray,w,h),
    channelCorr: computeChannelCorrelation(data,w*h),
  };
}

// ─── Heuristic Engine ─────────────────────────────────────────────────────────

async function runHeuristics(file: File) {
  const url=URL.createObjectURL(file);
  const img=await new Promise<HTMLImageElement>((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=()=>rej(new Error("Load failed")); i.src=url; });
  URL.revokeObjectURL(url);
  const origW=img.naturalWidth; const origH=img.naturalHeight;
  const ext=(file.name.split(".").pop()??"").toLowerCase();
  const mime=file.type;
  const isPng=mime==="image/png"||ext==="png";
  const isWebp=mime==="image/webp"||ext==="webp";
  const isJpeg=mime==="image/jpeg"||ext==="jpg"||ext==="jpeg";
  const ts=Math.min(1,200/Math.max(origW,origH));
  const tc=document.createElement("canvas"); tc.width=Math.round(origW*ts); tc.height=Math.round(origH*ts);
  tc.getContext("2d")!.drawImage(img,0,0,tc.width,tc.height);
  const thumbUrl=tc.toDataURL("image/jpeg",0.82);
  const exif=await readExif(file);
  const hasCamera=!!(exif?.make||exif?.model); const hasGPS=exif?.latitude!=null;
  const hasCameraSettings=!!(exif?.iso||exif?.fNumber||exif?.exposureTime);
  const softwareName=(exif?.software??"").toLowerCase();
  const isAISoftware=/(midjourney|stable.diffusion|dall.?e|firefly|imagen|flux|kling|sora|runway|novelai|dream|diffusion|comfy|automatic1111)/i.test(softwareName);
  const {noise,sharpness,blockUniformity,dctArtifact,channelCorr}=analyzeCanvas(img);
  const ar=origW/origH;
  const isSquare=Math.abs(ar-1.0)<0.015; const isPortrait916=Math.abs(ar-9/16)<0.025; const isLandscape169=Math.abs(ar-16/9)<0.025;
  const wIsAI=AI_WIDTHS.has(origW); const hIsAI=AI_WIDTHS.has(origH);
  const bothAI=wIsAI&&hIsAI; const oneAI=(wIsAI||hIsAI)&&!bothAI;

  let score=35; const signals: Signal[]=[];

  if (hasCamera) { score-=35; signals.push({name:"Camera model in EXIF",detail:[exif?.make,exif?.model].filter(Boolean).join(" "),contribution:-35,direction:"real",module:"EXIF"}); }
  if (hasGPS) { score-=15; signals.push({name:"GPS coordinates",detail:"Location metadata found",contribution:-15,direction:"real",module:"EXIF"}); }
  if (hasCameraSettings&&!hasCamera) { score-=10; signals.push({name:"Camera exposure settings",detail:`ISO ${exif?.iso??"?"} f/${exif?.fNumber??"?"}`,contribution:-10,direction:"real",module:"EXIF"}); }
  if (isAISoftware) { score+=40; signals.push({name:"AI software signature",detail:exif?.software??"AI tool detected in EXIF",contribution:40,direction:"ai",module:"EXIF"}); }
  if (isPng) { score+=20; signals.push({name:"PNG format",detail:"Cameras save JPEG; PNG is common AI output",contribution:20,direction:"ai",module:"Format"}); }
  else if (isWebp) { score+=12; signals.push({name:"WebP format",detail:"Newer AI tools frequently output WebP",contribution:12,direction:"ai",module:"Format"}); }
  else if (isJpeg&&!hasCamera) { score+=8; signals.push({name:"JPEG without camera EXIF",detail:"Real photos almost always carry camera metadata",contribution:8,direction:"ai",module:"Format"}); }
  if (bothAI) { score+=22; signals.push({name:"Both dims AI-typical",detail:`${origW}×${origH} — exact AI generator output size`,contribution:22,direction:"ai",module:"Dimensions"}); }
  else if (oneAI) { score+=10; signals.push({name:"One dim AI-typical",detail:`${origW}×${origH}`,contribution:10,direction:"ai",module:"Dimensions"}); }
  if (isSquare&&!bothAI) { score+=10; signals.push({name:"1:1 square ratio",detail:"Most popular with AI generators",contribution:10,direction:"ai",module:"Dimensions"}); }
  else if (isPortrait916&&!bothAI) { score+=8; signals.push({name:"9:16 portrait ratio",detail:"Common AI vertical output",contribution:8,direction:"ai",module:"Dimensions"}); }
  else if (isLandscape169&&!bothAI&&!hasCamera) { score+=5; signals.push({name:"16:9 landscape ratio",detail:"Common in AI wallpapers",contribution:5,direction:"ai",module:"Dimensions"}); }
  const nr=Math.round(noise*10)/10;
  if (noise<1.8&&sharpness>55) { score+=20; signals.push({name:"Unnaturally clean pixels",detail:`Noise RMS ${nr} — very low grain + high sharpness`,contribution:20,direction:"ai",module:"Noise"}); }
  else if (noise<3.5&&sharpness>65) { score+=10; signals.push({name:"Very low noise",detail:`Noise RMS ${nr}`,contribution:10,direction:"ai",module:"Noise"}); }
  else if (noise>9) { score-=14; signals.push({name:"Natural sensor grain",detail:`Noise RMS ${nr} — film/sensor grain detected`,contribution:-14,direction:"real",module:"Noise"}); }
  else if (noise>5) { score-=7; signals.push({name:"Visible grain",detail:`Noise RMS ${nr}`,contribution:-7,direction:"real",module:"Noise"}); }
  if (blockUniformity>0.55&&noise<4) { score+=12; signals.push({name:"Smooth texture blocks",detail:`${Math.round(blockUniformity*100)}% of blocks lack variation`,contribution:12,direction:"ai",module:"Texture"}); }
  else if (blockUniformity<0.25) { score-=8; signals.push({name:"Rich texture variation",detail:"Natural variation across image",contribution:-8,direction:"real",module:"Texture"}); }
  const dctPct=Math.round(dctArtifact*100);
  if (dctArtifact>0.18) { score+=14; signals.push({name:"DCT frequency artifacts",detail:`${dctPct}% HF energy — diffusion model upsampling fingerprint`,contribution:14,direction:"ai",module:"Frequency"}); }
  else if (dctArtifact<0.08) { score-=6; signals.push({name:"Natural frequency spectrum",detail:`${dctPct}% HF energy — consistent with optical sensor`,contribution:-6,direction:"real",module:"Frequency"}); }
  if (channelCorr>0.97) { score+=8; signals.push({name:"Near-perfect channel correlation",detail:"Channels match suspiciously closely",contribution:8,direction:"ai",module:"Color"}); }
  else if (channelCorr<0.7&&!hasCamera) { score-=4; signals.push({name:"Independent color channels",detail:"Natural channel independence",contribution:-4,direction:"real",module:"Color"}); }

  return { heuristicScore:Math.max(3,Math.min(97,score)), signals, fileName:file.name, fileSize:file.size,
    width:origW, height:origH, format:ext.toUpperCase()||"IMG", thumbUrl, exif, dctArtifact, frequencyScore:dctPct };
}

// ─── Neural Network (CLIP) ────────────────────────────────────────────────────

async function runNNAnalysis(dataUrl: string, onProgress: (msg: string, pct: number) => void): Promise<{nnScore:number;nnDetail:string}> {
  onProgress("Loading CLIP vision model…", 5);
  const { pipeline, env } = await import("@xenova/transformers");
  env.allowLocalModels = false;
  env.useBrowserCache = true;
  let lastPct=20;
  const classifier = await pipeline("zero-shot-image-classification","Xenova/clip-vit-base-patch32",{
    progress_callback: (info: {status:string;progress?:number}) => {
      if (info.status==="progress"&&info.progress!=null) {
        const pct=Math.round(20+info.progress*0.55);
        if (pct>lastPct) { lastPct=pct; onProgress(`Downloading model weights… ${Math.round(info.progress)}%`,pct); }
      }
    },
  });
  onProgress("Computing image embeddings…", 78);
  const results: Array<{label:string;score:number}> = await classifier(dataUrl, CLIP_LABELS);
  const aiResult=results.find(r=>r.label.includes("diffusion"))??results[0];
  const realResult=results.find(r=>r.label.includes("real"))??results[1];
  onProgress("Neural analysis complete", 100);
  return {
    nnScore: Math.round(aiResult.score*100),
    nnDetail: `CLIP ViT-B/32: ${Math.round(aiResult.score*100)}% AI / ${Math.round((realResult?.score??0)*100)}% Real`,
  };
}

// ─── Score Fusion ─────────────────────────────────────────────────────────────

function fuseScores(h: number, nn: number|null) {
  const final=nn!=null ? Math.round(h*0.45+nn*0.55) : h;
  let verdict: string; let verdictColor: string;
  if (final>=80){verdict="Very Likely AI-Generated";verdictColor="#9333ea";}
  else if (final>=65){verdict="Likely AI-Generated";verdictColor="#a855f7";}
  else if (final>=50){verdict="Possibly AI-Generated";verdictColor="#f97316";}
  else if (final>=38){verdict="Inconclusive";verdictColor="#eab308";}
  else if (final>=22){verdict="Possibly Real Photo";verdictColor="#22c55e";}
  else{verdict="Likely Real Photo";verdictColor="#10b981";}
  const confidence: "Low"|"Medium"|"High"|"Very High" =
    nn!=null&&(final>=75||final<=20)?"Very High":nn!=null?"High":final>=70||final<=20?"High":"Medium";
  return {final,verdict,verdictColor,confidence};
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtBytes(n: number): string {
  if (n<1024) return `${n} B`; if (n<1024*1024) return `${(n/1024).toFixed(1)} KB`; return `${(n/1024/1024).toFixed(2)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIDetectorPage() {
  const [phase, setPhase]=useState<"upload"|"heuristic"|"nn"|"result">("upload");
  const [partial, setPartial]=useState<Awaited<ReturnType<typeof runHeuristics>>|null>(null);
  const [result, setResult]=useState<DetectionResult|null>(null);
  const [msgIdx, setMsgIdx]=useState(0);
  const [nnMsg, setNNMsg]=useState(""); const [nnPct, setNNPct]=useState(0);
  const [barReady, setBarReady]=useState(false);
  const [isDrag, setIsDrag]=useState(false);
  const [downloading, setDownloading]=useState(false);
  const [skippedNN, setSkippedNN]=useState(false);

  const cardRef=useRef<HTMLDivElement>(null);
  const inputRef=useRef<HTMLInputElement>(null);
  const ivRef=useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(()=>{
    if (phase==="heuristic") { ivRef.current=setInterval(()=>setMsgIdx(m=>(m+1)%LOADING_MSGS.length),500); }
    else { if (ivRef.current) clearInterval(ivRef.current); }
    return ()=>{ if (ivRef.current) clearInterval(ivRef.current); };
  },[phase]);

  useEffect(()=>{
    if (phase==="result") { const t=setTimeout(()=>setBarReady(true),100); return ()=>clearTimeout(t); }
    setBarReady(false);
  },[phase]);

  const handleFile=useCallback(async(file: File)=>{
    if (!file.type.startsWith("image/")) { alert("Please upload an image file."); return; }
    setPhase("heuristic"); setMsgIdx(0); setSkippedNN(false);
    try {
      const p=await runHeuristics(file);
      setPartial(p);
      const hf=fuseScores(p.heuristicScore,null);
      setResult({...p,nnScore:null,finalScore:hf.final,verdict:hf.verdict,verdictColor:hf.verdictColor,confidence:hf.confidence});
      setPhase("nn");
      try {
        const {nnScore,nnDetail}=await runNNAnalysis(p.thumbUrl,(msg,pct)=>{setNNMsg(msg);setNNPct(pct);});
        const fused=fuseScores(p.heuristicScore,nnScore);
        setResult(prev=>prev?{...prev,nnScore,finalScore:fused.final,verdict:fused.verdict,verdictColor:fused.verdictColor,confidence:fused.confidence,
          signals:[...prev.signals,{name:"CLIP Neural Network (ViT-B/32)",detail:nnDetail,contribution:nnScore>=50?Math.round((nnScore-50)/3):-Math.round((50-nnScore)/3),direction:nnScore>=50?"ai":"real",module:"Neural Network"}]}:prev);
      } catch(nnErr) { console.warn("NN failed, using heuristics:",nnErr); }
      setPhase("result");
    } catch(e) {
      alert((e instanceof Error?e.message:"Analysis failed.")+"\nPlease try a different image.");
      setPhase("upload");
    }
  },[]);

  const skipNN=()=>{ if (partial) { const f=fuseScores(partial.heuristicScore,null); setResult({...partial,nnScore:null,finalScore:f.final,verdict:f.verdict,verdictColor:f.verdictColor,confidence:f.confidence}); setSkippedNN(true); setPhase("result"); } };
  const handleDrop=useCallback((e: React.DragEvent)=>{ e.preventDefault(); setIsDrag(false); const f=e.dataTransfer.files[0]; if(f) handleFile(f); },[handleFile]);
  const reset=()=>{ setPhase("upload"); setResult(null); setPartial(null); setBarReady(false); setNNPct(0); setNNMsg(""); };

  const downloadCard=async()=>{
    if (!cardRef.current||!result) return; setDownloading(true);
    try {
      const html2canvas=(await import("html2canvas")).default;
      const canvas=await html2canvas(cardRef.current,{scale:2,useCORS:true,logging:false});
      const a=document.createElement("a"); a.download=`ai-check-${result.fileName.replace(/\.[^.]+$/,"")}.png`; a.href=canvas.toDataURL("image/png"); a.click();
    } finally { setDownloading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="max-w-225 mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="tool-hero p-6 sm:p-8">
          <Link href="/image-tools" className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-base font-semibold mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4"/>Back to Image Tools
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6 text-primary"/>
            </div>
            <div>
              <h1 className="type-h1 font-display gradient-text mb-2">AI Image Detector</h1>
              <p className="text-foreground-secondary text-base leading-relaxed max-w-2xl">
                Runs a <strong>CLIP neural network</strong> (ViT-B/32) + <strong>10 heuristic signals</strong> — EXIF metadata, DCT frequency artifacts, noise fingerprint, block uniformity, color correlation, AI dimension matching. 100% private.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["CLIP Neural Net (ViT-B/32)","EXIF Analysis","DCT Frequency","Noise Fingerprint","Color Correlation","Dimension Matching"].map(t=>(
                  <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-225 mx-auto px-5 md:px-6 lg:px-8 pb-16">

        {/* Upload */}
        {phase==="upload" && (
          <>
            <div className={`mt-6 border-2 border-dashed rounded-2xl p-10 sm:p-16 text-center transition-colors cursor-pointer ${isDrag?"border-primary bg-primary/5":"border-border hover:border-primary/60"}`}
              onDragOver={e=>{e.preventDefault();setIsDrag(true);}} onDragLeave={()=>setIsDrag(false)} onDrop={handleDrop} onClick={()=>inputRef.current?.click()}>
              <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>
              <div className="w-16 h-16 rounded-2xl bg-primary-muted border border-primary-border flex items-center justify-center mx-auto mb-5"><Upload className="w-8 h-8 text-primary"/></div>
              <h2 className="type-h2 font-semibold text-foreground mb-2">Drop any image to analyze</h2>
              <p className="text-foreground-secondary mb-6">JPG, PNG, WebP — real photo or AI-generated art</p>
              <button className="btn-primary px-6 py-2.5">Choose Image</button>
            </div>
            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              {[
                {icon:<Brain className="w-4 h-4"/>,title:"CLIP Neural Network",body:"CLIP ViT-B/32 runs zero-shot classification, comparing your image embedding to learned patterns of AI-generated and real photo content. Model downloads once (~85MB) and is cached."},
                {icon:<BarChart3 className="w-4 h-4"/>,title:"10 Heuristic Signals",body:"EXIF metadata, DCT 8×8 frequency analysis, noise RMS fingerprint, block uniformity, AI dimension matching, color channel correlation — each scores independently."},
                {icon:<Activity className="w-4 h-4"/>,title:"Ensemble Decision",body:"Neural network contributes 55% of the final score; heuristics 45%. Shows confidence level, per-module breakdown, and visual score bar."},
              ].map(({icon,title,body})=>(
                <div key={title} className="rounded-xl border border-border bg-surface/30 p-4">
                  <div className="flex items-center gap-2 mb-2 text-primary">{icon}<span className="text-sm font-semibold">{title}</span></div>
                  <p className="text-xs text-foreground-secondary leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Heuristic analysis */}
        {phase==="heuristic" && (
          <div className="mt-6 glass-card-premium p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-muted border border-primary-border flex items-center justify-center mx-auto mb-6 animate-pulse"><ScanSearch className="w-8 h-8 text-primary"/></div>
            <h2 className="type-h2 font-semibold text-foreground mb-3">Running heuristic analysis…</h2>
            <p className="text-foreground-secondary min-h-[1.5em] text-base">{LOADING_MSGS[msgIdx]}</p>
          </div>
        )}

        {/* NN loading — show partial verdict while model downloads */}
        {phase==="nn" && result && (
          <>
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-muted border border-primary-border flex items-center justify-center shrink-0 animate-pulse"><Brain className="w-5 h-5 text-primary"/></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-1">CLIP neural network loading ({nnPct}%) — heuristic result below</p>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{width:`${nnPct}%`}}/>
                </div>
                <p className="text-xs text-foreground-secondary mt-1">{nnMsg||"Downloading CLIP ViT-B/32 (~85MB, cached after first use)…"}</p>
              </div>
              <button onClick={skipNN} className="shrink-0 text-xs text-foreground-secondary hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors">Skip</button>
            </div>
            <VerdictBlock result={result} barReady={false} faded/>
          </>
        )}

        {/* Final result */}
        {phase==="result" && result && (
          <>
            {skippedNN&&<div className="mt-6 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200/60 rounded-xl px-4 py-2.5"><AlertTriangle className="w-3.5 h-3.5"/>Neural network skipped — result uses heuristics only.</div>}
            {result.nnScore!=null&&<div className="mt-6 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200/60 rounded-xl px-4 py-2.5"><CheckCircle className="w-3.5 h-3.5"/>CLIP analysis complete · Ensemble: {result.finalScore}% AI (45% heuristic + 55% neural)</div>}
            <VerdictBlock result={result} barReady={barReady}/>

            {/* Signals */}
            <div className="mt-5 glass-card-premium p-5 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4">Detection Signals ({result.signals.length})</h3>
              {result.signals.length===0
                ? <p className="text-sm text-foreground-secondary italic">No strong signals — result is inconclusive.</p>
                : <div className="flex flex-col gap-2.5">
                    {[...result.signals].sort((a,b)=>Math.abs(b.contribution)-Math.abs(a.contribution)).map((sig,i)=>{
                      const isAI=sig.direction==="ai"; const mc=MODULE_COLORS[sig.module]??"#94a3b8";
                      return (
                        <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl border" style={{borderColor:isAI?"#a855f720":"#22c55e20",background:isAI?"#a855f708":"#22c55e08"}}>
                          <div className="shrink-0 mt-0.5">{isAI?<div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center"><span className="text-[9px] font-bold text-purple-600">AI</span></div>:<CheckCircle className="w-5 h-5 text-green-500"/>}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className="text-sm font-semibold text-foreground">{sig.name}</p>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold text-white" style={{background:mc}}>{sig.module}</span>
                            </div>
                            <p className="text-xs text-foreground-secondary">{sig.detail}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-sm font-bold tabular-nums" style={{color:isAI?"#a855f7":"#22c55e"}}>{isAI?"+":"−"}{Math.abs(sig.contribution)}</span>
                            <p className="text-[10px] text-foreground-secondary">{isAI?"↑ AI":"↑ Real"}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              }
            </div>

            {/* EXIF */}
            {result.exif&&(result.exif.make||result.exif.model||result.exif.iso||result.exif.software)&&(
              <div className="mt-5 glass-card-premium p-5">
                <h3 className="font-semibold text-foreground mb-3 text-sm">EXIF Metadata Found</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {result.exif.make&&<ExifChip label="Camera Make" value={result.exif.make}/>}
                  {result.exif.model&&<ExifChip label="Camera Model" value={result.exif.model}/>}
                  {result.exif.iso!=null&&<ExifChip label="ISO" value={String(result.exif.iso)}/>}
                  {result.exif.fNumber!=null&&<ExifChip label="Aperture" value={`f/${result.exif.fNumber}`}/>}
                  {result.exif.focalLength!=null&&<ExifChip label="Focal Length" value={`${result.exif.focalLength}mm`}/>}
                  {result.exif.latitude!=null&&<ExifChip label="GPS" value="Location found" highlight/>}
                  {result.exif.software&&<ExifChip label="Software" value={result.exif.software.slice(0,30)}/>}
                </div>
              </div>
            )}

            {/* Technical stats */}
            <div className="mt-5 glass-card-premium p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Technical Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatChip label="DCT HF Energy" value={`${result.frequencyScore}%`} note="AI upsampling artifacts"/>
                <StatChip label="Dimensions" value={`${result.width}×${result.height}`} note={AI_WIDTHS.has(result.width)?"⚠ AI-typical":"✓ Non-standard"}/>
                <StatChip label="Format" value={result.format} note={result.format==="PNG"?"Common AI output":"Camera format"}/>
                <StatChip label="NN Score" value={result.nnScore!=null?`${result.nnScore}%`:"N/A"} note={result.nnScore!=null?"CLIP ViT-B/32":"Skipped or failed"}/>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-5 rounded-xl border border-amber-200/60 bg-amber-50/60 px-5 py-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"/>
              <p className="text-sm text-amber-800 leading-relaxed"><strong>Not definitive.</strong> Modern high-quality AI images saved as JPEG without metadata are the hardest case. Even with neural network analysis, use human judgment alongside this result.</p>
            </div>

            {/* Shareable card */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="type-h3 font-semibold text-foreground">Shareable Result Card</h2>
                <button onClick={downloadCard} disabled={downloading} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"><Download className="w-4 h-4"/>{downloading?"Generating…":"Download PNG"}</button>
              </div>
              <div ref={cardRef} style={{background:"linear-gradient(135deg,#0f1117 0%,#1a1d2e 100%)",borderRadius:16,padding:24,maxWidth:560,fontFamily:"system-ui,sans-serif"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:32,height:32,borderRadius:8,background:"#4f46e5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🧠</div>
                    <span style={{color:"#fff",fontWeight:700,fontSize:17}}>AI Image Detector</span>
                  </div>
                  <span style={{color:"#6b7280",fontSize:12}}>toolsz.co</span>
                </div>
                <div style={{display:"flex",gap:14,marginBottom:20,alignItems:"center"}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.thumbUrl} alt="" style={{width:68,height:68,objectFit:"cover",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{color:"#d1d5db",fontSize:13,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{result.fileName}</p>
                    <p style={{color:"#6b7280",fontSize:11,marginBottom:10}}>{result.width}×{result.height}px · {fmtBytes(result.fileSize)} · {result.format}</p>
                    <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                      <span style={{fontSize:42,fontWeight:900,color:result.verdictColor,lineHeight:1}}>{result.finalScore}%</span>
                      <span style={{color:"#6b7280",fontSize:14}}>AI probability</span>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
                  <div style={{padding:"6px 16px",borderRadius:20,background:result.verdictColor+"28",color:result.verdictColor,fontWeight:700,fontSize:15}}>{result.verdict}</div>
                  <span style={{color:"#6b7280",fontSize:12}}>Confidence: {result.confidence}</span>
                </div>
                <div style={{height:8,borderRadius:4,background:"rgba(255,255,255,0.1)",overflow:"hidden",marginBottom:12}}>
                  <div style={{height:"100%",width:`${result.finalScore}%`,borderRadius:4,background:result.verdictColor}}/>
                </div>
                {result.nnScore!=null&&<p style={{color:"#9ca3af",fontSize:11,marginBottom:12}}>🧠 CLIP: {result.nnScore}% AI · Heuristics: {result.heuristicScore}% AI · Ensemble: {result.finalScore}%</p>}
                <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
                  {[...result.signals].sort((a,b)=>Math.abs(b.contribution)-Math.abs(a.contribution)).slice(0,4).map((sig,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:"#d1d5db",fontSize:12}}>{sig.direction==="ai"?"🔴":"🟢"} {sig.name}</span>
                      <span style={{color:sig.direction==="ai"?"#c084fc":"#86efac",fontSize:12,fontWeight:700}}>{sig.direction==="ai"?"+":"−"}{Math.abs(sig.contribution)}</span>
                    </div>
                  ))}
                </div>
                <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:12}}>
                  <p style={{color:"#6b7280",fontSize:10,fontStyle:"italic"}}>⚠ Ensemble model analysis · toolsz.co · Not definitive — use human judgment</p>
                </div>
              </div>
            </div>

            {/* What to check next */}
            <div className="mt-8">
              <h2 className="type-h3 font-semibold text-foreground mb-4">What to check next</h2>
              <div className="flex flex-col gap-2.5">
                {result.finalScore>=55&&<InfoCard icon="🔍" title="Cross-check with other tools" body="Try Hive Moderation, AI or Not, or Google reverse image search for an independent opinion."/>}
                {!result.exif?.make&&!result.exif?.model&&<InfoCard icon="📷" title="No camera EXIF found" body="Real photos carry make/model metadata. Missing EXIF is common in AI images, screenshots, and social media reposts — but not conclusive alone."/>}
                {result.finalScore>=55&&<InfoCard icon="👁️" title="Look for manual signs" body="AI images often have: wrong finger counts on hands, garbled text, asymmetric earrings, repeated skin textures, or unnaturally smooth backgrounds."/>}
                {result.finalScore<45&&result.exif?.make&&<InfoCard icon="✅" title="Camera metadata found" body={`Camera: ${[result.exif.make,result.exif.model].filter(Boolean).join(" ")}. Strong real-photo indicator — AI generators cannot produce camera EXIF.`}/>}
                {result.nnScore==null&&!skippedNN&&<InfoCard icon="🧠" title="Neural network unavailable" body="CLIP model failed to load (network issue). The result uses heuristics only. Re-upload to try again."/>}
                <div className="glass-panel rounded-xl px-5 py-4 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-foreground-secondary shrink-0 mt-0.5"/>
                  <div><p className="text-sm font-semibold text-foreground mb-0.5">Strip or view EXIF metadata</p><p className="text-xs text-foreground-secondary"><Link href="/exif-remover" className="text-primary font-medium hover:underline">Open EXIF Remover →</Link></p></div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground-secondary hover:text-foreground hover:border-primary/50 text-sm font-medium transition-colors">
                <RefreshCw className="w-4 h-4"/>Check Another Image
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function VerdictBlock({ result, barReady, faded }: { result: DetectionResult; barReady: boolean; faded?: boolean }) {
  return (
    <div className={`mt-6 glass-card-premium p-6 sm:p-8 transition-opacity ${faded?"opacity-60":""}`}>
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={result.thumbUrl} alt={result.fileName} className="w-28 h-28 object-cover rounded-xl border border-border shrink-0"/>
        <div className="flex-1 min-w-0">
          <p className="text-foreground-secondary text-sm truncate max-w-xs mb-0.5">{result.fileName}</p>
          <p className="text-foreground-secondary text-xs mb-5">{result.width}×{result.height}px · {fmtBytes(result.fileSize)} · {result.format}</p>
          <div className="flex items-end gap-4 flex-wrap mb-4">
            <div>
              <span className="text-5xl font-bold tabular-nums" style={{color:result.verdictColor}}>{result.finalScore}%</span>
              <span className="text-foreground-secondary text-lg ml-1">AI</span>
            </div>
            <div className="pb-1">
              <span className="text-sm font-bold px-3 py-1.5 rounded-lg" style={{background:result.verdictColor+"22",color:result.verdictColor}}>{result.verdict}</span>
              <span className="ml-2 text-xs text-foreground-secondary">Confidence: <strong>{result.confidence}</strong></span>
            </div>
          </div>
          {result.nnScore!=null&&(
            <div className="flex gap-4 mb-3 text-xs text-foreground-secondary">
              <span>Heuristic: <strong className="text-foreground">{result.heuristicScore}%</strong></span>
              <span>Neural Net: <strong className="text-foreground">{result.nnScore}%</strong></span>
              <span>Ensemble: <strong style={{color:result.verdictColor}}>{result.finalScore}%</strong></span>
            </div>
          )}
          <div className="h-3 rounded-full bg-surface border border-border overflow-hidden mb-1">
            <div className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{width:barReady?`${result.finalScore}%`:"0%",background:"linear-gradient(to right,#10b981,#eab308,#f97316,#a855f7)",backgroundSize:"400% 100%",backgroundPosition:`${100-result.finalScore}% 0`}}/>
          </div>
          <div className="flex justify-between text-[10px] text-foreground-secondary px-0.5"><span>Real Photo</span><span>AI-Generated</span></div>
        </div>
      </div>
    </div>
  );
}

function ExifChip({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-2.5 border ${highlight?"bg-green-50 border-green-200/60":"bg-surface border-border"}`}>
      <p className={`text-[10px] font-medium mb-0.5 ${highlight?"text-green-600":"text-foreground-secondary"}`}>{label}</p>
      <p className={`text-xs font-semibold truncate ${highlight?"text-green-700":"text-foreground"}`}>{value}</p>
    </div>
  );
}

function StatChip({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5 border border-border bg-surface">
      <p className="text-[10px] font-medium text-foreground-secondary mb-0.5">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-foreground-secondary mt-0.5">{note}</p>
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="glass-panel rounded-xl px-5 py-4 flex items-start gap-3">
      <span className="text-xl shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-foreground-secondary mt-0.5 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
