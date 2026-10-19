import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import DocCard from '../../molecules/doc-card/doc-card.js';

const html = htm.bind(h);

export default function DocGrid({ items = [], columns = 2 }) {
  if (!items.length) return null;

  return html`
    <ul class="m-0! grid list-none grid-cols-1 gap-4 p-0 ${columns === 1 ? '' : 'md:grid-cols-2'}" data-reveal-group>
      ${items.map((item, index) => html`
        <li key=${index} class="m-0" data-reveal-item>
          <${DocCard} ...${item} />
        </li>
      `)}
    </ul>
  `;
}
