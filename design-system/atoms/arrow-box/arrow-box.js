import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

export default function ArrowBox({ className = '' }) {
  return html`
    <span
      class="grid size-8.5 shrink-0 place-items-center rounded-md border border-line-strong text-fg-2 transition-colors duration-[var(--ds-motion-base)] ${className}"
      aria-hidden="true"
    >→</span>
  `;
}
