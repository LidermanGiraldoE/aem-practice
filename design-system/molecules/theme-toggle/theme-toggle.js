import { h } from '@dropins/tools/preact.js';
import { useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import IconButton from '../../atoms/icon-button/icon-button.js';

const html = htm.bind(h);
const STORAGE_KEY = 'aem-forge-theme';
// the icon previews the theme the button switches to
const ICONS = { light: '☀', dark: '☾' };

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    // the theme still applies to the current page when storage is unavailable
  }
}

export default function ThemeToggle({ options = [], value = '' }) {
  const [current, setCurrent] = useState(value);
  if (options.length < 2) return null;

  const index = Math.max(options.findIndex((option) => option.value === current), 0);
  const next = options[(index + 1) % options.length];
  const toggle = () => {
    applyTheme(next.value);
    setCurrent(next.value);
  };

  return html`
    <${IconButton}
      icon=${ICONS[next.value] || '◐'}
      label=${`Cambiar tema: ${next.label}`}
      onClick=${toggle}
    />
  `;
}
