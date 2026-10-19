import { h, render } from '@dropins/tools/preact.js';
import NavigationLinks from '../../design-system/molecules/navigation-links/navigation-links.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // rows without a link are kept so newly added (still empty) items remain editable
  const rows = [...block.children];

  const links = rows.map((row) => {
    const anchor = row.querySelector('a');
    return {
      href: anchor?.getAttribute('href') || '#',
      label: (anchor || row).textContent.trim(),
      title: anchor?.getAttribute('title') || '',
    };
  });
  block.replaceChildren();
  render(h(NavigationLinks, { items: links }), block);

  // keep Universal Editor data-aue-* attributes so each item stays selectable
  block.querySelectorAll(':scope > ul > li').forEach((li, i) => moveInstrumentation(rows[i], li));
}
