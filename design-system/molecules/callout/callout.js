import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

const VARIANTS = {
  note: {
    label: 'Nota',
    glyph: 'i',
    frame: 'border-info/35 bg-info/8',
    badge: 'bg-info',
  },
  tip: {
    label: 'Consejo',
    glyph: '✦',
    frame: 'border-brand/35 bg-brand/8',
    badge: 'bg-brand',
  },
  warning: {
    label: 'Atención',
    glyph: '!',
    frame: 'border-warning/40 bg-warning/10',
    badge: 'bg-warning',
  },
};

export const CALLOUT_VARIANTS = Object.keys(VARIANTS);

// the authored rich text is moved into [data-callout-content] after render, so its markup is kept
export default function Callout({ variant = 'note', title = '' }) {
  const style = VARIANTS[variant] || VARIANTS.note;

  return html`
    <aside class="flex gap-4 rounded-xl border p-5 ${style.frame}" aria-label=${title || style.label}>
      <span
        class="grid size-7 shrink-0 place-items-center rounded-full font-mono text-sm font-bold text-[#0b1016] ${style.badge}"
        aria-hidden="true"
      >${style.glyph}</span>
      <div class="flex min-w-0 flex-col gap-1.5">
        <p class="m-0! text-md font-bold text-fg">${title || style.label}</p>
        <div class="callout-content text-md leading-relaxed text-fg-2" data-callout-content></div>
      </div>
    </aside>
  `;
}
