# EDS Rockstar Roundtable — AEM Gaps in Edge Delivery Services

Use cases common in AEM but missing or weak in EDS. Strong talking points for the Adobe Partner roundtable.

---

## AEM Capabilities That Don't Exist (or Are Weak) in EDS

### Publishing & Workflow

| AEM Capability | EDS Status |
|---|---|
| **Scheduled publishing** (time-based activation) | Not native — workarounds via GitHub Actions cron |
| **Custom publish hooks / replication listeners** | No equivalent — publish = git push to CDN, no event hook |
| **Content approval workflows** | No native review/approval — DA Live is collaborative but no formal gate |
| **Rollback to a specific version** | Git revert is possible but not author-friendly |
| **Replication to multiple environments** (author → stage → prod) | EDS has preview (.page) and live (.live) — no staging "environment" per se |

### Content Management

| AEM Capability | EDS Status |
|---|---|
| **Multi-Site Manager** (Live Copy, blueprints, rollout) | Completely absent |
| **Translation Integration Framework** (Lionbridge, SDL connectors) | No native TIF equivalent — manual |
| **Structured Content Fragments** with complex schemas | EDS is document-based; no schema enforcement |
| **Tag Manager / centralized taxonomy** | Metadata-only; no hierarchical tag governance |
| **Audit trail** (who changed what, when) | Git log is the only audit trail |

### Personalization & Analytics

| AEM Capability | EDS Status |
|---|---|
| **ContextHub / client context** (segment-based personalization) | Not built in — manual with Experimentation block |
| **Adobe Target A/B via server side** | Must use client-side SDK |
| **Smart Tags / AI asset tagging** | No equivalent |

### Developer Experience

| AEM Capability | EDS Status |
|---|---|
| **Server-side rendering / Sling Models** | Pure client-side JS — no SSR |
| **OSGi runtime config** | No server runtime at all |
| **GraphQL for headless delivery** | Static JSON only (query-index.json) |

---

## Publishing Actions via Adobe I/O Events

**AEM Eventing** (part of Adobe I/O Events on Adobe Developer Console) fires events for:
- `page.published`, `page.unpublished`, `page.deleted`
- Asset events in AEM Assets as a Cloud Service

You subscribe via Adobe App Builder or a webhook endpoint. For EDS + DA Live, the integration path is:

```
Author edits in DA Live
  → Publishes via Sidekick
    → Triggers AEM Events (I/O Events)
      → Your App Builder action fires
        → Downstream: cache invalidation, Slack notification, external indexing, etc.
```

**What works today**: AEM Cloud Service sites + EDS hybrid setups where the backend is ACS. For pure EDS (da.live → GitHub → CDN), the equivalent is GitHub webhooks on push events — not Adobe I/O Events natively.

**The gap worth raising**: There is no official "on-publish webhook" built into the Sidekick / DA Live publish flow that fires a guaranteed I/O Event. Custom publish actions are a core AEM CMS primitive and EDS has no equivalent.

---

## Indexing DA Content into a Custom RAG Model

### Option 1 — Crawl the aem.page URLs (simplest)

```
EDS query-index.json → list all page URLs
  → Fetch each page HTML from https://main--repo--org.aem.page/
    → Extract text content (strip navigation/footer)
      → Chunk + embed
        → Upsert to vector DB (Pinecone, pgvector, Weaviate, etc.)
```

DA Live's `query-index.json` is your content catalog. Every page publishes structured metadata there.

### Option 2 — DA Live Admin API

Adobe DA Live has a `da.live/source/*` API that returns raw HTML for any authored document:

```
GET https://admin.da.live/source/{org}/{repo}/{path}
```

This gives the pre-rendered authored HTML (tables, headings, etc.) — better for ingestion than crawling rendered pages.

### Option 3 — GitHub as the content store

Since DA Live commits to GitHub, watch the repo directly:

```
GitHub webhook on push to main
  → GitHub Action triggers
    → Parse changed .html files in da-content branch
      → Chunk + embed + upsert to vector DB
```

### RAG Pipeline

```
DA Content (aem.page URLs)
  ↓ extract with @mozilla/readability or custom stripper
  ↓ chunk by heading sections (H2 boundaries work well for EDS)
  ↓ embed with text-embedding-3-small or voyage-3
  ↓ store in pgvector / Pinecone
  ↓
Claude / GPT RAG chain → answers grounded in your EDS content
```

**Key note**: EDS pages render JS-decorated blocks client-side — the raw HTML from aem.page is pre-decoration. For RAG, pre-decoration (the authored text) is usually better — cleaner and more author-intent-preserving.

---

## Strong Roundtable Angles

1. **"There's no publish event hook"** — fundamental CMS primitive, missing in EDS. Adobe I/O Events helps in hybrid setups but pure EDS has a gap.
2. **"MSM / Live Copy has no EDS equivalent"** — enterprises with 50+ sites in AEM depend on this heavily.
3. **"Scheduled publishing"** — every marketing team asks for this on day one.
4. **"DA content as a RAG knowledge base"** — the query-index.json + aem.page crawl pattern is not well documented but very powerful.
