import { h, render } from '@dropins/tools/preact.js';
import { getMetadata } from '../../scripts/aem.js';
import DocsHeader from '../../design-system/organisms/docs-header/docs-header.js';
import {
  DOCS_ROOT, currentDocPath, docsHomeHref, getDocContext,
} from '../../scripts/docs.js';

export default function decorate(block) {
  const props = {
    title: getMetadata('og:title') || document.title,
    description: getMetadata('description'),
    readingTime: Number.parseInt(getMetadata('reading-time'), 10) || 0,
    docsHref: docsHomeHref(),
    isRoot: currentDocPath() === DOCS_ROOT,
  };

  block.replaceChildren();
  render(h(DocsHeader, props), block);

  // the group label comes from the docs navigation, so it fills in once that loads
  getDocContext()
    .then(({ current }) => {
      if (current?.group) render(h(DocsHeader, { ...props, group: current.group }), block);
    })
    .catch(() => {});
}
