import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

const VARIANTS = {
  yes: { symbol: '✓', className: 'border-success/20 bg-success/10 text-success' },
  partial: { symbol: '~', className: 'border-warning/20 bg-warning/10 text-warning' },
  none: { symbol: '—', className: 'border-line-strong bg-transparent text-fg-2' },
};

export default function StatusBadge({ status = 'none', label = '' }) {
  const variant = VARIANTS[status] || VARIANTS.none;

  return html`
    <span class="inline-flex align-middle">
      <span
        class="grid size-6.5 place-items-center rounded-sm border text-sm font-bold ${variant.className}"
        aria-hidden="true"
      >${variant.symbol}</span>
      <span class="sr-only">${label}</span>
    </span>
  `;
}
