import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import { FoundationsSamples } from './foundations.samples.js';
import { AtomsSamples } from './atoms.samples.js';

const html = htm.bind(h);

/**
 * DsArchitecture - Main component for the AEM Forge Design System showcase
 */
export const DsArchitecture = () => html`
  <div class="flex flex-col">
    <div class="flex flex-col items-start gap-5 pb-10">
      <span class="inline-flex items-center gap-2 rounded-full border border-brand/22 bg-brand/7 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-2">
        <span class="size-1.5 rounded-full bg-brand"></span>
        Visual reference · foundations
      </span>
      <h2 class="m-0! text-h1! font-extrabold!">AEM Forge Design System</h2>
      <p class="m-0! max-w-prose text-lead text-fg-2">
        Referencia centralizada de los tokens implementados: color, tipografía, radius, sombras, layout, motion y botones, en Dark y Light.
      </p>
    </div>
    <${FoundationsSamples} />
    <${AtomsSamples} />
  </div>
`;

export default DsArchitecture;
