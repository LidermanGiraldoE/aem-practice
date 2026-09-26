import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

export default function Brand({
  mark = '',
  name = '',
  descriptor = '',
  href = '/',
}) {
  return html`
    <a href=${href || '/'} class="inline-flex min-w-0 items-center gap-2 text-fg !no-underline hover:text-fg">
      ${mark && html`<span class="grid size-7.5 shrink-0 place-items-center rounded-sm bg-gradient-mint-cyan text-brand-ink font-bold" aria-hidden="true">${mark}</span>`}
      ${name && html`<strong class="text-base font-bold">${name}</strong>`}
      ${descriptor && html`
        <span class="hidden text-base font-semibold text-fg-2 md:inline" aria-hidden="true">/</span>
        <span class="hidden text-base font-semibold text-fg-2 md:inline">${descriptor}</span>
      `}
    </a>
  `;
}
