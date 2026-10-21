import { h } from '@dropins/tools/preact.js';
import { useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';

const html = htm.bind(h);

/**
 * Checklist with a progress bar. Progress lives in memory only:
 * the complete tool is the one that keeps it between visits.
 */
export default function LaunchChecklist({ items = [], title = 'Antes de publicar' }) {
  const [done, setDone] = useState(() => new Set());
  if (!items.length) return null;

  const percent = Math.round((done.size / items.length) * 100);

  const toggle = (index) => {
    const next = new Set(done);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setDone(next);
  };

  return html`
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between gap-3 text-md text-fg-2">
          <strong class="text-fg">${title}</strong>
          <span aria-live="polite">${done.size} de ${items.length}</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-overlay/8" role="progressbar" aria-label=${title} aria-valuemin="0" aria-valuemax="100" aria-valuenow=${percent}>
          <div class="h-full rounded-full bg-[linear-gradient(135deg,var(--ds-brand),var(--ds-cyan))] transition-[width] duration-[var(--ds-motion-base)] ease-standard" style=${{ width: `${percent}%` }}></div>
        </div>
      </div>
      <ul class="m-0! grid list-none gap-2 p-0">
        ${items.map((item, index) => html`
          <li key=${index} class="m-0">
            <label class="flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-[15px] transition-colors ${done.has(index) ? 'border-success/40 text-fg' : 'border-line text-fg-2 hover:border-line-strong'}">
              <input type="checkbox" class="mt-0.5 size-4.5 shrink-0 accent-[var(--ds-success)]" checked=${done.has(index)} onChange=${() => toggle(index)} />
              <span>${item}</span>
            </label>
          </li>
        `)}
      </ul>
    </div>
  `;
}
