import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import {
  Mono, SampleGroup, SampleSection, SpecTable, useComputed,
} from '../../sample-kit.js';

const html = htm.bind(h);

const FONT_FAMILIES = [
  {
    name: 'Inter',
    utility: 'font-sans',
    role: 'UI, headings y body',
    weights: [
      ['Regular 400', 'font-normal'],
      ['Medium 500', 'font-medium'],
      ['Semibold 600', 'font-semibold'],
      ['Bold 700', 'font-bold'],
      ['Extrabold 800', 'font-extrabold'],
    ],
  },
  {
    name: 'JetBrains Mono',
    utility: 'font-mono',
    role: 'Código y terminal',
    weights: [
      ['Regular 400', 'font-normal'],
      ['Semibold 600', 'font-semibold'],
      ['Italic 400', 'italic'],
    ],
  },
];

const HEADINGS = [
  ['Display', 'text-display', 'font-extrabold', 'clamp(48px, 7vw, 88px)', '800 / 0.96 / -0.055em', 'Hero principal'],
  ['H1', 'text-h1', 'font-extrabold', 'clamp(48px, 7vw, 72px)', '800 / 0.96 / -0.055em', '1 por página'],
  ['H2', 'text-h2', 'font-extrabold', 'clamp(36px, 4vw, 54px)', '800 / 1.04 / -0.045em', '1 por bloque principal'],
  ['CTA', 'text-cta', 'font-extrabold', 'clamp(38px, 5vw, 60px)', '800 / 1 / -0.05em', 'Cierre de página'],
  ['H3', 'text-2xl', 'font-bold', '24px', '700 / 1.25', 'Cards y subsecciones'],
];

const TEXT_SCALE = [
  ['micro', 'text-micro'],
  ['caption', 'text-caption'],
  ['xs', 'text-xs'],
  ['sm', 'text-sm'],
  ['md', 'text-md'],
  ['code', 'text-code'],
  ['base', 'text-base'],
  ['lead', 'text-lead'],
  ['lg', 'text-lg'],
  ['xl', 'text-xl'],
  ['2xl', 'text-2xl'],
  ['3xl', 'text-3xl'],
  ['4xl', 'text-4xl'],
  ['5xl', 'text-5xl'],
];

const TRACKING = [
  ['tightest', 'tracking-tightest'],
  ['tighter', 'tracking-tighter'],
  ['tight', 'tracking-tight'],
  ['snug', 'tracking-snug'],
  ['normal', 'tracking-normal'],
  ['wide', 'tracking-wide'],
  ['wider', 'tracking-wider'],
  ['widest', 'tracking-widest'],
];

const LEADING = [
  ['leading-display', '0.96', 'Display y H1'],
  ['leading-heading', '1.04', 'H2 de sección'],
  ['leading-body', '1.55', 'Body'],
  ['leading-code', '1.75', 'Código y terminal'],
];

const FontFamily = ({ font }) => html`
  <div class="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 ${font.utility}">
    <div class="flex items-baseline justify-between gap-4">
      <strong class="text-lg">${font.name}</strong>
      <span class="font-mono text-xs text-fg-3">${font.utility} · ${font.role}</span>
    </div>
    <span class="text-5xl font-bold">Aa</span>
    <span class="text-md text-fg-2">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</span>
    <div class="flex flex-col gap-1 border-t border-line pt-4">
      ${font.weights.map(([label, cls]) => html`
        <div class="flex items-baseline justify-between gap-4">
          <span class="text-lg ${cls}">Edge Delivery Services</span>
          <span class="font-mono text-micro text-fg-3">${label} · ${cls}</span>
        </div>
      `)}
    </div>
  </div>
`;

const HeadingSpec = ({
  spec: [name, size, weight, range, metrics, usage],
}) => html`
  <div class="grid items-center gap-4 border-t border-line py-6 lg:grid-cols-[1.15fr_.85fr]">
    <div class="min-w-0 break-words ${size} ${weight}">${name} · Entiende AEM.</div>
    <div class="flex flex-col gap-1 text-xs text-fg-3">
      <strong class="text-fg">${size}</strong>
      <span>${range}</span>
      <span>${metrics}</span>
      <span>${usage}</span>
    </div>
  </div>
`;

const Measured = ({ className, text, read }) => {
  const [ref, value] = useComputed(read);
  return html`
    <div class="flex flex-col gap-1">
      <span ref=${ref} class="${className} text-fg">${text}</span>
      <span class="font-mono text-micro text-fg-3">${value}</span>
    </div>
  `;
};

const readSize = ({ fontSize, lineHeight }) => `${fontSize} / ${lineHeight}`;
const readTracking = ({ letterSpacing }) => letterSpacing;

const TEXT_SCALE_ROWS = TEXT_SCALE.map(([name, cls]) => [
  html`<${Mono}>${cls}<//>`,
  name,
  html`<${Measured} className=${cls} text="Entiende AEM" read=${readSize} />`,
]);

const TRACKING_ROWS = TRACKING.map(([name, cls]) => [
  html`<${Mono}>${cls}<//>`,
  name,
  html`<${Measured} className="${cls} text-md font-bold uppercase" text="AEM Forge" read=${readTracking} />`,
]);

const LEADING_ROWS = LEADING.map(([cls, value, usage]) => [html`<${Mono}>${cls}<//>`, value, usage]);

export const TypographySample = () => html`
  <${SampleSection}
    kicker="02 · Foundations"
    title="Tipografía"
    description="Familias, escala de headings fluida, escala de texto, tracking y leading."
  >
    <${SampleGroup} title="Familias">
      <div class="grid gap-4 lg:grid-cols-2">
        ${FONT_FAMILIES.map((font) => html`<${FontFamily} font=${font} />`)}
      </div>
    <//>
    <${SampleGroup} title="Heading scale">
      <div class="flex flex-col">
        ${HEADINGS.map((spec) => html`<${HeadingSpec} spec=${spec} />`)}
      </div>
    <//>
    <${SampleGroup} title="Text scale">
      <${SpecTable} headers=${['Utility', 'Token', 'Sample · size / line-height']} rows=${TEXT_SCALE_ROWS} />
    <//>
    <${SampleGroup} title="Tracking">
      <${SpecTable} headers=${['Utility', 'Token', 'Sample · letter-spacing']} rows=${TRACKING_ROWS} />
    <//>
    <${SampleGroup} title="Leading">
      <${SpecTable} headers=${['Utility', 'Valor', 'Uso']} rows=${LEADING_ROWS} />
    <//>
  <//>
`;

export default TypographySample;
