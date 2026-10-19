import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

export default function IconBox({ icon = '', className = '' }) {
  if (!icon) return null;

  return html`
    <span
      class="grid size-10 shrink-0 place-items-center rounded-btn border border-line-strong bg-surface-icon text-lg leading-none text-brand-2 ${className}"
      aria-hidden="true"
    >${icon}</span>
  `;
}
