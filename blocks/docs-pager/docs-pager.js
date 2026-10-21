import { h, render } from '@dropins/tools/preact.js';
import DocsPager from '../../design-system/organisms/docs-pager/docs-pager.js';
import { getDocContext } from '../../scripts/docs.js';

export default async function decorate(block) {
  block.replaceChildren();
  try {
    const { prev, next } = await getDocContext();
    render(h(DocsPager, { prev, next }), block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}
