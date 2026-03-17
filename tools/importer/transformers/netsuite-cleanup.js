/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NetSuite cleanup.
 * Removes non-authorable site chrome (header, footer, sidebar, breadcrumbs, consent).
 * All selectors from captured DOM of netsuite.com.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Cookie consent bar (from captured DOM: <div id="consent_blackbar">)
    // TrustArc cookie preferences (from captured DOM: <div id="teconsent">)
    WebImporter.DOMUtils.remove(element, [
      '#consent_blackbar',
      '#teconsent',
    ]);
  }

  if (hookName === H.after) {
    // Header navigation (from captured DOM: <header class="header-main ...">)
    // Breadcrumb (from captured DOM: <ol class="breadcrumb">)
    // Article sidebar (from captured DOM: <aside class="article-sidebar ...">)
    // Footer (from captured DOM: <footer>)
    // Safe element removal
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
