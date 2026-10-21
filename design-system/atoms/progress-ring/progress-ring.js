import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

export default function ProgressRing({ percent = 0, className = '' }) {
  const value = Math.min(100, Math.max(0, Math.round(percent)));

  return html`
    <div
      class="relative grid size-28 shrink-0 place-items-center rounded-full bg-[conic-gradient(var(--ds-brand)_calc(var(--p)*1%),color-mix(in_srgb,var(--ds-overlay)_8%,transparent)_0)] before:absolute before:inset-2.5 before:rounded-full before:bg-surface-card before:content-[''] ${className}"
      style=${{ '--p': value }}
      role="img"
      aria-label=${`${value}% completado`}
    >
      <span class="relative text-[26px] font-extrabold tracking-tight text-fg">${value}%</span>
    </div>
  `;
}
