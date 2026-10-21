import { h, render } from '@dropins/tools/preact.js';
import FeatureGrid from '../../design-system/organisms/feature-grid/feature-grid.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { TONES } from '../../design-system/atoms/badge/badge.js';
import observeReveal from '../../scripts/reveal.js';

function getText(element) {
  return element?.textContent?.trim() || '';
}

// title_badge and title_badgeTone are grouped into the title cell as paragraphs after the title
function parseTitle(cell) {
  const lines = [...(cell?.querySelectorAll('p') || [])].map(getText).filter(Boolean);
  if (!lines.length) return { title: getText(cell), badge: '', badgeTone: 'brand' };
  const [title, ...rest] = lines;
  const tone = TONES[rest.at(-1)] ? rest.pop() : 'brand';
  return { title, badge: rest[0] || '', badgeTone: tone };
}

// block option classes avoid Tailwind's columns-* utilities, which would split the block
function getColumns(block) {
  if (block.classList.contains('two-columns')) return 2;
  if (block.classList.contains('four-columns')) return 4;
  return 3;
}

export default function decorate(block) {
  // empty rows are kept so newly added cards stay selectable in Universal Editor
  const rows = [...block.children];
  const items = rows.map((row) => {
    const [icon, titleCell, description, linkCell] = [...row.children];
    const link = linkCell?.querySelector('a');
    const href = link?.getAttribute('href') || '';
    const label = getText(link);
    // link_status is grouped into the link cell; it only shows when there is no link
    const status = [...(linkCell?.children || [])]
      .filter((element) => !element.querySelector('a') && element.tagName !== 'A')
      .map(getText)
      .join(' ') || (link ? '' : getText(linkCell));
    return {
      icon: getText(icon),
      ...parseTitle(titleCell),
      description: getText(description),
      href,
      // a link without Link Text is rendered with its URL as the text
      linkLabel: href ? (label !== href && label) || '' : status,
    };
  });

  block.replaceChildren();
  render(h(FeatureGrid, {
    items,
    columns: getColumns(block),
    multicolor: block.classList.contains('multicolor'),
  }), block);
  observeReveal(block);

  block.querySelectorAll(':scope > ul > li').forEach((li, i) => moveInstrumentation(rows[i], li));
}
