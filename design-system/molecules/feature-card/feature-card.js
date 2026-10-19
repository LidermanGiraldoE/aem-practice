import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import IconBox from '../../atoms/icon-box/icon-box.js';

const html = htm.bind(h);

export default function FeatureCard({ icon = '', title = '', description = '' }) {
  return html`
    <article class="flex h-full flex-col rounded-card border border-line bg-surface-card p-6 transition-[border-color,transform] duration-[var(--ds-motion-base)] ease-standard hover:border-[color-mix(in_srgb,var(--ds-line)_60%,var(--ds-brand)_40%)] motion-safe:hover:-translate-y-[3px] motion-reduce:transition-none">
      <${IconBox} icon=${icon} className="mb-4.5" />
      ${title && html`<h3 class="m-0! mb-2! text-xl! text-fg">${title}</h3>`}
      ${description && html`<p class="m-0! text-md text-fg-2">${description}</p>`}
    </article>
  `;
}
