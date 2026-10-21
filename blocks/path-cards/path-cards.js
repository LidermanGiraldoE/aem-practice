import { h, render } from '@dropins/tools/preact.js';
import PathGrid from '../../design-system/organisms/path-grid/path-grid.js';
import { LEVELS } from '../../design-system/molecules/path-card/path-card.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import observeReveal from '../../scripts/reveal.js';

function getText(element) {
  return element?.textContent?.trim() || '';
}

export default function decorate(block) {
  // empty rows are kept so newly added cards stay selectable in Universal Editor
  const rows = [...block.children];
  const items = rows.map((row) => {
    // title, description and stats share one grouped cell (content_* fields), in that order
    const [icon, level, content, linkCell] = [...row.children];
    const [title = '', description = '', stats = ''] = content?.children.length
      ? [...content.children].map(getText)
      : [getText(content)];
    const levelValue = getText(level);
    return {
      icon: getText(icon),
      level: LEVELS[levelValue] ? levelValue : '',
      title,
      description,
      stats: stats.split(',').map((stat) => stat.trim()).filter(Boolean),
      href: linkCell?.querySelector('a')?.getAttribute('href') || '',
    };
  });

  block.replaceChildren();
  render(h(PathGrid, { items }), block);
  observeReveal(block);

  block.querySelectorAll(':scope > ul > li').forEach((li, i) => moveInstrumentation(rows[i], li));
}
