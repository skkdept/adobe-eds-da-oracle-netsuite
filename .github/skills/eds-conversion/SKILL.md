---
name: eds-conversion
description: "EDS Website Conversion skill for the Oracle NetSuite project. Scripts, templates, and Block Collection cache for converting external websites to AEM Edge Delivery Services format."
---

# EDS Website Conversion Skill

Scripts, templates, and Block Collection cache for the 4-step EDS conversion workflow.

## Quick Start

```bash
# One-time setup: populate Block Collection cache
python3 scripts/fetch-block-collection.py

# Step 1: Download a website
bash .github/skills/eds-conversion/download-webpage.sh https://example.com

# Steps 2–4: Use the agents
# Invoke eds-converter-main or step agents directly
```

## Available Assets

### Scripts
- `download-webpage.sh` — wget-based website download
- `scripts/fetch-block-collection.py` — populate Block Collection cache (root scripts/)

### Block Collection Cache
After running `fetch-block-collection.py`:
```
.github/skills/eds-conversion/block-collection/
├── index.json     ← read by Analyze Agent (REUSE vs BUILD decisions)
├── hero/
│   ├── hero.js
│   └── hero.css
├── cards/
└── ...
```

### Templates
- `templates/block-template.js` — JS decorator template
- `templates/block-template.css` — CSS template (mobile-first, scoped)
- `templates/block-definition.json` — `_{block}.json` metadata template
- `templates/conversion-plan-template.md` — CONVERSION_PLAN.md template

## Existing Project Blocks (Check Before Building)

This project already has these blocks — use them before creating new ones:

| Block | Purpose |
|-------|---------|
| `article-sidebar` | Two-column article layout sidebar |
| `callout` | Highlighted callout / key takeaway box |
| `cards` | Card grid (Collection model) |
| `cards-guide` | Guide-style cards variant |
| `columns` | Multi-column layout |
| `columns-cta` | CTA columns variant |
| `embed-video` | Video embed (YouTube, etc.) |
| `footer` | Site footer |
| `fragment` | Reusable content snippet |
| `header` | Site header + navigation |
| `hero` | Large banner with image and CTA |
| `hero-article` | Article-style hero |
| `promo-banner` | Promotional banner |

## Workflow Reference

```
Step 1: Download  → downloads/{site}/
Step 2: Analyze   → CONVERSION_PLAN.md (David's Model + Block Collection + canonical models)
Step 3: Build     → blocks/{name}/ (REUSE or BUILD; lint + aem.page verify required)
Step 4: Generate  → eds-html/ (all content; not committed)
```

## Project URLs

- **Preview**: `https://main--adobe-eds-da-oracle-netsuite--skkdept.aem.page/`
- **Live**: `https://main--adobe-eds-da-oracle-netsuite--skkdept.aem.live/`
- **DA Live**: content CMS (content is authored here)

## Key Rules (see Constitution for full details)

- `AGENTS.md` + `.github/copilot-instructions.md` = project law
- David's Model first — default content before blocks
- Block Collection cache + existing `blocks/` before building new
- Max 4 cells per row, block variants for styling
- `npm run lint` must pass before any block ships
- Verify on aem.page — local dev does not work in this project
- Never commit `downloads/` or `eds-html/`
