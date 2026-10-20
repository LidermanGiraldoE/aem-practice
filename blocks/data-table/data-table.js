import { h, render } from '@dropins/tools/preact.js';
import DataTable from '../../design-system/organisms/data-table/data-table.js';
import observeReveal from '../../scripts/reveal.js';

const PUBLISH_ORIGIN = 'https://publish-p34631-e1321407.adobeaemcloud.com';
const QUERY_PATH = '/graphql/execute.json/aem-practice/table-by-path';
const IS_AUTHOR = window.location.hostname.startsWith('author-');

const STATUS_BY_TEXT = new Map([
  ['sí', 'yes'], ['si', 'yes'], ['yes', 'yes'],
  ['parcial', 'partial'], ['partial', 'partial'],
  ['no aplica', 'none'], ['n/a', 'none'], ['no', 'none'],
]);

function getFragmentPath(block) {
  const value = block.querySelector('a')?.getAttribute('href') || block.textContent;
  return value.match(/\/content\/dam\/[^\s?#;]+/)?.[0] || '';
}

async function fetchFragment(path) {
  // author serves UE from the same origin; published pages read from AEM publish
  const origin = IS_AUTHOR ? '' : PUBLISH_ORIGIN;
  const response = await fetch(
    `${origin}${QUERY_PATH};path=${encodeURIComponent(path)}`,
    IS_AUTHOR ? { cache: 'no-store' } : {},
  );
  if (!response.ok) throw new Error(`Table fragment request failed: ${response.status}`);
  const { data } = await response.json();
  return data?.tableByPath?.item;
}

// maps AEM page paths (/content/site/page.html) to their Edge Delivery URLs (/page)
function toSitePath(href) {
  if (IS_AUTHOR) return href;
  const match = href.match(/^\/content\/(?!dam\/)[^/]+(\/[^?#]*?)?(?:\.html)?([?#].*)?$/);
  return match ? `${match[1] || '/'}${match[2] || ''}` : href;
}

function sanitize(markup) {
  const fragment = window.DOMPurify.sanitize(markup || '', {
    USE_PROFILES: { html: true },
    RETURN_DOM_FRAGMENT: true,
  });
  fragment.querySelectorAll('a[href]').forEach((link) => {
    link.setAttribute('href', toSitePath(link.getAttribute('href')));
  });
  return fragment;
}

function parseCell(cell) {
  const text = cell.textContent.replace(/\s+/g, ' ').trim();
  const base = { text, align: cell.style.textAlign, header: cell.tagName === 'TH' };

  const status = STATUS_BY_TEXT.get(text.toLowerCase());
  if (status) return { ...base, type: 'status', status };

  const link = cell.querySelector('a[href]');
  if (link) {
    return {
      ...base, type: 'link', text: link.textContent.trim(), href: link.getAttribute('href'),
    };
  }

  // a leading bold line is the row title, the remaining text its description
  const title = cell.querySelector('strong, b')?.textContent.trim();
  if (title && text.startsWith(title)) {
    return {
      ...base, type: 'title', header: true, title, description: text.slice(title.length).trim(),
    };
  }

  return { ...base, type: 'text' };
}

function parseTable(fragment) {
  const table = fragment.querySelector('table');
  if (!table) return { headers: [], rows: [] };

  const allRows = [...table.rows];
  const [firstRow] = allRows;
  const headRow = table.tHead?.rows[0]
    || ([...(firstRow?.cells || [])].every((cell) => cell.tagName === 'TH') ? firstRow : null);

  const headers = headRow
    ? [...headRow.cells].map((cell) => ({
      text: cell.textContent.trim(),
      align: cell.style.textAlign,
    }))
    : [];
  const rows = allRows
    .filter((row) => row !== headRow && row.parentElement.tagName !== 'THEAD')
    .map((row) => [...row.cells].map(parseCell))
    .filter((cells) => cells.some((cell) => cell.text));

  return { headers, rows };
}

function toHtml(fragment) {
  if (!fragment.textContent.trim()) return '';
  const container = document.createElement('div');
  container.append(fragment);
  return container.innerHTML;
}

export default async function decorate(block) {
  const path = getFragmentPath(block);
  block.replaceChildren();
  block.setAttribute('aria-busy', 'true');

  let item;
  try {
    item = path ? await fetchFragment(path) : null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  block.removeAttribute('aria-busy');

  const { headers, rows } = parseTable(sanitize(item?.table?.html));
  if (!rows.length) {
    if (IS_AUTHOR) block.textContent = 'Selecciona un Content Fragment del modelo Table.';
    return;
  }

  render(h(DataTable, {
    caption: item.caption || '',
    headers,
    rows,
    footnote: toHtml(sanitize(item.footnote?.html)),
  }), block);
  observeReveal(block);
}
