import { h, render } from '@dropins/tools/preact.js';
import RelatedPosts from '../../design-system/organisms/related-posts/related-posts.js';
import observeReveal from '../../scripts/reveal.js';
import {
  CATEGORIES, IS_AUTHOR, getArticleMeta, getBlogData, getRelatedPosts,
} from '../../scripts/blog.js';

export default async function decorate(block) {
  const section = block.closest('.section');
  block.replaceChildren();

  // the editor has no blog index, so the section would stay empty
  if (IS_AUTHOR) {
    section?.remove();
    return;
  }

  try {
    const { posts } = await getBlogData();
    const related = getRelatedPosts(posts, getArticleMeta());
    if (!related.length) {
      section?.remove();
      return;
    }
    render(h(RelatedPosts, { posts: related, categories: CATEGORIES }), block);
    observeReveal(block);
  } catch (error) {
    section?.remove();
    // eslint-disable-next-line no-console
    console.error(error);
  }
}
