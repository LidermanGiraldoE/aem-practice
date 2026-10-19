import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

export default function Tick({ className = '' }) {
  return html`
    <span
      class="grid size-5.5 shrink-0 place-items-center rounded-[7px] border border-brand/18 bg-brand/8 text-xs font-bold text-brand ${className}"
      aria-hidden="true"
    >✓</span>
  `;
}
