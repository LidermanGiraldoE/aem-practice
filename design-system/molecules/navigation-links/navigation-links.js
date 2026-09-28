import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

export default function NavigationLinks({ items, className = '' }) {
  return html`
    <ul class="m-0 flex list-none flex-col gap-5 p-0 text-base md:justify-center md:gap-6 md:text-md lg:flex-row ${className}">
      ${items.map((item) => html`
        <li key=${item.href + item.label}>
          <a
            href=${item.href}
            title=${item.title || null}
            class="inline-flex items-center rounded-md px-2 py-1.5 text-fg-2 !no-underline transition-colors hover:bg-surface-overlay hover:text-fg focus-visible:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >${item.label}</a>
        </li>
      `)}
    </ul>
  `;
}
