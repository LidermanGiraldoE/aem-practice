import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

/**
 * Native disclosure list. Each answer's authored rich text is moved into
 * [data-accordion-body] after render.
 */
export default function Accordion({ items = [] }) {
  if (!items.length) return null;

  return html`
    <div class="grid gap-2.5" data-reveal-group>
      ${items.map((item, index) => html`
        <details
          key=${index}
          class="group rounded-xl border border-line bg-surface-card open:border-line-strong"
          open=${index === 0}
          data-reveal-item
        >
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4.5 font-semibold text-fg focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
            ${item.title}
            <span class="shrink-0 font-mono text-xl leading-none font-normal text-fg-3 after:content-['+'] group-open:after:content-['−']" aria-hidden="true"></span>
          </summary>
          <div class="accordion-body px-5 pb-5 text-[15px] text-fg-2" data-accordion-body></div>
        </details>
      `)}
    </div>
  `;
}
