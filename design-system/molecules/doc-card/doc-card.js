import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import ArrowBox from '../../atoms/arrow-box/arrow-box.js';

const html = htm.bind(h);

// !important utilities beat the global unlayered a:any-link / a:hover rules in styles.css
const CARD_CLASS = 'group flex h-full items-center justify-between gap-5.5 rounded-card border border-line bg-surface-card p-6.5 text-fg! no-underline! transition-[border-color,transform] duration-[var(--ds-motion-base)] ease-standard hover:border-[color-mix(in_srgb,var(--ds-line)_60%,var(--ds-brand)_40%)] hover:text-fg! hover:no-underline! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-safe:hover:-translate-y-[3px] motion-reduce:transition-none';

export default function DocCard({
  href = '',
  category = '',
  readTime = '',
  title = '',
  description = '',
}) {
  const meta = [category, readTime].filter(Boolean).join(' · ');
  const content = html`
    <div class="min-w-0">
      ${meta && html`<p class="m-0! text-xs font-semibold tracking-wide text-fg-3 uppercase">${meta}</p>`}
      ${title && html`<h3 class="m-0! my-1! text-xl! text-fg">${title}</h3>`}
      ${description && html`<p class="m-0! text-md text-fg-2">${description}</p>`}
    </div>
    ${href && html`<${ArrowBox} className="group-hover:border-brand group-hover:text-brand" />`}
  `;

  return href
    ? html`<a href=${href} class=${CARD_CLASS}>${content}</a>`
    : html`<div class=${CARD_CLASS}>${content}</div>`;
}
