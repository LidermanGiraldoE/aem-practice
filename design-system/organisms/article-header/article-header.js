import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Badge from '../../atoms/badge/badge.js';
import Avatar from '../../atoms/avatar/avatar.js';

const html = htm.bind(h);

const LINK_CLASS = 'text-fg-2! no-underline! hover:text-fg! hover:underline!';

export default function ArticleHeader({
  title = '',
  description = '',
  category = null,
  categoryHref = '',
  author = null,
  dateLabel = '',
  isoDate = '',
  readingTime = 0,
}) {
  return html`
    <div class="mx-auto flex flex-col gap-4.5">
      <nav aria-label="Ruta de navegación">
        <ol class="m-0! flex list-none flex-wrap gap-2 p-0 text-sm text-fg-3">
          <li><a href="/" class=${LINK_CLASS}>Inicio</a></li>
          <li class="before:mr-2 before:text-line-strong before:content-['/']"><a href="/blog" class=${LINK_CLASS}>Blog</a></li>
          ${category && html`
            <li class="before:mr-2 before:text-line-strong before:content-['/']" aria-current="page">${category.label}</li>
          `}
        </ol>
      </nav>

      ${category && html`
        <a href=${categoryHref} class="w-fit no-underline!">
          <${Badge} tone=${category.tone}>${category.label}<//>
        </a>
      `}

      <h1 class="m-0! text-[clamp(36px,5vw,58px)]! leading-[0.98]! font-extrabold! tracking-tightest text-fg">${title}</h1>
      ${description && html`<p class="m-0! max-w-[62ch] text-lead text-fg-2 md:text-lg">${description}</p>`}

      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-md text-fg-3">
        ${author && html`
          <div class="flex items-center gap-2.5 text-sm text-fg-2">
            <${Avatar} name=${author.name} image=${author.image} />
            <span>
              <a href=${author.href} class="block text-md font-bold text-fg! no-underline! hover:underline!">${author.name}</a>
              ${author.role}
            </span>
          </div>
        `}
        ${dateLabel && html`<time datetime=${isoDate}>${dateLabel}</time>`}
        ${readingTime > 0 && html`<span aria-hidden="true">·</span><span>${readingTime} min de lectura</span>`}
      </div>
    </div>
  `;
}
