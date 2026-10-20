import { h, render } from '@dropins/tools/preact.js';
import Newsletter from '../../design-system/organisms/newsletter/newsletter.js';
import observeReveal from '../../scripts/reveal.js';

function getText(element) {
  return element?.textContent?.trim() || '';
}

// rows: eyebrow, title (heading), description, and the grouped form_* row (button text, note)
export default function decorate(block) {
  const [eyebrowRow, titleRow, descriptionRow, formRow] = [...block.children];
  const heading = titleRow?.querySelector('h1, h2, h3, h4, h5, h6');
  const [buttonText, note] = [...(formRow?.querySelectorAll('p') || [])].map(getText);

  const props = {
    eyebrow: getText(eyebrowRow),
    title: getText(heading || titleRow),
    titleLevel: heading?.tagName.toLowerCase() || 'h2',
    description: getText(descriptionRow),
    buttonLabel: buttonText || getText(formRow) || 'Suscribirme',
    note: note || '',
  };

  block.replaceChildren();
  render(h(Newsletter, props), block);
  observeReveal(block);
}
