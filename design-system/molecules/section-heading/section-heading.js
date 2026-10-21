import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Eyebrow from '../../atoms/eyebrow/eyebrow.js';
import Button from '../../atoms/button/button.js';

const html = htm.bind(h);
const HEADING_LEVELS = new Set(['h1', 'h2', 'h3']);
const SIZES = {
  section: {
    wrapper: 'max-w-prose gap-3',
    eyebrow: 'default',
    title: 'text-h2!',
    description: 'text-lead',
  },
  'page-hero': {
    wrapper: 'gap-4.5',
    eyebrow: 'signal',
    title: 'text-[clamp(40px,6.4vw,72px)]! leading-[0.98]! tracking-tightest!',
    description: 'max-w-[62ch] text-lead md:text-lg',
  },
};

export default function SectionHeading({
  eyebrow = '',
  title = '',
  titleLevel = 'h2',
  highlight = '',
  description = '',
  align = 'center',
  size = 'section',
  reveal = true,
  action = null,
}) {
  if (!eyebrow && !title && !description) return null;

  const Heading = HEADING_LEVELS.has(titleLevel) ? titleLevel : 'h2';
  const centered = align !== 'left';
  const styles = SIZES[size] || SIZES.section;

  const copy = html`
    <div
      class="flex flex-col ${styles.wrapper} ${centered ? 'mx-auto items-center text-center' : 'items-start text-left'}"
      data-reveal=${reveal && !action ? 'up' : null}
    >
      <${Eyebrow} variant=${styles.eyebrow}>${eyebrow}<//>
      ${title && html`
        <${Heading} class="m-0! ${styles.title} font-extrabold! text-fg">
          ${title}
          ${highlight && html`<br /><span class="bg-[image:var(--ds-gradient-accent)] bg-clip-text text-transparent">${highlight}</span>`}
        <//>
      `}
      ${description && html`<p class="m-0! ${styles.description} text-fg-2">${description}</p>`}
    </div>
  `;

  if (!action) return copy;

  // left aligned: the button sits at the end of the row; centered: below the copy
  return html`
    <div
      class="flex flex-col gap-5 ${centered ? 'items-center' : 'items-start md:flex-row md:items-end md:justify-between'}"
      data-reveal=${reveal ? 'up' : null}
    >
      ${copy}
      <${Button}
        href=${action.href}
        label=${action.label}
        title=${action.title}
        variant="secondary"
        className="shrink-0"
      />
    </div>
  `;
}
