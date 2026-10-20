import { h } from '@dropins/tools/preact.js';
import { useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import Avatar from '../../atoms/avatar/avatar.js';

const html = htm.bind(h);

const SHARE_CLASS = 'm-0 inline-flex min-h-8.5 cursor-pointer items-center rounded-[9px] border border-[var(--ds-button-secondary-border)] bg-[var(--ds-button-secondary-bg)] px-3 font-sans text-sm font-bold text-fg! no-underline! hover:border-[var(--ds-button-secondary-border-hover)] hover:bg-[var(--ds-button-secondary-bg-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

export default function ArticleFooter({
  tags = [],
  url = '',
  title = '',
  author = null,
}) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return html`
    <div class="grid max-w-[720px] gap-6 border-t border-line pt-8">
      ${tags.length > 0 && html`
        <ul class="m-0! flex list-none flex-wrap gap-1.5 p-0" aria-label="Etiquetas">
          ${tags.map((tag) => html`
            <li key=${tag} class="m-0 rounded-[7px] border border-line bg-overlay/4 px-2.5 py-0.75 text-xs font-semibold text-fg-2">#${tag}</li>
          `)}
        </ul>
      `}

      <div class="flex flex-wrap items-center gap-2">
        <span class="text-fg-3">Compartir:</span>
        <a class=${SHARE_CLASS} href=${`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a class=${SHARE_CLASS} href=${`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">X</a>
        <button type="button" class=${SHARE_CLASS} onClick=${copyLink}>${copied ? 'Enlace copiado ✓' : 'Copiar enlace'}</button>
        <span class="sr-only" aria-live="polite">${copied ? 'Enlace copiado' : ''}</span>
      </div>

      ${author && html`
        <div class="flex items-start gap-4.5 rounded-card border border-line bg-surface-card p-6">
          <${Avatar} name=${author.name} image=${author.image} size="lg" />
          <div>
            <a href=${author.href} class="font-bold text-fg! no-underline! hover:underline!">${author.name}</a>
            ${author.role && html`<p class="m-0! text-sm text-fg-3">${author.role}</p>`}
            ${author.bio && html`<p class="m-0! mt-1.5! text-md text-fg-2">${author.bio}</p>`}
          </div>
        </div>
      `}
    </div>
  `;
}
