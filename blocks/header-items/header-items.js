import { h, render } from '@dropins/tools/preact.js';
import NavigationLinks from '../../design-system/molecules/navigation-links/navigation-links.js';

export default function decorate(block) {
  const items = [...block.children]
    .map((row) => row.querySelector('a'))
    .filter(Boolean);

  const links = items.map((anchor) => ({
    href: anchor.getAttribute('href') || '#',
    label: anchor.textContent.trim(),
    title: anchor.getAttribute('title') || '',
  }));
  block.replaceChildren();
  render(h(NavigationLinks, { items: links }), block);
}
