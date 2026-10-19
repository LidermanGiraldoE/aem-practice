import { h, render } from '@dropins/tools/preact.js';
import HeroBanner from '../../design-system/organisms/hero-banner/hero-banner.js';

function getCell(row) {
  return row?.firstElementChild || null;
}

function getText(element) {
  return element?.textContent?.trim() || '';
}

function accentHeadingLines(copy) {
  copy.querySelectorAll('h1').forEach((heading) => {
    const lineBreak = heading.querySelector('br');
    const nextSibling = lineBreak?.nextSibling;
    const hasAccent = nextSibling?.nodeType === Node.ELEMENT_NODE
      && nextSibling.classList.contains('hero-heading-accent');
    if (!lineBreak || hasAccent) return;

    const accent = document.createElement('span');
    accent.className = 'hero-heading-accent';
    while (lineBreak.nextSibling) accent.append(lineBreak.nextSibling);
    heading.append(accent);
  });
}

function parseHeroCopy(cell) {
  if (!cell) return { eyebrow: '', copyHtml: '' };

  const copy = cell.cloneNode(true);
  const eyebrow = copy.querySelector(':scope > p');
  const eyebrowText = getText(eyebrow);
  eyebrow?.remove();
  accentHeadingLines(copy);

  return {
    eyebrow: eyebrowText,
    copyHtml: copy.innerHTML.trim(),
  };
}

function parseAction(row) {
  const cell = getCell(row);
  const link = cell?.querySelector('.button-wrapper a, a.button, a');
  if (!link) return null;

  const variant = ['primary', 'secondary', 'accent'].find((name) => link.classList.contains(name)) || '';
  const iconValue = [...(cell?.querySelectorAll('p') || [])]
    .find((paragraph) => !paragraph.contains(link));

  return {
    href: link.getAttribute('href') || '',
    label: getText(link),
    title: link.getAttribute('title') || '',
    variant,
    icon: getText(iconValue) || 'none',
  };
}

const CODE_TOKEN_PATTERN = new RegExp([
  '(//[^\\n]*|#[^\\n]*)',
  '|("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)',
  '|\\b(export|default|function|const|let|var|return|if|else|new|class|import|from|async|await)\\b',
  '|\\b([A-Za-z_$][\\w$]*)(?=\\s*\\()',
  '|\\b(\\d+(?:\\.\\d+)?)\\b',
].join(''), 'g');

function highlightCode(code) {
  const source = code.textContent;
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  const appendToken = (
    token,
    comment,
    string,
    keyword,
    functionName,
    number,
    index,
  ) => {
    if (index > lastIndex) fragment.append(document.createTextNode(source.slice(lastIndex, index)));

    let tokenClass = '';
    if (comment) tokenClass = 'hero-code-comment';
    else if (string) tokenClass = 'hero-code-string';
    else if (keyword) tokenClass = 'hero-code-keyword';
    else if (functionName) tokenClass = 'hero-code-function';
    else if (number) tokenClass = 'hero-code-number';

    if (tokenClass) {
      const span = document.createElement('span');
      span.className = tokenClass;
      span.textContent = token;
      fragment.append(span);
    } else {
      fragment.append(document.createTextNode(token));
    }
    lastIndex = index + token.length;
    return token;
  };

  source.replace(CODE_TOKEN_PATTERN, appendToken);

  if (lastIndex < source.length) {
    fragment.append(document.createTextNode(source.slice(lastIndex)));
  }

  code.replaceChildren(fragment);
}

function decorateTerminalMarkup(markup) {
  if (!markup) return '';
  const container = document.createElement('div');
  container.innerHTML = markup;

  container.querySelectorAll('p').forEach((paragraph) => {
    const text = paragraph.textContent.trim();
    if (text.startsWith('#')) paragraph.classList.add('hero-terminal-comment');
    const separatorIndex = text.indexOf(' | ');
    if (separatorIndex > 0) {
      const key = text.slice(0, separatorIndex);
      const value = text.slice(separatorIndex + 3);
      paragraph.replaceChildren();
      const keyElement = document.createElement('span');
      keyElement.className = 'hero-terminal-key';
      keyElement.textContent = key;
      const valueElement = document.createElement('span');
      valueElement.className = 'hero-terminal-value';
      valueElement.textContent = value;
      paragraph.append(keyElement, document.createTextNode(' '), valueElement);
    }
  });

  container.querySelectorAll('pre code').forEach(highlightCode);

  return container.innerHTML;
}

function parseTerminal(row) {
  const cell = getCell(row);
  if (!cell) return null;

  const content = cell.cloneNode(true);
  const directParagraphs = [...content.children].filter((child) => child.tagName === 'P');
  const titleElement = directParagraphs[0];
  const title = getText(titleElement);
  titleElement?.remove();

  const remainingParagraphs = [...content.children].filter((child) => child.tagName === 'P');
  const statusElement = remainingParagraphs.find((paragraph) => getText(paragraph).startsWith('✓'));
  const statusDetailElement = statusElement?.nextElementSibling?.tagName === 'P'
    ? statusElement.nextElementSibling
    : null;
  const status = getText(statusElement);
  const statusDetail = getText(statusDetailElement);
  statusElement?.remove();
  statusDetailElement?.remove();

  const contentHtml = decorateTerminalMarkup(content.innerHTML.trim());
  if (!title && !contentHtml && !status && !statusDetail) return null;

  return {
    title,
    contentHtml,
    status,
    statusDetail,
  };
}

export default function decorate(block) {
  const rows = [...block.children];
  const copy = parseHeroCopy(getCell(rows[0]));
  const actions = rows.slice(1, 3)
    .map(parseAction)
    .filter((action) => action?.href && action.label);
  const terminal = parseTerminal(rows[3]);

  block.replaceChildren();
  render(h(HeroBanner, {
    ...copy,
    actions,
    terminal,
  }), block);
}
