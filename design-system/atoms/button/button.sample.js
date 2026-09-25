import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import {
  Mono, SampleSection, SpecTable, ThemeCompare,
} from '../../sample-kit.js';

const html = htm.bind(h);

const VARIANTS = [
  ['Primary', 'button primary', 'Link en negrita'],
  ['Secondary', 'button secondary', 'Link en cursiva'],
  ['Accent', 'button accent', 'Link en negrita + cursiva'],
  ['Default', 'button', 'Sin variante'],
];

const VARIANT_ROWS = VARIANTS.map(([label, cls, authoring]) => [label, html`<${Mono}>${cls}<//>`, authoring]);

const ButtonRow = () => html`
  <div class="flex flex-wrap items-center gap-3">
    ${VARIANTS.map(([label, cls]) => html`<button type="button" class=${cls}>${label}</button>`)}
    <button type="button" class="button primary" disabled>Disabled</button>
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
