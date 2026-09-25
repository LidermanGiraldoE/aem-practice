import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import { SampleGroup, SampleSection, useComputed } from '../../sample-kit.js';

const html = htm.bind(h);

const RADII = [
  ['xs', 'rounded-xs'],
  ['sm', 'rounded-sm'],
  ['md', 'rounded-md'],
  ['btn', 'rounded-btn'],
  ['lg', 'rounded-lg'],
  ['xl', 'rounded-xl'],
  ['card', 'rounded-card'],
  ['2xl', 'rounded-2xl'],
  ['3xl', 'rounded-3xl'],
  ['panel', 'rounded-panel'],
  ['4xl', 'rounded-4xl'],
  ['full', 'rounded-full'],
];

const SHADOWS = [
  ['panel', 'shadow-panel', 'Paneles visuales'],
  ['glow', 'shadow-glow', 'Hover del botón primario'],
  ['terminal', 'shadow-terminal', 'Terminal preview'],
];

const readRadius = ({ borderTopLeftRadius }) => borderTopLeftRadius;

const Radius = ({ radius: [name, cls] }) => {
  const [ref, value] = useComputed(readRadius);
  return html`
    <div class="flex flex-col items-start gap-2">
      <div ref=${ref} class="size-16 border border-line-strong bg-surface-2 ${cls}"></div>
      <strong class="text-xs">${name}</strong>
      <span class="font-mono text-micro text-fg-2">${cls}</span>
      <span class="font-mono text-micro text-fg-3">${value}</span>
    </div>
  `;
};

const Shadow = ({ shadow: [name, cls, usage] }) => html`
  <div class="flex flex-col gap-3">
    <div class="h-24 rounded-card border border-line bg-surface ${cls}"></div>
    <strong class="text-xs">${name}</strong>
    <span class="font-mono text-micro text-fg-2">${cls}</span>
    <span class="text-xs text-fg-3">${usage}</span>
  </div>
`;

export const ShapeSample = () => html`
  <${SampleSection}
    kicker="03 · Foundations"
    title="Radius & sombras"
    description="Radios de controles, cards y paneles. Sombras para superficies protagonistas."
  >
    <${SampleGroup} title="Radius">
      <div class="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        ${RADII.map((radius) => html`<${Radius} radius=${radius} />`)}
      </div>
    <//>
    <${SampleGroup} title="Sombras">
      <div class="grid gap-6 rounded-card bg-bg-soft p-6 sm:grid-cols-3">
        ${SHADOWS.map((shadow) => html`<${Shadow} shadow=${shadow} />`)}
      </div>
    <//>
  <//>
`;

export default ShapeSample;
