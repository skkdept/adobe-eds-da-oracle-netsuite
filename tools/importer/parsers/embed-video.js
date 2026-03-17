/* eslint-disable */
/* global WebImporter */

/**
 * Parser for embed-video. Base: embed.
 * Source: https://www.netsuite.com/portal/resource/articles/erp/what-is-erp.shtml
 * Selector: div.ratio.ratio-16x9
 * Generated: 2026-03-17 (selectors verified against captured DOM)
 *
 * Source DOM structure (from captured HTML):
 *   <div class="ratio ratio-16x9">
 *     (iframe or empty - WAF may have blocked iframe content)
 *   </div>
 *
 * Target (embed block library): Row 1 = optional poster image + video URL link
 */
export default function parse(element, { document }) {
  // Try to find video URL from iframe (from captured DOM: may contain iframe with YouTube/Vimeo src)
  const iframe = element.querySelector('iframe');
  let videoUrl = null;

  if (iframe) {
    videoUrl = iframe.getAttribute('src') || iframe.getAttribute('data-src');
  }

  // Fallback: look for a link inside the element
  if (!videoUrl) {
    const link = element.querySelector('a[href*="youtube"], a[href*="youtu.be"], a[href*="vimeo"]');
    if (link) videoUrl = link.href;
  }

  // Fallback: check data attributes on the container
  if (!videoUrl) {
    videoUrl = element.getAttribute('data-src') || element.getAttribute('data-video-url');
  }

  // Build cells matching embed block library structure:
  // Row 1: video URL (and optional poster image)
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
