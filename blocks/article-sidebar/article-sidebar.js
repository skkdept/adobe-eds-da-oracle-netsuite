/**
 * Decorates the article-sidebar block.
 *
 * Expected authored content (table rows):
 *   Row 1: Featured Resource — cells: [image?, title, description, cta-link]
 *   Row 2+: Widget rows — first cell heading determines type:
 *     "Related Articles" → link list
 *     "Popular Topics"   → tag buttons
 *     "Stay Informed" / "Newsletter" → email signup form
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  rows.forEach((row, index) => {
    const cells = [...row.children];

    if (index === 0) {
      // Featured Resource widget
      const widget = document.createElement('div');
      widget.classList.add('sidebar-featured');

      const heading = document.createElement('h3');
      heading.textContent = 'Featured Resource';
      widget.append(heading);

      // Check if first cell has an image
      let [imgCell] = cells;
      let contentStart = 0;
      if (imgCell && !imgCell.querySelector('img, picture')) {
        imgCell = null;
      }
      if (imgCell) {
        contentStart = 1;
      }

      if (imgCell) {
        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('sidebar-featured-image');
        imgWrapper.append(imgCell.querySelector('picture') || imgCell.querySelector('img'));
        widget.append(imgWrapper);
      } else {
        const placeholder = document.createElement('div');
        placeholder.classList.add('sidebar-featured-image', 'sidebar-featured-image-placeholder');
        widget.append(placeholder);
      }

      // Title
      const titleCell = cells[contentStart];
      if (titleCell) {
        const title = document.createElement('h4');
        title.textContent = titleCell.textContent.trim();
        widget.append(title);
      }

      // Description
      const descCell = cells[contentStart + 1];
      if (descCell) {
        const desc = document.createElement('p');
        desc.textContent = descCell.textContent.trim();
        widget.append(desc);
      }

      // CTA link
      const ctaCell = cells[contentStart + 2] || cells[contentStart + 1];
      const ctaLink = ctaCell && ctaCell.querySelector('a');
      if (ctaLink) {
        ctaLink.classList.add('sidebar-download-btn');
        ctaLink.textContent = ctaLink.textContent.trim() || 'Download Now';
        widget.append(ctaLink);
      }

      block.append(widget);
      return;
    }

    // Determine widget type from first cell heading text
    const typeText = (cells[0]?.textContent || '').trim().toLowerCase();
    const contentCell = cells[1] || cells[0];

    if (typeText.includes('related') || typeText.includes('article')) {
      // Related Articles widget
      const widget = document.createElement('div');
      widget.classList.add('sidebar-related');

      const heading = document.createElement('h3');
      heading.textContent = cells[0].textContent.trim();
      widget.append(heading);

      const links = contentCell ? [...contentCell.querySelectorAll('a')] : [];
      if (links.length) {
        const ul = document.createElement('ul');
        links.forEach((link) => {
          const li = document.createElement('li');
          link.classList.remove('button');
          li.append(link);
          ul.append(li);
        });
        widget.append(ul);
      } else {
        // fallback: treat each paragraph as a link entry
        const paras = contentCell ? [...contentCell.querySelectorAll('p')] : [];
        const ul = document.createElement('ul');
        paras.forEach((p) => {
          const li = document.createElement('li');
          li.append(p);
          ul.append(li);
        });
        if (ul.children.length) widget.append(ul);
      }

      block.append(widget);
    } else if (typeText.includes('topic') || typeText.includes('tag')) {
      // Popular Topics widget
      const widget = document.createElement('div');
      widget.classList.add('sidebar-topics');

      const heading = document.createElement('h3');
      heading.textContent = cells[0].textContent.trim();
      widget.append(heading);

      const tagsContainer = document.createElement('div');
      tagsContainer.classList.add('sidebar-topics-tags');

      const links = contentCell ? [...contentCell.querySelectorAll('a')] : [];
      if (links.length) {
        links.forEach((link) => {
          link.classList.add('sidebar-tag');
          tagsContainer.append(link);
        });
      } else {
        // treat paragraphs as tags
        const paras = contentCell ? [...contentCell.querySelectorAll('p')] : [];
        paras.forEach((p) => {
          const span = document.createElement('span');
          span.classList.add('sidebar-tag');
          span.textContent = p.textContent.trim();
          tagsContainer.append(span);
        });
      }

      widget.append(tagsContainer);
      block.append(widget);
    } else if (typeText.includes('newsletter') || typeText.includes('inform') || typeText.includes('subscribe')) {
      // Newsletter signup widget
      const widget = document.createElement('div');
      widget.classList.add('sidebar-newsletter');

      const heading = document.createElement('h3');
      heading.textContent = cells[0].textContent.trim() || 'Stay Informed';
      widget.append(heading);

      const desc = contentCell?.querySelector('p');
      if (desc) widget.append(desc);

      const form = document.createElement('form');
      form.classList.add('sidebar-newsletter-form');
      form.addEventListener('submit', (e) => e.preventDefault());

      const input = document.createElement('input');
      input.type = 'email';
      input.placeholder = 'Your email address';
      input.setAttribute('aria-label', 'Email address');

      const btn = document.createElement('button');
      btn.type = 'submit';
      btn.textContent = 'Subscribe';
      btn.classList.add('sidebar-subscribe-btn');

      form.append(input, btn);
      widget.append(form);
      block.append(widget);
    } else {
      // Generic widget — just render as-is
      const widget = document.createElement('div');
      widget.classList.add('sidebar-generic');
      cells.forEach((cell) => widget.append(cell));
      block.append(widget);
    }
  });
}
