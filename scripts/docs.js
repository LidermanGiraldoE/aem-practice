import { getMetadata } from './aem.js';
import { toSitePath } from './blog.js';

const SITE_ROOT = '/content/aem-practice';
const DEFAULT_NAV = '/docs/nav';
const SAFE_HREF = /^(?:https?:|\/|#)/;

let navPromise;

function navPath() {
  const custom = getMetadata('docs-nav');
  if (custom) return new URL(custom, window.location.href).pathname;
  // the author tier serves pages under the site root, Edge Delivery serves them at the root
  return window.location.pathname.startsWith(SITE_ROOT) ? `${SITE_ROOT}${DEFAULT_NAV}` : DEFAULT_NAV;
}

const normalize = (path) => path.replace(/\/$/, '') || '/';

export const currentDocPath = () => normalize(toSitePath(window.location.href));

export const DOCS_ROOT = '/docs';

export const docsHomeHref = () => (
  window.location.pathname.startsWith(SITE_ROOT) ? `${SITE_ROOT}${DOCS_ROOT}.html` : DOCS_ROOT
);

// headings start a group; the links of the lists that follow become its pages
function parseNav(source) {
  const doc = new DOMParser().parseFromString(source, 'text/html');
  const groups = [];
  doc.body.querySelectorAll('h2, h3, h4, ul, ol').forEach((element) => {
    if (/^H\d$/.test(element.tagName)) {
      groups.push({ title: element.textContent.trim(), items: [] });
      return;
    }
    if (element.parentElement.closest('ul, ol')) return;
    if (!groups.length) groups.push({ title: '', items: [] });
    element.querySelectorAll(':scope > li > a, :scope > li > p > a').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!SAFE_HREF.test(href)) return;
      groups.at(-1).items.push({
        title: link.textContent.trim(),
        href,
        path: normalize(toSitePath(href)),
      });
    });
  });
  return groups.filter((group) => group.items.length);
}

/** Groups of documentation pages as authored in the docs navigation page. */
export function getDocsNav() {
  navPromise ||= fetch(`${navPath()}.plain.html`)
    .then((response) => {
      if (!response.ok) throw new Error(`Docs navigation request failed: ${response.status}`);
      return response.text();
    })
    .then(parseNav)
    .catch((error) => {
      navPromise = null;
      throw error;
    });
  return navPromise;
}

/** Position of the current page in the docs navigation, with its neighbours. */
export async function getDocContext() {
  const groups = await getDocsNav();
  const pages = groups.flatMap(({ title, items }) => (
    items.map((item) => ({ ...item, group: title }))
  ));
  const path = currentDocPath();
  const index = pages.findIndex((page) => page.path === path);
  return {
    groups,
    current: pages[index] || null,
    prev: index > 0 ? pages[index - 1] : null,
    next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : null,
  };
}
