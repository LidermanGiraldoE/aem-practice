import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import IconBox from '../../atoms/icon-box/icon-box.js';
import Badge from '../../atoms/badge/badge.js';

const html = htm.bind(h);

export const LEVELS = {
  beginner: { label: 'Principiante', tone: 'success' },
  intermediate: { label: 'Intermedio', tone: 'brand' },
  advanced: { label: 'Avanzado', tone: 'coral' },
};

// !important utilities beat the global unlayered a:any-link / a:hover rules in styles.css
const LINK_CLASS = 'text-fg! no-underline! hover:text-fg! hover:no-underline! after:absolute after:inset-0 after:rounded-card after:content-[\'\'] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand';

export default function PathCard({
  icon = '',
  level = '',
  title = '',
  description = '',
  stats = [],
  href = '',
  tone = 'brand',
}) {
  const badge = LEVELS[level];

  return html`
    <article class="relative flex h-full flex-col gap-4 rounded-card border border-line bg-surface-card p-7 transition-[border-color,transform] duration-[var(--ds-motion-base)] ease-standard hover:border-[color-mix(in_srgb,var(--ds-line)_60%,var(--ds-brand)_40%)] motion-safe:hover:-translate-y-[3px] motion-reduce:transition-none">
      ${(icon || badge) && html`
        <div class="flex items-center justify-between gap-3">
          <${IconBox} icon=${icon} tone=${tone} className="size-12! font-mono font-bold" />
          ${badge && html`<${Badge} tone=${badge.tone}>${badge.label}<//>`}
        </div>
      `}
      ${title && html`
        <h3 class="m-0! text-xl! text-fg">
          ${href ? html`<a href=${href} class=${LINK_CLASS}>${title}</a>` : title}
        </h3>
      `}
      ${description && html`<p class="m-0! text-md text-fg-2">${description}</p>`}
      ${stats.length > 0 && html`
        <ul class="m-0! mt-auto! flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-sm text-fg-3">
          ${stats.map((stat) => html`<li class="m-0">${stat}</li>`)}
        </ul>
      `}
    </article>
  `;
}
