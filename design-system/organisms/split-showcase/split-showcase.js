import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import SectionHeading from '../../molecules/section-heading/section-heading.js';
import CheckItem from '../../molecules/check-item/check-item.js';
import StackPanel from '../stack-panel/stack-panel.js';

const html = htm.bind(h);

export default function SplitShowcase({
  eyebrow = '',
  title = '',
  titleLevel = 'h2',
  description = '',
  checks = [],
  cards = [],
  reverse = false,
}) {
  return html`
    <div class="grid items-center gap-14 lg:grid-cols-2">
      <div class=${reverse ? 'lg:order-2' : ''} data-reveal="up">
        <${SectionHeading}
          eyebrow=${eyebrow}
          title=${title}
          titleLevel=${titleLevel}
          description=${description}
          align="left"
          reveal=${false}
        />
        ${checks.length > 0 && html`
          <ul class="m-0! mt-6! grid list-none gap-3.25 p-0">
            ${checks.map((check, index) => html`
              <li key=${check.index ?? index} data-item-index=${check.index} class="m-0">
                <${CheckItem} lead=${check.lead} text=${check.text} />
              </li>
            `)}
          </ul>
        `}
      </div>
      ${cards.length > 0 && html`<${StackPanel} cards=${cards} reverse=${reverse} />`}
    </div>
  `;
}
