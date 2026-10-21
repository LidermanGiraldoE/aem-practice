import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import PathCard from '../../molecules/path-card/path-card.js';
import { TONE_CYCLE } from '../../atoms/icon-box/icon-box.js';

const html = htm.bind(h);

export default function PathGrid({ items = [] }) {
  if (!items.length) return null;

  return html`
    <ul class="m-0! grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3" data-reveal-group>
      ${items.map((item, index) => html`
        <li key=${index} class="m-0" data-reveal-item>
          <${PathCard} ...${item} tone=${TONE_CYCLE[index % TONE_CYCLE.length]} />
        </li>
      `)}
    </ul>
  `;
}
