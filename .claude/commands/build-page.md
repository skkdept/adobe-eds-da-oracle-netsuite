# Build Page Agent Prompt

Use this prompt at the start of a new conversation to build a new article page end-to-end.

---

## Prompt to paste into Claude Code

```
I want to build a new page for this AEM Edge Delivery site that closely matches a reference site I've cloned.

**Reference clone:** I've saved the cloned page HTML to:
  `clone/<page-name>.html`
  and all associated assets to:
  `clone/<page-name>_files/`

**Target DA Live path:** `/<page-name>` (e.g. `/what-is-erp`)

**Live preview URL:** https://main--adobe-eds-da-oracle-netsuite--skkdept.aem.page/<page-name>

Please do the following in order:

---

### Step 1 — Analyze the reference clone
Read `clone/<page-name>.html` in chunks and extract:
1. Full page section structure (breadcrumb, article body, sidebar, cards, CTA banner, footer)
2. Every heading (h1–h4) with its text — this becomes the content outline
3. Every image with its src path (relative to the _files/ folder)
4. Every block type used (callout, columns, cards, sidebar, embed-video, etc.)
5. Sidebar widgets (TOC, stat card, trending articles, popular topics, newsletter)
6. Related solutions cards (title, description, image)
7. CTA banner (headline, body, button text/link)

---

### Step 2 — Apply David's Model + Audit blocks

**First, for every content sequence identified in Step 1, ask:**
> "Can an author create this by just typing in DA Live?" (heading, paragraph, image, link, simple list)
> - YES → **default content** — no block needed
> - NO → needs a block

Only proceed to block audit for sequences that truly need a block.

**For each block needed, check in this order:**

1. **Existing project blocks** (`blocks/` folder):
   `article-sidebar`, `callout`, `cards`, `cards-guide`, `columns`, `columns-cta`, `embed-video`, `footer`, `fragment`, `header`, `hero`, `hero-article`, `promo-banner`
   → If match: **REUSE** (CSS tweaks only if design differs)

2. **Block Collection cache** (`.github/skills/eds-conversion/block-collection/index.json`):
   → If match: **REUSE_COLLECTION** (copy JS+CSS, adapt CSS)
   → Cache missing? Run `python3 scripts/fetch-block-collection.py` once to populate it

3. **Neither** → **BUILD** from scratch using the canonical content model below

**Assign a canonical content model to every block that needs building:**

| Model | When | Key rule |
|-------|------|----------|
| **Standalone** | Unique one-off (hero, callout, promo-banner) | Safe default |
| **Collection** | Repeating items — each table row = one item | Max 4 cells/row |
| **Configuration** | API-driven behavior only (sort/filter params) | NOT for static content |
| **Auto-Blocked** | Pattern JS auto-detects (YouTube URL, tabs from H2s) | Rare |

List outcome:
- Blocks that exist and are ready (REUSE)
- Blocks that need CSS/JS updates (REUSE with tweaks)
- Blocks from Block Collection to copy (REUSE_COLLECTION)
- Blocks missing and need to be created (BUILD) — with canonical model noted

---

### Step 3 — Copy images
Copy all page-specific images from `clone/<page-name>_files/` to `media/<page-name>/`.
Commit them so they're served at:
  `https://main--adobe-eds-da-oracle-netsuite--skkdept.aem.page/media/<page-name>/<filename>`

---

### Step 4 — Build / update blocks
For each block that needs work:
1. Read the reference HTML to understand exact visual design
2. Write or update `blocks/<blockname>/<blockname>.css` and `.js`
3. Ensure: mobile-first CSS, scoped selectors, WCAG AA contrast (4.5:1 minimum), correct heading hierarchy (no skipped levels), accessible ARIA where needed

Key blocks this site uses:
- `callout` — key takeaway / important / CTA variants
- `columns` — side-by-side comparison (2–3 cols)
- `cards` — solution cards with image overlay + colored tint
- `article-sidebar` — sticky sidebar: TOC + Featured Resource + Trending + Topics + Newsletter
- `embed-video` — YouTube embed
- `hero-article` — article banner image + title + author

---

### Step 5 — Create the DA Live paste HTML
Create `drafts/<page-name>-paste.html` — a browser-openable HTML file with:

- Instructions box at the top (yellow background)
- A dashed paste-area containing ALL page content structured as:
  - **Plain HTML** for default content (headings, paragraphs, lists, images)
  - **HTML `<table>` elements** for every block and section-metadata
  - **Absolute image URLs** pointing to `https://main--adobe-eds-da-oracle-netsuite--skkdept.aem.page/media/<page-name>/...`
  - **Absolute internal links** pointing to `https://main--adobe-eds-da-oracle-netsuite--skkdept.aem.page/...`
  - **`<hr>` tags** between each section (DA Live interprets these as section breaks)

**Section structure:**
```
<section 1> breadcrumb paragraph + Section Metadata table (Style=breadcrumb)
<hr>
<section 2> h1, author, banner image, full article body, all inline blocks,
            article-sidebar table, Section Metadata table (Style=article-layout)
<hr>
<section 3> h2, Cards table, Section Metadata table (Style=light-gray)
<hr>
<section 4> h2, body, CTA button, Section Metadata table (Style=cta-banner)
```

**Block table format** (DA Live reads the first row as the block name):
```html
<table>
  <tr><td colspan="N">Block Name (Variant)</td></tr>
  <tr><td>cell1</td><td>cell2</td></tr>
</table>
```

**Section metadata table format:**
```html
<table>
  <tr><td colspan="2">Section Metadata</td></tr>
  <tr><td>Style</td><td>article-layout</td></tr>
</table>
```

---

### Step 6 — Commit and push
1. `git add` all changed files (blocks, styles, media, drafts)
2. Commit with a clear message
3. `git push` to main
4. Confirm the live preview URL is working

---

### Quality checklist before finishing
- [ ] No `file://` or `about:error` URLs anywhere in the paste HTML
- [ ] Heading hierarchy is valid (h1 → h2 → h3, no skips)
- [ ] All text/background combinations pass WCAG AA contrast (4.5:1)
- [ ] Images have meaningful `alt` text
- [ ] All block CSS selectors are scoped to `.blockname`
- [ ] Mobile-first CSS (styles default to mobile, `min-width: 900px` for desktop)
- [ ] robots.txt exists at repo root and allows crawling

---

**Reference design context:**
- Target site: https://www.netsuite.com
- Figma spec: https://floret-unity-63839672.figma.site
- Live preview: https://main--adobe-eds-da-oracle-netsuite--skkdept.aem.page/
- Never test at localhost — always use the aem.page preview URL
```

---

## Workflow summary (quick reference)

| Step | What | Where |
|------|------|-------|
| Clone | Save site HTML + assets | `clone/<name>.html` + `clone/<name>_files/` |
| Images | Copy to repo | `media/<name>/` |
| Blocks | Build / fix JS + CSS | `blocks/<blockname>/` |
| Content | Build paste file | `drafts/<name>-paste.html` |
| Author | Open paste file in browser → Cmd+A Cmd+C → paste into DA Live `/page` | DA Live |
| Publish | Preview + publish in DA Live | DA Live |
| Verify | Check `aem.page` preview | Browser / Lighthouse |
