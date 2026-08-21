/**
 * Syncs tool descriptions on homepage and category pages with
 * cardDescription values from app/utils/seo.ts.
 *
 * Run: node scripts/sync-card-descriptions.js
 */
const fs = require("fs");
const path = require("path");

const appDir = path.join(__dirname, "..", "app");
const seoPath = path.join(appDir, "utils", "seo.ts");
const seoContent = fs.readFileSync(seoPath, "utf-8");

// Parse cardDescription values from seo.ts
const cardDescriptions = {};
const regex = /"([a-z0-9-]+)":\s*\{[^}]*?cardDescription:\s*"((?:[^"\\]|\\.)*)"/gs;

let match;
while ((match = regex.exec(seoContent)) !== null) {
  const slug = match[1];
  const desc = match[2]
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');
  cardDescriptions[slug] = desc;
}

console.log(`Extracted ${Object.keys(cardDescriptions).length} card descriptions from seo.ts\n`);

// Update a page file by replacing desc/description strings that match tool hrefs
function syncPageDescriptions(pagePath, pageLabel) {
  if (!fs.existsSync(pagePath)) {
    console.log(`  ⚠️  ${pagePath} not found`);
    return;
  }

  let content = fs.readFileSync(pagePath, "utf-8");
  let count = 0;

  for (const [slug, newDesc] of Object.entries(cardDescriptions)) {
    // Match patterns like:
    //   href: "/compress-pdf",
    //   ... desc: "old description",
    // or
    //   href: \"/compress-pdf\",
    //   ... description: \"old description\",

    // Find the tool entry by its href, then replace the desc/description on the next/same block
    // Pattern: href: "/SLUG"[^}]*?(desc|description): "[^"]*"
    const hrefPattern = new RegExp(
      `(href:\\s*["']/${slug}["'][^}]*?(?:desc|description):\\s*["'])((?:[^"\\n])*)(")`,
      "gs"
    );

    const newContent = content.replace(hrefPattern, `$1${newDesc.replace(/"/g, "&quot;")}$3`);
    if (newContent !== content) {
      content = newContent;
      count++;
    }
  }

  if (count > 0) {
    fs.writeFileSync(pagePath, content, "utf-8");
    console.log(`  ✅ ${pageLabel}: ${count} descriptions synced`);
  } else {
    console.log(`  ℹ️  ${pageLabel}: no changes needed`);
  }
}

// Sync homepage
syncPageDescriptions(path.join(appDir, "page.tsx"), "Homepage");

// Sync category pages
syncPageDescriptions(path.join(appDir, "pdf-tools", "page.tsx"), "PDF Tools");
syncPageDescriptions(path.join(appDir, "image-tools", "page.tsx"), "Image Tools");
syncPageDescriptions(path.join(appDir, "dev-tools", "page.tsx"), "Dev Tools");

console.log("\nDone!");
