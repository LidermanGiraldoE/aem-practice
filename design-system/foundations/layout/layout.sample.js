import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import {
  Mono, SampleGroup, SampleSection, SpecTable,
} from '../../sample-kit.js';

const html = htm.bind(h);

const LAYOUT = [
  ['max-w-site', '1180px', 'Contenedor principal'],
  ['max-w-hero', '900px', 'Título del hero'],
  ['max-w-prose', '760px', 'Encabezados de sección'],
  ['max-w-copy', '720px', 'Copy del hero'],
  ['h-header', '72px', 'Altura del header'],
  ['py-section', '110px', 'Padding vertical de sección'],
  ['px-gutter', '20px', 'Margen lateral'],
];

const BREAKPOINTS = [
  ['sm:', '560px', 'Mobile grande'],
  ['md:', '760px', 'Tablet'],
  ['lg:', '900px', 'Desktop'],
  ['xl:', '1100px', 'Desktop ancho'],
];

const toRows = (items) => items.map(([cls, value, usage]) => [html`<${Mono}>${cls}<//>`, value, usage]);

export const LayoutSample = () => html`
  <${SampleSection}
    kicker="04 · Foundations"
    title="Layout & breakpoints"
    description="Contenedores, espaciado estructural y breakpoints mobile-first."
  >
    <${SampleGroup} title="Layout">
      <${SpecTable} headers=${['Utility', 'Valor', 'Uso']} rows=${toRows(LAYOUT)} />
    <//>
    <${SampleGroup} title="Breakpoints">
      <${SpecTable} headers=${['Prefijo', 'Min-width', 'Contexto']} rows=${toRows(BREAKPOINTS)} />
    <//>
  <//>
`;

export default LayoutSample;
