const CustomImportScript = (() => {
  const __defProp = Object.defineProperty;
  const __defProps = Object.defineProperties;
  const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  const __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  const __getOwnPropNames = Object.getOwnPropertyNames;
  const __getOwnPropSymbols = Object.getOwnPropertySymbols;
  const __hasOwnProp = Object.prototype.hasOwnProperty;
  const __propIsEnum = Object.prototype.propertyIsEnumerable;
  const __defNormalProp = (obj, key, value) => (key in obj ? __defProp(obj, key, {
    enumerable: true, configurable: true, writable: true, value,
  }) : obj[key] = value);
  const __spreadValues = (a, b) => {
    for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols) {
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
      }
    }
    return a;
  };
  const __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  const __export = (target, all) => {
    for (const name in all) __defProp(target, name, { get: all[name], enumerable: true });
  };
  const __copyProps = (to, from, except, desc) => {
    if (from && typeof from === 'object' || typeof from === 'function') {
      for (const key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  const __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

  // tools/importer/import-resource-article.js
  const import_resource_article_exports = {};
  __export(import_resource_article_exports, {
    default: () => import_resource_article_default,
  });

  // tools/importer/parsers/hero-article.js
  function parse(element, { document }) {
    const bannerImg = element.querySelector('img.article-img, img.img-fluid');
    const title = element.querySelector('h1, h2, .article-title');
    const authorDiv = element.querySelector('.author');
    const dateEl = element.querySelector('time, .article-date');
    const cells = [];
    if (bannerImg) {
      cells.push([bannerImg]);
    }
    const contentCell = [];
    if (title) contentCell.push(title);
    if (authorDiv) contentCell.push(authorDiv);
    if (dateEl && !(authorDiv == null ? void 0 : authorDiv.contains(dateEl))) contentCell.push(dateEl);
    if (contentCell.length > 0) cells.push(contentCell);
    const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-video.js
  function parse2(element, { document }) {
    const iframe = element.querySelector('iframe');
    let videoUrl = null;
    if (iframe) {
      videoUrl = iframe.getAttribute('src') || iframe.getAttribute('data-src');
    }
    if (!videoUrl) {
      const link = element.querySelector('a[href*="youtube"], a[href*="youtu.be"], a[href*="vimeo"]');
      if (link) videoUrl = link.href;
    }
    if (!videoUrl) {
      videoUrl = element.getAttribute('data-src') || element.getAttribute('data-video-url');
    }
    const cells = [];
    const contentCell = [];
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.textContent = videoUrl;
      contentCell.push(link);
    }
    if (contentCell.length > 0) {
      cells.push(contentCell);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse3(element, { document }) {
    const cells = [];
    const isCta = element.classList.contains('cta');
    const isUgTreatment = element.classList.contains('ug-treatment');
    const isHowToTreatment = element.classList.contains('how-to-treatment');
    if (isCta) {
      const heading = element.querySelector('h3, .h3, h2');
      const ctaLink = element.querySelector('a.cta__button, a[class*="cta"], a.btn');
      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (ctaLink) contentCell.push(ctaLink);
      cells.push(contentCell);
    } else if (isUgTreatment || isHowToTreatment) {
      const imgCol = element.querySelector('[class*="__img"] img, .ug-treatment__img img, .how-to-treatment__img img');
      const copyDiv = element.querySelector('[class*="__copy"], .ug-treatment__copy, .how-to-treatment__copy');
      const textCell = [];
      if (copyDiv) {
        const heading = copyDiv.querySelector('p.h3, h3, .h3, p:first-child');
        const ctaLink = copyDiv.querySelector('a');
        if (heading) textCell.push(heading);
        if (ctaLink && ctaLink !== heading) textCell.push(ctaLink);
      }
      if (isUgTreatment) {
        cells.push([...textCell, imgCol].filter(Boolean));
      } else {
        cells.push([imgCol, ...textCell].filter(Boolean));
      }
    } else {
      const img = element.querySelector('img');
      const heading = element.querySelector('h2, h3, .h3, p.h3');
      const ctaLink = element.querySelector('a[href]');
      const textCell = [];
      if (heading) textCell.push(heading);
      if (ctaLink) textCell.push(ctaLink);
      if (img) {
        cells.push([...textCell, img]);
      } else {
        cells.push(textCell);
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-guide.js
  function parse4(element, { document }) {
    const cells = [];
    const isGuideCarousel = element.classList.contains('business-guide-carousel');
    const isRelatedArticles = element.classList.contains('related-articles');
    const isSolutionsGrid = element.classList.contains('solutions-grid');
    if (isGuideCarousel) {
      const cards = element.querySelectorAll('.card-large-thumbnail');
      cards.forEach((card) => {
        const img = card.querySelector('img.card-large-thumbnail__thumbnail, img');
        const category = card.querySelector('.card-large-thumbnail__category');
        const heading = card.querySelector('.card-large-thumbnail__heading');
        const ctaTag = card.querySelector('.card-large-thumbnail__tag');
        const link = card.querySelector('a.card-large-thumbnail__link, a');
        const textCell = [];
        if (category) textCell.push(category);
        if (heading) {
          if (link && heading) {
            const h = document.createElement('p');
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = heading.textContent;
            h.appendChild(a);
            textCell.push(h);
          } else {
            textCell.push(heading);
          }
        }
        if (ctaTag) textCell.push(ctaTag);
        cells.push([img || '', textCell]);
      });
    } else if (isRelatedArticles) {
      const featImg = element.querySelector('.ra-feat img');
      const featTitle = element.querySelector('.ra-feat .display a, .ra-feat h2 a, .ra-feat p.display a');
      const featDesc = element.querySelector('.ra-feat > div:last-child > p:not(.display)');
      if (featImg || featTitle) {
        const textCell = [];
        if (featTitle) {
          const h = document.createElement('p');
          const a = document.createElement('a');
          a.href = featTitle.href;
          a.textContent = featTitle.textContent;
          h.appendChild(document.createElement('strong')).appendChild(a);
          textCell.push(h);
        }
        if (featDesc) textCell.push(featDesc);
        cells.push([featImg || '', textCell]);
      }
      const moreArticles = element.querySelectorAll('.ra-more figure');
      moreArticles.forEach((fig) => {
        const img = fig.querySelector('img');
        const link = fig.querySelector('figcaption a, a');
        const textCell = [];
        if (link) {
          const p = document.createElement('p');
          const a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.textContent;
          p.appendChild(a);
          textCell.push(p);
        }
        cells.push([img || '', textCell]);
      });
    } else if (isSolutionsGrid) {
      const items = element.querySelectorAll('.solutions-grid__item');
      items.forEach((item) => {
        const img = item.querySelector('.solutions-grid__item--img img, img');
        const heading = item.querySelector('h3');
        const desc = item.querySelector('figure p, p:not(.h2)');
        const link = item.closest('a');
        const textCell = [];
        if (heading) {
          if (link) {
            const h = document.createElement('h3');
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = heading.textContent;
            h.appendChild(a);
            textCell.push(h);
          } else {
            textCell.push(heading);
          }
        }
        if (desc) textCell.push(desc);
        cells.push([img || '', textCell]);
      });
    } else {
      const items = element.querySelectorAll('[class*="card"], [class*="item"], figure');
      items.forEach((item) => {
        const img = item.querySelector('img');
        const heading = item.querySelector('h3, h4, p strong, .heading');
        const desc = item.querySelector('p:not(:has(strong))');
        const textCell = [];
        if (heading) textCell.push(heading);
        if (desc) textCell.push(desc);
        cells.push([img || '', textCell]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-guide', cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/netsuite-cleanup.js
  const H = { before: 'beforeTransform', after: 'afterTransform' };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        '#consent_blackbar',
        '#teconsent',
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        'header.header-main',
        'ol.breadcrumb',
        'aside.article-sidebar',
        'footer',
        'iframe',
        'link',
        'noscript',
      ]);
    }
  }

  // tools/importer/transformers/netsuite-sections.js
  const H2 = { after: 'afterTransform' };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
      const template = payload && payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const { sections } = template;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const { selector } = section;
        if (!selector) continue;
        const selectorList = Array.isArray(selector) ? selector : [selector];
        let sectionEl = null;
        for (const sel of selectorList) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: 'Section Metadata',
            cells: { style: section.style },
          });
          sectionEl.after(metaBlock);
        }
        if (i > 0 && sectionEl.previousElementSibling) {
          const hr = document.createElement('hr');
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-resource-article.js
  const parsers = {
    'hero-article': parse,
    'embed-video': parse2,
    'columns-cta': parse3,
    'cards-guide': parse4,
  };
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
  const transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : [],
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE,
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
  var import_resource_article_default = {
    transform: (payload) => {
      const {
        document, url, html, params,
      } = payload;
      const main = document.body;
      executeTransformers('beforeTransform', main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers('afterTransform', main, payload);
      const hr = document.createElement('hr');
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.shtml$/, '').replace(/\.html$/, ''),
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
  return __toCommonJS(import_resource_article_exports);
})();
