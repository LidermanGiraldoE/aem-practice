import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import StatusBadge from '../../atoms/status-badge/status-badge.js';

const html = htm.bind(h);

const ALIGN_CLASS = { left: 'text-left', center: 'text-center', right: 'text-right' };
const CELL_CLASS = 'px-5 py-4 align-middle md:px-6';
// !important utilities beat the global unlayered a:any-link / a:hover rules in styles.css
const LINK_CLASS = 'group inline-flex items-center gap-1.5 text-base font-bold text-brand! no-underline! hover:text-brand! hover:no-underline! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

function CellContent({ cell }) {
  switch (cell.type) {
    case 'title':
      return html`
        <span class="block text-lead font-bold text-fg">${cell.title}</span>
        ${cell.description && html`<span class="mt-1 block text-base font-normal text-fg-2">${cell.description}</span>`}
      `;
    case 'status':
      return html`<${StatusBadge} status=${cell.status} label=${cell.text} />`;
    case 'link':
      return html`
        <a href=${cell.href} class=${LINK_CLASS}>
          ${cell.text}
          <span class="transition-transform duration-[var(--ds-motion-fast)] group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true">→</span>
        </a>
      `;
    default:
      return html`<span class="text-md font-normal text-fg-2">${cell.text}</span>`;
  }
}

function Cell({ cell }) {
  const Tag = cell.header ? 'th' : 'td';
  return html`
    <${Tag} scope=${cell.header ? 'row' : null} class="${CELL_CLASS} ${ALIGN_CLASS[cell.align] || ALIGN_CLASS.left}">
      <${CellContent} cell=${cell} />
    <//>
  `;
}

export default function DataTable({
  caption = '',
  headers = [],
  rows = [],
  footnote = '',
}) {
  if (!rows.length) return null;

  return html`
    <div data-reveal="up">
      <div
        class="relative overflow-x-auto rounded-panel border border-line bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        role="region"
        aria-label=${caption || 'Tabla'}
        tabindex="0"
      >
        <table class="w-full min-w-180 border-collapse">
          ${caption && html`<caption class="sr-only">${caption}</caption>`}
          ${headers.length > 0 && html`
            <thead>
              <tr class="border-b border-line">
                ${headers.map((header, index) => html`
                  <th key=${index} scope="col" class="${CELL_CLASS} text-xs font-bold tracking-widest text-fg-3 uppercase ${ALIGN_CLASS[header.align] || ALIGN_CLASS.left}">
                    ${header.text}
                  </th>
                `)}
              </tr>
            </thead>
          `}
          <tbody class="divide-y divide-line">
            ${rows.map((row, rowIndex) => html`
              <tr key=${rowIndex}>
                ${row.map((cell, cellIndex) => html`<${Cell} key=${cellIndex} cell=${cell} />`)}
              </tr>
            `)}
          </tbody>
        </table>
      </div>
      ${footnote && html`
        <div
          class="mt-4 text-sm text-fg-3 [&_a]:text-brand! [&_p]:m-0!"
          dangerouslySetInnerHTML=${{ __html: footnote }}
        ></div>
      `}
    </div>
  `;
}
