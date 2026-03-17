/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-cta. Base: columns.
 * Source: https://www.netsuite.com/portal/resource/articles/erp/what-is-erp.shtml
 * Selectors: div.cta.bg.bg-ai-1, section.py-0 div.ug-treatment, section.py-0 div.how-to-treatment
 * Generated: 2026-03-17 (selectors verified against captured DOM, attempt 3)
 *
 * Source DOM structures (from captured HTML):
 *
 * Instance 1 (div.cta.bg.bg-ai-1):
 *   <div class="cta bg bg-ai-1">
 *     <div class="row"><div class="col-auto">
 *       <h3><span>The #1</span><br><span>AI Cloud ERP</span></h3>
 *       <a class="cta__button">Free Product Tour</a>
 *     </div></div>
 *   </div>
 *
 * Instance 2 (div.ug-treatment):
 *   <div class="ug-treatment">
 *     <div class="row"><div class="ug-treatment__img"><img></div>
 *     <div class="ug-treatment__copy"><p class="h3">text</p><a>CTA</a></div></div>
 *   </div>
 *
 * Instance 3 (div.how-to-treatment):
 *   <div class="how-to-treatment">
 *     <div class="row"><div class="how-to-treatment__img"><img></div>
 *     <div class="how-to-treatment__copy"><p>text</p><a>CTA</a></div></div>
 *   </div>
 *
 * Target (columns block library): 2+ columns per row, each cell with text/images/links
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect which instance type we're dealing with
  const isCta = element.classList.contains('cta');
  const isUgTreatment = element.classList.contains('ug-treatment');
  const isHowToTreatment = element.classList.contains('how-to-treatment');

  if (isCta) {
    // Instance 1: Single-column CTA with heading and button
    // From captured DOM: h3 with spans + a.cta__button
    const heading = element.querySelector('h3, .h3, h2');
    const ctaLink = element.querySelector('a.cta__button, a[class*="cta"], a.btn');
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (ctaLink) contentCell.push(ctaLink);
    cells.push(contentCell);
  } else if (isUgTreatment || isHowToTreatment) {
    // Instance 2 & 3: Two-column layout with image and text/CTA
    const imgCol = element.querySelector('[class*="__img"] img, .ug-treatment__img img, .how-to-treatment__img img');
    const copyDiv = element.querySelector('[class*="__copy"], .ug-treatment__copy, .how-to-treatment__copy');

    const textCell = [];
    if (copyDiv) {
      const heading = copyDiv.querySelector('p.h3, h3, .h3, p:first-child');
      const ctaLink = copyDiv.querySelector('a');
      if (heading) textCell.push(heading);
      if (ctaLink && ctaLink !== heading) textCell.push(ctaLink);
    }

    // Build two-column row: text | image or image | text based on DOM order
    if (isUgTreatment) {
      // ug-treatment has image on right visually (flex-row-reverse), text on left
      cells.push([...textCell, imgCol].filter(Boolean));
    } else {
      // how-to-treatment has image on left, text on right
      cells.push([imgCol, ...textCell].filter(Boolean));
    }
  } else {
    // Fallback: generic two-column extraction
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
