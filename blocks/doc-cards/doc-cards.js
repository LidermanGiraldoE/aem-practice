import { h, render } from '@dropins/tools/preact.js';
import DocGrid from '../../design-system/organisms/doc-grid/doc-grid.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(element) {
  return element?.textContent?.trim() || '';
}

export default function decorate(block) {
  // empty rows are kept so newly added cards stay selectable in Universal Editor
  const rows = [...block.children];
  const items = rows.map((row) => {
    // title and description share one grouped cell (content_* fields): title first
    const [category, readTime, content, linkCell] = [...row.children];
    const [title, description] = content?.children.length
      ? [...content.children].map(getText)
      : [getText(content)];
    return {
      category: getText(category),
      readTime: getText(readTime),
      title: title || '',
      description: description || '',
      href: linkCell?.querySelector('a')?.getAttribute('href') || '',
    };
  });

  block.replaceChildren();
  render(h(DocGrid, { items, columns: block.classList.contains('one-column') ? 1 : 2 }), block);

  block.querySelectorAll(':scope > ul > li').forEach((li, i) => moveInstrumentation(rows[i], li));
}
