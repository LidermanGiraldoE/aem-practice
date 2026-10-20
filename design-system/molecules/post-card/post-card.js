import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Badge from '../../atoms/badge/badge.js';
import PostCover from '../post-cover/post-cover.js';
import AuthorLine from '../author-line/author-line.js';

const html = htm.bind(h);

// !important utilities beat the global unlayered a:any-link / a:hover rules in styles.css
const CARD_CLASS = 'group relative flex h-full flex-col gap-4 rounded-card border border-line bg-surface-card p-3 pb-5 transition-[border-color,transform] duration-[var(--ds-motion-base)] ease-standard hover:border-[color-mix(in_srgb,var(--ds-line)_60%,var(--ds-brand)_40%)] focus-within:border-brand motion-safe:hover:-translate-y-[3px] motion-reduce:transition-none';

export default function PostCard({ post, category = {}, headingLevel = 'h3' }) {
  const Heading = headingLevel;

  return html`
    <article class=${CARD_CLASS}>
      <${PostCover} image=${post.image} glyph=${category.glyph} tone=${category.tone} />
      <div class="flex flex-1 flex-col gap-2.5 px-2">
        <div class="flex items-center justify-between gap-2 text-sm">
          <${Badge} tone=${category.tone}>${category.label}<//>
          ${post.readingTime > 0 && html`<span class="text-fg-3">${post.readingTime} min</span>`}
        </div>
        <${Heading} class="m-0! text-[19px]! leading-snug! font-bold! tracking-snug">
          <a href=${post.path} class="text-fg! no-underline! after:absolute after:inset-0 after:rounded-card focus-visible:outline-none">${post.title}</a>
        <//>
        ${post.description && html`<p class="m-0! line-clamp-3 text-md text-fg-2">${post.description}</p>`}
        <div class="mt-auto pt-1.5">
          <${AuthorLine} author=${post.author} dateLabel=${post.dateLabel} />
        </div>
      </div>
    </article>
  `;
}
