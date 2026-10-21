import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Eyebrow from '../../atoms/eyebrow/eyebrow.js';
import Button from '../../atoms/button/button.js';
import ProgressRing from '../../atoms/progress-ring/progress-ring.js';

const html = htm.bind(h);

const LINK_CLASS = 'text-fg-2! no-underline! hover:text-fg! hover:underline!';
const CRUMB_CLASS = "before:mr-2 before:text-line-strong before:content-['/']";
const CARD_CLASS = 'flex flex-col gap-5 rounded-panel border border-line-strong bg-surface-card p-7 shadow-panel';
const LABEL_CLASS = 'm-0! text-xs font-bold tracking-wide text-fg-3 uppercase';

function ProgressCard({ progress }) {
  return html`
    <aside class=${CARD_CLASS} aria-labelledby="learn-hero-progress">
      <div class="flex items-center gap-5">
        <${ProgressRing} percent=${progress.percent} />
        <div class="min-w-0">
          <p class=${LABEL_CLASS} id="learn-hero-progress">Continúa donde lo dejaste</p>
          <p class="m-0! mt-1.5! text-xl font-bold text-fg">${progress.title}</p>
          ${progress.detail && html`<p class="m-0! text-md text-fg-3">${progress.detail}</p>`}
        </div>
      </div>
      ${progress.next && html`
        <a
          href=${progress.next.href}
          class="block rounded-xl border border-brand/30 bg-brand/7 px-4 py-3.5 text-md font-bold text-fg! no-underline! hover:border-brand hover:text-fg! hover:no-underline!"
        >
          <span class="block text-xs font-semibold text-fg-3">Siguiente paso</span>
          ${progress.next.label}
        </a>
      `}
    </aside>
  `;
}

function StartCard({ start }) {
  return html`
    <aside class=${CARD_CLASS} aria-labelledby="learn-hero-start">
      <div class="flex flex-col gap-1.5">
        ${start.eyebrow && html`<p class=${LABEL_CLASS}>${start.eyebrow}</p>`}
        <p class="m-0! text-xl font-bold text-fg" id="learn-hero-start">${start.title}</p>
        ${start.text && html`<p class="m-0! text-md text-fg-2">${start.text}</p>`}
      </div>
      ${start.action && html`
        <${Button} ...${start.action} variant="primary" icon="arrow-right" className="gap-2 self-start" />
      `}
    </aside>
  `;
}

/**
 * Learning hub hero. The authored heading and lead are moved into [data-learn-hero-copy]
 * after render; the card shows the visitor's progress, or the start card for a new visitor.
 */
export default function LearnHero({
  eyebrow = '',
  breadcrumb = [],
  actions = [],
  progress = null,
  start = null,
}) {
  const showStart = !progress && start?.title;

  return html`
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
      <div class="flex flex-col items-start gap-4.5">
        ${breadcrumb.length > 0 && html`
          <nav aria-label="Ruta de navegación">
            <ol class="m-0! flex list-none flex-wrap gap-2 p-0 text-sm text-fg-3">
              ${breadcrumb.map((crumb, index) => html`
                <li class=${index ? CRUMB_CLASS : ''} aria-current=${crumb.href ? null : 'page'}>
                  ${crumb.href ? html`<a href=${crumb.href} class=${LINK_CLASS}>${crumb.label}</a>` : crumb.label}
                </li>
              `)}
            </ol>
          </nav>
        `}
        <${Eyebrow} variant="signal">${eyebrow}<//>
        <div class="learn-hero-copy flex flex-col gap-4.5" data-learn-hero-copy></div>
        ${actions.length > 0 && html`
          <div class="mt-2 flex flex-wrap gap-3">
            ${actions.map((action) => html`<${Button} ...${action} className="gap-2" />`)}
          </div>
        `}
      </div>
      ${progress && html`<${ProgressCard} progress=${progress} />`}
      ${showStart && html`<${StartCard} start=${start} />`}
    </div>
  `;
}
