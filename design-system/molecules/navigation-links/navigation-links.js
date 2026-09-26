import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

export default function NavigationLinks({ items, className = '' }) {
  return html`
    <ul class="m-0 flex list-none flex-col gap-5 p-0 text-base md:justify-center md:gap-6 md:text-sm lg:flex-row ${className}">
      ${items.map((item) => html`
        <li key=${item.href + item.label}>
          <a
            href=${item.href}
            title=${item.title || null}
            class="text-fg-2 no-underline hover:text-fg focus-visible:text-fg"
          >${item.label}</a>
        </li>
      `)}
    </ul>
  `;
}
