"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bot, X, Send, ArrowUpRight, Sparkles, RotateCcw, Zap } from "lucide-react";

// ─── Tool data ────────────────────────────────────────────────────────────────

interface ChatTool {
  name: string;
  description: string;
  href: string;
  category: "PDF" | "Image" | "Dev";
  keywords: string[];
}

const TOOLS: ChatTool[] = [
  // ── PDF ────────────────────────────────────────────────────────────────────
  { name:"Compress PDF",            description:"Reduce PDF file size without losing quality",          href:"/compress-pdf",           category:"PDF",   keywords:["shrink","reduce","smaller","file too big","large pdf","optimize","size","lighter","less mb","compress pdf","pdf size","too large"] },
  { name:"PDF to JPG",              description:"Convert PDF pages to high-quality images",              href:"/pdf-to-jpg",             category:"PDF",   keywords:["convert pdf","image","jpg","jpeg","png","picture","photo","extract pages","save as image"] },
  { name:"Merge PDF",               description:"Combine multiple PDFs into one document",               href:"/merge-pdf",              category:"PDF",   keywords:["combine","join","unite","append","merge","multiple pdfs","two pdfs","together","one file"] },
  { name:"PDF to Text",             description:"Extract text content from PDF files",                   href:"/pdf-to-text",            category:"PDF",   keywords:["copy text","extract","plaintext","text from pdf","readable","copy paste"] },
  { name:"PDF to Data",             description:"Convert PDF to JSON or CSV structured data",            href:"/pdf-to-data",            category:"PDF",   keywords:["json","csv","structured data","table","parse","scrape","spreadsheet"] },
  { name:"PDF Editor",              description:"Draw, highlight and add text on PDF pages",             href:"/pdf-editor",             category:"PDF",   keywords:["annotate","markup","draw","write on","edit pdf","fill","text box","highlight"] },
  { name:"PDF Flipbook",            description:"Read PDFs as interactive 3D flipbooks",                 href:"/flipbook-pdf",           category:"PDF",   keywords:["flipbook","flip","3d","animation","reader","page turn","book"] },
  { name:"Split PDF",               description:"Divide PDF by page ranges or extract pages",            href:"/split-pdf",              category:"PDF",   keywords:["separate","divide","extract pages","cut","break apart","specific pages","range"] },
  { name:"Rotate PDF",              description:"Rotate individual or all PDF pages",                    href:"/rotate-pdf",             category:"PDF",   keywords:["rotate","orientation","sideways","upside down","turn","flip","landscape","portrait"] },
  { name:"Watermark PDF",           description:"Add custom text watermarks to PDF",                     href:"/watermark-pdf",          category:"PDF",   keywords:["stamp","brand","overlay","confidential","draft","logo","watermark pdf"] },
  { name:"Redact PDF",              description:"Permanently black out sensitive information",            href:"/redact-pdf",             category:"PDF",   keywords:["censor","hide","black out","sensitive","private","remove info","personal data"] },
  { name:"PDF Diff",                description:"Compare two PDFs side by side",                         href:"/pdf-diff",               category:"PDF",   keywords:["compare","difference","changes","before after","two versions","updated"] },
  { name:"PDF Form Filler",         description:"Fill PDF form fields without Adobe",                    href:"/pdf-form-filler",        category:"PDF",   keywords:["form","fields","checkboxes","fillable","fill out","application","blanks"] },
  { name:"HTML to PDF",             description:"Convert HTML markup to a clean PDF",                    href:"/html-to-pdf",            category:"PDF",   keywords:["webpage","html","convert","web page to pdf","url to pdf","print"] },
  { name:"Invoice Generator",       description:"Create professional PDF invoices with 10 templates",   href:"/invoice-generator",      category:"PDF",   keywords:["invoice","bill","receipt","payment","client","template","freelance","billing","tax","vat"] },
  { name:"Sign PDF",                description:"Add your signature to any PDF document",                href:"/sign-pdf",               category:"PDF",   keywords:["signature","esignature","digital sign","sign","draw signature","autograph"] },
  { name:"PPTX to PDF",            description:"Convert PowerPoint presentations to PDF",               href:"/pptx-to-pdf",            category:"PDF",   keywords:["powerpoint","presentation","slides","pptx","ppt","keynote"] },
  { name:"Unlock PDF",              description:"Remove PDF password protection",                        href:"/unlock-pdf",             category:"PDF",   keywords:["decrypt","remove password","unprotect","open","locked","no password"] },
  { name:"Protect PDF",             description:"Add password encryption to PDF",                        href:"/protect-pdf",            category:"PDF",   keywords:["encrypt","secure","password","lock","protect","private"] },
  { name:"Organize PDF",            description:"Reorder, delete & duplicate PDF pages",                 href:"/organize-pdf",           category:"PDF",   keywords:["reorder","rearrange","manage pages","delete page","move page","order"] },
  { name:"Add Page Numbers",        description:"Insert page numbers into any PDF position",             href:"/page-numbers",           category:"PDF",   keywords:["page numbers","paginate","footer","number pages","numbering"] },
  { name:"Crop PDF",                description:"Trim PDF page margins & white space",                   href:"/crop-pdf",               category:"PDF",   keywords:["trim","margins","cut","border","whitespace","crop"] },
  { name:"Flatten PDF",             description:"Merge form fields into static PDF content",             href:"/flatten-pdf",            category:"PDF",   keywords:["flatten","static","non-editable","form fields","lock fields"] },
  { name:"Extract Images from PDF", description:"Pull all embedded images from a PDF",                  href:"/extract-images-pdf",     category:"PDF",   keywords:["extract images","download images","pictures in pdf","save images","pull images"] },
  { name:"PDF OCR",                 description:"Make scanned PDFs searchable with Tesseract",          href:"/pdf-ocr",                category:"PDF",   keywords:["ocr","scan","scanned","searchable","text layer","recognize","tesseract","handwriting"] },
  { name:"PDF to Word",             description:"Convert PDF to editable DOCX",                         href:"/pdf-to-word",            category:"PDF",   keywords:["docx","word","microsoft word","edit","convert","doc"] },
  { name:"PDF to Excel",            description:"Convert PDF tables to XLSX",                           href:"/pdf-to-excel",           category:"PDF",   keywords:["xlsx","excel","spreadsheet","tables","convert","xls"] },
  { name:"Smart PDF Cleaner",       description:"Auto remove margins, center content & normalize fonts", href:"/pdf-cleaner",           category:"PDF",   keywords:["clean pdf","margins","readability","normalize","center","tidy"] },
  { name:"Highlight Extractor",     description:"Pull annotated text and highlights from PDFs",         href:"/highlight-extractor",    category:"PDF",   keywords:["annotation","highlights","markup","notes","sticky notes","comments"] },
  { name:"Why Is My PDF So Big?",   description:"Visual breakdown of what is eating your PDF file size",  href:"/size-analyzer",         category:"PDF",   keywords:["pdf size","file too big","large pdf","bloated","diagnose","analyze pdf","size breakdown","fonts metadata","what is inside"] },
  { name:"PDF Roast & Quality Score",description:"Brutally honest quality score for your PDF",            href:"/pdf-roast",             category:"PDF",   keywords:["pdf quality","roast","score","quality check","grade","audit","bloat","safety","pdf version","font load"] },
  { name:"Business Document Pack",  description:"Generate invoices, quotes, receipts and purchase orders",href:"/business-docs",         category:"PDF",   keywords:["invoice","quote","receipt","purchase order","delivery note","business document","professional template","billing"] },

  // ── Image ──────────────────────────────────────────────────────────────────
  { name:"Compress Image",          description:"Reduce image file size while keeping quality",          href:"/compress-image",         category:"Image", keywords:["shrink","reduce","smaller","optimize","photo size","image size","compress","less kb","file too big"] },
  { name:"Compress to Exact Size",  description:"Compress photo to an exact KB or MB target",           href:"/compress-to-size",       category:"Image", keywords:["exact size","target size","exact kb","compress to kb","passport size","visa size","us passport","uk passport","specific size"] },
  { name:"Image to PDF",            description:"Convert images into a single PDF document",             href:"/image-to-pdf",           category:"Image", keywords:["jpg to pdf","png to pdf","photos to pdf","image to pdf","picture pdf"] },
  { name:"Resize Image",            description:"Scale image dimensions to any target size",             href:"/resize-image",           category:"Image", keywords:["scale","dimensions","pixels","size","bigger","smaller","width","height","resize"] },
  { name:"Image to Text",           description:"Extract text from images using OCR",                    href:"/image-to-text",          category:"Image", keywords:["ocr","copy text","screenshot","text from image","picture to text","read text"] },
  { name:"Convert Image",           description:"Switch image formats — PNG, JPG, WebP, SVG, HEIC",     href:"/convert-image",          category:"Image", keywords:["png to jpg","jpg to png","webp","heic","format","change format","convert image","svg","avif"] },
  { name:"Edit Image",              description:"Adjust brightness, contrast, filters & crop photos",   href:"/edit-image",             category:"Image", keywords:["adjust","filter","brightness","contrast","edit","saturation","photo edit","enhance","tweak"] },
  { name:"Background Remover",      description:"Remove image backgrounds using AI",                     href:"/remove-bg",              category:"Image", keywords:["remove background","transparent","cutout","no background","ai","background eraser","bg remover"] },
  { name:"Blur Background",         description:"Professional bokeh blur effect for portraits",          href:"/blur-background",        category:"Image", keywords:["bokeh","blur","portrait","isolation","depth of field","soften background"] },
  { name:"HEIC to JPG",             description:"Convert iPhone HEIC/HEIF photos to JPG",               href:"/heic-to-jpg",            category:"Image", keywords:["iphone","heif","apple","heic","convert","ios","mac"] },
  { name:"EXIF Remover",            description:"Strip GPS & metadata from photos for privacy",          href:"/exif-remover",           category:"Image", keywords:["privacy","gps","camera info","metadata","location","exif","strip","remove data"] },
  { name:"Batch Image Resizer",     description:"Resize 50+ images at once in bulk",                    href:"/batch-resize",           category:"Image", keywords:["bulk","mass","multiple","batch","many images","zip","at once"] },
  { name:"ID Photo Maker",          description:"Create passport & visa photos at the right size",       href:"/id-photo",               category:"Image", keywords:["passport photo","visa photo","id","300dpi","mugshot","government photo","2x2"] },
  { name:"Social Media Image Resizer",description:"Resize images for Instagram, Twitter, LinkedIn",     href:"/social-image",           category:"Image", keywords:["instagram","twitter","linkedin","youtube","tiktok","facebook","social media","post","cover","profile"] },
  { name:"Color Blindness Simulator",description:"Test design for accessibility and color blindness",   href:"/color-blind-simulator",  category:"Image", keywords:["accessibility","protanopia","deuteranopia","a11y","color blind","simulate","design check"] },
  { name:"Watermark Remover",       description:"Remove watermarks from images using AI inpainting",    href:"/watermark-remover",      category:"Image", keywords:["remove watermark","inpaint","clean","erase watermark","stock photo"] },
  { name:"Watermark Image",         description:"Add custom text or logo watermarks to photos",          href:"/watermark-image",        category:"Image", keywords:["add watermark","stamp","brand","overlay","logo watermark","copyright","protect photo"] },
  { name:"Video to GIF",            description:"Convert video clips to animated GIFs",                 href:"/video-to-gif",           category:"Image", keywords:["gif","video","mp4","clip","animation","convert video","animated"] },
  { name:"Image Cropper",           description:"Crop images with precision and aspect ratio presets",  href:"/crop-image",             category:"Image", keywords:["crop","1:1","4:3","16:9","aspect ratio","square","cut image"] },
  { name:"Rotate & Flip Image",     description:"Rotate 90°/180°/270° and flip images",                href:"/rotate-image",           category:"Image", keywords:["rotate","flip","horizontal","vertical","upside down","mirror","orientation"] },
  { name:"Image Splitter",          description:"Split images into Instagram grid sections",             href:"/split-image",            category:"Image", keywords:["grid","carousel","instagram","split","1x3","3x3","9 tiles","multi-post"] },
  { name:"GIF Maker",               description:"Create animated GIFs from a set of images",            href:"/gif-maker",              category:"Image", keywords:["animate","frames","loop","delay","gif","create gif","animation"] },
  { name:"Collage Maker",           description:"Create photo collages with flexible layouts",           href:"/collage-maker",          category:"Image", keywords:["collage","2x2","photos","grid","layout","combine photos","montage"] },
  { name:"Meme Generator",          description:"Add text captions to images and create memes",          href:"/meme-generator",         category:"Image", keywords:["meme","impact","text overlay","funny","caption","create meme"] },
  { name:"Image Annotator",         description:"Add arrows, text and markup to images",                 href:"/annotate-image",         category:"Image", keywords:["arrows","rectangles","feedback","markup","annotate","label","callout"] },
  { name:"Image Upscaler",          description:"Upscale images up to 4× without quality loss",         href:"/upscale-image",          category:"Image", keywords:["enlarge","super resolution","4x","upscale","increase size","bigger","sharpen","enhance"] },
  { name:"Photo Enhancer",          description:"Auto-fix & fine-tune image quality",                   href:"/photo-enhancer",         category:"Image", keywords:["auto fix","brightness","saturation","enhance","improve quality","fix photo"] },
  { name:"Colorize Image",          description:"Add color to black & white photos",                    href:"/colorize-image",         category:"Image", keywords:["black and white","sepia","color","bw","colorize","old photo","vintage"] },
  { name:"Blur Face",               description:"Blur faces and sensitive areas in photos",              href:"/blur-face",              category:"Image", keywords:["blur face","anonymize","privacy","censor","face","sensitive","hide face"] },
  { name:"HTML to Image",           description:"Render HTML code as a PNG or JPEG image",              href:"/html-to-image",          category:"Image", keywords:["html screenshot","code to image","render html","webpage capture","screenshot"] },
  { name:"Real Pixel Size Comparator",description:"Compare actual vs display size with zoom overlays", href:"/pixel-comparator",       category:"Image", keywords:["pixel size","actual size","display size","zoom","margin","dpi","real size"] },
  { name:"AI Image Detector",       description:"Detect if an image is AI-generated using neural network",href:"/ai-detector",         category:"Image", keywords:["ai detector","ai generated","fake image","deepfake","real or fake","midjourney","stable diffusion","dall-e","detect ai","is this ai","neural network"] },
  { name:"SVG to PNG",              description:"Convert SVG vector files to PNG at any resolution",      href:"/svg-to-png",          category:"Image", keywords:["svg to png","convert svg","vector to png","export png","svg export","figma svg","illustrator svg"] },
  { name:"PNG to SVG",              description:"Trace raster images into scalable SVG vectors",           href:"/png-to-svg",          category:"Image", keywords:["png to svg","trace","vectorize","raster to vector","convert png svg","svg trace","vector"] },
  { name:"Passport & Visa Photo",   description:"Create compliant passport and visa photos for 60+ countries",href:"/passport-photo",  category:"Image", keywords:["passport photo","visa photo","60 countries","government id","biometric","face crop","background replace","300dpi","print sheet","uk passport","us passport"] },
  { name:"Screenshot to Table",     description:"Extract tables from screenshots or photos into CSV",      href:"/screenshot-to-table",category:"Image", keywords:["screenshot table","extract table","table ocr","image to excel","image to csv","photo to spreadsheet","table from image","picture to csv"] },
  { name:"Image Size Analyzer",     description:"Visual breakdown of what is bloating your image file",   href:"/size-analyzer",       category:"Image", keywords:["image size","file too big","what is inside","analyze image","exif","icc profile","size breakdown","png size","jpg size"] },
  { name:"Image Roast & Quality Score",description:"Brutally honest quality score for any image",         href:"/image-roast",         category:"Image", keywords:["image quality","roast","score","sharpness","noise","compression","exposure","color","quality check","image grade"] },
  { name:"Print & Frame Calculator", description:"Check if your photo will print at 8x10 or A4 without blurring",href:"/print-calculator",category:"Image",keywords:["print photo","dpi","8x10","print size","a4","letter","frame","resolution","will it print","dpi calculator","photo print"] },
  { name:"PNG to JPG",              description:"Convert PNG to JPG with quality control — handles transparency", href:"/png-to-jpg",          category:"Image", keywords:["png to jpg","png to jpeg","convert png","png converter","remove transparency","png jpg"] },
  { name:"PNG to WebP",             description:"Convert PNG to WebP — 25-35% smaller file size",               href:"/png-to-webp",         category:"Image", keywords:["png to webp","webp converter","reduce image size","web performance","png webp"] },
  { name:"PNG to GIF",              description:"Convert PNG to static GIF format",                              href:"/png-to-gif",          category:"Image", keywords:["png to gif","convert png gif","static gif","image to gif","png gif"] },
  { name:"JPG to PNG",              description:"Convert JPG to PNG for lossless quality",                       href:"/jpg-to-png",          category:"Image", keywords:["jpg to png","jpeg to png","lossless","convert jpg","jpg png","jpeg png"] },
  { name:"JPG to WebP",             description:"Convert JPG photos to WebP — better web performance",           href:"/jpg-to-webp",         category:"Image", keywords:["jpg to webp","jpeg to webp","web optimization","pagespeed","core web vitals","webp"] },
  { name:"WebP to PNG",             description:"Convert WebP to PNG for universal compatibility",               href:"/webp-to-png",         category:"Image", keywords:["webp to png","open webp","photoshop webp","webp compatibility","webp png"] },
  { name:"Bulk PNG to JPG",         description:"Batch convert multiple PNG files to JPG — download as ZIP",     href:"/bulk-png-to-jpg",     category:"Image", keywords:["bulk png to jpg","batch convert","multiple images","zip","mass convert","batch png jpg"] },
  { name:"Bulk PNG to WebP",        description:"Batch convert PNG files to WebP in one click",                  href:"/bulk-png-to-webp",    category:"Image", keywords:["bulk png webp","batch webp","bulk convert images","mass webp","zip download"] },
  { name:"Bulk PNG to GIF",         description:"Batch convert multiple PNG images to GIF",                      href:"/bulk-png-to-gif",     category:"Image", keywords:["bulk png gif","batch gif","mass convert gif","multiple png gif"] },
  { name:"Bulk JPG to PNG",         description:"Batch convert JPG photos to PNG — lossless output",             href:"/bulk-jpg-to-png",     category:"Image", keywords:["bulk jpg png","batch jpeg png","mass convert","multiple jpg to png"] },
  { name:"Bulk JPG to WebP",        description:"Batch optimize your JPEG library to WebP format",               href:"/bulk-jpg-to-webp",    category:"Image", keywords:["bulk jpg webp","batch jpeg webp","optimize photos","mass webp","photo library"] },
  { name:"Bulk WebP to PNG",        description:"Batch convert WebP files to PNG for compatibility",              href:"/bulk-webp-to-png",    category:"Image", keywords:["bulk webp png","batch convert webp","mass convert","compatibility","webp to png bulk"] },
  // New format converters
  { name:"GIF to PNG",             description:"Convert GIF to PNG with full transparency support",               href:"/gif-to-png",          category:"Image", keywords:["gif to png","convert gif","gif png"] },
  { name:"GIF to JPG",             description:"Convert GIF to JPEG with white background fill",                  href:"/gif-to-jpg",          category:"Image", keywords:["gif to jpg","gif to jpeg","convert gif jpg"] },
  { name:"GIF to WebP",            description:"Convert GIF to WebP for smaller file sizes",                      href:"/gif-to-webp",         category:"Image", keywords:["gif to webp","convert gif webp"] },
  { name:"BMP to PNG",             description:"Convert BMP to lossless PNG — smaller file size",                 href:"/bmp-to-png",          category:"Image", keywords:["bmp to png","bitmap to png","bmp png"] },
  { name:"BMP to JPG",             description:"Convert BMP to JPEG with adjustable quality",                     href:"/bmp-to-jpg",          category:"Image", keywords:["bmp to jpg","bitmap to jpeg","bmp jpg"] },
  { name:"BMP to WebP",            description:"Convert BMP to modern WebP for better compression",               href:"/bmp-to-webp",         category:"Image", keywords:["bmp to webp","bitmap to webp"] },
  { name:"AVIF to PNG",            description:"Convert AVIF to PNG for universal compatibility",                  href:"/avif-to-png",         category:"Image", keywords:["avif to png","convert avif","avif png"] },
  { name:"AVIF to JPG",            description:"Convert AVIF to JPEG for broad compatibility",                     href:"/avif-to-jpg",         category:"Image", keywords:["avif to jpg","avif to jpeg","avif jpg"] },
  { name:"WebP to JPG",            description:"Convert WebP to JPEG for broad software compatibility",            href:"/webp-to-jpg",         category:"Image", keywords:["webp to jpg","webp to jpeg","convert webp jpg"] },
  { name:"WebP to GIF",            description:"Convert WebP to GIF format",                                       href:"/webp-to-gif",         category:"Image", keywords:["webp to gif","convert webp gif"] },
  { name:"WebP to SVG",            description:"Trace WebP images to scalable SVG vector",                         href:"/webp-to-svg",         category:"Image", keywords:["webp to svg","vectorize webp","webp svg"] },
  { name:"WebP to ICO",            description:"Create ICO favicon from WebP images",                              href:"/webp-to-ico",         category:"Image", keywords:["webp to ico","webp favicon","webp icon"] },
  { name:"WebP to BMP",            description:"Convert WebP to 24-bit BMP for Windows compatibility",             href:"/webp-to-bmp",         category:"Image", keywords:["webp to bmp","webp bitmap"] },
  { name:"WebP to TIFF",           description:"Convert WebP to TIFF for professional print workflows",            href:"/webp-to-tiff",        category:"Image", keywords:["webp to tiff","webp tiff","webp to tif"] },
  { name:"JPG to GIF",             description:"Convert JPG photos to GIF format",                                 href:"/jpg-to-gif",          category:"Image", keywords:["jpg to gif","jpeg to gif","convert jpg gif"] },
  { name:"JPG to SVG",             description:"Trace JPEG to scalable SVG vector — 4 tracing modes",             href:"/jpg-to-svg",          category:"Image", keywords:["jpg to svg","jpeg to svg","vectorize jpg","trace jpg","jpg svg"] },
  { name:"JPG to ICO",             description:"Create multi-size ICO favicon from any JPG image",                 href:"/jpg-to-ico",          category:"Image", keywords:["jpg to ico","jpeg to ico","jpg favicon","create ico"] },
  { name:"JPG to BMP",             description:"Convert JPEG to 24-bit BMP for legacy Windows compatibility",      href:"/jpg-to-bmp",          category:"Image", keywords:["jpg to bmp","jpeg to bmp","jpg bitmap"] },
  { name:"JPG to AVIF",            description:"Convert JPEG to AVIF for up to 50% smaller file sizes",            href:"/jpg-to-avif",         category:"Image", keywords:["jpg to avif","jpeg to avif","avif","next gen format","avif compression"] },
  { name:"JPG to TIFF",            description:"Convert JPG to TIFF for professional print",                       href:"/jpg-to-tiff",         category:"Image", keywords:["jpg to tiff","jpeg to tiff","jpg tif","print format tiff"] },
  { name:"JPG to HEIC",            description:"Convert JPG to HEIC — or use AVIF as open alternative",            href:"/jpg-to-heic",         category:"Image", keywords:["jpg to heic","jpeg to heic","heic format","apple heic"] },
  { name:"PNG to ICO",             description:"Create ICO favicon (256, 48, 32, 16px) from PNG",                  href:"/png-to-ico",          category:"Image", keywords:["png to ico","favicon","icon","create favicon","png ico","website icon"] },
  { name:"PNG to BMP",             description:"Convert PNG to 24-bit Windows BMP format",                         href:"/png-to-bmp",          category:"Image", keywords:["png to bmp","png bitmap","bmp format"] },
  { name:"PNG to AVIF",            description:"Convert PNG to AVIF — up to 50% smaller than JPG",                 href:"/png-to-avif",         category:"Image", keywords:["png to avif","avif","next gen","modern format","avif compression"] },
  { name:"PNG to TIFF",            description:"Convert PNG to TIFF for print workflows",                           href:"/png-to-tiff",         category:"Image", keywords:["png to tiff","tiff","print format","professional print"] },
  { name:"PNG to HEIC",            description:"Convert PNG to HEIC — Mac Preview or AVIF alternative",             href:"/png-to-heic",         category:"Image", keywords:["png to heic","heic format","apple heic"] },
  { name:"ICO to PNG",             description:"Extract highest-resolution PNG from ICO favicon",                   href:"/ico-to-png",          category:"Image", keywords:["ico to png","favicon to png","extract ico","convert ico"] },
  { name:"ICO to JPG",             description:"Convert ICO to JPEG — extracts largest embedded size",              href:"/ico-to-jpg",          category:"Image", keywords:["ico to jpg","favicon to jpg","convert ico jpg"] },
  { name:"ICO to WebP",            description:"Convert ICO favicon to WebP format",                                href:"/ico-to-webp",         category:"Image", keywords:["ico to webp","favicon to webp"] },
  { name:"ICO to SVG",             description:"Convert ICO to SVG via two-step raster tracing",                   href:"/ico-to-svg",          category:"Image", keywords:["ico to svg","favicon to svg","icon to vector"] },
  { name:"SVG to ICO",             description:"Create multi-size ICO favicon from SVG source",                     href:"/svg-to-ico",          category:"Image", keywords:["svg to ico","svg favicon","create ico from svg","vector favicon"] },
  { name:"SVG to JPG",             description:"Convert SVG vector to JPEG with white background",                  href:"/svg-to-jpg",          category:"Image", keywords:["svg to jpg","svg to jpeg","convert svg jpg"] },
  { name:"SVG to WebP",            description:"Convert SVG to WebP for smaller web output",                        href:"/svg-to-webp",         category:"Image", keywords:["svg to webp","svg webp"] },
  { name:"TIFF to PNG",            description:"Convert TIFF to PNG — desktop software guide",                      href:"/tiff-to-png",         category:"Image", keywords:["tiff to png","tif to png","convert tiff","tiff converter"] },
  { name:"TIFF to JPG",            description:"Convert TIFF to JPEG — IrfanView or GIMP guide",                   href:"/tiff-to-jpg",         category:"Image", keywords:["tiff to jpg","tif to jpg","tiff to jpeg","convert tiff jpg"] },
  { name:"TIFF to WebP",           description:"Convert TIFF to WebP — two-step browser workaround",               href:"/tiff-to-webp",        category:"Image", keywords:["tiff to webp","tif to webp"] },
  { name:"HEIC to PNG",            description:"Convert HEIC to PNG — uses our HEIC converter with PNG output",    href:"/heic-to-png",         category:"Image", keywords:["heic to png","heif to png","iphone heic png"] },
  { name:"HEIC to WebP",           description:"Convert HEIC to WebP — uses our HEIC converter with WebP output", href:"/heic-to-webp",        category:"Image", keywords:["heic to webp","heif to webp","iphone heic webp"] },
  // Bulk image tools
  { name:"Bulk Image Compressor",  description:"Compress dozens of images at once — download as ZIP",              href:"/bulk-image-compressor",category:"Image",keywords:["bulk compress","batch compress","multiple images compress","compress all","mass compress","zip download"] },
  { name:"Bulk Image Resizer",     description:"Resize multiple images to exact dimensions — ZIP download",         href:"/bulk-image-resizer",  category:"Image", keywords:["bulk resize","batch resize","resize multiple","mass resize","many images","resize all"] },
  { name:"Bulk Image Converter",   description:"Convert multiple images to WebP in one batch — ZIP download",       href:"/bulk-image-converter",category:"Image",keywords:["bulk convert","batch convert images","mass convert","convert all images","multiple webp"] },
  { name:"Bulk Background Remover",description:"Remove backgrounds from multiple photos — AI batch processing",    href:"/bulk-background-remover",category:"Image",keywords:["bulk background removal","batch remove bg","multiple remove bg","mass background remover"] },
  { name:"Bulk Watermark Adder",   description:"Add watermarks to multiple photos in one operation",                href:"/bulk-watermark-adder",category:"Image",keywords:["bulk watermark","batch watermark","mass watermark","multiple images watermark"] },
  // Product & e-commerce tools
  { name:"Amazon Image Resizer",   description:"Resize product photos to Amazon 1000×1000 standard",               href:"/amazon-image-resizer",category:"Image",keywords:["amazon image","1000x1000","amazon product photo","amazon listing","white background","amazon seller"] },
  { name:"Shopify Image Optimizer",description:"Optimize product images for Shopify — 2048×2048 JPG",              href:"/shopify-image-optimizer",category:"Image",keywords:["shopify image","shopify product photo","shopify store","2048x2048","shopify optimize"] },
  { name:"Etsy Image Resizer",     description:"Resize product photos for Etsy listings — 2000×2000 JPG",          href:"/etsy-image-resizer",  category:"Image", keywords:["etsy image","etsy product photo","etsy listing","2000x2000","etsy seller"] },
  { name:"Product Image Resizer",  description:"Resize product photos with Amazon/Shopify/Etsy/eBay presets",      href:"/product-image-resizer",category:"Image",keywords:["product photo","ecommerce image","resize product","amazon shopify etsy ebay","product photo size"] },
  { name:"Product Photo Optimizer",description:"Compress and optimize multiple product photos — batch JPG",         href:"/product-photo-optimizer",category:"Image",keywords:["product photo optimize","compress product images","ecommerce photo compression","batch product images"] },
  { name:"Product Background Remover",description:"Remove backgrounds from product photos for e-commerce listings",href:"/product-background-remover",category:"Image",keywords:["product background","white background","ecommerce background","product cutout","product remove bg"] },
  // OCR & text extraction
  { name:"Screenshot to Text",    description:"Extract text from screenshots using OCR",                            href:"/screenshot-to-text",  category:"Image", keywords:["screenshot text","copy text screenshot","ocr screenshot","text from screenshot","screenshot ocr","screen grab text"] },
  { name:"Handwriting to Text",   description:"Convert handwritten notes to digital text using OCR",                href:"/handwriting-to-text", category:"Image", keywords:["handwriting","handwritten","notes to text","handwriting ocr","written notes digital","cursive ocr"] },
  { name:"Receipt Scanner",       description:"Scan receipts and extract totals, items, dates via OCR",             href:"/receipt-scanner",     category:"Image", keywords:["receipt","scan receipt","receipt ocr","receipt text","expense","total","itemized receipt"] },
  { name:"Business Card Scanner", description:"Scan business cards and extract contact info via OCR",               href:"/business-card-scanner",category:"Image",keywords:["business card","scan business card","contact","vcard","name email phone","card scanner","business card ocr"] },
  { name:"Table Extraction from Image",description:"Extract tables from images into structured CSV",                href:"/table-extraction-from-image",category:"Image",keywords:["table from image","extract table","image table ocr","photo to table","picture to csv","table extraction"] },
  { name:"JPG to PDF",             description:"Convert JPG images to PDF — batch, no upload, no watermarks",    href:"/jpg-to-pdf",          category:"PDF",   keywords:["jpg to pdf","jpeg to pdf","photo to pdf","image to pdf","jpg pdf"] },
  { name:"JPEG to PDF",            description:"Convert JPEG photos to PDF — multi-file, browser-based",         href:"/jpeg-to-pdf",         category:"PDF",   keywords:["jpeg to pdf","jpg to pdf","photo to pdf","jpeg pdf"] },
  { name:"PNG to PDF",             description:"Convert PNG images to PDF — lossless, no upload",                href:"/png-to-pdf",          category:"PDF",   keywords:["png to pdf","convert png pdf","image to pdf","png pdf"] },
  { name:"WebP to PDF",            description:"Convert WebP images to PDF — browser-based",                     href:"/webp-to-pdf",         category:"PDF",   keywords:["webp to pdf","convert webp","webp pdf"] },
  { name:"GIF to PDF",             description:"Convert GIF images to PDF — first frame embedded",               href:"/gif-to-pdf",          category:"PDF",   keywords:["gif to pdf","convert gif pdf"] },
  { name:"BMP to PDF",             description:"Convert BMP bitmap images to PDF",                               href:"/bmp-to-pdf",          category:"PDF",   keywords:["bmp to pdf","bitmap to pdf","bmp pdf"] },
  { name:"TIFF to PDF",            description:"Convert TIFF scanned images to PDF",                             href:"/tiff-to-pdf",         category:"PDF",   keywords:["tiff to pdf","tif to pdf","scanned document pdf"] },
  { name:"AVIF to PDF",            description:"Convert AVIF next-gen images to PDF",                            href:"/avif-to-pdf",         category:"PDF",   keywords:["avif to pdf"] },
  { name:"HEIC to PDF",            description:"Convert iPhone HEIC photos to PDF — no upload",                  href:"/heic-to-pdf",         category:"PDF",   keywords:["heic to pdf","iphone photo pdf","heif to pdf"] },
  { name:"SVG to PDF",             description:"Convert SVG vector graphics to PDF",                             href:"/svg-to-pdf",          category:"PDF",   keywords:["svg to pdf","vector to pdf","svg pdf"] },
  { name:"PDF to PNG",             description:"Convert PDF pages to lossless PNG images",                       href:"/pdf-to-png",          category:"PDF",   keywords:["pdf to png","pdf to image","pdf pages png"] },
  { name:"PDF to WebP",            description:"Convert PDF pages to web-optimized WebP",                        href:"/pdf-to-webp",         category:"PDF",   keywords:["pdf to webp","pdf to image webp"] },
  { name:"PDF to GIF",             description:"Convert PDF to animated GIF slideshow",                          href:"/pdf-to-gif",          category:"PDF",   keywords:["pdf to gif","pdf animated gif","pdf slideshow"] },
  { name:"PDF to CSV",             description:"Extract PDF text content as CSV data",                           href:"/pdf-to-csv",          category:"PDF",   keywords:["pdf to csv","extract pdf data","pdf to spreadsheet"] },
  { name:"PDF to HTML",            description:"Convert PDF text to an HTML web page",                           href:"/pdf-to-html",         category:"PDF",   keywords:["pdf to html","pdf to web","pdf to webpage"] },
  { name:"PDF to JSON",            description:"Extract PDF pages as structured JSON data",                      href:"/pdf-to-json",         category:"PDF",   keywords:["pdf to json","pdf data extraction","pdf to api"] },
  { name:"PDF to Markdown",        description:"Convert PDF text to Markdown format",                            href:"/pdf-to-markdown",     category:"PDF",   keywords:["pdf to markdown","pdf to md","pdf to documentation"] },
  { name:"PDF to XML",             description:"Extract PDF content as structured XML",                          href:"/pdf-to-xml",          category:"PDF",   keywords:["pdf to xml","pdf to structured data"] },
  { name:"CSV to PDF",             description:"Convert CSV data to a formatted PDF table",                      href:"/csv-to-pdf",          category:"PDF",   keywords:["csv to pdf","spreadsheet to pdf","csv pdf"] },
  { name:"TXT to PDF",             description:"Convert plain text files to clean PDF",                          href:"/txt-to-pdf",          category:"PDF",   keywords:["txt to pdf","text to pdf","notepad to pdf","plain text pdf"] },
  { name:"Markdown to PDF",        description:"Convert Markdown files to styled PDF — headings, code, lists",  href:"/markdown-to-pdf",     category:"PDF",   keywords:["markdown to pdf","md to pdf","readme to pdf","documentation pdf"] },
  { name:"JSON to PDF",            description:"Convert JSON data to formatted PDF document",                    href:"/json-to-pdf",         category:"PDF",   keywords:["json to pdf","api response pdf"] },
  { name:"XML to PDF",             description:"Convert XML files to readable PDF",                              href:"/xml-to-pdf",          category:"PDF",   keywords:["xml to pdf"] },
  { name:"Excel to PDF",           description:"Convert Excel XLSX files to PDF — all sheets included",         href:"/excel-to-pdf",        category:"PDF",   keywords:["excel to pdf","xlsx to pdf","spreadsheet to pdf","excel pdf"] },
  { name:"XLS to PDF",             description:"Convert legacy XLS Excel files to PDF",                         href:"/xls-to-pdf",          category:"PDF",   keywords:["xls to pdf","old excel to pdf","excel 97 pdf"] },
  { name:"DOC to PDF",             description:"Convert DOC/DOCX Word files to PDF",                            href:"/doc-to-pdf",          category:"PDF",   keywords:["doc to pdf","docx to pdf","word to pdf","document pdf"] },
  { name:"RTF to PDF",             description:"Convert RTF Rich Text files to PDF",                            href:"/rtf-to-pdf",          category:"PDF",   keywords:["rtf to pdf","rich text to pdf","wordpad to pdf"] },
  { name:"EPUB to PDF",            description:"Convert EPUB eBooks to PDF document",                           href:"/epub-to-pdf",         category:"PDF",   keywords:["epub to pdf","ebook to pdf","epub pdf"] },
  { name:"PDF to EPUB",            description:"PDF to EPUB eBook — format guide and best tools",               href:"/pdf-to-epub",         category:"PDF",   keywords:["pdf to epub","pdf to ebook","pdf ebook"] },
  { name:"PDF to MOBI",            description:"PDF to MOBI Kindle — how to convert PDF for Kindle",            href:"/pdf-to-mobi",         category:"PDF",   keywords:["pdf to mobi","pdf to kindle","kindle pdf"] },
  { name:"MOBI to PDF",            description:"MOBI to PDF — convert Kindle books to PDF with Calibre",        href:"/mobi-to-pdf",         category:"PDF",   keywords:["mobi to pdf","kindle to pdf"] },
  { name:"PDF to PPT",             description:"PDF to PowerPoint — conversion guide and tools",                 href:"/pdf-to-ppt",          category:"PDF",   keywords:["pdf to ppt","pdf to powerpoint","pdf to slides"] },
  { name:"PPT to PDF",             description:"PPT to PDF — use our PPTX to PDF converter",                    href:"/ppt-to-pdf",          category:"PDF",   keywords:["ppt to pdf","powerpoint to pdf","presentation to pdf"] },
  { name:"PDF to AVIF",            description:"PDF to AVIF next-gen image — format guide and alternatives",      href:"/pdf-to-avif",         category:"PDF",   keywords:["pdf to avif","pdf avif"] },
  { name:"PDF to BMP",             description:"PDF to BMP bitmap — why to use PNG instead",                      href:"/pdf-to-bmp",          category:"PDF",   keywords:["pdf to bmp","pdf to bitmap"] },
  { name:"PDF to TIFF",            description:"PDF to TIFF — professional format guide",                         href:"/pdf-to-tiff",         category:"PDF",   keywords:["pdf to tiff","pdf to tif","pdf tiff"] },
  { name:"PDF to SVG",             description:"PDF to SVG vector — conversion guide",                            href:"/pdf-to-svg",          category:"PDF",   keywords:["pdf to svg","pdf to vector"] },
  { name:"PDF to HEIC",            description:"PDF to HEIC — browser limitation guide",                          href:"/pdf-to-heic",         category:"PDF",   keywords:["pdf to heic","pdf to iphone"] },
  { name:"PDF to RTF",             description:"PDF to RTF Rich Text — use PDF to Word instead",                  href:"/pdf-to-rtf",          category:"PDF",   keywords:["pdf to rtf","pdf to rich text"] },
  { name:"PDF to ODT",             description:"PDF to ODT LibreOffice — format guide",                           href:"/pdf-to-odt",          category:"PDF",   keywords:["pdf to odt","pdf to libreoffice","pdf to openoffice"] },
  { name:"PDF to DOC",             description:"PDF to DOC — use PDF to Word (DOCX) instead",                    href:"/pdf-to-doc",          category:"PDF",   keywords:["pdf to doc","pdf to word doc"] },
  { name:"PDF to XLS",             description:"PDF to XLS — use PDF to Excel (XLSX) instead",                   href:"/pdf-to-xls",          category:"PDF",   keywords:["pdf to xls","pdf to excel xls"] },
  { name:"PDF to AZW3",            description:"PDF to AZW3 Kindle — format guide and Calibre tips",             href:"/pdf-to-azw3",         category:"PDF",   keywords:["pdf to azw3","pdf to kindle fire"] },
  { name:"AZW3 to PDF",            description:"AZW3 to PDF — convert Kindle ebooks to PDF with Calibre",        href:"/azw3-to-pdf",         category:"PDF",   keywords:["azw3 to pdf","kindle to pdf","amazon kindle pdf"] },
  { name:"ODT to PDF",             description:"ODT to PDF — LibreOffice document to PDF guide",                  href:"/odt-to-pdf",          category:"PDF",   keywords:["odt to pdf","libreoffice to pdf","openoffice to pdf"] },
  { name:"Resume Builder",          description:"Build professional resumes with 20+ ATS-optimized templates",href:"/resume-builder",  category:"Dev",   keywords:["resume","cv","job application","template","ats","professional","career","work history","cover letter","curriculum vitae"] },

  // ── Dev ────────────────────────────────────────────────────────────────────
  { name:"JSON Preview",            description:"Visualize JSON as an interactive expandable tree",     href:"/json-preview",           category:"Dev",   keywords:["json viewer","inspect","tree","collapse","format json","pretty print","parse json"] },
  { name:"API Formatter",           description:"Beautify & inspect API responses",                     href:"/api-formatter",          category:"Dev",   keywords:["api","response","headers","status","format","beautify","fetch","http"] },
  { name:"Code Screenshot",         description:"Beautiful syntax-highlighted code snippet images",     href:"/code-screenshot",        category:"Dev",   keywords:["carbon","snippet","image","theme","code image","share code","syntax highlight"] },
  { name:"Markdown Studio",         description:"Write and preview Markdown as styled docs",            href:"/markdown-docs",          category:"Dev",   keywords:["markdown","preview","md","documentation","render","readme","notes"] },
  { name:"Fake Data Generator",     description:"Generate realistic mock & dummy test data",            href:"/fake-data",              category:"Dev",   keywords:["mock","dummy","test data","faker","csv","sample data","seed","random data"] },
  { name:"Email Signature Generator",description:"Create professional HTML email signatures",          href:"/email-signature",        category:"Dev",   keywords:["signature","html","email","professional","copy","gmail signature","outlook"] },
  { name:"SVG Optimizer",           description:"Clean and reduce SVG file size",                       href:"/svg-optimizer",          category:"Dev",   keywords:["svg","svgo","clean","figma","illustrator","vector","compress svg"] },
  { name:"QR Code Generator",       description:"Generate QR codes for URLs, WiFi and vCards",         href:"/qr-code",                category:"Dev",   keywords:["qr","qr code","url","wifi","vcard","barcode","create qr","generate qr"] },
  { name:"Barcode Generator",       description:"Create Code128, EAN-13, UPC-A barcodes",              href:"/barcode",                category:"Dev",   keywords:["barcode","ean","upc","code128","itf","create barcode","product code"] },
  { name:"Password Generator",      description:"Generate crypto-secure passwords in bulk",             href:"/password-generator",     category:"Dev",   keywords:["password","secure","random","strong","bulk","generate password","passphrase"] },
  { name:"JSON ↔ CSV Converter",    description:"Bidirectional JSON and CSV conversion",                href:"/json-csv",               category:"Dev",   keywords:["json to csv","csv to json","convert","delimiter","table","spreadsheet","data"] },
  { name:"Favicon Generator",       description:"Create ICO, PNG & web app manifest icons",             href:"/favicon-generator",      category:"Dev",   keywords:["favicon","ico","app icon","manifest","apple icon","browser icon","32x32"] },
  { name:"Color Picker & Palette",  description:"Pick colors in Hex, RGB, HSL with WCAG contrast",     href:"/color-picker",           category:"Dev",   keywords:["color","hex","rgb","hsl","wcag","contrast","palette","color picker","accessibility"] },
  { name:"Word Counter",            description:"Count words, characters, sentences & SEO density",     href:"/word-counter",           category:"Dev",   keywords:["word count","characters","reading time","seo","density","word counter","count"] },
  { name:"Base64 Encode / Decode",  description:"Encode and decode Base64, URL encoding, HTML entities",href:"/base64",                category:"Dev",   keywords:["base64","encode","decode","url encode","html entities","cipher","convert"] },
  { name:"Regex Tester",            description:"Real-time regex pattern matching with cheat sheet",    href:"/regex-tester",           category:"Dev",   keywords:["regex","regular expression","pattern","match","test","regexp","search"] },
  { name:"CSS Gradient Generator",  description:"Create linear, radial and conic CSS gradients",        href:"/gradient-generator",     category:"Dev",   keywords:["css","gradient","linear","radial","conic","background","color gradient"] },
  { name:"Lorem Ipsum Generator",   description:"Generate placeholder paragraphs, sentences and words", href:"/lorem-ipsum",            category:"Dev",   keywords:["placeholder","dummy text","lipsum","lorem","filler","sample text"] },
  { name:"Diff Checker",            description:"Compare text, JSON & images side by side",             href:"/diff-checker",           category:"Dev",   keywords:["compare","diff","difference","changes","text diff","before after","side by side"] },
  { name:"Multi-Format Converter",  description:"Convert files to Text, Table, JSON & Images at once",  href:"/multi-converter",        category:"Dev",   keywords:["convert","multi format","text","json","csv","images","one click","all formats"] },
  { name:"CSV Visual Debugger",     description:"Find duplicates, empty values & column issues in CSV", href:"/csv-debugger",           category:"Dev",   keywords:["csv","debug","duplicates","empty","data problems","validate","errors","issues"] },
  { name:"Bulk File Renamer",       description:"Rename files with date, numbering & pattern rules",    href:"/bulk-renamer",           category:"Dev",   keywords:["rename","bulk","batch","numbering","date","pattern","file names","mass rename"] },
  { name:"Folder Structure Visualizer",description:"Interactive folder tree with unused file detection",href:"/folder-visualizer",     category:"Dev",   keywords:["folder","tree","structure","visualizer","project","directory","files","map"] },
  { name:"JSON to PPTX",            description:"Convert structured JSON to a PowerPoint presentation", href:"/json-to-pptx",          category:"Dev",   keywords:["json to pptx","json to powerpoint","create presentation","pptx from json","slides","generate powerpoint","json slides"] },
  { name:"JS to PPTX",              description:"Write JavaScript to generate PPTX files using pptxgenjs",href:"/js-to-pptx",         category:"Dev",   keywords:["js to pptx","javascript pptx","pptxgenjs","code to powerpoint","create pptx","presentation api","generate pptx code"] },
  { name:"Word to PDF",             description:"Convert Word DOCX files to PDF entirely in your browser",href:"/word-to-pdf",        category:"Dev",   keywords:["word to pdf","docx to pdf","convert word","doc to pdf","microsoft word","word document pdf","docx convert"] },
  { name:"Website Trust Checker",   description:"Check SSL, security headers & get a 0-100 trust score for any website",href:"/website-trust-checker",   category:"Dev",   keywords:["website trust","ssl checker","security headers","is site safe","trust score","website legitimacy","website safety","https checker","check website","site security"] },
  { name:"Website Content Extractor",description:"Extract clean readable article text from any URL, export as Markdown or plain text",href:"/website-content-extractor",category:"Dev",   keywords:["content extractor","article extractor","url to text","url to markdown","clean article","extract text url","webpage text","reader mode","mercury reader","remove ads"] },
];

// ─── Category styling ─────────────────────────────────────────────────────────

const CAT = {
  PDF:   { chip:"bg-red-50 text-red-600 border-red-100",   dot:"bg-red-400",    ring:"ring-red-200"   },
  Image: { chip:"bg-amber-50 text-amber-600 border-amber-100", dot:"bg-amber-400", ring:"ring-amber-200" },
  Dev:   { chip:"bg-blue-50 text-blue-600 border-blue-100",  dot:"bg-blue-400",   ring:"ring-blue-200"  },
};

// ─── Starter suggestions ──────────────────────────────────────────────────────

const STARTERS = [
  "Compress a PDF",
  "Remove image background",
  "Convert PNG to JPG",
  "Make a QR code",
  "Detect if image is AI",
  "Build a resume",
  "Sign a PDF",
  "Extract text from image",
];

// ─── Matching ─────────────────────────────────────────────────────────────────

function findTools(query: string): ChatTool[] {
  const raw = query.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!raw || raw.length < 2) return [];

  const tokens = raw.split(" ").filter(t => t.length > 1);
  const STOP = new Set(["a","an","the","to","for","my","me","i","want","need","how","can","do","is","it","this","that","what","please","help","find","use","from","into","and","or","with"]);
  const meaningful = tokens.filter(t => !STOP.has(t));

  type Scored = ChatTool & { score: number };
  const scored: Scored[] = TOOLS.map(tool => {
    const name = tool.name.toLowerCase();
    const desc = tool.description.toLowerCase();
    const kw = tool.keywords.join(" ").toLowerCase();
    const cat = tool.category.toLowerCase();
    let score = 0;

    // Full phrase match = jackpot
    if (name.includes(raw)) score += 30;
    if (kw.includes(raw)) score += 20;

    const check = meaningful.length ? meaningful : tokens;
    for (const tok of check) {
      // Name word starts-with
      if (name.split(/\s+/).some(w => w.startsWith(tok))) score += 10;
      else if (name.includes(tok)) score += 7;
      // Keywords
      if (kw.split(/\s+/).some(w => w.startsWith(tok))) score += 6;
      else if (kw.includes(tok)) score += 4;
      // Description
      if (desc.includes(tok)) score += 2;
      // Category
      if (cat.includes(tok)) score += 1;
    }

    // Category affinity boost
    const q = raw;
    if (tool.category === "PDF"   && (q.includes("pdf") || q.includes("document") || q.includes("doc"))) score += 4;
    if (tool.category === "Image" && (q.includes("image") || q.includes("photo") || q.includes("picture") || q.includes("png") || q.includes("jpg"))) score += 4;
    if (tool.category === "Dev"   && (q.includes("code") || q.includes("json") || q.includes("csv") || q.includes("dev"))) score += 4;

    return { ...tool, score };
  });

  return scored
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// ─── Message types ────────────────────────────────────────────────────────────

type Msg =
  | { role: "user"; text: string }
  | { role: "bot"; text: string; tools?: ChatTool[]; starters?: boolean };

// ─── Component ────────────────────────────────────────────────────────────────

export default function ToolChatbot() {
  const [open, setOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi! Tell me what you're trying to do and I'll find the right tool for you.", starters: true },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 80); }, [open]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  // Show "Find a tool" label bubble after 1.8s, auto-hide after 5s
  useEffect(() => {
    const show = setTimeout(() => setShowLabel(true), 1800);
    const hide = setTimeout(() => setShowLabel(false), 7000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const send = useCallback((text: string) => {
    if (!text.trim()) return;
    const q = text.trim();
    setInput("");
    setMsgs(m => [...m, { role: "user", text: q }]);
    setTyping(true);

    // Simulate a short think delay for a more natural feel
    setTimeout(() => {
      const results = findTools(q);
      let reply: string;
      if (results.length === 0) {
        reply = "I couldn't find an exact match. Try describing it differently, or browse all tools below.";
      } else if (results.length === 1) {
        reply = `This tool should do the job:`;
      } else {
        reply = `Here are ${results.length} tools that can help:`;
      }
      setTyping(false);
      setMsgs(m => [...m, { role: "bot", text: reply, tools: results }]);
    }, 480);
  }, []);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const reset = () => {
    setMsgs([{ role: "bot", text: "Hi! Tell me what you're trying to do and I'll find the right tool for you.", starters: true }]);
    setInput("");
  };

  return (
    <>
      {/* ── Floating button + label ──────────────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 z-50 flex items-end gap-3">
        {/* Attention label bubble — auto-shows then fades */}
        {!open && (
          <div className={`mb-2 transition-all duration-500 ${showLabel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
            <div className="relative bg-white border border-indigo-100 shadow-lg rounded-2xl px-4 py-2.5 flex items-center gap-2 whitespace-nowrap">
              <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0"/>
              <span className="text-sm font-semibold text-gray-800">Find the right tool</span>
              <button onClick={() => setShowLabel(false)} className="ml-1 text-gray-300 hover:text-gray-500">
                <X className="w-3 h-3"/>
              </button>
              {/* Tail pointing right */}
              <span className="absolute right-[-7px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-b-[7px] border-l-[8px] border-t-transparent border-b-transparent border-l-white"/>
              <span className="absolute right-[-9px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-b-[8px] border-l-[9px] border-t-transparent border-b-transparent border-l-indigo-100 -z-10"/>
            </div>
          </div>
        )}

        <button
          onClick={() => { setOpen(o => !o); setShowLabel(false); }}
          aria-label="Tool recommendation assistant"
          className={`relative w-[72px] h-[72px] rounded-full shadow-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ${open ? "bg-gray-800 scale-95" : "bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-600 hover:scale-110 hover:shadow-indigo-300/60"}`}
          style={open ? {} : { boxShadow: "0 8px 32px rgba(99,102,241,0.45)" }}
        >
          {open ? (
            <X className="w-7 h-7 text-white"/>
          ) : (
            <>
              <Bot className="w-8 h-8 text-white drop-shadow"/>
              <span className="text-[9px] font-bold text-indigo-100 tracking-wide leading-none">ASK AI</span>
              {/* Live pulse dot */}
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center">
                <span className="absolute w-5 h-5 bg-green-400 rounded-full opacity-40 animate-ping"/>
                <span className="w-3 h-3 bg-green-400 rounded-full border-2 border-white"/>
              </span>
            </>
          )}
        </button>
      </div>

      {/* ── Chat panel ──────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        className={`fixed bottom-24 right-5 z-50 w-[430px] max-w-[calc(100vw-16px)] rounded-2xl shadow-2xl border border-border bg-white flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
        style={{ maxHeight: "min(680px, calc(100dvh - 108px))" }}
      >
        {/* Header */}
        <div className="shrink-0 bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-600 px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-white"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-none">Tool Finder AI</p>
            <p className="text-[11px] text-indigo-200 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"/>
              219 tools · describe what you need
            </p>
          </div>
          <button onClick={reset} title="New chat" className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors">
            <RotateCcw className="w-3.5 h-3.5"/>
          </button>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5"/>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 overscroll-contain">
          {msgs.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-primary text-white text-sm px-3.5 py-2 rounded-2xl rounded-tr-sm max-w-[85%] leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="bg-gray-50 border border-gray-100 text-gray-700 text-sm px-3.5 py-2 rounded-2xl rounded-tl-sm max-w-[90%] leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Tool cards */}
                  {msg.tools && msg.tools.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {msg.tools.map(tool => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={() => setOpen(false)}
                          className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 bg-white hover:bg-primary/[0.02] transition-all shadow-sm"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${CAT[tool.category].chip}`}>
                                {tool.category}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{tool.name}</p>
                            <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{tool.description}</p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary shrink-0 transition-colors"/>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* No results — high-intent: suggest requesting the tool */}
                  {msg.tools && msg.tools.length === 0 && (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/request-a-tool"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors group"
                      >
                        <Sparkles className="w-4 h-4 text-primary shrink-0"/>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-primary leading-tight">Request this tool →</p>
                          <p className="text-[10px] text-indigo-500 mt-0.5">47 tools built from requests</p>
                        </div>
                      </Link>
                      <div className="flex gap-1.5 flex-wrap">
                        {[{label:"All Tools",href:"/all-tools"},{label:"PDF",href:"/pdf-tools"},{label:"Image",href:"/image-tools"},{label:"Dev",href:"/dev-tools"}].map(l=>(
                          <Link key={l.href} href={l.href} onClick={()=>setOpen(false)} className="text-xs px-2.5 py-1 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-gray-500 transition-colors bg-white">
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Starter suggestions */}
                  {msg.starters && (
                    <div className="flex flex-col gap-1.5 mt-0.5">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide px-0.5">Try asking:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {STARTERS.map(s => (
                          <button key={s} onClick={() => send(s)} className="text-xs px-2.5 py-1.5 rounded-xl border border-gray-200 hover:border-primary/40 hover:bg-primary/[0.03] hover:text-primary text-gray-600 transition-all bg-white shadow-sm">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-1 px-3.5 py-2.5 bg-gray-50 rounded-2xl rounded-tl-sm w-16">
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay:`${i*130}ms` }}/>
              ))}
            </div>
          )}

          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border px-3 py-3 flex items-center gap-2 bg-white">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="e.g. compress image, make QR code, sign PDF…"
            className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-gray-400 text-gray-800"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 disabled:opacity-35 hover:opacity-90 transition-opacity shadow-sm"
          >
            <Send className="w-4 h-4 text-white"/>
          </button>
        </div>
      </div>
    </>
  );
}
