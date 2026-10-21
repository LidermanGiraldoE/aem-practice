import { h, render } from '@dropins/tools/preact.js';
import DocsSidebar from '../../design-system/organisms/docs-sidebar/docs-sidebar.js';
import { currentDocPath, getDocsNav } from '../../scripts/docs.js';

export default function decorate(block) {
  block.replaceChildren();
  // the nav loads in the background so it never delays the page content
  getDocsNav()
    .then((groups) => render(h(DocsSidebar, { groups, currentPath: currentDocPath() }), block))
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    });
}
