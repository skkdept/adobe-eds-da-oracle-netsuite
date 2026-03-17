/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS - Import all parsers needed for resource-article template
import heroArticleParser from './parsers/hero-article.js';
import embedVideoParser from './parsers/embed-video.js';
import columnsCtaParser from './parsers/columns-cta.js';
import cardsGuideParser from './parsers/cards-guide.js';

// TRANSFORMER IMPORTS - Import all transformers from tools/importer/transformers/
import netsuiteCleanupTransformer from './transformers/netsuite-cleanup.js';
import netsuiteSectionsTransformer from './transformers/netsuite-sections.js';

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-article': heroArticleParser,
  'embed-video': embedVideoParser,
  'columns-cta': columnsCtaParser,
  'cards-guide': cardsGuideParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'resource-article',
  description: 'NetSuite resource article page about ERP topics, with educational content and related resources',
  urls: [
    'https://www.netsuite.com/portal/resource/articles/erp/what-is-erp.shtml',
  ],
  blocks: [
    {
      name: 'hero-article',
      instances: ['div.article-banner'],
    },
    {
      name: 'embed-video',
      instances: ['div.ratio.ratio-16x9'],
    },
    {
      name: 'columns-cta',
      instances: ['div.cta.bg.bg-ai-1', 'section.py-0 div.ug-treatment', 'section.py-0 div.how-to-treatment'],
    },
    {
      name: 'cards-guide',
      instances: ['section.business-guide-carousel', 'div.related-articles', 'section.solutions-grid'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Article Hero',
      selector: 'div.article-banner',
      style: null,
      blocks: ['hero-article'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Article Body',
      selector: 'article.article-body div.entry-content',
      style: null,
      blocks: ['embed-video', 'columns-cta'],
      defaultContent: [
        'article.article-body div.entry-content > p:first-child',
        'h2#target1',
        'p.h2',
        'h2#target2',
        'h2#target3',
        'h2#target4',
        'h2#target5',
        'h2#target6',
        'h2#target7',
        'h2#target8',
        'h2#target9',
        'h2#target10',
        'h2#target11',
        'h2#target12',
        'h2#target13',
        'h2#target14',
        'h2#target15',
        'div.consensus-embed',
      ],
    },
    {
      id: 'section-3',
      name: 'You May Also Like',
      selector: 'section.business-guide-carousel',
      style: null,
      blocks: ['cards-guide'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Related Articles',
      selector: 'div.related-articles',
      style: null,
      blocks: ['cards-guide'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Solutions Grid',
      selector: 'section.solutions-grid',
      style: null,
      blocks: ['cards-guide'],
      defaultContent: [],
    },
    {
      id: 'section-6',
      name: 'Bottom CTA',
      selector: 'section.botcta',
      style: 'dark',
      blocks: [],
      defaultContent: ['section.botcta div.container'],
    },
  ],
};

// TRANSFORMER REGISTRY - Array of transformer functions
// Section transformer runs after cleanup in afterTransform hook
const transformers = [
  netsuiteCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [netsuiteSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname
        .replace(/\/$/, '')
        .replace(/\.shtml$/, '')
        .replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
