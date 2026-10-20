import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

const TONES = {
  brand: 'border-brand/30 bg-brand/9 text-brand',
  violet: 'border-violet/30 bg-violet/9 text-violet',
  cyan: 'border-cyan/30 bg-cyan/9 text-cyan',
  warning: 'border-warning/30 bg-warning/9 text-warning',
  coral: 'border-coral/30 bg-coral/9 text-coral',
  success: 'border-success/30 bg-success/9 text-success',
};

export default function Badge({ children, tone = 'brand', className = '' }) {
  if (!children) return null;

  return html`
    <span class="inline-flex w-fit items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold leading-tight ${TONES[tone] || TONES.brand} ${className}">${children}</span>
  `;
}
