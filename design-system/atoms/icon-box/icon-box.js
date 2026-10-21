import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

const TONES = {
  brand: 'text-brand-2',
  violet: 'text-violet',
  cyan: 'text-cyan',
  warning: 'text-warning',
  coral: 'text-coral',
};

// order used when a grid colours its cards one after another
export const TONE_CYCLE = Object.keys(TONES);

export default function IconBox({ icon = '', tone = 'brand', className = '' }) {
  if (!icon) return null;

  return html`
    <span
      class="grid size-10 shrink-0 place-items-center rounded-btn border border-line-strong bg-surface-icon text-lg leading-none ${TONES[tone] || TONES.brand} ${className}"
      aria-hidden="true"
    >${icon}</span>
  `;
}
