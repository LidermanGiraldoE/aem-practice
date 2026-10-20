import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);
const SIZES = { sm: 'size-8 text-xs', lg: 'size-13 text-base' };

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default function Avatar({ name = '', image = '', size = 'sm' }) {
  const sizeClass = SIZES[size] || SIZES.sm;

  // the name is always shown next to the avatar, so it is decorative
  return image
    ? html`<img src=${`${image}?width=104&format=webply&optimize=medium`} alt="" loading="lazy" class="${sizeClass} shrink-0 rounded-full object-cover" />`
    : html`<span class="grid ${sizeClass} shrink-0 place-items-center rounded-full bg-gradient-mint-cyan font-extrabold text-brand-ink" aria-hidden="true">${initials(name)}</span>`;
}
