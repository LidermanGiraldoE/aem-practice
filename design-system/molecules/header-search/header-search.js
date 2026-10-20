import { h } from '@dropins/tools/preact.js';
import { useEffect, useRef, useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';

const html = htm.bind(h);
const MAX_RESULTS = 8;

let searchPagesPromise;

function getSearchPages() {
  if (!searchPagesPromise) {
    searchPagesPromise = fetch('/query-index.json?limit=1000')
      .then((response) => {
        if (!response.ok) throw new Error('Search index could not be loaded');
        return response.json();
      })
      .then(({ data = [] }) => data
        .filter((page) => page.path && !page.robots?.includes('noindex'))
        .filter((page) => !['/nav', '/footer'].includes(page.path))
        .map((page) => {
          const pathName = page.path.split('/').filter(Boolean).pop() || 'Home';
          const title = page.title?.trim() || pathName.replaceAll('-', ' ');
          return {
            path: page.path,
            title,
            description: page.description?.trim() || '',
          };
        }));
    searchPagesPromise = searchPagesPromise.catch((error) => {
      searchPagesPromise = null;
      throw error;
    });
  }
  return searchPagesPromise;
}

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function filterPages(pages, query) {
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return pages
    .filter((page) => {
      const searchableText = normalize(`${page.title} ${page.description} ${page.path}`);
      return terms.every((term) => searchableText.includes(term));
    })
    .slice(0, MAX_RESULTS);
}

const Kbd = ({ children, className = '' }) => html`
  <kbd class="rounded-xs border border-b-2 border-line-strong bg-surface px-1.5 py-0.75 font-mono text-[11px] font-semibold leading-none text-fg-3 ${className}">${children}</kbd>
`;

export default function HeaderSearch({ label = 'Buscar…', fluid = false }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [pages, setPages] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const results = pages ? filterPages(pages, query) : [];

  const open = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery('');
    setActiveIndex(0);
    dialog.showModal();
    inputRef.current?.focus();
    getSearchPages()
      .then((data) => {
        setPages(data);
        setHasError(false);
      })
      .catch(() => setHasError(true));
  };

  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const onKeyDown = (event) => {
      const typing = event.target.isContentEditable
        || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
      if (event.key !== '/' || typing || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      open();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleInput = (event) => {
    setQuery(event.currentTarget.value);
    setActiveIndex(0);
  };

  const handleKeyDown = (event) => {
    // a search input swallows the first Escape to clear itself
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      window.location.assign(results[activeIndex]?.path || results[0].path);
    }
  };

  let status = '';
  if (hasError) status = 'La búsqueda no está disponible temporalmente.';
  else if (!pages) status = 'Buscando…';
  else if (!results.length) status = 'Sin resultados. Prueba con otra palabra.';

  return html`
    <div class="header-search-trigger relative w-full ${fluid ? 'min-w-0' : 'md:w-80'}">
      <button
        type="button"
        class="m-0 flex h-header-control w-full min-w-0 cursor-pointer items-center gap-3 rounded-md border border-line bg-transparent px-2.5 text-left font-sans text-fg-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-haspopup="dialog"
        onClick=${open}
      >
        <img src="/icons/search.svg" alt="" class="header-search-icon size-4 shrink-0" />
        <span class="min-w-34 flex-1 truncate text-sm text-fg-2">${label}</span>
      </button>
    </div>

    <dialog
      ref=${dialogRef}
      class="mx-auto mt-[12vh] w-[min(640px,calc(100%-32px))] overflow-hidden rounded-2xl border border-line-strong bg-surface p-0 text-fg shadow-panel backdrop:bg-black/55 backdrop:backdrop-blur-sm"
      aria-label=${label}
      onClick=${(event) => { if (event.target === dialogRef.current) close(); }}
    >
      <input
        ref=${inputRef}
        type="search"
        role="combobox"
        value=${query}
        placeholder="Buscar guías, documentación, artículos…"
        aria-label=${label}
        aria-autocomplete="list"
        aria-expanded=${results.length > 0}
        aria-controls="header-search-results"
        aria-activedescendant=${results.length ? `header-search-result-${activeIndex}` : null}
        autocomplete="off"
        class="m-0 h-14.5 w-full border-0 border-b border-line bg-transparent px-5 font-sans text-base text-fg outline-none placeholder:text-fg-3"
        onInput=${handleInput}
        onKeyDown=${handleKeyDown}
      />
      <ul id="header-search-results" role="listbox" aria-label="Resultados" class="m-0! max-h-[50vh] list-none overflow-y-auto p-2">
        ${results.map((result, index) => html`
          <li key=${result.path} role="presentation" class="m-0">
            <a
              id=${`header-search-result-${index}`}
              role="option"
              aria-selected=${index === activeIndex}
              href=${result.path}
              class="flex flex-col gap-0.5 rounded-md px-3 py-2.5 font-semibold text-fg! no-underline! hover:bg-brand/10 focus-visible:bg-brand/10 focus-visible:outline-none ${index === activeIndex ? 'bg-brand/10' : ''}"
              onMouseEnter=${() => setActiveIndex(index)}
            >
              ${result.title}
              <small class="line-clamp-1 text-sm font-medium text-fg-3">${result.description || result.path}</small>
            </a>
          </li>
        `)}
      </ul>
      ${status && html`<p class="m-0! px-7 pb-7 text-center text-fg-3" role="status">${status}</p>`}
      <div class="flex gap-4 border-t border-line px-4 py-2.5 text-xs text-fg-3">
        <span><${Kbd}>Esc<//> cerrar</span>
        <span><${Kbd}>/<//> buscar</span>
      </div>
    </dialog>
  `;
}
