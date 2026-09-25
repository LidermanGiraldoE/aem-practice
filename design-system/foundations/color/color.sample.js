import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import {
  SampleGroup, SampleSection, ThemeCompare, TokenValue,
} from '../../sample-kit.js';

const html = htm.bind(h);

const COLOR_GROUPS = [
  {
    title: 'Backgrounds',
    tokens: [
      ['bg', 'bg-bg', '--ds-bg'],
      ['bg-soft', 'bg-bg-soft', '--ds-bg-soft'],
      ['bg-sunken', 'bg-bg-sunken', '--ds-bg-sunken'],
    ],
  },
  {
    title: 'Surfaces',
    tokens: [
      ['surface', 'bg-surface', '--ds-surface'],
      ['surface-2', 'bg-surface-2', '--ds-surface-2'],
      ['surface-raised', 'bg-surface-raised', '--ds-surface-raised'],
      ['surface-card', 'bg-surface-card', '--ds-surface-card'],
      ['surface-input', 'bg-surface-input', '--ds-surface-input'],
      ['surface-icon', 'bg-surface-icon', '--ds-surface-icon'],
    ],
  },
  {
    title: 'Text',
    tokens: [
      ['fg', 'text-fg', '--ds-text'],
      ['fg-2', 'text-fg-2', '--ds-text-2'],
      ['fg-3', 'text-fg-3', '--ds-text-3'],
    ],
  },
  {
    title: 'Borders & overlay',
    tokens: [
      ['line', 'border-line', '--ds-line'],
      ['line-strong', 'border-line-strong', '--ds-line-strong'],
      ['overlay', 'bg-overlay/3', '--ds-overlay'],
    ],
  },
  {
    title: 'Brand',
    tokens: [
      ['brand', 'bg-brand', '--ds-brand'],
      ['brand-2', 'text-brand-2', '--ds-brand-2'],
      ['brand-ink', 'text-brand-ink', '--ds-brand-ink'],
      ['violet', 'text-violet', '--ds-violet'],
      ['cyan', 'text-cyan', '--ds-cyan'],
      ['coral', 'text-coral', '--ds-coral'],
    ],
  },
  {
    title: 'Feedback',
    tokens: [
      ['success', 'text-success', '--ds-success'],
      ['warning', 'text-warning', '--ds-warning'],
      ['error', 'text-error', '--ds-error'],
      ['info', 'text-info', '--ds-info'],
    ],
  },
  {
    title: 'Gradients',
    tokens: [
      ['gradient-brand', 'var(--ds-gradient-brand)', '--ds-gradient-brand'],
      ['gradient-brand-mark', 'var(--ds-gradient-brand-mark)', '--ds-gradient-brand-mark'],
      ['gradient-accent', 'var(--ds-gradient-accent)', '--ds-gradient-accent'],
    ],
  },
];

const TERMINAL_TOKENS = [
  ['terminal-bg', 'bg-terminal-bg', '--ds-terminal-bg'],
  ['terminal-topbar', 'bg-terminal-topbar', '--ds-terminal-topbar'],
  ['terminal-line', 'border-terminal-line', '--ds-terminal-line'],
  ['terminal-text', 'text-terminal-text', '--ds-terminal-text'],
  ['terminal-title', 'text-terminal-title', '--ds-terminal-title'],
  ['terminal-comment', 'text-terminal-comment', '--ds-terminal-comment'],
  ['terminal-prompt', 'text-terminal-prompt', '--ds-terminal-prompt'],
  ['terminal-command', 'text-terminal-command', '--ds-terminal-command'],
  ['terminal-key', 'text-terminal-key', '--ds-terminal-key'],
  ['terminal-success', 'text-terminal-success', '--ds-terminal-success'],
  ['terminal-dot-red', 'bg-terminal-dot-red', '--ds-terminal-dot-red'],
  ['terminal-dot-yellow', 'bg-terminal-dot-yellow', '--ds-terminal-dot-yellow'],
  ['terminal-dot-green', 'bg-terminal-dot-green', '--ds-terminal-dot-green'],
  ['syntax-violet', 'text-syntax-violet', '--ds-syntax-violet'],
  ['syntax-blue', 'text-syntax-blue', '--ds-syntax-blue'],
  ['syntax-mint', 'text-syntax-mint', '--ds-syntax-mint'],
  ['syntax-yellow', 'text-syntax-yellow', '--ds-syntax-yellow'],
];

const Swatch = ({ token: [name, utility, cssVar] }) => html`
  <div class="overflow-hidden rounded-lg border border-line bg-surface-card">
    <div class="h-14 border-b border-line" style=${{ background: `var(${cssVar})` }}></div>
    <div class="flex flex-col gap-0.5 p-3">
      <strong class="text-xs text-fg">${name}</strong>
      <span class="font-mono text-micro text-fg-2">${utility}</span>
      <${TokenValue} cssVar=${cssVar} />
    </div>
  </div>
`;

const SwatchGrid = ({ tokens, className = 'sm:grid-cols-3' }) => html`
  <div class="grid grid-cols-2 gap-3 ${className}">
    ${tokens.map((token) => html`<${Swatch} token=${token} />`)}
  </div>
`;

export const ColorSample = () => html`
  <${SampleSection}
    kicker="01 · Foundations"
    title="Color"
    description="Tokens semánticos por tema. Cada valor se lee en vivo desde tokens.css."
  >
    <${ThemeCompare} render=${() => COLOR_GROUPS.map(({ title, tokens }) => html`
      <${SampleGroup} title=${title}><${SwatchGrid} tokens=${tokens} /><//>
    `)} />
    <${SampleGroup} title="Terminal & syntax · siempre oscuro">
      <div data-theme="dark" class="rounded-card border border-terminal-line bg-terminal-bg p-5">
        <${SwatchGrid} tokens=${TERMINAL_TOKENS} className="sm:grid-cols-3 lg:grid-cols-4" />
      </div>
    <//>
  <//>
`;

export default ColorSample;
