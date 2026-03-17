/**
 * Decorates the article-sidebar block.
 *
 * Renders a sticky sidebar matching the Oracle NetSuite reference design:
 *   1. "In This Article" auto-generated TOC (from article h2/h3 headings)
 *   2. Authored widget rows (Featured Resource, Related Articles, Popular Topics, Newsletter)
 *
 * Expected authored content (table rows):
 *   Row 1: Featured Resource — cells: [image?, title, description, cta-link]
 *   Row 2+: Widget rows — first cell heading determines type:
 *     "Related Articles" / "Trending Articles" → link list
 *     "Popular Topics"   → tag buttons
 *     "Stay Informed" / "Newsletter" → email signup form
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  // Wrap all non-sidebar sibling divs in .article-main so flexbox layout works
  // without the sidebar height bleeding into the article column (avoids grid whitespace)
  const section = block.closest('.section');
  const sidebarWrapper = block.closest('.article-sidebar-wrapper');
  if (section && sidebarWrapper) {
    const articleMain = document.createElement('div');
    articleMain.className = 'article-main';
    [...section.children].forEach((child) => {
      if (child !== sidebarWrapper) articleMain.append(child);
    });
    section.prepend(articleMain);
  }

  // 1. Auto-generate "In This Article" TOC — scan only the article section
  if (section) {
    const headings = [...section.querySelectorAll('h2, h3')].filter((h) => {
      // skip headings inside the sidebar block itself
      if (block.closest('.article-sidebar-wrapper')?.contains(h)) return false;
      // skip headings with no text or id
      return h.id && h.textContent.trim();
    });

    if (headings.length > 0) {
      const toc = document.createElement('div');
      toc.classList.add('sidebar-toc');

      const tocTitle = document.createElement('p');
      tocTitle.classList.add('sidebar-toc-title');
      tocTitle.textContent = 'In This Article';
      toc.append(tocTitle);

      const ul = document.createElement('ul');
      headings.forEach((h) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${h.id}`;
        a.textContent = h.textContent.replace(/\*/g, '').trim();
        if (h.tagName === 'H3') li.classList.add('sidebar-toc-sub');
        li.append(a);
        ul.append(li);
      });
      toc.append(ul);
      block.append(toc);
    }
  }

  // 2. Authored widgets
  rows.forEach((row, index) => {
    const cells = [...row.children];

    if (index === 0) {
      // Featured Resource widget
      const widget = document.createElement('div');
      widget.classList.add('sidebar-featured');

      const heading = document.createElement('h3');
      heading.textContent = 'Featured Resource';
      widget.append(heading);

      let [imgCell] = cells;
      let contentStart = 0;
      if (imgCell && !imgCell.querySelector('img, picture')) {
        imgCell = null;
      }
      if (imgCell) contentStart = 1;

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

      const titleCell = cells[contentStart];
      if (titleCell) {
        const title = document.createElement('h4');
        title.textContent = titleCell.textContent.trim();
        widget.append(title);
      }

      const descCell = cells[contentStart + 1];
      if (descCell) {
        const desc = document.createElement('p');
        desc.textContent = descCell.textContent.trim();
        widget.append(desc);
      }

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

    const typeText = (cells[0]?.textContent || '').trim().toLowerCase();
    const contentCell = cells[1] || cells[0];

    if (typeText.includes('related') || typeText.includes('article') || typeText.includes('trending')) {
      // Related / Trending Articles widget
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
        const paras = contentCell ? [...contentCell.querySelectorAll('p')] : [];
        if (paras.length) {
          const ul = document.createElement('ul');
          paras.forEach((p) => {
            const li = document.createElement('li');
            li.append(p);
            ul.append(li);
          });
          widget.append(ul);
        }
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
      // Generic widget
      const widget = document.createElement('div');
      widget.classList.add('sidebar-generic');
      cells.forEach((cell) => widget.append(cell));
      block.append(widget);
    }
  });
}
