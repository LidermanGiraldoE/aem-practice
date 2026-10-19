import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

export default function Pill({ children, className = '' }) {
  if (!children) return null;

  return html`
    <span class="inline-flex items-center rounded-full border border-line-strong px-2 py-1.25 text-caption leading-tight text-fg-2 ${className}">${children}</span>
  `;
}
