import { h, render } from '@dropins/tools/preact.js';
import SectionHeading from '../../design-system/molecules/section-heading/section-heading.js';
import observeReveal from '../../scripts/reveal.js';

function getText(element) {
  return element?.textContent?.trim() || '';
}

export default function decorate(block) {
  const [eyebrowRow, titleRow, descriptionRow] = [...block.children];
  const heading = titleRow?.querySelector('h1, h2, h3, h4, h5, h6');
  // title_highlight is grouped into the title cell as a paragraph after the heading
  const highlight = heading ? titleRow.querySelector('p') : null;
  // description_link is grouped into the description cell as a paragraph after the text
  const link = descriptionRow?.querySelector('a');
  const href = link?.getAttribute('href') || '';
  const label = getText(link);
  (link?.closest('p') || link)?.remove();

  const props = {
    eyebrow: getText(eyebrowRow),
    title: getText(heading || titleRow),
    titleLevel: heading?.tagName.toLowerCase() || 'h2',
    highlight: getText(highlight),
    description: getText(descriptionRow),
    align: block.classList.contains('left') ? 'left' : 'center',
    size: block.classList.contains('page-hero') ? 'page-hero' : 'section',
    // a link without Link Text is rendered with its URL as the text
    action: href && label && label !== href
      ? { href, label, title: link.getAttribute('title') || '' }
      : null,
  };

  block.replaceChildren();
  render(h(SectionHeading, props), block);
  observeReveal(block);
}
