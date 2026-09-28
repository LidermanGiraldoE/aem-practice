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
  const defaultValue = value ?? options[0]?.value;

  return html`
    <select
      aria-label=${ariaLabel}
      class="max-w-24 cursor-pointer rounded-sm bg-transparent py-1.5 text-sm font-semibold text-fg outline-offset-2 ${focusStyles} ${className}"
      defaultValue=${defaultValue}
      onChange=${onChange}
    >
      ${options.map((option) => html`
        <option key=${option.value} value=${option.value} class="font-semibold">${option.label}</option>
      `)}
    </select>
  `;
}
