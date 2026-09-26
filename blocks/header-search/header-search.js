import { h, render } from '@dropins/tools/preact.js';
import HeaderSearch from '../../design-system/molecules/header-search/header-search.js';

export default function decorate(block) {
  const label = block.querySelector('p')?.textContent?.trim() || block.textContent.trim();
  block.replaceChildren();
  render(h(HeaderSearch, {
    label,
  }), block);
}
