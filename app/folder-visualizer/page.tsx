"use client";

import { useState, useCallback } from "react";
import {
  FolderTree,
  Shield,
  Zap,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  AlertCircle,
  Upload,
  FileCode,
  FileImage,
  FileText,
  FileArchive,
  FileVideo,
  FileAudio,
  Database,
} from "lucide-react";
import ToolHero from "@/app/components/ToolHero";

interface TreeNode {
  name: string;
  type: "file" | "folder";
  children: TreeNode[];
  extension?: string;
  size?: number;
  depth: number;
  path: string;
}

// Known potentially unused files
const UNUSED_PATTERNS = [
  /\.DS_Store$/,
  /Thumbs\.db$/,
  /\.log$/,
  /\.tmp$/,
  /\.bak$/,
  /\.swp$/,
  /~$/,
  /\.env\.local$/,
  /\.npmrc$/,
  /node_modules/,
  /\.cache$/,
  /__pycache__/,
  /\.git/,
];

// File type icons mapping
const FILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ts: FileCode,
  tsx: FileCode,
  js: FileCode,
  jsx: FileCode,
  py: FileCode,
  rb: FileCode,
  go: FileCode,
  rs: FileCode,
  java: FileCode,
  css: FileCode,
  scss: FileCode,
  html: FileCode,
  json: Database,
  csv: Database,
  sql: Database,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  svg: FileImage,
  webp: FileImage,
  mp4: FileVideo,
  avi: FileVideo,
  mov: FileVideo,
  mp3: FileAudio,
  wav: FileAudio,
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  md: FileText,
  zip: FileArchive,
  tar: FileArchive,
  gz: FileArchive,
  rar: FileArchive,
};

function getFileIcon(name: string) {
  const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
  return FILE_ICONS[ext] || File;
}

function isUnused(path: string) {
  return UNUSED_PATTERNS.some((p) => p.test(path));
}

function buildTree(paths: string[]): TreeNode {
  const root: TreeNode = { name: "root", type: "folder", children: [], depth: 0, path: "" };

  paths.forEach((filePath) => {
    const parts = filePath.split("/").filter(Boolean);
    let current = root;

    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1 && part.includes(".");
      const existingChild = current.children.find((c) => c.name === part);

      if (existingChild) {
        current = existingChild;
      } else {
        const newNode: TreeNode = {
          name: part,
          type: isFile ? "file" : "folder",
          children: [],
          extension: isFile ? part.split(".").pop() : undefined,
          depth: i + 1,
          path: parts.slice(0, i + 1).join("/"),
        };
        current.children.push(newNode);
        current = newNode;
      }
    });
  });

  return root;
}

// Sort: folders first, then files, alphabetically
function sortTree(node: TreeNode): TreeNode {
  if (node.type === "file") return node;
  const sorted = [...node.children].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return { ...node, children: sorted.map(sortTree) };
}

const SAMPLE_TREE = [
  "src/components/Header.tsx",
  "src/components/Footer.tsx",
  "src/components/Button.tsx",
  "src/components/Modal.tsx",
  "src/pages/index.tsx",
  "src/pages/about.tsx",
  "src/pages/contact.tsx",
  "src/utils/api.ts",
  "src/utils/helpers.ts",
  "src/utils/formatters.ts",
  "src/styles/global.css",
  "src/styles/variables.css",
  "src/hooks/useAuth.ts",
  "src/hooks/useFetch.ts",
  "src/__tests__/Header.test.tsx",
  "src/__tests__/api.test.ts",
  "public/images/logo.png",
  "public/images/hero.jpg",
  "public/favicon.ico",
  "public/robots.txt",
  "config/dev.json",
  "config/prod.json",
  "config/staging.json",
  ".env.local",
  ".DS_Store",
  "package.json",
  "tsconfig.json",
  "README.md",
  "debug.log",
  "temp.tmp",
];

interface TreeRowProps {
  node: TreeNode;
  expanded: Set<string>;
  toggleExpand: (path: string) => void;
  showUnused: boolean;
}

function TreeRow({ node, expanded, toggleExpand, showUnused }: TreeRowProps) {
  const isExpanded = expanded.has(node.path);
  const unused = isUnused(node.path) || isUnused(node.name);
  const Icon = node.type === "folder" ? (isExpanded ? FolderOpen : Folder) : getFileIcon(node.name);

  if (node.type === "file" && showUnused && unused) {
    return (
      <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-red-50/50 border border-red-100">
        <span style={{ width: node.depth * 20 }} />
        <Icon className="w-4 h-4 text-red-400 flex-shrink-0" />
        <span className="text-xs text-red-600 line-through">{node.name}</span>
        <span className="ml-auto flex items-center gap-1 text-red-400"><AlertCircle className="w-3 h-3" /><span className="text-[9px]">unused</span></span>
      </div>
    );
  }

  if (node.type === "file") {
    return (
      <div className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-surface-1 transition-colors">
        <span style={{ width: node.depth * 20 }} />
        <Icon className="w-4 h-4 text-foreground-muted flex-shrink-0" />
        <span className="text-xs text-foreground-secondary">{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => toggleExpand(node.path)}
        className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-primary-subtle transition-colors w-full text-left"
      >
        <span style={{ width: node.depth * 20 }} />
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-primary" /> : <ChevronRight className="w-3.5 h-3.5 text-foreground-muted" />}
        <Icon className={`w-4 h-4 flex-shrink-0 ${isExpanded ? "text-primary" : "text-foreground-muted"}`} />
        <span className={`text-xs font-semibold ${isExpanded ? "text-primary" : "text-foreground"}`}>{node.name}</span>
        <span className="text-[10px] text-foreground-muted ml-auto">{node.children.length} items</span>
      </button>
      {isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeRow
              key={child.path}
              node={child}
              expanded={expanded}
              toggleExpand={toggleExpand}
              showUnused={showUnused}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderVisualizerPage() {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showUnused, setShowUnused] = useState(true);
  const [folderName, setFolderName] = useState("my-project");
  const [totalFiles, setTotalFiles] = useState(0);
  const [unusedCount, setUnusedCount] = useState(0);

  const countStats = useCallback((node: TreeNode) => {
    let files = 0;
    let unused = 0;
    const traverse = (n: TreeNode) => {
      if (n.type === "file") {
        files++;
        if (isUnused(n.path) || isUnused(n.name)) unused++;
      }
      n.children.forEach(traverse);
    };
    traverse(node);
    return { files, unused };
  }, []);

  const handleLoadSample = useCallback(() => {
    const rawTree = buildTree(SAMPLE_TREE);
    const sorted = sortTree(rawTree);
    sorted.name = "my-project";
    setTree(sorted);
    setFolderName("my-project");
    const stats = countStats(sorted);
    setTotalFiles(stats.files);
    setUnusedCount(stats.unused);
    // Expand first level
    setExpanded(new Set(sorted.children.filter((c) => c.type === "folder").map((c) => c.path)));
  }, [countStats]);

  const handleFolderUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const paths: string[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // webkitRelativePath gives the full path like "folder/sub/file.txt"
      const relativePath = file.webkitRelativePath;
      if (relativePath) {
        paths.push(relativePath);
      }
    }

    if (paths.length > 0) {
      const folderRoot = paths[0].split("/")[0];
      const rawTree = buildTree(paths);
      const sorted = sortTree(rawTree);
      sorted.name = folderRoot;
      setTree(sorted);
      setFolderName(folderRoot);
      const stats = countStats(sorted);
      setTotalFiles(stats.files);
      setUnusedCount(stats.unused);
      setExpanded(new Set(sorted.children.filter((c) => c.type === "folder").map((c) => c.path)));
    }
  }, [countStats]);

  const toggleExpand = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (!tree) return;
    const allPaths = new Set<string>();
    const traverse = (n: TreeNode) => {
      if (n.type === "folder") {
        allPaths.add(n.path);
        n.children.forEach(traverse);
      }
    };
    traverse(tree);
    setExpanded(allPaths);
  }, [tree]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={FolderTree}
          title="Folder Structure Visualizer"
          description="Upload a folder and see an interactive tree view — collapsible structure, file type highlights, and unused file detection. Simple web tool for understanding project structure."
          backHref="/dev-tools"
          backLabel="Back to Developer Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        {!tree ? (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              {/* Upload Folder */}
              <div className="w-full max-w-md">
                <label className="block">
                  <input
                    type="file"
                    // @ts-expect-error webkitdirectory is not in the types
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={handleFolderUpload}
                    className="hidden"
                  />
                  <div className="drop-zone py-16 px-6 text-center rounded-2xl cursor-pointer">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-[10px] border border-border bg-surface-1 flex items-center justify-center mb-4">
                        <Upload className="w-5 h-5 text-foreground-secondary" />
                      </div>
                      <h3 className="type-h3 font-semibold mb-1 text-foreground">Upload Folder</h3>
                      <p className="type-small text-foreground-muted">Click to select a folder — all files will be visualized</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="my-6 text-foreground-muted text-xs">— or —</div>

              <button
                onClick={handleLoadSample}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <FolderTree className="w-4 h-4" />
                Load Sample Project
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border p-3 text-center bg-surface-1">
                <div className="text-xl font-bold text-primary">{totalFiles}</div>
                <div className="type-label text-foreground-muted">Files</div>
              </div>
              <div className="rounded-xl border border-border p-3 text-center bg-surface-1">
                <div className="text-xl font-bold text-foreground">{folderName}</div>
                <div className="type-label text-foreground-muted">Root</div>
              </div>
              <div className="rounded-xl border border-border p-3 text-center bg-surface-1">
                <div className="text-xl font-bold text-red-500">{unusedCount}</div>
                <div className="type-label text-foreground-muted">Unused</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2 items-center">
              <button onClick={expandAll} className="btn btn-secondary inline-flex items-center gap-1.5 !py-2 !px-3 text-xs">
                Expand All
              </button>
              <button onClick={collapseAll} className="btn btn-secondary inline-flex items-center gap-1.5 !py-2 !px-3 text-xs">
                Collapse All
              </button>
              <label className="flex items-center gap-2 ml-auto cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnused}
                  onChange={(e) => setShowUnused(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-xs text-foreground-secondary">Highlight unused files</span>
              </label>
            </div>

            {/* Tree View */}
            <div className="glass-panel rounded-[16px] p-4 sm:p-6 max-h-[600px] overflow-y-auto">
              <TreeRow node={tree} expanded={expanded} toggleExpand={toggleExpand} showUnused={showUnused} />
            </div>

            {/* Reset */}
            <div className="flex justify-center">
              <button
                onClick={() => { setTree(null); setExpanded(new Set()); }}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Different Folder
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Interactive Tree View</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Collapsible folders, file type icons, and color-coded highlights. Understand any project structure in seconds — not available as a simple web tool anywhere else.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Unused File Detection</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Automatically detects potentially unused files like .DS_Store, .log, .tmp, .bak, and other clutter that shouldn't be in your project.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
