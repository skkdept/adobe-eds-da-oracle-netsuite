import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  createOptimizedPicture,
} from './aem.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    // Check if h1 or picture is already inside a hero block
    if (h1.closest('.hero') || picture.closest('.hero')) {
      return; // Don't create a duplicate hero block
    }
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }

    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Re-processes inline content images with article-appropriate breakpoints.
 * AEM's default srcset only has width=2000 (desktop) and width=750 (all mobile),
 * so small viewports (~380px) wastefully download the 750px version.
 * This replaces those picture elements with a 3-breakpoint set.
 * @param {Element} main The main element
 */
function optimizeInlineImages(main) {
  // The first content image is the LCP candidate (e.g. article banner) — load it eagerly.
  // All others use lazy. Mobile breakpoint is 600px (not 400px) to cover 1.5x DPR devices
  // where a 380px display needs a ~570px source.
  let isFirst = true;
  main.querySelectorAll('.default-content-wrapper picture').forEach((picture) => {
    const img = picture.querySelector('img');
    if (!img || !img.src) return;
    const eager = isFirst || img.loading === 'eager';
    isFirst = false;
    const newPicture = createOptimizedPicture(img.src, img.alt, eager, [
      { media: '(min-width: 900px)', width: '750' },
      { media: '(min-width: 480px)', width: '600' },
      { width: '600' },
    ]);
    const newImg = newPicture.querySelector('img');
    if (img.getAttribute('width')) newImg.setAttribute('width', img.getAttribute('width'));
    if (img.getAttribute('height')) newImg.setAttribute('height', img.getAttribute('height'));
    picture.replaceWith(newPicture);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
  optimizeInlineImages(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();

  // Skip navigation link for accessibility
  const skipNav = document.createElement('a');
  skipNav.href = '#main-content';
  skipNav.className = 'skip-nav';
  skipNav.textContent = 'Skip to main content';
  doc.body.prepend(skipNav);

  const main = doc.querySelector('main');
  if (main) {
    main.id = 'main-content';
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Injects JSON-LD structured data for the page (SEO/GEO).
 * Reads metadata from the document to build Article schema.
 */
function injectStructuredData(doc) {
  const title = doc.querySelector('title')?.textContent || doc.querySelector('h1')?.textContent || '';
  const description = doc.querySelector('meta[name="description"]')?.content || '';
  const canonicalEl = doc.querySelector('link[rel="canonical"]');
  const url = canonicalEl ? canonicalEl.href : window.location.href;
  const image = doc.querySelector('main picture img')?.src || '';
  const dateModified = doc.querySelector('meta[name="modified-time"]')?.content
    || doc.querySelector('time')?.getAttribute('datetime') || '';

  // Article schema — used by Google and AI crawlers (GEO)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    image: image || undefined,
    dateModified: dateModified || undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Oracle NetSuite',
      url: 'https://www.netsuite.com',
      logo: {
        '@type': 'ImageObject',
        url: `${window.location.origin}/icons/oracle-netsuite-logo-white.svg`,
      },
    },
  };

  // Remove undefined fields
  Object.keys(schema).forEach((k) => schema[k] === undefined && delete schema[k]);

  const script = doc.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  doc.head.append(script);
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  // window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  injectStructuredData(document);
  loadDelayed();
}

loadPage();
