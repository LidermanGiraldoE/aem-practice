import { h, render } from '@dropins/tools/preact.js';
import HeaderOptionControl from '../../design-system/molecules/header-option-control/header-option-control.js';

function getOptions(block) {
  return [...block.children]
    .map((row) => [...row.children].map((cell) => cell.textContent.trim()))
    .filter(([label, locale]) => label && locale);
}

export default function decorate(block) {
  const options = getOptions(block);
  if (!options.length) {
    block.replaceChildren();
    return;
  }
  block.replaceChildren();

  const { lang } = document.documentElement;
  const pageLocale = lang.toLowerCase();
  const matchingOption = options.find(([, locale]) => (
    locale.toLowerCase() === pageLocale || pageLocale.startsWith(`${locale.toLowerCase()}-`)
  ));
  const [, matchingLocale] = matchingOption || options[0];

  render(h(HeaderOptionControl, {
    ariaLabel: 'Select language',
    icon: '◎',
    options: options.map(([label, locale]) => ({ label, value: locale })),
    value: matchingLocale,
    onChange: (event) => {
      const { value: locale } = event.currentTarget;
      document.dispatchEvent(new CustomEvent('header-language-change', {
        detail: { locale },
      }));
    },
  }), block);
}
