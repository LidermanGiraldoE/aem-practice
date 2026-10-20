import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Badge from '../../atoms/badge/badge.js';
import PostCover from '../../molecules/post-cover/post-cover.js';
import AuthorLine from '../../molecules/author-line/author-line.js';

const html = htm.bind(h);

export default function BlogFeatured({ post = null, category = {} }) {
  if (!post) return null;

  return html`
    <article
      class="group relative grid gap-6 rounded-card border border-line bg-surface-card p-3.5 transition-[border-color,transform] duration-[var(--ds-motion-base)] ease-standard hover:border-[color-mix(in_srgb,var(--ds-line)_60%,var(--ds-brand)_40%)] focus-within:border-brand motion-safe:hover:-translate-y-[3px] motion-reduce:transition-none md:p-4.5 lg:grid-cols-[1.1fr_1fr] lg:items-center"
      data-reveal="up"
    >
      <${PostCover}
        image=${post.image}
        glyph=${category.glyph}
        tone=${category.tone}
        ratio=${post.image ? 'aspect-video' : 'aspect-[4/3]'}
        width=${1200}
        eager
      />
      <div class="flex flex-col gap-4 px-2.5 pb-3.5 lg:px-2">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-md text-fg-3">
          <${Badge}>Destacado<//>
          <span>${category.label}</span>
          ${post.readingTime > 0 && html`<span aria-hidden="true">·</span><span>${post.readingTime} min de lectura</span>`}
        </div>
        <h2 class="m-0! text-[clamp(26px,3vw,38px)]! leading-tight! font-extrabold! tracking-tight">
          <a href=${post.path} class="text-fg! no-underline! after:absolute after:inset-0 after:rounded-card focus-visible:outline-none">${post.title}</a>
        </h2>
        ${post.description && html`<p class="m-0! max-w-[62ch] text-lead text-fg-2">${post.description}</p>`}
        <${AuthorLine} author=${post.author} dateLabel=${post.dateLabel} stacked />
      </div>
    </article>
  `;
}
