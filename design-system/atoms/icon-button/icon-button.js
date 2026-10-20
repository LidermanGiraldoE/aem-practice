import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

export default function IconButton({
  icon = '',
  label = '',
  onClick,
  className = '',
  ...props
}) {
  return html`
    <button
      type="button"
      class="m-0 grid size-header-control shrink-0 cursor-pointer place-items-center rounded-md border border-line-strong bg-surface p-0 font-sans text-base leading-none text-fg-2 transition-colors duration-[var(--ds-motion-fast)] hover:border-[var(--ds-button-secondary-border-hover)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}"
      aria-label=${label}
      title=${label}
      onClick=${onClick}
      ...${props}
    >
      <span aria-hidden="true">${icon}</span>
    </button>
  `;
}
