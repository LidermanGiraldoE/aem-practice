const SITE_ROOT = '/content/aem-practice';
const DEFAULT_IMAGE = '/default-meta-image.png';

// the author tier has no EDS query index, so blog listings only render on EDS hosts
export const IS_AUTHOR = window.location.hostname.startsWith('author-');

export const CATEGORIES = {
  'edge-delivery': { label: 'Edge Delivery', tone: 'brand', glyph: '</>' },
  'universal-editor': { label: 'Universal Editor', tone: 'violet', glyph: '{ }' },
  frontend: { label: 'Frontend', tone: 'cyan', glyph: 'tw:' },
  performance: { label: 'Performance', tone: 'warning', glyph: '100' },
  'casos-reales': { label: 'Casos reales', tone: 'coral', glyph: '↯' },
};

const DATE_FORMAT = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });

let indexPromise;

function fetchBlogIndex() {
  indexPromise ||= fetch('/blog/query-index.json?limit=500')
    .then((response) => {
      if (!response.ok) throw new Error(`Blog index request failed: ${response.status}`);
      return response.json();
    })
    .then(({ data = [] }) => data)
    .catch((error) => {
      indexPromise = null;
      throw error;
    });
  return indexPromise;
}

/** Normalizes authored page links (/content/site/blog/x.html or /blog/x) to site paths. */
export function toSitePath(href = '') {
  const { pathname } = new URL(href, window.location.origin);
  return pathname.replace(SITE_ROOT, '').replace(/\.html$/, '');
}

function toImage(path = '') {
  if (!path || path.startsWith(DEFAULT_IMAGE)) return '';
  return path.split('?')[0];
}

function toDate(value = '') {
  const [, year, month, day] = value.match(/^(\d{4})-(\d{2})-(\d{2})/) || [];
  return year ? new Date(Number(year), Number(month) - 1, Number(day)) : null;
}

/**
 * Loads the blog index and returns posts (newest first) with their authors resolved.
 * @returns {Promise<{posts: object[], authors: Map<string, object>}>}
 */
export async function getBlogData() {
  const rows = await fetchBlogIndex();
  const visible = rows.filter((row) => !row.robots?.includes('noindex'));

  const authors = new Map(visible
    .filter((row) => row.template === 'blog-author')
    .map((row) => [row.path, {
      name: row.title,
      role: row.role,
      image: toImage(row.image),
      href: row.path,
    }]));

  const posts = visible
    .filter((row) => row.template === 'blog-post')
    .map((row) => {
      const date = toDate(row.publicationDate);
      const category = CATEGORIES[row.category] ? row.category : '';
      return {
        path: row.path,
        title: row.title,
        description: row.description,
        image: toImage(row.image),
        category,
        date,
        dateLabel: date ? DATE_FORMAT.format(date) : '',
        readingTime: Number.parseInt(row.readingTime, 10) || 0,
        featured: row.featured === 'true',
        author: authors.get(row.author) || null,
      };
    })
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

  return { posts, authors };
}

/** The authored article when given, otherwise the newest featured one, otherwise the newest. */
export function getFeaturedPost(posts, path = '') {
  return posts.find((post) => path && post.path === path)
    || posts.find((post) => post.featured)
    || posts[0]
    || null;
}

/** Placeholder shown inside Universal Editor, where the blog index is not available. */
export function renderEditorNotice(block, title) {
  const notice = document.createElement('div');
  notice.className = 'rounded-card border border-dashed border-line-strong px-6 py-10 text-center text-fg-2';
  const heading = document.createElement('p');
  heading.className = 'm-0! font-bold text-fg';
  heading.textContent = title;
  const text = document.createElement('p');
  text.className = 'm-0! mt-1! text-sm text-fg-3';
  text.textContent = 'Se genera con los artículos publicados. Revísalo en aem.page o aem.live.';
  notice.append(heading, text);
  block.replaceChildren(notice);
}
