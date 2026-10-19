import { h, render } from '@dropins/tools/preact.js';
import FeatureGrid from '../../design-system/organisms/feature-grid/feature-grid.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(element) {
  return element?.textContent?.trim() || '';
}

// block option classes avoid Tailwind's columns-* utilities, which would split the block
function getColumns(block) {
  if (block.classList.contains('two-columns')) return 2;
  if (block.classList.contains('four-columns')) return 4;
  return 3;
}

export default function decorate(block) {
  // empty rows are kept so newly added cards stay selectable in Universal Editor
  const rows = [...block.children];
  const items = rows.map((row) => {
    const [icon, title, description] = [...row.children].map(getText);
    return { icon, title, description };
  });

  block.replaceChildren();
  render(h(FeatureGrid, { items, columns: getColumns(block) }), block);

  block.querySelectorAll(':scope > ul > li').forEach((li, i) => moveInstrumentation(rows[i], li));
}
