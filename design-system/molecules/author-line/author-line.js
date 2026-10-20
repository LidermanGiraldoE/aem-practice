import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Avatar from '../../atoms/avatar/avatar.js';

const html = htm.bind(h);

export default function AuthorLine({ author = null, dateLabel = '', stacked = false }) {
  if (!author && !dateLabel) return null;

  const text = stacked
    ? html`<span><strong class="block text-md text-fg">${author?.name}</strong>${dateLabel}</span>`
    : html`<span>${[author?.name, dateLabel].filter(Boolean).join(' · ')}</span>`;

  return html`
    <div class="flex items-center gap-2.5 text-sm text-fg-2">
      ${author && html`<${Avatar} name=${author.name} image=${author.image} />`}
      ${text}
    </div>
  `;
}
