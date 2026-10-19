import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Tick from '../../atoms/tick/tick.js';

const html = htm.bind(h);

export default function CheckItem({ lead = '', text = '' }) {
  if (!lead && !text) return null;

  return html`
    <div class="flex gap-3 text-fg-2">
      <${Tick} className="mt-0.5" />
      <div>
        ${lead && html`<b class="text-fg">${lead}</b>`}${lead && text ? ' ' : ''}${text}
      </div>
    </div>
  `;
}
