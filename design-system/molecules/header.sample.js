import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import { SampleSection } from '../sample-kit.js';

const html = htm.bind(h);

const HEADER_PARTS = [
  [
    'header-brand',
    'Brand',
    'Logo enlazado con marca, nombre y descriptor editables.',
  ],
  [
    'header-items',
    'NavigationLinks',
    'Enlaces de navegación principal, ordenables desde Universal Editor.',
  ],
  [
    'header-search',
    'HeaderSearch',
    'Campo de búsqueda con resultados del índice, teclado y navegación.',
  ],
  [
    'header-theme',
    'HeaderOptionControl + Select',
    'Opciones de tema authorables; el usuario elige el tema activo.',
  ],
  [
    'header-language',
    'HeaderOptionControl + Select',
    'Opciones de idioma authorables; el usuario elige el idioma activo.',
  ],
];

export default function HeaderSample() {
  return html`
    <${SampleSection}
      kicker="04 · Organisms"
      title="Header"
      description="Subbloques authorables y componentes reutilizables que forman el header del sitio."
    >
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th class="border-b border-line p-3 text-left text-caption font-bold uppercase tracking-wider text-fg-3">Universal Editor</th>
              <th class="border-b border-line p-3 text-left text-caption font-bold uppercase tracking-wider text-fg-3">Design System</th>
              <th class="border-b border-line p-3 text-left text-caption font-bold uppercase tracking-wider text-fg-3">Responsibility</th>
            </tr>
          </thead>
          <tbody>
            ${HEADER_PARTS.map(([blockName, component, description]) => html`
              <tr key=${blockName}>
                <td class="border-b border-line p-3 align-middle font-mono text-xs text-fg">${blockName}</td>
                <td class="border-b border-line p-3 align-middle text-fg-2">${component}</td>
                <td class="border-b border-line p-3 align-middle text-fg-2">${description}</td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
      <p class="m-0! text-xs text-fg-3">Shared atom: Select. Shared molecules: Brand, NavigationLinks, HeaderSearch and HeaderOptionControl.</p>
    <//>
  `;
}
