import { h, render } from '@dropins/tools/preact.js';
import BlogFeatured from '../../design-system/organisms/blog-featured/blog-featured.js';
import observeReveal from '../../scripts/reveal.js';
import {
  CATEGORIES, IS_AUTHOR, getBlogData, getFeaturedPost, renderEditorNotice, toSitePath,
} from '../../scripts/blog.js';

export default async function decorate(block) {
  const href = block.querySelector('a')?.getAttribute('href');
  // blog-list reads this to avoid repeating the featured article
  block.dataset.article = href ? toSitePath(href) : '';
  block.replaceChildren();

  if (IS_AUTHOR) {
    renderEditorNotice(block, 'Artículo destacado');
    return;
  }

  try {
    block.setAttribute('aria-busy', 'true');
    const { posts } = await getBlogData();
    const post = getFeaturedPost(posts, block.dataset.article);
    if (!post) return;
    render(h(BlogFeatured, { post, category: CATEGORIES[post.category] || {} }), block);
    observeReveal(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    block.removeAttribute('aria-busy');
  }
}
