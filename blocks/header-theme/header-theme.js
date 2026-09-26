import { h, render } from '@dropins/tools/preact.js';
import HeaderOptionControl from '../../design-system/molecules/header-option-control/header-option-control.js';

function getOptions(block) {
  return [...block.children]
    .map((row) => [...row.children].map((cell) => cell.textContent.trim()))
    .filter(([label, theme]) => label && theme);
}

export default function decorate(block) {
  const options = getOptions(block);
  if (!options.length) {
    block.replaceChildren();
    return;
  }
  block.replaceChildren();

  let savedTheme = '';
  try {
    savedTheme = window.localStorage.getItem('aem-forge-theme') || '';
  } catch (error) {
    savedTheme = '';
  }
  const rootTheme = document.documentElement.dataset.theme;
  const currentTheme = rootTheme || savedTheme;
  const value = options.some(([, theme]) => theme === currentTheme)
    ? currentTheme
    : options[0][1];
  if (!rootTheme && savedTheme && value === savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
  }

  render(h(HeaderOptionControl, {
    ariaLabel: 'Select theme',
    icon: '◐',
    options: options.map(([label, theme]) => ({ label, value: theme })),
    value,
    onChange: (event) => {
      const { value: selectedTheme } = event.currentTarget;
      document.documentElement.dataset.theme = selectedTheme;
      try {
        window.localStorage.setItem('aem-forge-theme', selectedTheme);
      } catch (error) {
        // Theme still applies for the current page when storage is unavailable.
      }
    },
  }), block);
}
