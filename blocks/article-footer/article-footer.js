import { h, render } from '@dropins/tools/preact.js';
import ArticleFooter from '../../design-system/organisms/article-footer/article-footer.js';
import {
  IS_AUTHOR, authorFromPath, getArticleMeta, getBlogData,
} from '../../scripts/blog.js';

export default async function decorate(block) {
  const article = getArticleMeta();
  const props = {
    tags: article.tags,
    url: document.querySelector('link[rel="canonical"]')?.href || window.location.href,
    title: article.title,
    author: authorFromPath(article.authorPath),
  };

  block.replaceChildren();
  render(h(ArticleFooter, props), block);
  if (IS_AUTHOR) return;

  try {
    const { authors } = await getBlogData();
    const author = authors.get(article.authorPath) || props.author;
    render(h(ArticleFooter, { ...props, author }), block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}
