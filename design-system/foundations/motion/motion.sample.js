import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import {
  Mono, SampleGroup, SampleSection, SpecTable, TokenValue,
} from '../../sample-kit.js';

const html = htm.bind(h);

const DURATIONS = [
  ['--ds-motion-fast', 'Hover y microinteracciones'],
  ['--ds-motion-base', 'Estados de componentes'],
  ['--ds-motion-slow', 'Superficies y efectos'],
  ['--ds-motion-enter', 'Entrada al viewport'],
  ['--ds-reveal-distance', 'Offset vertical del reveal'],
];

const EASING = [
  ['ease-standard', 'cubic-bezier(0.2, 0.7, 0.2, 1)', 'UI general'],
  ['ease-emphasized', 'cubic-bezier(0.16, 1, 0.3, 1)', 'Reveal'],
];

const DURATION_ROWS = DURATIONS.map(([cssVar, usage]) => [
  html`<${Mono}>${cssVar}<//>`,
  html`<${TokenValue} cssVar=${cssVar} />`,
  usage,
]);

const EASING_ROWS = EASING.map(([cls, curve, usage]) => [
  html`<${Mono}>${cls}<//>`,
  html`<${Mono}>${curve}<//>`,
  usage,
]);

export const MotionSample = () => html`
  <${SampleSection}
    kicker="05 · Foundations"
    title="Motion"
    description="Duraciones y curvas compartidas. Respetan prefers-reduced-motion."
  >
    <${SampleGroup} title="Duraciones">
      <${SpecTable} headers=${['Token', 'Valor', 'Uso']} rows=${DURATION_ROWS} />
    <//>
    <${SampleGroup} title="Easing">
      <${SpecTable} headers=${['Utility', 'Curva', 'Uso']} rows=${EASING_ROWS} />
    <//>
  <//>
`;

export default MotionSample;
