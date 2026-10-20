import { h } from '@dropins/tools/preact.js';
import { useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import Eyebrow from '../../atoms/eyebrow/eyebrow.js';
import Button from '../../atoms/button/button.js';

const html = htm.bind(h);
const HEADING_LEVELS = new Set(['h1', 'h2', 'h3']);
const SUCCESS_MESSAGE = '¡Listo! Revisa tu correo para confirmar la suscripción.';
const INPUT_CLASS = 'm-0 h-11 min-w-0 flex-[1_1_220px] rounded-md border border-line-strong bg-surface-input px-3.5 font-sans text-md text-fg placeholder:text-fg-3 focus:border-brand focus:shadow-focus-ring focus:outline-none';

let instance = 0;

export default function Newsletter({
  eyebrow = '',
  title = '',
  titleLevel = 'h2',
  description = '',
  buttonLabel = 'Suscribirme',
  note = '',
}) {
  const [inputId] = useState(() => {
    instance += 1;
    return `newsletter-email-${instance}`;
  });
  const [submitted, setSubmitted] = useState(false);
  const Heading = HEADING_LEVELS.has(titleLevel) ? titleLevel : 'h2';

  const handleSubmit = (event) => {
    event.preventDefault();
    event.currentTarget.reset();
    setSubmitted(true);
  };

  return html`
    <div class="relative isolate grid gap-6 overflow-hidden rounded-4xl border border-line-strong bg-surface-raised px-7 py-10 min-[900px]:grid-cols-[1.2fr_1fr] min-[900px]:items-center min-[900px]:p-14" data-reveal="scale">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(75%_120%_at_0%_0%,color-mix(in_srgb,var(--ds-brand)_20%,transparent),transparent_70%),radial-gradient(75%_120%_at_100%_100%,color-mix(in_srgb,var(--ds-violet)_22%,transparent),transparent_70%)]"
        aria-hidden="true"
      ></div>
      <div class="flex flex-col items-start gap-3">
        <${Eyebrow}>${eyebrow}<//>
        ${title && html`<${Heading} class="m-0! text-h2! font-extrabold! text-fg">${title}<//>`}
        ${description && html`<p class="m-0! text-lead text-fg-2">${description}</p>`}
      </div>
      <form class="flex flex-wrap gap-2.5" onSubmit=${handleSubmit}>
        <label class="sr-only" for=${inputId}>Correo electrónico</label>
        <input
          id=${inputId}
          class=${INPUT_CLASS}
          type="email"
          name="email"
          placeholder="tu@correo.com"
          autocomplete="email"
          required
        />
        <${Button} type="submit" label=${buttonLabel} variant="primary" />
        <p class="m-0! w-full text-sm text-fg-3" role="status">${submitted ? SUCCESS_MESSAGE : note}</p>
      </form>
    </div>
  `;
}
