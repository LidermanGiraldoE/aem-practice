import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

const CARD_CLASS = 'group flex min-w-0 flex-col gap-1 rounded-card border border-line bg-surface-card px-5 py-4 no-underline! transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

function PagerLink({ page, direction }) {
  const isNext = direction === 'next';
  return html`
    <a href=${page.href} class="${CARD_CLASS} ${isNext ? 'items-end text-right sm:col-start-2' : ''}" rel=${isNext ? 'next' : 'prev'}>
      <span class="text-xs font-semibold text-fg-3">${isNext ? 'Siguiente →' : '← Anterior'}</span>
      <span class="text-md font-bold text-fg group-hover:text-brand">${page.title}</span>
    </a>
  `;
}

export default function DocsPager({ prev = null, next = null }) {
  if (!prev && !next) return null;

  return html`
    <nav aria-label="Páginas de la documentación" class="grid gap-3 sm:grid-cols-2">
      ${prev && html`<${PagerLink} page=${prev} direction="prev" />`}
      ${next && html`<${PagerLink} page=${next} direction="next" />`}
    </nav>
  `;
}
