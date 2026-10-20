import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

const VARIANTS = {
  default: 'gap-2 border-brand/22 bg-brand/7 px-2.5 text-brand-2',
  // glowing dot before the label, used by page heroes
  signal: 'gap-2 border-brand/28 bg-brand/8 px-3 text-brand before:size-1.5 before:shrink-0 before:rounded-full before:bg-current before:shadow-[0_0_12px_currentColor] before:content-[\'\']',
};

export default function Eyebrow({ children, variant = 'default' }) {
  if (!children) return null;

  return html`
    <span class="hero-eyebrow inline-flex max-w-full items-center rounded-full border py-1.5 text-xs font-bold uppercase tracking-wide ${VARIANTS[variant] || VARIANTS.default}">
      <span>${children}</span>
    </span>
  `;
}
