import { h, render } from '@dropins/tools/preact.js';
import ArticleHeader from '../../design-system/organisms/article-header/article-header.js';
import {
  CATEGORIES, IS_AUTHOR, authorFromPath, getArticleMeta, getBlogData,
} from '../../scripts/blog.js';

function addReadingProgress() {
  if (document.querySelector('.article-progress')) return;
  const bar = document.createElement('div');
  bar.className = 'article-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);

  const update = () => {
    const sections = document.querySelectorAll('main .article-body');
    if (!sections.length) return;
    const start = sections[0].getBoundingClientRect().top + window.scrollY;
    const end = sections[sections.length - 1].getBoundingClientRect().bottom
      + window.scrollY - window.innerHeight;
    const ratio = end > start ? (window.scrollY - start) / (end - start) : 1;
    bar.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function addStructuredData(article, author) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.isoDate || undefined,
    image: article.image ? new URL(article.image, window.location.origin).href : undefined,
    mainEntityOfPage: window.location.href,
    keywords: article.tags.join(', ') || undefined,
    author: author ? {
      '@type': 'Person',
      name: author.name,
      url: new URL(author.href, window.location.origin).href,
    } : undefined,
  });
  document.head.append(script);
}

export default async function decorate(block) {
  const article = getArticleMeta();
  const props = {
    ...article,
    category: CATEGORIES[article.category] || null,
    categoryHref: `/blog?categoria=${article.category}`,
    author: authorFromPath(article.authorPath),
  };

  block.replaceChildren();
  render(h(ArticleHeader, props), block);
  addReadingProgress();
  if (IS_AUTHOR) return;

  try {
    const { authors } = await getBlogData();
    const author = authors.get(article.authorPath) || props.author;
    render(h(ArticleHeader, { ...props, author }), block);
    addStructuredData(article, author);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}
