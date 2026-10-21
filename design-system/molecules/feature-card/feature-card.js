import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import IconBox from '../../atoms/icon-box/icon-box.js';

const html = htm.bind(h);

// !important utilities beat the global unlayered a:any-link / a:hover rules in styles.css
const LINK_CLASS = 'text-fg! no-underline! hover:text-fg! hover:no-underline! after:absolute after:inset-0 after:rounded-card after:content-[\'\'] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand';

/**
 * With `href` the whole card is clickable and `linkLabel` reads as its call to action.
 * Without it, `linkLabel` is shown as a muted status such as "Próximamente".
 */
export default function FeatureCard({
  icon = '',
  title = '',
  description = '',
  href = '',
  linkLabel = '',
  tone = 'brand',
}) {
  const pending = !href && linkLabel;

  return html`
    <article class="relative flex h-full flex-col rounded-card border ${pending ? 'border-dashed' : ''} border-line bg-surface-card p-6 transition-[border-color,transform] duration-[var(--ds-motion-base)] ease-standard hover:border-[color-mix(in_srgb,var(--ds-line)_60%,var(--ds-brand)_40%)] motion-safe:hover:-translate-y-[3px] motion-reduce:transition-none">
      <${IconBox} icon=${icon} tone=${tone} className="mb-4.5" />
      ${title && html`
        <h3 class="m-0! mb-2! text-xl! text-fg">
          ${href ? html`<a href=${href} class=${LINK_CLASS}>${title}</a>` : title}
        </h3>
      `}
      ${description && html`<p class="m-0! text-md text-fg-2">${description}</p>`}
      ${linkLabel && html`
        <p class="m-0! mt-auto! pt-4 text-md font-bold ${href ? 'text-brand' : 'text-fg-3'}" aria-hidden=${href ? 'true' : null}>
          ${linkLabel}${href ? ' →' : ''}
        </p>
      `}
    </article>
  `;
}
