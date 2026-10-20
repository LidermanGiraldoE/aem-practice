import { h, render } from '@dropins/tools/preact.js';
import PostCover from '../../design-system/molecules/post-cover/post-cover.js';
import { CATEGORIES, getArticleMeta } from '../../scripts/blog.js';

export default function decorate(block) {
  const article = getArticleMeta();
  const category = CATEGORIES[article.category] || {};

  block.replaceChildren();
  render(h(PostCover, {
    image: article.image,
    glyph: category.glyph,
    tone: category.tone,
    ratio: 'aspect-[16/9] md:aspect-[21/9]',
    className: 'rounded-3xl!',
    eager: true,
  }), block);
}
