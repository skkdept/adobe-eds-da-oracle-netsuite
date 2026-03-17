/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-guide. Base: cards.
 * Source: https://www.netsuite.com/portal/resource/articles/erp/what-is-erp.shtml
 * Selectors: section.business-guide-carousel, div.related-articles, section.solutions-grid
 * Generated: 2026-03-17 (selectors verified against captured DOM, v3)
 *
 * Source DOM structures (from captured HTML):
 *
 * Instance 1 (section.business-guide-carousel):
 *   <section class="business-guide-carousel">
 *     <div class="card card-large-thumbnail">
 *       <a><img class="card-large-thumbnail__thumbnail">
 *         <div class="card-large-thumbnail__content-wrapper">
 *           <p class="card-large-thumbnail__category">Guide</p>
 *           <p class="card-large-thumbnail__heading">Title</p>
 *           <p class="card-large-thumbnail__tag">Learn More</p>
 *         </div></a>
 *     </div> (x4)
 *   </section>
 *
 * Instance 2 (div.related-articles):
 *   <div class="related-articles">
 *     <div class="ra-feat"><img><p class="display"><a>Title</a></p><p>Description</p></div>
 *     <div class="ra-more"><figure><img><figcaption><a>Title</a></figcaption></figure> (x3)</div>
 *   </div>
 *
 * Instance 3 (section.solutions-grid):
 *   <section class="solutions-grid">
 *     <div class="solutions-grid__item">
 *       <div class="solutions-grid__item--img"><img></div>
 *       <figure><h3>Title</h3><p>Description</p></figure>
 *     </div> (x6)
 *   </section>
 *
 * Target (cards block library): 2 columns per row: [image | text content] per card
 */
export default function parse(element, { document }) {
  const cells = [];

  const isGuideCarousel = element.classList.contains('business-guide-carousel');
  const isRelatedArticles = element.classList.contains('related-articles');
  const isSolutionsGrid = element.classList.contains('solutions-grid');

  if (isGuideCarousel) {
    // Instance 1: Guide cards with thumbnail, category, heading, CTA
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
        // Wrap heading text in a link if available
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
    // Instance 2: Featured article + smaller related articles
    // Featured article (from captured DOM: div.ra-feat)
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

    // Smaller related articles (from captured DOM: div.ra-more figure)
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
    // Instance 3: Solution tiles with image, title, description
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
    // Fallback: generic card extraction
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
