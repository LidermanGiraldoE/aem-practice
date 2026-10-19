import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Button from './button.js';
import {
  Mono, SampleSection, SpecTable, ThemeCompare,
} from '../../sample-kit.js';

const html = htm.bind(h);

const VARIANTS = [
  ['Primary', 'primary', 'Link en negrita'],
  ['Secondary', 'secondary', 'Link en cursiva'],
  ['Accent', 'accent', 'Link en negrita + cursiva'],
  ['Default', '', 'Sin variante'],
];

const VARIANT_ROWS = VARIANTS.map(([label, cls, authoring]) => [label, html`<${Mono}>${cls}<//>`, authoring]);

const ButtonRow = () => html`
  <div class="flex flex-wrap items-center gap-3">
    ${VARIANTS.map(([label, variant]) => html`<${Button} label=${label} variant=${variant} />`)}
    <${Button} label="Disabled" variant="primary" disabled=${true} />
  </div>
`;

export const ButtonSample = () => html`
  <${SampleSection}
    kicker="06 · Atoms"
    title="Button"
    description="Estilos globales de styles.css. Los autores los generan con el formato del link."
  >
    <${ThemeCompare} render=${() => html`<${ButtonRow} />`} />
    <${SpecTable} headers=${['Variante', 'Clases', 'Cómo se autorea']} rows=${VARIANT_ROWS} />
  <//>
`;

export default ButtonSample;
