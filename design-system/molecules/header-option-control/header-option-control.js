import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Select from '../../atoms/select/select.js';

const html = htm.bind(h);

function openSelectPicker(event) {
  if (event.target.closest('select')) return;

  event.preventDefault();
  const select = event.currentTarget.querySelector('select');
  if (typeof select.showPicker === 'function') {
    try {
      select.showPicker();
      return;
    } catch (error) {
      // Fall back to native control activation when picker API is restricted.
    }
  }
  select.focus();
  select.click();
}

export default function HeaderOptionControl({
  ariaLabel,
  icon,
  options,
  value,
  onChange,
}) {
  return html`
    <label class="inline-flex min-h-header-control cursor-pointer items-center gap-1.5 rounded-md border border-line px-2 text-fg-2 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand" onClick=${openSelectPicker}>
      <span class="inline-flex size-4 shrink-0 items-center justify-center text-base leading-none" aria-hidden="true">${icon}</span>
      <${Select}
        ariaLabel=${ariaLabel}
        options=${options}
        value=${value}
        onChange=${onChange}
        focusOutline=${false}
        className="max-md:max-w-none max-md:px-0 max-md:text-xs"
      />
    </label>
  `;
}
