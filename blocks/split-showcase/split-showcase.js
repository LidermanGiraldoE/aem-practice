import { h, render } from '@dropins/tools/preact.js';
import SplitShowcase from '../../design-system/organisms/split-showcase/split-showcase.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(element) {
  return element?.textContent?.trim() || '';
}

// block fields render as single-cell rows; check items have 2 cells and stack cards 3
function parseRows(rows) {
  const fields = {
    eyebrow: '', title: '', titleLevel: 'h2', description: '',
  };
  const checks = [];
  const cards = [];

  rows.forEach((row, index) => {
    const cells = [...row.children];
    if (cells.length === 2) {
      checks.push({ index, lead: getText(cells[0]), text: getText(cells[1]) });
    } else if (cells.length >= 3) {
      cards.push({
        index,
        tags: getText(cells[0]).split(',').map((tag) => tag.trim()).filter(Boolean),
        title: getText(cells[1]),
        description: getText(cells[2]),
      });
    } else {
      const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        fields.title = getText(heading);
        fields.titleLevel = heading.tagName.toLowerCase();
      } else if (!fields.title) {
        fields.eyebrow = getText(row);
      } else {
        fields.description = getText(row);
      }
    }
  });

  return { ...fields, checks, cards };
}

export default function decorate(block) {
  const rows = [...block.children];
  const props = parseRows(rows);

  block.replaceChildren();
  render(h(SplitShowcase, { ...props, reverse: block.classList.contains('reverse') }), block);

  block.querySelectorAll('[data-item-index]').forEach((element) => {
    moveInstrumentation(rows[Number(element.dataset.itemIndex)], element);
  });
}
