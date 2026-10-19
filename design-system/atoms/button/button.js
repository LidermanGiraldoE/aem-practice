import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);
const ALLOWED_VARIANTS = new Set(['primary', 'secondary', 'accent']);
const ICONS = {
  'arrow-right': '→',
  'arrow-up-right': '↗',
};

function ButtonContent({ label, icon }) {
  const iconGlyph = ICONS[icon];
  return html`
    <span>${label}</span>
    ${iconGlyph && html`<span class="hero-button-icon" aria-hidden="true">${iconGlyph}</span>`}
  `;
}

export default function Button({
  href,
  label,
  title = '',
  variant = '',
  icon = 'none',
  type = 'button',
  disabled = false,
  className = '',
}) {
  if (!label) return null;

  const buttonVariant = ALLOWED_VARIANTS.has(variant) ? variant : '';
  const classes = ['button', buttonVariant, className].filter(Boolean).join(' ');

  if (href) {
    return html`
      <a href=${href} title=${title || label} class=${classes}>
        <${ButtonContent} label=${label} icon=${icon} />
      </a>
    `;
  }

  return html`
    <button type=${type} class=${classes} disabled=${disabled}>
      <${ButtonContent} label=${label} icon=${icon} />
    </button>
  `;
}
