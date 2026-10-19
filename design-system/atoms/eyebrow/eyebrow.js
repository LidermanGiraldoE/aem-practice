import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

export default function Eyebrow({ children }) {
  if (!children) return null;

  return html`
    <span class="hero-eyebrow inline-flex max-w-full items-center gap-2 rounded-full border border-brand/22 bg-brand/7 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-2">
      <span>${children}</span>
    </span>
  `;
}
