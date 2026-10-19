import { h, render } from '@dropins/tools/preact.js';
import SectionHeading from '../../design-system/molecules/section-heading/section-heading.js';

function getText(element) {
  return element?.textContent?.trim() || '';
}

export default function decorate(block) {
  const [eyebrowRow, titleRow, descriptionRow] = [...block.children];
  const heading = titleRow?.querySelector('h1, h2, h3, h4, h5, h6');

  const props = {
    eyebrow: getText(eyebrowRow),
    title: getText(heading || titleRow),
    titleLevel: heading?.tagName.toLowerCase() || 'h2',
    description: getText(descriptionRow),
    align: block.classList.contains('left') ? 'left' : 'center',
  };

  block.replaceChildren();
  render(h(SectionHeading, props), block);
}
