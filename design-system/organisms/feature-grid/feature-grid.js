import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import FeatureCard from '../../molecules/feature-card/feature-card.js';

const html = htm.bind(h);

const COLUMN_CLASSES = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
};

export default function FeatureGrid({ items = [], columns = 3 }) {
  if (!items.length) return null;

  return html`
    <ul class="m-0! grid list-none grid-cols-1 gap-4 p-0 ${COLUMN_CLASSES[columns] || COLUMN_CLASSES[3]}" data-reveal-group>
      ${items.map((item, index) => html`
        <li key=${index} class="m-0" data-reveal-item>
          <${FeatureCard} icon=${item.icon} title=${item.title} description=${item.description} />
        </li>
      `)}
    </ul>
  `;
}
