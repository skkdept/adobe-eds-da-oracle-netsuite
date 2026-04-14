# EDS Conversion — ASDD Constitution (Addendum to AGENTS.md)

**AGENTS.md is the primary Constitution for this project.** Read it first. This file adds the ASDD governance layer for the EDS website conversion workflow — rules not already covered in AGENTS.md.

---

## ASDD Governance Layers

| Layer | File | Role |
|-------|------|------|
| **Constitution** | `AGENTS.md` + this file | Non-negotiable law for all agents |
| **Skills** | `.github/skills/eds-conversion/SKILL.md` | Conversion domain expertise |
| **Agents** | `.github/agents/*.agent.md` | Step-specific workers |
| **Spec** | `downloads/*/CONVERSION_PLAN.md` | Per-conversion blueprint |

---

## Law 1 — Default Content Before Blocks (David's Model)

For every content sequence on a source page, ask first:

> **"Can an author create this by just typing in da.live?"**

| Answer | Action |
|--------|--------|
| Yes — heading, paragraph, image, link, simple list | **Default content** — no block needed |
| No — grid, carousel, accordion, complex layout | Select a block |

Never create a block for content that an author can type. Prefer fewer blocks.

---

## Law 2 — Block Content Model Rules

When a block is required, assign the correct canonical model:

| Model | Use When |
|-------|----------|
| **Standalone** | Unique one-off element (hero, callout, promo-banner). Safe default. |
| **Collection** | Repeating items — each row = one item, columns = parts (cards, article-sidebar rows) |
| **Configuration** | API-driven behavior only (key/value pairs for sort/filter). NOT for static content. |
| **Auto-Blocked** | Pattern JS auto-detects (embeds from URLs, tabs from H2 sections) |

**Hard limits:**
- Max **4 cells per row** — never exceed
- Use block **variants** for styling: `| Hero (Dark) |` — not a config cell
- Check existing blocks first: `article-sidebar`, `callout`, `cards`, `columns`, `columns-cta`, `embed-video`, `hero`, `hero-article`, `promo-banner`, `cards-guide`, `fragment`

---

## Law 3 — Block Collection Cache First

Before building any new block from scratch:

1. Check `.github/skills/eds-conversion/block-collection/index.json`
2. Found → copy from cache, customize CSS only
3. Cache missing → build from scratch; remind user to run `python3 scripts/fetch-block-collection.py`

Also check this project's existing `blocks/` — it may already have what you need.

---

## Law 4 — Pre-Decoration DOM

The JS decorator receives the **pre-decoration DOM** (raw divs). Always:
- Re-use existing elements via semantic selectors (`querySelector('h2')`, `querySelector('img')`)
- Never create new wrapper elements around existing content
- Never rely on fixed cell index (`block.children[0].children[1]` is fragile)

---

## Law 5 — Quality Gates (Mandatory)

No block is done until:

1. **`npm run lint`** — zero errors
2. **Verify against live preview** — push to a branch and check `https://{branch}--adobe-eds-da-oracle-netsuite--skkdept.aem.page/` (local dev does not work in this environment per AGENTS.md)
3. **No console errors** — check browser devtools

---

## Law 6 — Content Generation

- Extract **ALL content** — no truncation, no placeholders
- Section breaks are `<hr>` elements
- Images → `eds-html/assets/images/` with relative paths
- `eds-html/` is in `.gitignore` and never committed
- Test output at: `https://main--adobe-eds-da-oracle-netsuite--skkdept.aem.page/`

---

## Law 7 — Unknown EDS Patterns

When uncertain about any EDS behavior, search the docs:
```bash
curl -s https://www.aem.live/docpages-index.json | jq -r '.data[] | select(.content | test("KEYWORD"; "i")) | "\(.path): \(.title)"'
```
Do not guess. Do not invent behavior.

---

## Law 8 — What Gets Committed

```bash
git add blocks/ scripts/ styles/   # component code only
# NEVER commit: downloads/  eds-html/  drafts/  clone/
```

---

## Block Collection Cache Setup (One-Time)

```bash
python3 scripts/fetch-block-collection.py
```

Populates `.github/skills/eds-conversion/block-collection/` — agents read this without internet access.
