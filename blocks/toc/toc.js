import { h, render } from '@dropins/tools/preact.js';
import { getMetadata, toClassName } from '../../scripts/aem.js';
import TableOfContents from '../../design-system/molecules/table-of-contents/table-of-contents.js';

const MIN_SECTIONS = 2;

export default function decorate(block) {
  const headings = [...document.querySelectorAll('main :is(.article-body, .doc-body) .default-content-wrapper :is(h2, h3)')];
  const items = headings.map((heading) => {
    // Edge Delivery adds ids to headings; the author tier does not
    heading.id ||= toClassName(heading.textContent);
    return { id: heading.id, text: heading.textContent.trim(), level: heading.tagName === 'H3' ? 3 : 2 };
  });

  if (items.filter((item) => item.level === 2).length < MIN_SECTIONS) {
    block.closest('.toc-wrapper')?.remove();
    return;
  }

  block.replaceChildren();
  const title = getMetadata('template') === 'doc' ? 'En esta página' : undefined;
  render(h(TableOfContents, { items, title }), block);
}
