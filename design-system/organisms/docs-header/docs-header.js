import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Badge from '../../atoms/badge/badge.js';

const html = htm.bind(h);

const LINK_CLASS = 'text-fg-2! no-underline! hover:text-fg! hover:underline!';
const CRUMB_CLASS = "before:mr-2 before:text-line-strong before:content-['/']";

export default function DocsHeader({
  title = '',
  description = '',
  group = '',
  readingTime = 0,
  docsHref = '/learn/docs',
  learnHref = '/learn',
  isRoot = false,
}) {
  return html`
    <div class="flex flex-col gap-4">
      <nav aria-label="Ruta de navegación">
        <ol class="m-0! flex list-none flex-wrap gap-2 p-0 text-sm text-fg-3">
          <li><a href=${learnHref} class=${LINK_CLASS}>Aprender</a></li>
          ${isRoot
    ? html`<li class=${CRUMB_CLASS} aria-current="page">Documentación</li>`
    : html`
              <li class=${CRUMB_CLASS}><a href=${docsHref} class=${LINK_CLASS}>Documentación</a></li>
              ${group && html`<li class=${CRUMB_CLASS}>${group}</li>`}
              <li class=${CRUMB_CLASS} aria-current="page">${title}</li>
            `}
        </ol>
      </nav>
      <h1 class="m-0! text-[clamp(32px,4vw,46px)]! leading-[1.05]! font-extrabold! tracking-tightest text-fg">${title}</h1>
      ${description && html`<p class="m-0! max-w-[62ch] text-lead text-fg-2">${description}</p>`}
      ${(group || readingTime > 0) && html`
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-fg-3">
          ${group && html`<${Badge} tone="violet">${group}<//>`}
          ${readingTime > 0 && html`<span>${readingTime} min de lectura</span>`}
        </div>
      `}
    </div>
  `;
}
