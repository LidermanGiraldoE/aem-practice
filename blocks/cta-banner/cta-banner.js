import { h, render } from '@dropins/tools/preact.js';
import CtaBanner from '../../design-system/organisms/cta-banner/cta-banner.js';

function getText(element) {
  return element?.textContent?.trim() || '';
}

function parseAction(row) {
  const link = row.querySelector('a');
  const variant = ['primary', 'secondary', 'accent'].find((name) => link.classList.contains(name)) || '';
  const iconValue = [...row.querySelectorAll('p')].find((paragraph) => !paragraph.contains(link));

  return {
    href: link.getAttribute('href') || '',
    label: getText(link),
    title: link.getAttribute('title') || '',
    variant,
    icon: getText(iconValue) || 'none',
  };
}

// rows: eyebrow, title (heading), description, and the grouped cta_* row holding the link
export default function decorate(block) {
  const props = {
    eyebrow: '', title: '', titleLevel: 'h2', description: '', action: null,
  };

  [...block.children].forEach((row) => {
    const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      props.title = getText(heading);
      props.titleLevel = heading.tagName.toLowerCase();
    } else if (row.querySelector('a')) {
      props.action = parseAction(row);
    } else if (!props.title) {
      props.eyebrow = getText(row);
    } else {
      props.description = getText(row);
    }
  });

  if (!props.action?.href || !props.action.label) props.action = null;

  block.replaceChildren();
  render(h(CtaBanner, props), block);
}
