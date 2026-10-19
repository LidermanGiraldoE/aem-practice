import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import StackCard from '../../molecules/stack-card/stack-card.js';

const html = htm.bind(h);

const CARD_STEP = 112;
const CARD_HEIGHT = 124;
const PANEL_PADDING = 58;
// offsets repeat every three cards to keep the staggered look of the design
const CARD_POSITIONS = ['md:left-0', 'md:right-0', 'md:left-[8%]'];
const CARD_ANIMATIONS = [
  'motion-safe:animate-stack-float-1',
  'motion-safe:animate-stack-float-2',
  'motion-safe:animate-stack-float-3',
];
const GLOW_GREEN = 'bg-[radial-gradient(circle,color-mix(in_srgb,var(--ds-brand)_30%,transparent),color-mix(in_srgb,var(--ds-cyan)_10%,transparent)_42%,transparent_70%)]';
const GLOW_VIOLET = 'bg-[radial-gradient(circle,color-mix(in_srgb,var(--ds-violet)_28%,transparent),color-mix(in_srgb,var(--ds-accent-violet)_10%,transparent)_42%,transparent_70%)]';

export default function StackPanel({ cards = [], reverse = false }) {
  const stackHeight = (cards.length - 1) * CARD_STEP + CARD_HEIGHT;
  const panelHeight = Math.max(420, PANEL_PADDING * 2 + stackHeight);
  const [topGlow, bottomGlow] = reverse ? [GLOW_VIOLET, GLOW_GREEN] : [GLOW_GREEN, GLOW_VIOLET];

  return html`
    <div
      class="relative overflow-hidden rounded-panel border border-line-strong bg-surface-raised shadow-panel md:min-h-[var(--stack-panel-height)]"
      style=${{ '--stack-panel-height': `${panelHeight}px` }}
    >
      <div
        class="pointer-events-none absolute -top-30 -right-25 size-87.5 rounded-full ${topGlow}"
        aria-hidden="true"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-30 -left-25 size-87.5 rounded-full ${bottomGlow}"
        aria-hidden="true"
      ></div>
      <ul class="relative m-0! flex list-none flex-col gap-3 p-6 md:absolute md:inset-x-12 md:inset-y-14.5 md:block md:p-0">
        ${cards.map((card, index) => html`
          <li
            key=${card.index ?? index}
            data-item-index=${card.index}
            class="m-0 md:absolute md:top-[var(--stack-card-top)] md:w-[78%] ${CARD_POSITIONS[index % 3]} ${CARD_ANIMATIONS[index % 3]}"
            style=${{ '--stack-card-top': `${index * CARD_STEP}px` }}
          >
            <${StackCard} tags=${card.tags} title=${card.title} description=${card.description} />
          </li>
        `)}
      </ul>
    </div>
  `;
}
