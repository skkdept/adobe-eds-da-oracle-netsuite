/**
 * Decorates the promo-banner block.
 *
 * Expected authored content:
 *   Row 1: Heading text
 *   Row 2: Body paragraph text
 *   (Optional) any row with a link → becomes the CTA button
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];

  const content = document.createElement('div');
  content.classList.add('promo-banner-content');

  let heading = null;
  let bodyText = null;
  let ctaLink = null;

  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    const link = cell.querySelector('a');

    if (link && !ctaLink) {
      ctaLink = link;
      ctaLink.classList.add('promo-banner-cta');
      if (!ctaLink.textContent.trim()) ctaLink.textContent = 'Free Product Tour';
      return;
    }

    const hEl = cell.querySelector('h1, h2, h3, h4');
    if (hEl && !heading) {
      heading = hEl;
      return;
    }

    const pEl = cell.querySelector('p');
    if (pEl && !bodyText) {
      bodyText = pEl;
    }
  });

  // fallback: if no explicit heading found, use first row text
  if (!heading && rows[0]) {
    heading = document.createElement('h2');
    heading.textContent = rows[0].textContent.trim();
  }

  if (heading) content.append(heading);
  if (bodyText) content.append(bodyText);
  if (ctaLink) {
    const btnWrapper = document.createElement('p');
    btnWrapper.classList.add('promo-banner-btn-wrapper');
    btnWrapper.append(ctaLink);
    content.append(btnWrapper);
  }

  block.textContent = '';
  block.append(content);
}
