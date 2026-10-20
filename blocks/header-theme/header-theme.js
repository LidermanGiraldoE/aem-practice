import { h, render } from '@dropins/tools/preact.js';
import ThemeToggle from '../../design-system/molecules/theme-toggle/theme-toggle.js';

export default function decorate(block) {
  const options = [...block.children]
    .map((row) => {
      const [label = '', theme = ''] = [...row.children].map((cell) => cell.textContent.trim());
      return { label: label || theme, value: theme };
    })
    .filter((option) => option.value);
  block.replaceChildren();

  // head.html already applied the saved theme before first paint
  const rootTheme = document.documentElement.dataset.theme;
  const value = options.some((option) => option.value === rootTheme)
    ? rootTheme
    : options[0]?.value ?? '';

  render(h(ThemeToggle, { options, value }), block);
}
