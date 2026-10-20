import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

const TONES = {
  brand: '--a: var(--ds-brand); --b: var(--ds-cyan);',
  violet: '--a: var(--ds-violet); --b: var(--ds-accent-violet);',
  cyan: '--a: var(--ds-cyan); --b: var(--ds-violet);',
  warning: '--a: var(--ds-warning); --b: var(--ds-brand);',
  coral: '--a: var(--ds-coral); --b: var(--ds-warning);',
};

export default function PostCover({
  image = '',
  glyph = '',
  tone = 'brand',
  ratio = 'aspect-video',
  width = 750,
  eager = false,
  className = '',
}) {
  const frame = `relative grid ${ratio} place-items-center overflow-hidden rounded-xl border border-line bg-surface-2 ${className}`;

  if (image) {
    return html`
      <div class=${frame}>
        <img
          src=${`${image}?width=${width}&format=webply&optimize=medium`}
          alt=""
          loading=${eager ? 'eager' : 'lazy'}
          class="absolute inset-0 size-full! object-cover"
        />
      </div>
    `;
  }

  // generated cover for posts without an image, tinted by category
  return html`
    <div
      class="${frame} bg-[radial-gradient(80%_90%_at_0%_0%,color-mix(in_srgb,var(--a)_34%,transparent),transparent_70%),radial-gradient(80%_90%_at_100%_100%,color-mix(in_srgb,var(--b)_28%,transparent),transparent_70%)]"
      style=${TONES[tone] || TONES.brand}
      aria-hidden="true"
    >
      <span class="absolute inset-0 bg-[linear-gradient(var(--ds-grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--ds-grid-line)_1px,transparent_1px)] bg-size-[28px_28px]"></span>
      <span class="relative font-mono text-[clamp(28px,4vw,52px)] leading-none font-bold tracking-tight text-fg/88">${glyph}</span>
    </div>
  `;
}
