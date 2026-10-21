import { h, render } from '@dropins/tools/preact.js';
import NavigationLinks from '../../design-system/molecules/navigation-links/navigation-links.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// cells follow the model order (label + link grouped, description, level), read from the end;
// older items only have the link, with its text as the label
function parseRow(row, index) {
  const cells = [...row.children];
  const text = (cell) => cell?.textContent.trim() || '';
  const levelText = text(cells.at(-1));
  const hasLevel = cells.length >= 3 && /^\d*$/.test(levelText);
  const linkCell = hasLevel ? cells.at(-3) : row;
  const anchor = linkCell.querySelector('a');
  const labelElement = [...linkCell.children].find((child) => !child.querySelector('a') && child.tagName !== 'A');
  const label = text(labelElement) || text(anchor) || text(linkCell) || 'New item';

  return {
    index,
    level: Math.max(1, Number(levelText) || 1),
    href: anchor?.getAttribute('href') || '',
    label,
    title: anchor?.getAttribute('title') || '',
    description: hasLevel ? text(cells.at(-2)) : '',
    children: [],
  };
}

// each item nests under the closest previous item with a lower level
function buildTree(items) {
  const root = [];
  const stack = [];
  items.forEach((item) => {
    while (stack.length && stack.at(-1).level >= item.level) stack.pop();
    const parent = stack.at(-1);
    if (parent) parent.children.push(item);
    else root.push(item);
    stack.push(item);
  });
  return root;
}

export default function decorate(block) {
  // rows without a link are kept so newly added (still empty) items remain editable
  const rows = [...block.children];
  const items = buildTree(rows.map(parseRow));

  block.replaceChildren();
  render(h(NavigationLinks, { items }), block);

  // keep Universal Editor data-aue-* attributes so each item stays selectable
  block.querySelectorAll('li[data-nav-index]').forEach((li) => {
    moveInstrumentation(rows[Number(li.dataset.navIndex)], li);
  });
}
