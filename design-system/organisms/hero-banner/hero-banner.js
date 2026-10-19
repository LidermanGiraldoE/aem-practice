import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Eyebrow from '../../atoms/eyebrow/eyebrow.js';
import Button from '../../atoms/button/button.js';
import TerminalPreview from '../../molecules/terminal-preview/terminal-preview.js';

const html = htm.bind(h);

export default function HeroBanner({
  eyebrow,
  copyHtml,
  actions = [],
  terminal,
}) {
  return html`
    <section class="hero-banner-scene relative isolate flex items-center overflow-hidden border-b border-line bg-bg text-fg">
      <div class="hero-banner-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <div class="hero-banner-content relative z-10 mx-auto flex flex-col items-center py-section text-center">
        <div class="hero-banner-copy flex w-full flex-col items-center text-center">
          <${Eyebrow}>${eyebrow}<//>
          ${copyHtml && html`
            <div class="hero-banner-copy-richtext" dangerouslySetInnerHTML=${{ __html: copyHtml }}></div>
          `}
          ${actions.length > 0 && html`
            <div class="hero-actions flex w-full flex-wrap items-center justify-center gap-3">
              ${actions.map((action, index) => html`
                <${Button}
                  key=${action.href + action.label + index}
                  href=${action.href}
                  label=${action.label}
                  title=${action.title}
                  variant=${action.variant}
                  icon=${action.icon}
                />
              `)}
            </div>
          `}
        </div>
        ${terminal && html`
          <div class="hero-banner-preview w-full">
            <${TerminalPreview}
              title=${terminal.title}
              contentHtml=${terminal.contentHtml}
              status=${terminal.status}
              statusDetail=${terminal.statusDetail}
            />
          </div>
        `}
      </div>
    </section>
  `;
}
