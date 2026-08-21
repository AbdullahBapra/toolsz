"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileDown, Image, Merge, FileText, Table2, Highlighter, FileEdit, BookOpen,
  Scissors, RotateCw, Droplets, EyeOff, GitCompare, Receipt, PenTool, Unlock,
  Lock, LayoutList, ListOrdered, Crop, Layers, ScanSearch, Sparkles, Gauge,
  ScrollText, ClipboardList, Maximize, Type, ArrowRightLeft, Pencil, Smartphone,
  ShieldCheck, Eraser, Camera, Eye, Paintbrush, Film, Grid3x3, LayoutGrid,
  MessageSquare, Maximize2, Palette, Braces, Server, Database, Mail, QrCode,
  Barcode, Binary, Regex, Lock as LockIcon, ArrowRight, Bug, PenLine, FolderTree,
  Code, Ruler, BookOpen as BookOpenIcon, Search, X,
} from "lucide-react";

interface Tool {
  name: string; desc: string; href: string;
  category: "PDF" | "Image" | "Dev";
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const ALL_TOOLS: Tool[] = [
  // PDF
  { name:"Compress PDF",             desc:"Reduce PDF file size without losing quality.",                              href:"/compress-pdf",          category:"PDF",   icon:FileDown,      badge:"Popular" },
  { name:"Merge PDF",                desc:"Combine multiple PDFs into one document.",                                  href:"/merge-pdf",             category:"PDF",   icon:Merge },
  { name:"Split PDF",                desc:"Divide PDF by page ranges or extract specific pages.",                      href:"/split-pdf",             category:"PDF",   icon:Scissors },
  { name:"PDF to JPG",               desc:"Convert each PDF page to a high-quality image.",                           href:"/pdf-to-jpg",            category:"PDF",   icon:Image },
  { name:"PDF to Word",              desc:"Convert PDF to editable DOCX — free.",                                     href:"/pdf-to-word",           category:"PDF",   icon:FileDown },
  { name:"PDF to Excel",             desc:"Extract PDF tables to XLSX spreadsheets.",                                  href:"/pdf-to-excel",          category:"PDF",   icon:Table2 },
  { name:"PDF to Text",              desc:"Extract all text content from PDF files.",                                  href:"/pdf-to-text",           category:"PDF",   icon:FileText },
  { name:"PDF to Data",              desc:"Convert PDF content into structured JSON or CSV.",                          href:"/pdf-to-data",           category:"PDF",   icon:Table2 },
  { name:"PDF OCR",                  desc:"Make scanned PDFs searchable using Tesseract.",                            href:"/pdf-ocr",               category:"PDF",   icon:ScanSearch,    badge:"Free" },
  { name:"PDF Editor",               desc:"Draw, highlight and add text on PDF pages.",                               href:"/pdf-editor",            category:"PDF",   icon:FileEdit },
  { name:"Sign PDF",                 desc:"Add your signature to any PDF document.",                                   href:"/sign-pdf",              category:"PDF",   icon:PenTool },
  { name:"PDF Form Filler",          desc:"Fill PDF forms without Adobe Acrobat.",                                     href:"/pdf-form-filler",       category:"PDF",   icon:FileEdit,      badge:"Free" },
  { name:"Redact PDF",               desc:"Permanently remove sensitive information from PDFs.",                       href:"/redact-pdf",            category:"PDF",   icon:EyeOff },
  { name:"Protect PDF",              desc:"Add AES-256 password encryption to PDFs.",                                  href:"/protect-pdf",           category:"PDF",   icon:Lock },
  { name:"Unlock PDF",               desc:"Remove password protection from your PDFs.",                                href:"/unlock-pdf",            category:"PDF",   icon:Unlock },
  { name:"Watermark PDF",            desc:"Add custom text watermarks to PDFs.",                                       href:"/watermark-pdf",         category:"PDF",   icon:Droplets },
  { name:"Rotate PDF",               desc:"Rotate individual or all PDF pages.",                                       href:"/rotate-pdf",            category:"PDF",   icon:RotateCw },
  { name:"Organize PDF",             desc:"Reorder, delete and duplicate PDF pages.",                                  href:"/organize-pdf",          category:"PDF",   icon:LayoutList },
  { name:"Crop PDF",                 desc:"Trim PDF page margins and white space.",                                    href:"/crop-pdf",              category:"PDF",   icon:Crop },
  { name:"Flatten PDF",              desc:"Merge form fields into static PDF content.",                                href:"/flatten-pdf",           category:"PDF",   icon:Layers },
  { name:"Add Page Numbers",         desc:"Insert page numbers in any position and format.",                           href:"/page-numbers",          category:"PDF",   icon:ListOrdered },
  { name:"Highlight Extractor",      desc:"Extract annotated text and highlights from PDFs.",                         href:"/highlight-extractor",   category:"PDF",   icon:Highlighter,   badge:"Unique" },
  { name:"PDF Diff",                 desc:"Compare two PDFs side by side with diff highlighting.",                    href:"/pdf-diff",              category:"PDF",   icon:GitCompare,    badge:"Unique" },
  { name:"PDF Flipbook",             desc:"Read any PDF as an interactive 3D flipbook.",                               href:"/flipbook-pdf",          category:"PDF",   icon:BookOpen,      badge:"Unique" },
  { name:"HTML to PDF",              desc:"Convert HTML markup to a clean PDF.",                                       href:"/html-to-pdf",           category:"PDF",   icon:FileDown },
  { name:"PPTX to PDF",              desc:"Convert PowerPoint presentations to PDF.",                                  href:"/pptx-to-pdf",           category:"PDF",   icon:FileDown },
  { name:"Invoice Generator",        desc:"Create professional PDF invoices with 10 templates.",                      href:"/invoice-generator",     category:"PDF",   icon:Receipt },
  { name:"Smart PDF Cleaner",        desc:"Auto-remove margins and normalize fonts.",                                  href:"/pdf-cleaner",           category:"PDF",   icon:Sparkles,      badge:"Unique" },
  { name:"PDF Size Analyzer",        desc:"Visual breakdown of what's bloating your PDF.",                            href:"/size-analyzer",         category:"PDF",   icon:Gauge,         badge:"Unique" },
  { name:"PDF Quality Score",        desc:"Brutally honest quality score for any PDF.",                               href:"/pdf-roast",             category:"PDF",   icon:ScrollText,    badge:"Unique" },
  { name:"Business Document Pack",   desc:"Invoices, quotes, receipts and purchase orders.",                          href:"/business-docs",         category:"PDF",   icon:ClipboardList, badge:"Unique" },
  { name:"Extract Images from PDF",  desc:"Pull all embedded images from a PDF.",                                     href:"/extract-images-pdf",    category:"PDF",   icon:Image },
  // Image
  { name:"Compress Image",           desc:"Reduce image file size while keeping quality.",                             href:"/compress-image",        category:"Image", icon:FileDown,      badge:"Popular" },
  { name:"Compress to Exact Size",   desc:"Hit a precise KB/MB target for passport, visa and ID photos.",            href:"/compress-to-size",      category:"Image", icon:FileDown,      badge:"Unique" },
  { name:"Background Remover",       desc:"Remove image backgrounds with AI.",                                        href:"/remove-bg",             category:"Image", icon:Eraser,        badge:"AI" },
  { name:"Resize Image",             desc:"Scale images to any pixel size or percentage.",                            href:"/resize-image",          category:"Image", icon:Maximize },
  { name:"Convert Image",            desc:"Switch between PNG, JPG, WebP, HEIC, SVG and more.",                      href:"/convert-image",         category:"Image", icon:ArrowRightLeft },
  { name:"Image Upscaler",           desc:"Upscale images up to 4× using super-resolution AI.",                      href:"/upscale-image",         category:"Image", icon:Maximize2,     badge:"AI" },
  { name:"HEIC to JPG",              desc:"Convert iPhone HEIC/HEIF photos to JPG.",                                  href:"/heic-to-jpg",           category:"Image", icon:Smartphone },
  { name:"Watermark Remover",        desc:"Remove watermarks from images using AI inpainting.",                       href:"/watermark-remover",     category:"Image", icon:Paintbrush,    badge:"AI" },
  { name:"Photo Enhancer",           desc:"Auto-fix and fine-tune image quality.",                                    href:"/photo-enhancer",        category:"Image", icon:Sparkles },
  { name:"AI Image Detector",        desc:"Detect AI-generated images using CLIP neural network.",                    href:"/ai-detector",           category:"Image", icon:Eye,           badge:"AI" },
  { name:"Image Cropper",            desc:"Crop to any aspect ratio with precision.",                                  href:"/crop-image",            category:"Image", icon:Crop },
  { name:"Edit Image",               desc:"Adjust brightness, contrast, saturation and filters.",                     href:"/edit-image",            category:"Image", icon:Pencil },
  { name:"Blur Background",          desc:"Add professional portrait bokeh blur.",                                    href:"/blur-background",       category:"Image", icon:Droplets },
  { name:"Blur Face",                desc:"Blur faces and sensitive areas for privacy.",                              href:"/blur-face",             category:"Image", icon:EyeOff },
  { name:"Watermark Image",          desc:"Add custom text or logo watermarks to photos.",                            href:"/watermark-image",       category:"Image", icon:Droplets },
  { name:"Rotate & Flip Image",      desc:"Rotate 90°/180°/270° and flip images.",                                   href:"/rotate-image",          category:"Image", icon:RotateCw },
  { name:"Batch Image Resizer",      desc:"Resize 50+ images at once, download as ZIP.",                              href:"/batch-resize",          category:"Image", icon:Maximize },
  { name:"Image to Text (OCR)",      desc:"Extract text from images using OCR.",                                      href:"/image-to-text",         category:"Image", icon:Type },
  { name:"Image to PDF",             desc:"Convert images into a single PDF document.",                               href:"/image-to-pdf",          category:"Image", icon:Image },
  { name:"EXIF Remover",             desc:"Strip GPS and camera metadata from photos.",                               href:"/exif-remover",          category:"Image", icon:ShieldCheck },
  { name:"ID Photo Maker",           desc:"Create passport and visa photos at the right size.",                       href:"/id-photo",              category:"Image", icon:Camera },
  { name:"Social Media Resizer",     desc:"Resize images for Instagram, Twitter, LinkedIn.",                          href:"/social-image",          category:"Image", icon:Smartphone },
  { name:"GIF Maker",                desc:"Create animated GIFs from a set of images.",                              href:"/gif-maker",             category:"Image", icon:Film },
  { name:"Video to GIF",             desc:"Convert video clips to animated GIFs.",                                   href:"/video-to-gif",          category:"Image", icon:Film },
  { name:"Image Splitter",           desc:"Split images into Instagram grid layouts.",                                href:"/split-image",           category:"Image", icon:Grid3x3 },
  { name:"Collage Maker",            desc:"Create photo collages with flexible grid layouts.",                        href:"/collage-maker",         category:"Image", icon:LayoutGrid },
  { name:"Meme Generator",           desc:"Add text captions to images and create memes.",                            href:"/meme-generator",        category:"Image", icon:MessageSquare },
  { name:"Image Annotator",          desc:"Add arrows, text and markup to images.",                                   href:"/annotate-image",        category:"Image", icon:PenTool },
  { name:"Colorize Image",           desc:"Add color to black-and-white photos.",                                     href:"/colorize-image",        category:"Image", icon:Palette },
  { name:"Color Blindness Simulator",desc:"Test designs for color-blind accessibility.",                             href:"/color-blind-simulator", category:"Image", icon:Eye },
  { name:"HTML to Image",            desc:"Render HTML and CSS code as a PNG or JPEG.",                               href:"/html-to-image",         category:"Image", icon:Code },
  { name:"Pixel Size Comparator",    desc:"Compare actual vs display pixel size with overlays.",                     href:"/pixel-comparator",      category:"Image", icon:Ruler },
  { name:"SVG to PNG",               desc:"Convert SVG vector files to PNG at any resolution.",                      href:"/svg-to-png",            category:"Image", icon:Image },
  { name:"PNG to SVG",               desc:"Trace raster images into scalable SVG vectors.",                          href:"/png-to-svg",            category:"Image", icon:ArrowRightLeft },
  { name:"Passport & Visa Photo",    desc:"Create compliant passport photos for 60+ countries.",                     href:"/passport-photo",        category:"Image", icon:Camera,         badge:"Unique" },
  { name:"Screenshot to Table",      desc:"Extract tables from screenshots into CSV or Excel.",                      href:"/screenshot-to-table",   category:"Image", icon:Table2,         badge:"Unique" },
  { name:"Image Roast & Quality",    desc:"Brutally honest quality score for any image.",                            href:"/image-roast",           category:"Image", icon:Gauge,          badge:"Unique" },
  { name:"Print & Frame Calculator", desc:"Check if your photo will print at full size without blur.",               href:"/print-calculator",      category:"Image", icon:Ruler },
  { name:"PNG to JPG",               desc:"Convert PNG to JPG with quality control. Handles transparency.",             href:"/png-to-jpg",            category:"Image", icon:ArrowRightLeft },
  { name:"PNG to WebP",              desc:"Convert PNG to WebP — 25-35% smaller with same visual quality.",             href:"/png-to-webp",           category:"Image", icon:ArrowRightLeft },
  { name:"PNG to GIF",               desc:"Convert PNG images to static GIF format.",                                   href:"/png-to-gif",            category:"Image", icon:ArrowRightLeft },
  { name:"JPG to PNG",               desc:"Convert JPG to lossless PNG for editing and design.",                        href:"/jpg-to-png",            category:"Image", icon:ArrowRightLeft },
  { name:"JPG to WebP",              desc:"Convert JPEG photos to WebP — 25-34% smaller for faster web pages.",         href:"/jpg-to-webp",           category:"Image", icon:ArrowRightLeft },
  { name:"WebP to PNG",              desc:"Convert WebP to PNG for Photoshop, email, and Windows compatibility.",       href:"/webp-to-png",           category:"Image", icon:ArrowRightLeft },
  { name:"Bulk PNG to JPG",          desc:"Batch convert multiple PNG files to JPG — download all as ZIP.",             href:"/bulk-png-to-jpg",       category:"Image", icon:ArrowRightLeft },
  { name:"Bulk PNG to WebP",         desc:"Batch convert PNG library to WebP. 25-35% smaller, download as ZIP.",        href:"/bulk-png-to-webp",      category:"Image", icon:ArrowRightLeft },
  { name:"Bulk PNG to GIF",          desc:"Batch convert multiple PNG images to GIF — download as ZIP.",                href:"/bulk-png-to-gif",       category:"Image", icon:ArrowRightLeft },
  { name:"Bulk JPG to PNG",          desc:"Batch convert JPG photos to PNG — lossless output, download as ZIP.",        href:"/bulk-jpg-to-png",       category:"Image", icon:ArrowRightLeft },
  { name:"Bulk JPG to WebP",         desc:"Batch optimize your JPEG photo library to WebP — download as ZIP.",          href:"/bulk-jpg-to-webp",      category:"Image", icon:ArrowRightLeft },
  { name:"Bulk WebP to PNG",         desc:"Batch convert WebP files to PNG for universal compatibility.",                href:"/bulk-webp-to-png",      category:"Image", icon:ArrowRightLeft },
  // New format converters
  { name:"GIF to PNG",               desc:"Extract GIF first frame as PNG with full transparency support.",              href:"/gif-to-png",            category:"Image", icon:ArrowRightLeft },
  { name:"GIF to JPG",               desc:"Convert GIF to JPEG with white background fill.",                             href:"/gif-to-jpg",            category:"Image", icon:ArrowRightLeft },
  { name:"GIF to WebP",              desc:"Convert GIF to modern WebP format for smaller file sizes.",                   href:"/gif-to-webp",           category:"Image", icon:ArrowRightLeft },
  { name:"BMP to PNG",               desc:"Convert Windows BMP to lossless PNG — smaller, universal format.",           href:"/bmp-to-png",            category:"Image", icon:ArrowRightLeft },
  { name:"BMP to JPG",               desc:"Convert BMP to JPEG with adjustable quality.",                               href:"/bmp-to-jpg",            category:"Image", icon:ArrowRightLeft },
  { name:"BMP to WebP",              desc:"Convert BMP to modern WebP for better compression.",                          href:"/bmp-to-webp",           category:"Image", icon:ArrowRightLeft },
  { name:"AVIF to PNG",              desc:"Convert AVIF to PNG for universal software compatibility.",                   href:"/avif-to-png",           category:"Image", icon:ArrowRightLeft },
  { name:"AVIF to JPG",              desc:"Convert AVIF to JPEG for broad sharing and app compatibility.",               href:"/avif-to-jpg",           category:"Image", icon:ArrowRightLeft },
  { name:"WebP to JPG",              desc:"Convert WebP to JPEG for broad software and sharing compatibility.",          href:"/webp-to-jpg",           category:"Image", icon:ArrowRightLeft },
  { name:"WebP to GIF",              desc:"Convert WebP to GIF format with 256-color palette.",                          href:"/webp-to-gif",           category:"Image", icon:ArrowRightLeft },
  { name:"WebP to SVG",              desc:"Trace WebP images to scalable SVG vector — 4 tracing modes.",                href:"/webp-to-svg",           category:"Image", icon:ArrowRightLeft },
  { name:"WebP to ICO",              desc:"Create ICO favicon from WebP images for browser favicons.",                   href:"/webp-to-ico",           category:"Image", icon:ArrowRightLeft },
  { name:"WebP to BMP",              desc:"Convert WebP to 24-bit BMP for Windows legacy compatibility.",                href:"/webp-to-bmp",           category:"Image", icon:ArrowRightLeft },
  { name:"WebP to TIFF",             desc:"Convert WebP to TIFF for professional print workflows.",                      href:"/webp-to-tiff",          category:"Image", icon:ArrowRightLeft },
  { name:"JPG to GIF",               desc:"Convert JPG photos to GIF format with 256-color palette.",                   href:"/jpg-to-gif",            category:"Image", icon:ArrowRightLeft },
  { name:"JPG to SVG",               desc:"Trace JPEG to scalable SVG vector — pixel-perfect, detailed, flat, or mono.",href:"/jpg-to-svg",            category:"Image", icon:ArrowRightLeft },
  { name:"JPG to ICO",               desc:"Create multi-size ICO favicon from any JPG image.",                          href:"/jpg-to-ico",            category:"Image", icon:ArrowRightLeft },
  { name:"JPG to BMP",               desc:"Convert JPEG to 24-bit BMP for legacy Windows compatibility.",               href:"/jpg-to-bmp",            category:"Image", icon:ArrowRightLeft },
  { name:"JPG to AVIF",              desc:"Convert JPEG to AVIF for up to 50% smaller file sizes.",                     href:"/jpg-to-avif",           category:"Image", icon:ArrowRightLeft },
  { name:"JPG to TIFF",              desc:"Convert JPG to TIFF for professional print workflows.",                       href:"/jpg-to-tiff",           category:"Image", icon:ArrowRightLeft },
  { name:"JPG to HEIC",              desc:"Convert JPG to HEIC — or use AVIF as an open alternative.",                  href:"/jpg-to-heic",           category:"Image", icon:ArrowRightLeft },
  { name:"PNG to ICO",               desc:"Create multi-size ICO favicons (256, 48, 32, 16px) from any PNG.",           href:"/png-to-ico",            category:"Image", icon:ArrowRightLeft },
  { name:"PNG to BMP",               desc:"Convert PNG to 24-bit Windows BMP format.",                                   href:"/png-to-bmp",            category:"Image", icon:ArrowRightLeft },
  { name:"PNG to AVIF",              desc:"Convert PNG to next-gen AVIF — up to 50% smaller than JPG.",                 href:"/png-to-avif",           category:"Image", icon:ArrowRightLeft },
  { name:"PNG to TIFF",              desc:"Convert PNG to TIFF for professional print workflows.",                       href:"/png-to-tiff",           category:"Image", icon:ArrowRightLeft },
  { name:"PNG to HEIC",              desc:"Convert PNG to Apple HEIC — use Mac Preview or AVIF alternative.",           href:"/png-to-heic",           category:"Image", icon:ArrowRightLeft },
  { name:"ICO to PNG",               desc:"Extract highest-resolution PNG from ICO favicon file.",                       href:"/ico-to-png",            category:"Image", icon:ArrowRightLeft },
  { name:"ICO to JPG",               desc:"Convert ICO to JPEG — extracts and converts the largest embedded size.",     href:"/ico-to-jpg",            category:"Image", icon:ArrowRightLeft },
  { name:"ICO to WebP",              desc:"Convert ICO favicon to WebP format.",                                         href:"/ico-to-webp",           category:"Image", icon:ArrowRightLeft },
  { name:"ICO to SVG",               desc:"Convert ICO to SVG via two-step raster tracing approach.",                   href:"/ico-to-svg",            category:"Image", icon:ArrowRightLeft },
  { name:"SVG to ICO",               desc:"Create multi-size ICO favicon from SVG vector source.",                       href:"/svg-to-ico",            category:"Image", icon:ArrowRightLeft },
  { name:"SVG to JPG",               desc:"Convert SVG vector to JPEG with white background fill.",                      href:"/svg-to-jpg",            category:"Image", icon:ArrowRightLeft },
  { name:"SVG to WebP",              desc:"Convert SVG to WebP for smaller web-optimized output.",                       href:"/svg-to-webp",           category:"Image", icon:ArrowRightLeft },
  { name:"TIFF to PNG",              desc:"Convert TIFF to PNG — guide with IrfanView/GIMP/CloudConvert alternatives.", href:"/tiff-to-png",           category:"Image", icon:ArrowRightLeft },
  { name:"TIFF to JPG",              desc:"Convert TIFF to JPEG — guide with free desktop software alternatives.",       href:"/tiff-to-jpg",           category:"Image", icon:ArrowRightLeft },
  { name:"TIFF to WebP",             desc:"Convert TIFF to WebP — guide with two-step browser workaround.",             href:"/tiff-to-webp",          category:"Image", icon:ArrowRightLeft },
  { name:"HEIC to PNG",              desc:"Convert HEIC to PNG — uses our multi-format HEIC converter tool.",            href:"/heic-to-png",           category:"Image", icon:ArrowRightLeft },
  { name:"HEIC to WebP",             desc:"Convert HEIC to WebP — uses our multi-format HEIC converter tool.",           href:"/heic-to-webp",          category:"Image", icon:ArrowRightLeft },
  // Bulk image tools
  { name:"Bulk Image Compressor",    desc:"Compress dozens of images at once with shared quality slider — download ZIP.", href:"/bulk-image-compressor", category:"Image", icon:ArrowRightLeft },
  { name:"Bulk Image Resizer",       desc:"Resize multiple images to exact dimensions — contain/cover/stretch — ZIP.",   href:"/bulk-image-resizer",    category:"Image", icon:Maximize },
  { name:"Bulk Image Converter",     desc:"Convert multiple images to WebP in one batch — 25–35% smaller. ZIP download.",href:"/bulk-image-converter",  category:"Image", icon:ArrowRightLeft },
  { name:"Bulk Background Remover",  desc:"Remove backgrounds from multiple product photos — AI-powered batch.",         href:"/bulk-background-remover",category:"Image",icon:Eraser },
  { name:"Bulk Watermark Adder",     desc:"Add text or image watermarks to multiple photos in one operation.",           href:"/bulk-watermark-adder",  category:"Image", icon:Droplets },
  // Product & e-commerce tools
  { name:"Amazon Image Resizer",     desc:"Resize product photos to Amazon 1000×1000 standard — white background, JPG.",href:"/amazon-image-resizer",  category:"Image", icon:Maximize },
  { name:"Shopify Image Optimizer",  desc:"Optimize product photos for Shopify — 2048×2048, white background, JPG.",    href:"/shopify-image-optimizer",category:"Image",icon:Maximize },
  { name:"Etsy Image Resizer",       desc:"Resize product photos for Etsy listings to 2000×2000 JPG.",                  href:"/etsy-image-resizer",    category:"Image", icon:Maximize },
  { name:"Product Image Resizer",    desc:"Resize product photos with Amazon/Shopify/Etsy/eBay presets.",               href:"/product-image-resizer", category:"Image", icon:Maximize },
  { name:"Product Photo Optimizer",  desc:"Compress and optimize multiple product photos — batch JPG output.",           href:"/product-photo-optimizer",category:"Image",icon:Sparkles },
  { name:"Product Background Remover",desc:"Remove backgrounds from product photos for e-commerce white-bg listings.",  href:"/product-background-remover",category:"Image",icon:Eraser },
  // OCR & text extraction
  { name:"Screenshot to Text",       desc:"Extract text from screenshots using OCR — UI text, error messages, code.",   href:"/screenshot-to-text",    category:"Image", icon:Type },
  { name:"Handwriting to Text",      desc:"Convert handwritten notes to digital text using OCR.",                        href:"/handwriting-to-text",   category:"Image", icon:Type },
  { name:"Receipt Scanner",          desc:"Scan receipts and extract totals, items, dates, and merchant names via OCR.", href:"/receipt-scanner",       category:"Image", icon:Type },
  { name:"Business Card Scanner",    desc:"Scan business cards and extract name, email, phone, company via OCR.",        href:"/business-card-scanner", category:"Image", icon:Type },
  { name:"Table Extraction from Image",desc:"Extract tables from images into structured CSV — spatial OCR approach.",    href:"/table-extraction-from-image",category:"Image",icon:Table2 },
  { name:"JPG to PDF",               desc:"Convert JPG images to PDF — batch, no upload, no watermarks.",               href:"/jpg-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"JPEG to PDF",              desc:"Convert JPEG photos to PDF — multi-file, browser-based.",                    href:"/jpeg-to-pdf",           category:"PDF",   icon:ArrowRightLeft },
  { name:"PNG to PDF",               desc:"Convert PNG images to PDF — lossless, no upload.",                           href:"/png-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"WebP to PDF",              desc:"Convert WebP images to PDF — browser-based.",                                href:"/webp-to-pdf",           category:"PDF",   icon:ArrowRightLeft },
  { name:"GIF to PDF",               desc:"Convert GIF images to PDF — first frame used for animated GIFs.",           href:"/gif-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"BMP to PDF",               desc:"Convert BMP bitmap images to PDF — browser-based.",                         href:"/bmp-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"TIFF to PDF",              desc:"Convert TIFF scanned images to PDF.",                                        href:"/tiff-to-pdf",           category:"PDF",   icon:ArrowRightLeft },
  { name:"AVIF to PDF",              desc:"Convert AVIF next-gen images to PDF.",                                       href:"/avif-to-pdf",           category:"PDF",   icon:ArrowRightLeft },
  { name:"HEIC to PDF",              desc:"Convert iPhone HEIC photos to PDF — no upload, private.",                   href:"/heic-to-pdf",           category:"PDF",   icon:ArrowRightLeft },
  { name:"SVG to PDF",               desc:"Convert SVG vector graphics to PDF — high-resolution output.",              href:"/svg-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to PNG",               desc:"Convert PDF pages to lossless PNG images — 300 DPI option.",                href:"/pdf-to-png",            category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to WebP",              desc:"Convert PDF pages to web-optimized WebP — 25% smaller than JPEG.",          href:"/pdf-to-webp",           category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to GIF",               desc:"Convert PDF to animated GIF slideshow — each page is a frame.",             href:"/pdf-to-gif",            category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to CSV",               desc:"Extract PDF text content as CSV data — page-by-page.",                      href:"/pdf-to-csv",            category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to HTML",              desc:"Convert PDF text to an HTML web page — clean, structured output.",          href:"/pdf-to-html",           category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to JSON",              desc:"Extract PDF pages as structured JSON — perfect for data pipelines.",         href:"/pdf-to-json",           category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to Markdown",          desc:"Convert PDF text to Markdown — ready for GitHub, Notion, wikis.",           href:"/pdf-to-markdown",       category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to XML",               desc:"Extract PDF content as structured XML — for enterprise workflows.",          href:"/pdf-to-xml",            category:"PDF",   icon:ArrowRightLeft },
  { name:"CSV to PDF",               desc:"Convert CSV data to a styled PDF table — clean, professional output.",      href:"/csv-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"TXT to PDF",               desc:"Convert plain text files to clean, readable PDF documents.",                href:"/txt-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"Markdown to PDF",          desc:"Convert Markdown to PDF — headings, bold, code, lists all styled.",         href:"/markdown-to-pdf",       category:"PDF",   icon:ArrowRightLeft },
  { name:"JSON to PDF",              desc:"Convert JSON data to formatted, readable PDF — great for API responses.",    href:"/json-to-pdf",           category:"PDF",   icon:ArrowRightLeft },
  { name:"XML to PDF",               desc:"Convert XML files to readable PDF document.",                               href:"/xml-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"Excel to PDF",             desc:"Convert Excel XLSX files to PDF — all sheets included, formatted tables.",  href:"/excel-to-pdf",          category:"PDF",   icon:ArrowRightLeft },
  { name:"XLS to PDF",               desc:"Convert legacy XLS Excel files to PDF.",                                    href:"/xls-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"DOC to PDF",               desc:"Convert DOC/DOCX Word files to PDF — formatting preserved.",                href:"/doc-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"RTF to PDF",               desc:"Convert RTF Rich Text Format files to PDF.",                               href:"/rtf-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"EPUB to PDF",              desc:"Convert EPUB eBooks to PDF — chapters extracted and combined.",             href:"/epub-to-pdf",           category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to EPUB",              desc:"PDF to EPUB eBook — format guide and best free tools.",                     href:"/pdf-to-epub",           category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to MOBI",              desc:"PDF to MOBI for Kindle — conversion guide and Calibre tips.",               href:"/pdf-to-mobi",           category:"PDF",   icon:ArrowRightLeft },
  { name:"MOBI to PDF",              desc:"MOBI to PDF — convert Kindle books to PDF with Calibre.",                   href:"/mobi-to-pdf",           category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to PPT",               desc:"PDF to PowerPoint — conversion guide and best tools.",                      href:"/pdf-to-ppt",            category:"PDF",   icon:ArrowRightLeft },
  { name:"PPT to PDF",               desc:"PPT to PDF — use our PPTX to PDF converter for .pptx files.",              href:"/ppt-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to AVIF",              desc:"PDF to AVIF — next-gen image format guide and alternatives.",                href:"/pdf-to-avif",           category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to BMP",               desc:"PDF to BMP — browser limitation guide, use PNG instead.",                   href:"/pdf-to-bmp",            category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to TIFF",              desc:"PDF to TIFF — professional format guide and tools.",                         href:"/pdf-to-tiff",           category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to SVG",               desc:"PDF to SVG vector — conversion guide and tools.",                            href:"/pdf-to-svg",            category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to HEIC",              desc:"PDF to HEIC — browser limitation guide, use WebP instead.",                 href:"/pdf-to-heic",           category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to RTF",               desc:"PDF to RTF — format guide, use PDF to Word instead.",                        href:"/pdf-to-rtf",            category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to ODT",               desc:"PDF to ODT LibreOffice — format guide and tools.",                           href:"/pdf-to-odt",            category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to DOC",               desc:"PDF to DOC — redirects to our PDF to Word (DOCX) tool.",                    href:"/pdf-to-doc",            category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to XLS",               desc:"PDF to XLS — redirects to our PDF to Excel (XLSX) tool.",                   href:"/pdf-to-xls",            category:"PDF",   icon:ArrowRightLeft },
  { name:"PDF to AZW3",              desc:"PDF to AZW3 Kindle — format guide and Calibre tips.",                        href:"/pdf-to-azw3",           category:"PDF",   icon:ArrowRightLeft },
  { name:"AZW3 to PDF",              desc:"AZW3 to PDF — convert Kindle ebooks to PDF with Calibre.",                  href:"/azw3-to-pdf",           category:"PDF",   icon:ArrowRightLeft },
  { name:"ODT to PDF",               desc:"ODT to PDF — LibreOffice format guide and tools.",                           href:"/odt-to-pdf",            category:"PDF",   icon:ArrowRightLeft },
  // Dev
  { name:"JSON Preview",             desc:"Visualize JSON as an interactive collapsible tree.",                       href:"/json-preview",          category:"Dev",   icon:Braces,        badge:"Popular" },
  { name:"Regex Tester",             desc:"Test regex patterns in real time with a cheat sheet.",                     href:"/regex-tester",          category:"Dev",   icon:Regex },
  { name:"Diff Checker",             desc:"Compare text, JSON or images side by side.",                               href:"/diff-checker",          category:"Dev",   icon:GitCompare },
  { name:"Code Screenshot",          desc:"Create beautiful syntax-highlighted code images.",                         href:"/code-screenshot",       category:"Dev",   icon:Camera },
  { name:"Base64 Encode / Decode",   desc:"Encode and decode Base64, URL encoding and HTML entities.",                href:"/base64",                category:"Dev",   icon:Binary },
  { name:"QR Code Generator",        desc:"Generate QR codes for URLs, WiFi and vCards.",                            href:"/qr-code",               category:"Dev",   icon:QrCode },
  { name:"JSON ↔ CSV Converter",    desc:"Convert JSON to CSV and back instantly.",                                   href:"/json-csv",              category:"Dev",   icon:ArrowRightLeft },
  { name:"Password Generator",       desc:"Generate crypto-secure passwords in bulk.",                                href:"/password-generator",    category:"Dev",   icon:LockIcon },
  { name:"Color Picker & Palette",   desc:"Pick colors in Hex, RGB, HSL with WCAG contrast.",                        href:"/color-picker",          category:"Dev",   icon:Palette },
  { name:"Markdown Studio",          desc:"Write and preview Markdown with live rendering.",                          href:"/markdown-docs",         category:"Dev",   icon:BookOpenIcon },
  { name:"Fake Data Generator",      desc:"Generate realistic mock data for testing.",                                href:"/fake-data",             category:"Dev",   icon:Database },
  { name:"API Formatter",            desc:"Beautify and inspect API responses.",                                      href:"/api-formatter",         category:"Dev",   icon:Server },
  { name:"Barcode Generator",        desc:"Generate Code128, EAN-13, UPC-A barcodes.",                               href:"/barcode",               category:"Dev",   icon:Barcode },
  { name:"Email Signature Generator",desc:"Create professional HTML email signatures.",                               href:"/email-signature",       category:"Dev",   icon:Mail },
  { name:"SVG Optimizer",            desc:"Clean and reduce SVG file size.",                                          href:"/svg-optimizer",         category:"Dev",   icon:Sparkles },
  { name:"Favicon Generator",        desc:"Create ICO, PNG and web app manifest icons.",                             href:"/favicon-generator",     category:"Dev",   icon:QrCode },
  { name:"Word Counter",             desc:"Count words, characters, sentences and reading time.",                     href:"/word-counter",          category:"Dev",   icon:FileText },
  { name:"CSS Gradient Generator",   desc:"Build linear, radial and conic CSS gradients.",                           href:"/gradient-generator",    category:"Dev",   icon:Palette },
  { name:"Lorem Ipsum Generator",    desc:"Generate placeholder text paragraphs and sentences.",                     href:"/lorem-ipsum",           category:"Dev",   icon:BookOpenIcon },
  { name:"Multi-Format Converter",   desc:"Convert files to Text, Table, JSON and Images at once.",                  href:"/multi-converter",       category:"Dev",   icon:ArrowRightLeft, badge:"Unique" },
  { name:"CSV Visual Debugger",      desc:"Find duplicates and empty values in CSV files.",                           href:"/csv-debugger",          category:"Dev",   icon:Bug,            badge:"Unique" },
  { name:"Bulk File Renamer",        desc:"Rename files with date, numbering and patterns.",                          href:"/bulk-renamer",          category:"Dev",   icon:PenLine },
  { name:"Folder Structure Visualizer",desc:"Interactive folder tree with unused file detection.",                   href:"/folder-visualizer",     category:"Dev",   icon:FolderTree,     badge:"Unique" },
  { name:"Resume Builder",           desc:"Build ATS-optimized resumes with 20+ templates.",                         href:"/resume-builder",        category:"Dev",   icon:FileText,       badge:"New" },
  { name:"JSON to PPTX",            desc:"Convert structured JSON to a PowerPoint presentation.",                   href:"/json-to-pptx",          category:"Dev",   icon:FileText,       badge:"Unique" },
  { name:"JS to PPTX",              desc:"Write JavaScript to generate PPTX files using pptxgenjs.",               href:"/js-to-pptx",            category:"Dev",   icon:Code },
  { name:"Word to PDF",             desc:"Convert Word DOCX files to PDF entirely in your browser.",               href:"/word-to-pdf",           category:"Dev",   icon:FileDown },
  { name:"Website Trust Checker",   desc:"Check SSL, security headers & get a trust score for any URL.",              href:"/website-trust-checker", category:"Dev",   icon:ShieldCheck, badge:"New" },
  { name:"Website Content Extractor",desc:"Extract clean article text from any URL — export as Markdown or plain text.",href:"/website-content-extractor",category:"Dev",icon:BookOpen, badge:"New" },
];

const CATS = ["All", "PDF", "Image", "Dev"] as const;
type Cat = typeof CATS[number];

const CAT_COLORS: Record<string, { chip: string; icon: string }> = {
  PDF:   { chip:"bg-red-50 text-red-600 border-red-100",   icon:"bg-red-50 border-red-100 text-red-500 group-hover:bg-red-100" },
  Image: { chip:"bg-amber-50 text-amber-600 border-amber-100", icon:"bg-amber-50 border-amber-100 text-amber-500 group-hover:bg-amber-100" },
  Dev:   { chip:"bg-blue-50 text-blue-600 border-blue-100",  icon:"bg-blue-50 border-blue-100 text-blue-500 group-hover:bg-blue-100" },
};

export default function AllToolsPage() {
  const [cat, setCat] = useState<Cat>("All");
  const [search, setSearch] = useState("");

  const filtered = ALL_TOOLS.filter(t => {
    const matchCat = cat === "All" || t.category === cat;
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const counts = {
    All: ALL_TOOLS.length,
    PDF: ALL_TOOLS.filter(t => t.category === "PDF").length,
    Image: ALL_TOOLS.filter(t => t.category === "Image").length,
    Dev: ALL_TOOLS.filter(t => t.category === "Dev").length,
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="tool-hero p-6 sm:p-8">
          <nav className="flex items-center gap-2 text-sm text-foreground-secondary mb-5">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">All Tools</span>
          </nav>
          <h1 className="type-h1 font-display gradient-text mb-3">
            All {ALL_TOOLS.length} Free Online Tools
          </h1>
          <p className="text-foreground-secondary text-lg max-w-2xl leading-relaxed">
            Every tool on Toolsz in one place — {counts.PDF} PDF tools, {counts.Image} image tools, {counts.Dev} developer utilities. Filter by category or search. All 100% free, browser-based, no uploads, no signup.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-2 mt-5">
            {([
              { label:`${counts.PDF} PDF Tools`, href:"/pdf-tools" },
              { label:`${counts.Image} Image Tools`, href:"/image-tools" },
              { label:`${counts.Dev} Dev Tools`, href:"/dev-tools" },
            ]).map(s => (
              <Link key={s.href} href={s.href} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-white hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors font-medium">
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Category tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                  cat === c
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "border-border text-foreground-secondary hover:border-primary/40 hover:text-foreground bg-white"
                }`}
              >
                {c} <span className="ml-1 opacity-70 font-normal text-xs">({counts[c]})</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:max-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-secondary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools…"
              className="w-full pl-8 pr-8 py-1.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 placeholder:text-foreground-secondary/60"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-sm text-foreground-secondary ml-auto shrink-0">
            {filtered.length} of {ALL_TOOLS.length} tools
          </p>
        </div>
      </div>

      {/* Tool grid */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center">
            <Search className="w-10 h-10 mb-4 text-foreground-secondary/30" />
            <p className="text-lg font-semibold text-foreground mb-1">No tools match &quot;{search}&quot;</p>
            <p className="text-sm text-foreground-secondary mb-6 max-w-sm">
              We don&apos;t have that tool yet — but you can request it. 219 tools and counting, with new ones added from community requests every few weeks.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/request-a-tool`}
                className="btn btn-primary gap-2"
              >
                <X className="w-4 h-4 rotate-45" />
                Request &quot;{search}&quot;
              </Link>
              <button
                onClick={() => { setSearch(""); setCat("All"); }}
                className="btn btn-secondary"
              >
                Clear search
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(tool => {
              const colors = CAT_COLORS[tool.category];
              return (
                <Link key={tool.href + tool.name} href={tool.href} className="glass-card-premium p-5 group flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${colors.icon}`}>
                      <tool.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {tool.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                          tool.badge === "Popular" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                          tool.badge === "AI" ? "bg-violet-50 text-violet-600 border-violet-100" :
                          tool.badge === "Unique" ? "bg-amber-50 text-amber-600 border-amber-100" :
                          tool.badge === "Free" ? "bg-green-50 text-green-600 border-green-100" :
                          "bg-sky-50 text-sky-600 border-sky-100"
                        }`}>{tool.badge}</span>
                      )}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${colors.chip}`}>{tool.category}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{tool.name}</h3>
                  <p className="text-xs text-foreground-secondary leading-relaxed flex-1">{tool.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom links */}
        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-sm text-foreground-secondary mb-3 font-medium">Collection pages</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label:"Best Free PDF Tools 2026", href:"/best-free-pdf-tools" },
              { label:"Best Free Image Tools 2026", href:"/best-free-image-tools" },
              { label:"Best Free Developer Tools 2026", href:"/best-free-developer-tools" },
              { label:"Free Smallpdf Alternative", href:"/free-alternatives-to-smallpdf" },
              { label:"Free Adobe Acrobat Alternative", href:"/free-alternatives-to-adobe-acrobat" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary text-foreground-secondary transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
