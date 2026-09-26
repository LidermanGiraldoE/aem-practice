import { h, render } from '@dropins/tools/preact.js';
import Brand from '../../design-system/molecules/brand/brand.js';

function getRowText(row) {
  return row?.textContent?.trim() || '';
}

export default function decorate(block) {
  const [markRow, nameRow, descriptorRow, hrefRow] = [...block.children];
  const mark = getRowText(markRow);
  const name = getRowText(nameRow);
  const descriptor = getRowText(descriptorRow).replace(/^\/\s+/, '');
  const href = hrefRow?.querySelector('a')?.getAttribute('href') || getRowText(hrefRow) || '/';

  if (!mark && !name && !descriptor) {
    block.replaceChildren();
    return;
  }

  block.replaceChildren();
  render(h(Brand, {
    mark,
    name,
    descriptor,
    href,
  }), block);
}
