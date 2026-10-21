import { h } from '@dropins/tools/preact.js';
import { useEffect, useRef, useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import { LANGUAGES, highlight } from './highlight.js';

const html = htm.bind(h);
const COPY_RESET_MS = 2000;

function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      setCopied(false);
    }
  };

  return html`
    <button
      type="button"
      class="m-0 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-terminal-line bg-transparent px-2.5 py-1 font-sans text-xs font-semibold text-terminal-title transition-colors hover:border-terminal-title hover:text-terminal-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      onClick=${copy}
    >
      <span aria-hidden="true">${copied ? '✓' : '⧉'}</span>
      <span>${copied ? 'Copiado' : 'Copiar'}</span>
    </button>
    <span class="sr-only" aria-live="polite">${copied ? 'Código copiado al portapapeles' : ''}</span>
  `;
}

export default function CodeBlock({ code = '', language = 'js', filename = '' }) {
  const label = filename || LANGUAGES[language] || language;

  return html`
    <figure class="m-0 overflow-hidden rounded-xl border border-terminal-line bg-terminal-bg text-terminal-text" data-theme="dark">
      <figcaption class="flex min-h-11 items-center justify-between gap-4 border-b border-terminal-line bg-terminal-topbar py-1.5 pr-2.5 pl-4">
        <span class="flex min-w-0 items-center gap-3">
          <span class="flex shrink-0 gap-1.5" aria-hidden="true">
            <span class="size-2.5 rounded-full bg-terminal-dot-red"></span>
            <span class="size-2.5 rounded-full bg-terminal-dot-yellow"></span>
            <span class="size-2.5 rounded-full bg-terminal-dot-green"></span>
          </span>
          <span class="truncate font-mono text-xs text-terminal-title">${label}</span>
        </span>
        <${CopyButton} code=${code} />
      </figcaption>
      <pre
        class="m-0! overflow-x-auto rounded-none! border-0! bg-transparent! px-5! py-4.5! font-mono text-[13.5px]! leading-code text-terminal-text"
        tabindex="0"
        aria-label=${`Código ${label}`}
      ><code dangerouslySetInnerHTML=${{ __html: highlight(code, language) }}></code></pre>
    </figure>
  `;
}
