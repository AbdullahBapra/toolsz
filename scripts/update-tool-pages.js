/**
 * Batch Update: Tool Pages → Unicorn SaaS Design System
 * 
 * Transforms:
 * 1. Icon containers: flat bg → gradient bg with indigo tint
 * 2. Icon sizes: w-4 h-4 → w-5 h-5 (inside old w-8 containers)  
 * 3. Card text: text-xs → text-sm (headings + descriptions)
 * 4. Glass panels: rounded-[12px] p-5 → rounded-[16px] p-6
 * 5. Card gaps: gap-4 → gap-5 (inside glass panels)
 * 6. Info card heading mb: mb-1 → mb-1.5
 */

const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..', 'app');

// Find all page.tsx files (tool pages + category pages)
function findPageFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip components, utils, api directories
      if (['components', 'utils', 'api'].includes(entry.name)) continue;
      const subEntries = fs.readdirSync(fullPath, { withFileTypes: true });
      for (const sub of subEntries) {
        if (sub.isFile() && sub.name === 'page.tsx') {
          results.push(path.join(fullPath, sub.name));
        }
      }
    }
  }
  return results;
}

const files = findPageFiles(appDir);
console.log(`Found ${files.length} page.tsx files to process\n`);

let totalChanges = 0;
const changes = {};

// Define all replacement rules (order matters!)
const rules = [
  // ══════════════════════════════════════════
  // 1. ICON CONTAINERS → Gradient backgrounds
  // ══════════════════════════════════════════
  
  // Old small containers: w-8 h-8 rounded-[10px] → w-10 h-10 rounded-[14px] gradient
  {
    name: 'icon-container-sm-old',
    from: 'w-8 h-8 rounded-[10px] bg-primary-muted border border-primary-border flex items-center justify-center flex-shrink-0',
    to: 'w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0',
  },
  
  // Current medium containers: w-10 h-10 rounded-lg with border → gradient
  {
    name: 'icon-container-md-bordered',
    from: 'w-10 h-10 rounded-lg bg-primary-muted border border-primary-border flex items-center justify-center flex-shrink-0',
    to: 'w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0',
  },
  
  // Current medium containers: w-10 h-10 rounded-lg without border → gradient with border
  {
    name: 'icon-container-md-borderless',
    from: 'w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center flex-shrink-0',
    to: 'w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0',
  },
  
  // Alt medium containers: w-10 h-10 rounded-[10px] → gradient
  {
    name: 'icon-container-md-alt',
    from: 'w-10 h-10 rounded-[10px] bg-primary-muted border border-primary-border flex items-center justify-center flex-shrink-0',
    to: 'w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0',
  },
  
  // Small containers in heic-to-jpg inline items: w-8 h-8 rounded-lg → keep w-8 but add gradient
  {
    name: 'icon-container-sm-inline',
    from: 'w-8 h-8 rounded-lg bg-primary-muted border border-primary-border flex items-center justify-center flex-shrink-0',
    to: 'w-9 h-9 rounded-[12px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0',
  },
  
  // Large category containers: w-12 h-12 rounded-[12px] → gradient
  {
    name: 'icon-container-lg',
    from: 'w-12 h-12 rounded-[12px] bg-primary-muted border border-primary-border flex items-center justify-center flex-shrink-0',
    to: 'w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0',
  },

  // ══════════════════════════════════════════
  // 2. ICON SIZES → Upgrade w-4 h-4 to w-5 h-5 inside info cards
  // ══════════════════════════════════════════
  
  // Shield icon in info cards (most common)
  {
    name: 'icon-shield-size',
    from: '<Shield className="w-4 h-4 text-primary" />',
    to: '<Shield className="w-5 h-5 text-primary" />',
  },
  
  // Zap icon in info cards
  {
    name: 'icon-zap-size',
    from: '<Zap className="w-4 h-4 text-primary" />',
    to: '<Zap className="w-5 h-5 text-primary" />',
  },

  // ══════════════════════════════════════════
  // 3. CARD TEXT → Larger sizes
  // ══════════════════════════════════════════
  
  // Card headings with font-display: text-xs → text-sm, mb-1 → mb-1.5
  {
    name: 'card-heading-display',
    from: 'font-display font-semibold text-foreground text-xs mb-1',
    to: 'font-display font-semibold text-foreground text-sm mb-1.5',
  },
  
  // Card headings without font-display: add font-display, text-xs → text-sm
  {
    name: 'card-heading-plain',
    from: 'font-semibold text-foreground text-xs mb-1',
    to: 'font-display font-semibold text-foreground text-sm mb-1.5',
  },
  
  // Card descriptions: text-xs → text-sm
  {
    name: 'card-description',
    from: 'text-foreground-muted text-xs leading-relaxed',
    to: 'text-foreground-muted text-sm leading-relaxed',
  },
  
  // ══════════════════════════════════════════
  // 4. GLASS PANELS → Larger radius + padding
  // ══════════════════════════════════════════
  
  // Glass panel p-5 → p-6, rounded-[12px] → rounded-[16px]
  {
    name: 'glass-panel-p5',
    from: 'glass-panel rounded-[12px] p-5',
    to: 'glass-panel rounded-[16px] p-6',
  },
  
  // Glass panel p-6 (already has bigger padding) → just update radius
  {
    name: 'glass-panel-p6',
    from: 'glass-panel rounded-[12px] p-6',
    to: 'glass-panel rounded-[16px] p-6',
  },
  
  // ══════════════════════════════════════════
  // 5. INFO CARD GAP → More breathing room
  // ══════════════════════════════════════════
  
  // Gap inside glass panels: gap-4 → gap-5 (only in info card context)
  {
    name: 'info-card-gap',
    from: 'glass-panel rounded-[16px] p-6 flex items-start gap-4',
    to: 'glass-panel rounded-[16px] p-6 flex items-start gap-5',
  },

  // ══════════════════════════════════════════
  // 6. FILE UPLOAD ICON → Match gradient style
  // ══════════════════════════════════════════
  {
    name: 'fileupload-icon',
    from: 'w-10 h-10 rounded-[10px] bg-primary-muted border border-primary-border flex items-center justify-center flex-shrink-0',
    to: 'w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0',
  },
];

// Process each file
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '..'), file);
  let fileChanges = 0;
  
  for (const rule of rules) {
    const before = content;
    // Use split/join for global replacement (faster than regex for literal strings)
    content = content.split(rule.from).join(rule.to);
    const count = (before.match(new RegExp(rule.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (count > 0) {
      fileChanges += count;
      if (!changes[rule.name]) changes[rule.name] = 0;
      changes[rule.name] += count;
    }
  }
  
  if (fileChanges > 0) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ ${relativePath} (${fileChanges} changes)`);
    totalChanges += fileChanges;
  } else {
    console.log(`⏭️  ${relativePath} (no changes)`);
  }
}

console.log(`\n════════════════════════════════════════`);
console.log(`Total: ${totalChanges} changes across ${files.length} files`);
console.log(`════════════════════════════════════════\n`);

// Print breakdown by rule
console.log('Breakdown by rule:');
for (const [rule, count] of Object.entries(changes).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${rule}: ${count}`);
}
