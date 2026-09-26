import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

export default function Select({
  ariaLabel,
  options,
  value,
  onChange,
  className = '',
  focusOutline = true,
}) {
  const focusStyles = focusOutline
    ? 'focus-visible:outline-2 focus-visible:outline-brand'
    : 'focus-visible:outline-none';

  return html`
    <select
      aria-label=${ariaLabel}
      class="max-w-24 cursor-pointer rounded-sm bg-transparent px-2 py-1.5 text-sm text-fg outline-offset-2 ${focusStyles} ${className}"
      defaultValue=${value}
      onChange=${onChange}
    >
      ${options.map((option) => html`
        <option key=${option.value} value=${option.value}>${option.label}</option>
      `)}
    </select>
  `;
}
