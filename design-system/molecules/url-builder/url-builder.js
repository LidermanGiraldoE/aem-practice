import { h } from '@dropins/tools/preact.js';
import { useEffect, useRef, useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import Badge from '../../atoms/badge/badge.js';

const html = htm.bind(h);
const COPY_RESET_MS = 1600;
const HOST_PATTERN = /^([a-z0-9-]+)--([a-z0-9-]+)--([a-z0-9-]+)\.aem\.(?:page|live)$/;

const ENVIRONMENTS = [
  { id: 'page', label: 'Preview', tone: 'cyan' },
  { id: 'live', label: 'Live', tone: 'success' },
];

const FIELDS = [
  { name: 'owner', label: 'Organización', placeholder: 'mi-organizacion' },
  { name: 'repo', label: 'Repositorio', placeholder: 'mi-repositorio' },
  { name: 'branch', label: 'Rama', placeholder: 'main' },
  { name: 'path', label: 'Ruta', placeholder: '/' },
];

// branch, repository and owner become a single DNS label: lowercase, anything else is a hyphen
export function toSlug(value = '') {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function buildUrl({
  owner, repo, branch, path,
}, environment) {
  const host = [toSlug(branch) || 'main', toSlug(repo), toSlug(owner)].join('--');
  return `https://${host}.aem.${environment}/${path.trim().replace(/^\/+/, '')}`;
}

// start from the site the visitor is on when it is a preview or live URL
function initialValues() {
  const [, branch = 'main', repo = '', owner = ''] = window.location.hostname.match(HOST_PATTERN) || [];
  return {
    owner, repo, branch, path: '/',
  };
}

function CopyButton({ value, disabled }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      setCopied(false);
    }
  };

  return html`
    <button type="button" class="button secondary min-h-8.5! shrink-0 px-3! text-sm!" disabled=${disabled} onClick=${copy}>
      ${copied ? 'Copiado ✓' : 'Copiar'}
    </button>
    <span class="sr-only" aria-live="polite">${copied ? 'URL copiada al portapapeles' : ''}</span>
  `;
}

/**
 * Preview and live URLs for any branch, repository and organization.
 */
export default function UrlBuilder({ id = 'url-builder' }) {
  const [values, setValues] = useState(initialValues);
  const ready = Boolean(toSlug(values.owner) && toSlug(values.repo));

  const update = (name) => (event) => setValues({ ...values, [name]: event.currentTarget.value });

  const rows = ENVIRONMENTS.map((environment) => {
    const url = ready ? buildUrl(values, environment.id) : '';
    const value = url
      ? html`<a class="truncate font-mono text-sm text-fg! no-underline! hover:text-brand!" href=${url} target="_blank" rel="noopener">${url}</a>`
      : html`<span class="truncate text-sm text-fg-3">Completa organización y repositorio</span>`;
    return html`
      <li key=${environment.id} class="m-0 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-line bg-surface-input px-3.5 py-3">
        <${Badge} tone=${environment.tone}>${environment.label}<//>
        ${value}
        <${CopyButton} value=${url} disabled=${!url} />
      </li>
    `;
  });

  return html`
    <div class="flex flex-col gap-5">
      <div class="grid gap-3.5 sm:grid-cols-2">
        ${FIELDS.map((field) => html`
          <label key=${field.name} class="flex flex-col gap-1.5 text-sm font-semibold text-fg-2" for=${`${id}-${field.name}`}>
            ${field.label}
            <input
              id=${`${id}-${field.name}`}
              class="h-10.5 w-full rounded-btn border border-line-strong bg-surface-input px-3.5 font-mono text-sm text-fg placeholder:text-fg-3 focus-visible:border-brand focus-visible:outline-none"
              value=${values[field.name]}
              placeholder=${field.placeholder}
              autocomplete="off"
              spellcheck="false"
              onInput=${update(field.name)}
            />
          </label>
        `)}
      </div>
      <ul class="m-0! grid list-none gap-2.5 p-0">${rows}</ul>
      <p class="m-0! text-sm text-fg-3">La rama se normaliza: minúsculas y cualquier carácter distinto de letras o números se convierte en guion.</p>
    </div>
  `;
}
