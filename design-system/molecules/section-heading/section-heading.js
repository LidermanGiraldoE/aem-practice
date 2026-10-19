import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Eyebrow from '../../atoms/eyebrow/eyebrow.js';

const html = htm.bind(h);
const HEADING_LEVELS = new Set(['h1', 'h2', 'h3']);

export default function SectionHeading({
  eyebrow = '',
  title = '',
  titleLevel = 'h2',
  description = '',
  align = 'center',
  reveal = true,
}) {
  if (!eyebrow && !title && !description) return null;

  const Heading = HEADING_LEVELS.has(titleLevel) ? titleLevel : 'h2';
  const centered = align !== 'left';

  return html`
    <div
      class="flex max-w-prose flex-col gap-3 ${centered ? 'mx-auto items-center text-center' : 'items-start text-left'}"
      data-reveal=${reveal ? 'up' : null}
    >
      <${Eyebrow}>${eyebrow}<//>
      ${title && html`
        <${Heading} class="m-0! text-h2! font-extrabold! text-fg">${title}<//>
      `}
      ${description && html`<p class="m-0! text-lead text-fg-2">${description}</p>`}
    </div>
  `;
}
