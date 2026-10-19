import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

export default function TerminalPreview({
  title,
  contentHtml,
  status,
  statusDetail,
}) {
  if (!title && !contentHtml && !status && !statusDetail) return null;

  return html`
    <div class="hero-terminal relative w-full overflow-hidden rounded-xl border border-terminal-line bg-terminal-bg text-terminal-text shadow-terminal">
      <div class="hero-terminal-topbar flex min-h-14 items-center gap-5 border-b border-terminal-line bg-terminal-topbar px-5">
        <div class="flex shrink-0 items-center gap-2.5" aria-hidden="true">
          <span class="size-3 rounded-full bg-terminal-dot-red"></span>
          <span class="size-3 rounded-full bg-terminal-dot-yellow"></span>
          <span class="size-3 rounded-full bg-terminal-dot-green"></span>
        </div>
        <span class="min-w-0 truncate font-mono text-xs text-terminal-title md:text-sm">${title}</span>
      </div>
      <div
        class="hero-terminal-content min-w-0 overflow-x-auto px-5 py-6 font-mono text-xs leading-code md:px-9 md:py-8 md:text-code"
        dangerouslySetInnerHTML=${{ __html: contentHtml || '' }}
      ></div>
      ${(status || statusDetail) && html`
        <div class="hero-terminal-status flex flex-col gap-2 border-t border-terminal-line px-5 py-4 text-xs text-terminal-title md:flex-row md:items-center md:justify-between md:px-9">
          ${status && html`<span class="text-terminal-success">${status}</span>`}
          ${statusDetail && html`<span>${statusDetail}</span>`}
        </div>
      `}
    </div>
  `;
}
