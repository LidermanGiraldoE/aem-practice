import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Pill from '../../atoms/pill/pill.js';

const html = htm.bind(h);

export default function StackCard({ tags = [], title = '', description = '' }) {
  return html`
    <article class="rounded-xl border border-line-strong bg-surface-2 p-4.5">
      ${tags.length > 0 && html`
        <div class="flex flex-wrap gap-1.5">
          ${tags.map((tag) => html`<${Pill} key=${tag}>${tag}<//>`)}
        </div>
      `}
      ${title && html`<h3 class="m-0! mt-3! mb-1.25! text-lg! leading-tight! font-bold! text-fg">${title}</h3>`}
      ${description && html`<p class="m-0! text-sm text-fg-2">${description}</p>`}
    </article>
  `;
}
