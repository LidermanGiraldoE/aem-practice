import { h, render } from '@dropins/tools/preact.js';
import LearnHero from '../../design-system/organisms/learn-hero/learn-hero.js';
import { getMetadata } from '../../scripts/aem.js';
import { IS_AUTHOR, toPageHref } from '../../scripts/blog.js';
import getCurrentProgress from '../../scripts/learn-progress.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getText(element) {
  return element?.textContent?.trim() || '';
}

function parseLink(cell) {
  const link = cell?.querySelector('a');
  const href = link?.getAttribute('href') || '';
  const label = getText(link);
  // a link without its text field is rendered with the URL as the text
  if (!href || !label || label === href) return null;
  return { href, label, title: link.getAttribute('title') || '' };
}

// a line break in the H1 starts the accent line, as in the hero banner
function accentHeading(heading) {
  const lineBreak = heading?.querySelector(':scope > br');
  if (!lineBreak?.nextSibling) return;
  const accent = document.createElement('span');
  while (lineBreak.nextSibling) accent.append(lineBreak.nextSibling);
  heading.append(accent);
}

// rows: grouped content (eyebrow + rich text), primary CTA, secondary CTA, grouped start card
export default function decorate(block) {
  const [copyRow, primaryRow, secondaryRow, cardRow] = [...block.children];
  const copyCell = copyRow?.firstElementChild;
  const heading = copyCell?.querySelector('h1, h2');
  const firstChild = copyCell?.firstElementChild;
  const eyebrow = heading && firstChild?.tagName === 'P' ? firstChild : null;

  const cardCell = cardRow?.firstElementChild;
  const cardTexts = [...(cardCell?.children || [])]
    .filter((element) => !element.querySelector('a'))
    .map(getText)
    .filter(Boolean);
  const [cardEyebrow, cardTitle, cardText] = cardTexts.length >= 3 ? cardTexts : ['', ...cardTexts];

  const actions = [
    { ...parseLink(primaryRow), variant: 'primary', icon: 'arrow-right' },
    { ...parseLink(secondaryRow), variant: 'secondary' },
  ].filter((action) => action.href);

  const props = {
    eyebrow: getText(eyebrow),
    breadcrumb: [
      { label: 'Inicio', href: toPageHref('/') },
      { label: getMetadata('og:title') || document.title },
    ],
    actions,
    // the editor always shows the authored start card so it stays editable
    progress: IS_AUTHOR ? null : getCurrentProgress(),
    start: {
      eyebrow: cardEyebrow, title: cardTitle, text: cardText, action: parseLink(cardCell),
    },
  };

  eyebrow?.remove();
  accentHeading(heading);

  block.replaceChildren();
  render(h(LearnHero, props), block);

  const slot = block.querySelector('[data-learn-hero-copy]');
  if (copyCell) {
    moveInstrumentation(copyCell, slot);
    slot.append(...copyCell.childNodes);
  }
}
