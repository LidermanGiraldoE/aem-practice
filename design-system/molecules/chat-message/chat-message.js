import { h } from '@dropins/tools/preact.js';
import { useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import CodeBlock from '../code-block/code-block.js';

const html = htm.bind(h);

const CODE_CLASS = 'rounded-xs border border-line bg-surface-2 px-1.5 py-px font-mono text-[0.88em] text-fg';

// answers mark code with backticks: `decorate(block)`
function withCode(text = '') {
  return text.split(/`([^`]+)`/).map((part, index) => (index % 2 ? html`<code class=${CODE_CLASS}>${part}</code>` : part));
}

export function ChatAvatar({ size = 'md' }) {
  const sizes = { md: 'size-8 rounded-[10px] text-[15px]', lg: 'size-14 rounded-2xl text-[26px]' };
  return html`
    <span class="grid shrink-0 place-items-center bg-[linear-gradient(135deg,var(--ds-brand),var(--ds-cyan))] font-extrabold text-brand-ink ${sizes[size] || sizes.md}" aria-hidden="true">✦</span>
  `;
}

function Feedback() {
  const [vote, setVote] = useState('');
  const options = [['yes', '✓ Me sirvió'], ['no', '✕ No me sirvió']];

  return html`
    <div class="-ml-2 flex gap-1" role="group" aria-label="¿Te sirvió esta respuesta?">
      ${options.map(([value, label]) => html`
        <button
          key=${value}
          type="button"
          class="cursor-pointer rounded-[9px] border-0 bg-transparent px-2 py-1.5 text-sm font-bold transition-colors hover:bg-overlay/5 focus-visible:outline-2 focus-visible:outline-brand ${vote === value ? 'text-brand' : 'text-fg-3 hover:text-fg'}"
          aria-pressed=${vote === value}
          onClick=${() => setVote(value)}
        >${label}</button>
      `)}
    </div>
  `;
}

/**
 * A visitor question (`text`) or an assistant answer (`answer`) with the shape
 * { text: [paragraphs], code: { code, language, filename }, outro: [paragraphs],
 *   sources: [{ label, href }] }
 */
export default function ChatMessage({ role = 'user', text = '', answer = null }) {
  if (role === 'user') {
    return html`
      <div class="flex justify-end">
        <p class="m-0! max-w-[80%] whitespace-pre-wrap rounded-[16px_16px_4px_16px] border border-brand/28 bg-brand/10 px-4 py-2.5 text-[15px] text-fg">${text}</p>
      </div>
    `;
  }

  const {
    text: paragraphs = [], code = null, outro = [], sources = [],
  } = answer || {};

  return html`
    <div class="flex gap-3">
      <${ChatAvatar} />
      <div class="flex min-w-0 flex-1 flex-col gap-3 pt-1 text-[15px] leading-relaxed text-fg-2">
        ${paragraphs.map((paragraph, index) => html`<p key=${`p${index}`} class="m-0!">${withCode(paragraph)}</p>`)}
        ${code && html`<${CodeBlock} ...${code} />`}
        ${outro.map((paragraph, index) => html`<p key=${`o${index}`} class="m-0!">${withCode(paragraph)}</p>`)}
        ${sources.length > 0 && html`
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span class="font-semibold text-fg-3">Fuentes</span>
            ${sources.map((source) => html`
              <a key=${source.href} href=${source.href} class="rounded-full border border-line-strong px-2.5 py-0.5 font-semibold text-fg-2! no-underline! hover:border-brand hover:text-brand!">${source.label}</a>
            `)}
          </div>
        `}
        <${Feedback} />
      </div>
    </div>
  `;
}
