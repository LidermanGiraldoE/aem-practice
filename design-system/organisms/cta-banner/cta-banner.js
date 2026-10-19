import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Eyebrow from '../../atoms/eyebrow/eyebrow.js';
import Button from '../../atoms/button/button.js';

const html = htm.bind(h);
const HEADING_LEVELS = new Set(['h1', 'h2', 'h3']);

export default function CtaBanner({
  eyebrow = '',
  title = '',
  titleLevel = 'h2',
  description = '',
  action = null,
}) {
  const Heading = HEADING_LEVELS.has(titleLevel) ? titleLevel : 'h2';

  return html`
    <div class="flex flex-col items-center rounded-4xl border border-line-strong bg-surface-raised bg-[linear-gradient(var(--ds-grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--ds-grid-line)_1px,transparent_1px)] bg-size-[36px_36px] px-7 py-14 text-center md:py-19">
      <${Eyebrow}>${eyebrow}<//>
      ${title && html`
        <${Heading} class="m-0! mt-4! max-w-hero text-cta! font-extrabold! text-fg">${title}<//>
      `}
      ${description && html`<p class="m-0! mt-4! max-w-150 text-lead text-fg-2">${description}</p>`}
      ${action && html`
        <div class="mt-6.5">
          <${Button}
            href=${action.href}
            label=${action.label}
            title=${action.title}
            variant=${action.variant}
            icon=${action.icon}
            className="gap-2"
          />
        </div>
      `}
    </div>
  `;
}
