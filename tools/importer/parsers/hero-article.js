/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-article. Base: hero.
 * Source: https://www.netsuite.com/portal/resource/articles/erp/what-is-erp.shtml
 * Selector: div.article-banner
 * Generated: 2026-03-17 (WAF blocks live URL validation - verified against captured DOM)
 *
 * Source DOM structure (from captured HTML):
 *   <div class="article-banner">
 *     <h1 class="article-title">What is ERP?</h1>
 *     <div class="row">
 *       <div class="col-md-9 author"><img class="author-img"> <a>Author Name</a> | Role</div>
 *       <div class="col-md-3 article-date"><time>Date</time></div>
 *     </div>
 *     <img class="article-img" src="..." alt="">
 *   </div>
 *
 * Target (hero block library): Row 1 = background image, Row 2 = heading + text
 */
export default function parse(element, { document }) {
  // Extract banner image (from captured DOM: <img class="article-img">)
  const bannerImg = element.querySelector('img.article-img, img.img-fluid');

  // Extract title (from captured DOM: <h1 class="article-title">)
  const title = element.querySelector('h1, h2, .article-title');

  // Extract author info (from captured DOM: <div class="author">)
  const authorDiv = element.querySelector('.author');

  // Extract date (from captured DOM: <time> inside .article-date)
  const dateEl = element.querySelector('time, .article-date');

  // Build cells matching hero block library structure:
  // Row 1: background/banner image
  // Row 2: title + subtitle/info
  const cells = [];

  // Row 1: banner image
  if (bannerImg) {
    cells.push([bannerImg]);
  }

  // Row 2: content (title + author/date info)
  const contentCell = [];
  if (title) contentCell.push(title);
  if (authorDiv) contentCell.push(authorDiv);
  if (dateEl && !authorDiv?.contains(dateEl)) contentCell.push(dateEl);
  if (contentCell.length > 0) cells.push(contentCell);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}
