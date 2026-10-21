import { h } from '@dropins/tools/preact.js';
import { useId, useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';

const html = htm.bind(h);

const LINK_CLASS = 'block rounded-md px-3 py-1.5 text-sm leading-snug text-fg-2! no-underline! transition-colors hover:bg-surface-overlay hover:text-fg! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[current=page]:bg-brand/10 aria-[current=page]:font-semibold aria-[current=page]:text-brand!';

function filterGroups(groups, query) {
  const term = query.trim().toLowerCase();
  if (!term) return groups;
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => `${group.title} ${item.title}`.toLowerCase().includes(term)),
    }))
    .filter((group) => group.items.length);
}

export default function DocsSidebar({ groups = [], currentPath = '' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const visible = filterGroups(groups, query);

  if (!groups.length) return null;

  const onInput = (event) => setQuery(event.currentTarget.value);

  return html`
    <nav aria-label="Documentación">
      <button
        type="button"
        class="m-0 flex w-full cursor-pointer items-center justify-between rounded-md border border-line bg-surface-raised px-4 py-3 font-sans text-md font-semibold text-fg lg:hidden"
        aria-expanded=${open}
        aria-controls=${panelId}
        onClick=${() => setOpen(!open)}
      >
        <span>Menú de documentación</span>
        <span aria-hidden="true">${open ? '✕' : '☰'}</span>
      </button>
      <div id=${panelId} class="flex flex-col gap-6 ${open ? 'mt-4' : 'max-lg:hidden'}">
        <input
          type="search"
          value=${query}
          placeholder="Filtrar temas…"
          aria-label="Filtrar documentación"
          class="m-0 h-10 w-full rounded-md border border-line-strong bg-surface-input px-3 font-sans text-sm text-fg placeholder:text-fg-3 focus:border-brand focus:shadow-focus-ring focus:outline-none"
          onInput=${onInput}
        />
        ${visible.map((group) => html`
          <div key=${group.title}>
            ${group.title && html`
              <p class="m-0! mb-2! px-3 text-xs font-bold tracking-wider text-fg-3 uppercase">${group.title}</p>
            `}
            <ul class="m-0 flex list-none flex-col gap-0.5 p-0">
              ${group.items.map((item) => html`
                <li key=${item.href}>
                  <a href=${item.href} class=${LINK_CLASS} aria-current=${item.path === currentPath ? 'page' : null}>${item.title}</a>
                </li>
              `)}
            </ul>
          </div>
        `)}
        ${!visible.length && html`<p class="m-0! px-3 text-sm text-fg-3" role="status">Sin resultados para “${query.trim()}”.</p>`}
      </div>
    </nav>
  `;
}
