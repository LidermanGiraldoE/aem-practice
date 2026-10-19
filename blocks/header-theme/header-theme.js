import { h, render } from '@dropins/tools/preact.js';
import HeaderOptionControl from '../../design-system/molecules/header-option-control/header-option-control.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // rows without values are kept so newly added (still empty) options remain editable
  const rows = [...block.children];
  if (!rows.length) return;

  const options = rows.map((row) => {
    const [label = '', theme = ''] = [...row.children].map((cell) => cell.textContent.trim());
    return [label || theme || 'New option', theme];
  });
  const validOptions = options.filter(([, theme]) => theme);
  block.replaceChildren();

  let savedTheme = '';
  try {
    savedTheme = window.localStorage.getItem('aem-forge-theme') || '';
  } catch (error) {
    savedTheme = '';
  }
  const rootTheme = document.documentElement.dataset.theme;
  const currentTheme = rootTheme || savedTheme;
  const value = validOptions.some(([, theme]) => theme === currentTheme)
    ? currentTheme
    : validOptions[0]?.[1] ?? '';
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
      if (!selectedTheme) return;
      document.documentElement.dataset.theme = selectedTheme;
      try {
        window.localStorage.setItem('aem-forge-theme', selectedTheme);
      } catch (error) {
        // Theme still applies for the current page when storage is unavailable.
      }
    },
  }), block);

  // keep Universal Editor data-aue-* attributes so each option stays selectable
  block.querySelectorAll('option').forEach((option, i) => moveInstrumentation(rows[i], option));
}
