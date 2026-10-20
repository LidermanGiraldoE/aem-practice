import { h, render } from '@dropins/tools/preact.js';
import BlogList from '../../design-system/organisms/blog-list/blog-list.js';
import {
  CATEGORIES, IS_AUTHOR, getBlogData, getFeaturedPost, renderEditorNotice, toSitePath,
} from '../../scripts/blog.js';

const PARAMS = { category: 'categoria', query: 'q', page: 'pagina' };

function getFeaturedPath() {
  const featured = document.querySelector('.blog-featured');
  if (!featured) return null;
  // blog-featured may not be decorated yet, in which case its authored link is still there
  if (featured.dataset.article !== undefined) return featured.dataset.article;
  const href = featured.querySelector('a')?.getAttribute('href');
  return href ? toSitePath(href) : '';
}

function syncUrl(state) {
  const url = new URL(window.location.href);
  url.searchParams.delete(PARAMS.category);
  url.searchParams.delete(PARAMS.query);
  url.searchParams.delete(PARAMS.page);
  if (state.category !== 'all') url.searchParams.set(PARAMS.category, state.category);
  if (state.query) url.searchParams.set(PARAMS.query, state.query);
  if (state.page > 1) url.searchParams.set(PARAMS.page, state.page);
  window.history.replaceState(window.history.state, '', url);
}

export default async function decorate(block) {
  const [title = '', pageSize = ''] = [...block.children].map((row) => row.textContent.trim());
  block.replaceChildren();

  if (IS_AUTHOR) {
    renderEditorNotice(block, title || 'Listado de artículos');
    return;
  }

  try {
    block.setAttribute('aria-busy', 'true');
    const { posts } = await getBlogData();
    const featuredPath = getFeaturedPath();
    const featured = featuredPath === null ? null : getFeaturedPost(posts, featuredPath);
    const params = new URLSearchParams(window.location.search);

    render(h(BlogList, {
      posts: posts.filter((post) => post !== featured),
      categories: CATEGORIES,
      title,
      pageSize: Number.parseInt(pageSize, 10) || 9,
      initial: {
        category: params.get(PARAMS.category),
        query: params.get(PARAMS.query),
        page: params.get(PARAMS.page),
      },
      onStateChange: syncUrl,
    }), block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    block.removeAttribute('aria-busy');
  }
}
