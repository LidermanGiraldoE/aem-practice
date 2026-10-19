import { h, render } from '@dropins/tools/preact.js';
import HeaderOptionControl from '../../design-system/molecules/header-option-control/header-option-control.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // rows without values are kept so newly added (still empty) options remain editable
  const rows = [...block.children];
  if (!rows.length) return;

  const options = rows.map((row) => {
    const [label = '', locale = ''] = [...row.children].map((cell) => cell.textContent.trim());
    return [label || locale || 'New option', locale];
  });
  block.replaceChildren();

  const firstLocale = options.find(([, locale]) => locale)?.[1] ?? '';

  render(h(HeaderOptionControl, {
    ariaLabel: 'Select language',
    icon: '◎',
    options: options.map(([label, locale]) => ({ label, value: locale })),
    value: firstLocale,
    onChange: (event) => {
      const { value: locale } = event.currentTarget;
      if (!locale) return;
      document.dispatchEvent(new CustomEvent('header-language-change', {
        detail: { locale },
      }));
    },
  }), block);

  // keep Universal Editor data-aue-* attributes so each option stays selectable
  block.querySelectorAll('option').forEach((option, i) => moveInstrumentation(rows[i], option));
}
