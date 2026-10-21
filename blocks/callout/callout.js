import { h, render } from '@dropins/tools/preact.js';
import Callout, { CALLOUT_VARIANTS } from '../../design-system/molecules/callout/callout.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// rows: title (optional), rich text
export default function decorate(block) {
  const [titleRow, textRow] = [...block.children];
  const variant = CALLOUT_VARIANTS.find((name) => block.classList.contains(name)) || 'note';
  const title = titleRow?.textContent.trim() || '';
  const textCell = textRow?.firstElementChild || textRow;

  block.replaceChildren();
  render(h(Callout, { variant, title }), block);

  const content = block.querySelector('[data-callout-content]');
  if (textCell) {
    moveInstrumentation(textCell, content);
    content.append(...textCell.childNodes);
  }
}
