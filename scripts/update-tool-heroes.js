/**
 * Updates ToolHero description props on all tool page.tsx files
 * using the heroDescription data from app/utils/seo.ts.
 *
 * Run: node scripts/update-tool-heroes.js
 */
const fs = require("fs");
const path = require("path");

const appDir = path.join(__dirname, "..", "app");

// Extract heroDescription map from seo.ts
const seoPath = path.join(appDir, "utils", "seo.ts");
const seoContent = fs.readFileSync(seoPath, "utf-8");

// Parse heroDescription values using regex
const heroDescriptions = {};
const regex = /"([a-z0-9-]+)":\s*\{[^}]*?heroDescription:\s*"((?:[^"\\]|\\.)*)"/gs;

let match;
while ((match = regex.exec(seoContent)) !== null) {
  const slug = match[1];
  const desc = match[2]
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');
  heroDescriptions[slug] = desc;
}

console.log(`Extracted ${Object.keys(heroDescriptions).length} hero descriptions from seo.ts`);

let updated = 0;
let skipped = 0;
let notFound = 0;

for (const [slug, heroDesc] of Object.entries(heroDescriptions)) {
  const pagePath = path.join(appDir, slug, "page.tsx");

  if (!fs.existsSync(pagePath)) {
    console.log(`  ⚠️  No page.tsx for ${slug}`);
    notFound++;
    continue;
  }

  let content = fs.readFileSync(pagePath, "utf-8");

  // Pattern 1: description="..." inside ToolHero component
  // This handles the common case where description is a simple string on one or more lines
  const descRegex = /(<ToolHero[^>]*\sdescription=")([^"]*?)(")/s;

  if (descRegex.test(content)) {
    // Need to re-test since test consumes the match
    const newContent = content.replace(descRegex, `$1${heroDesc.replace(/"/g, "&quot;")}$3`);

    if (newContent !== content) {
      fs.writeFileSync(pagePath, newContent, "utf-8");
      console.log(`  ✅ Updated ${slug}`);
      updated++;
    } else {
      skipped++;
    }
  } else {
    // Pattern 2: description={`...`} (template literal)
    const templateRegex = /(<ToolHero[^>]*\sdescription=\{`)([^`]*?)(`\})/s;
    if (templateRegex.test(content)) {
      const newContent = content.replace(templateRegex, `$1${heroDesc}$3`);
      if (newContent !== content) {
        fs.writeFileSync(pagePath, newContent, "utf-8");
        console.log(`  ✅ Updated ${slug} (template literal)`);
        updated++;
      } else {
        skipped++;
      }
    } else {
      console.log(`  ⚠️  No ToolHero description found in ${slug}/page.tsx`);
      notFound++;
    }
  }
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${notFound} not found`);
