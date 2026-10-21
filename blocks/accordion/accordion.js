import { h, render } from '@dropins/tools/preact.js';
import Accordion from '../../design-system/organisms/accordion/accordion.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import observeReveal from '../../scripts/reveal.js';

// rows: question, rich text answer
export default function decorate(block) {
  // empty rows are kept so newly added items stay selectable in Universal Editor
  const rows = [...block.children];
  const items = rows.map((row) => ({ title: row.children[0]?.textContent.trim() || '' }));

  block.replaceChildren();
  render(h(Accordion, { items }), block);
  observeReveal(block);

  block.querySelectorAll('details').forEach((details, index) => {
    const row = rows[index];
    moveInstrumentation(row, details);
    const answer = row.children[1];
    if (answer) details.querySelector('[data-accordion-body]').append(...answer.childNodes);
  });
}
