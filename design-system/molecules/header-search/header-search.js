import { h } from '@dropins/tools/preact.js';
import { useEffect, useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';

const html = htm.bind(h);

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

function closeResultsOnBlur(event, setIsOpen) {
  if (!event.currentTarget.form.contains(event.relatedTarget)) setIsOpen(false);
}

export default function HeaderSearch({ label = 'Search' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const searchTerm = query.trim();
    if (searchTerm.length < 2) {
      setResults([]);
      setActiveIndex(-1);
      setIsOpen(false);
      setIsLoading(false);
      setHasError(false);
      return undefined;
    }

    let isCurrent = true;
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setHasError(false);
      getSearchPages()
        .then((pages) => {
          if (!isCurrent) return;
          const terms = normalize(searchTerm).split(/\s+/).filter(Boolean);
          const matches = pages.filter((page) => {
            const searchableText = normalize(`${page.title} ${page.description} ${page.path}`);
            return terms.every((term) => searchableText.includes(term));
          });
          setResults(matches.slice(0, 6));
          setActiveIndex(-1);
          setIsOpen(true);
        })
        .catch(() => {
          if (!isCurrent) return;
          setResults([]);
          setHasError(true);
          setIsOpen(true);
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
    }, 160);

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const navigateToResult = (result) => {
    if (result) window.location.assign(result.path);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigateToResult(results[activeIndex] || results[0]);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === 'Escape') {
      if (isOpen) {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(false);
        setActiveIndex(-1);
        setQuery('');
      }
    }
  };

  return html`
    <div class="header-search-trigger relative w-full md:w-80">
      <form role="search" class="relative flex h-11 min-w-0 items-center gap-3 rounded-md border border-line px-3 text-fg-2 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand" onSubmit=${handleSubmit}>
        <span class="icon icon-search size-4 shrink-0" aria-hidden="true"></span>
        <input
          type="search"
          value=${query}
          placeholder=${label}
          aria-label=${label}
          aria-autocomplete="list"
          aria-controls="header-search-results"
          aria-expanded=${isOpen}
          aria-activedescendant=${activeIndex >= 0 ? `header-search-result-${activeIndex}` : null}
          autocomplete="off"
          class="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-2 outline-none"
          onInput=${(event) => setQuery(event.currentTarget.value)}
          onKeyDown=${handleKeyDown}
          onFocus=${() => { if (query.trim().length >= 2) setIsOpen(true); }}
          onBlur=${(event) => closeResultsOnBlur(event, setIsOpen)}
        />
        ${isOpen && html`
          <div id="header-search-results" class="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-md border border-line bg-surface-raised p-1 text-fg shadow-panel" role="listbox" aria-label="Search results">
            ${isLoading && html`<p class="m-0 px-3 py-2 text-sm text-fg-2" role="status">Buscando...</p>`}
            ${!isLoading && hasError && html`<p class="m-0 px-3 py-2 text-sm text-fg-2" role="status">La búsqueda no está disponible temporalmente.</p>`}
            ${!isLoading && !hasError && results.length === 0 && html`<p class="m-0 px-3 py-2 text-sm text-fg-2" role="status">No se encontraron resultados.</p>`}
            ${!isLoading && results.map((result, index) => html`
              <button
                id=${`header-search-result-${index}`}
                type="button"
                role="option"
                aria-selected=${index === activeIndex}
                class="flex w-full flex-col items-start gap-1 rounded-sm px-3 py-2 text-left text-sm text-fg hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none ${index === activeIndex ? 'bg-surface-2' : ''}"
                onMouseDown=${(event) => event.preventDefault()}
                onClick=${() => navigateToResult(result)}
              >
                <span class="font-semibold">${result.title}</span>
                ${result.description && html`<span class="line-clamp-2 text-xs text-fg-2">${result.description}</span>`}
                <span class="text-xs text-fg-3">${result.path}</span>
              </button>
            `)}
          </div>
        `}
      </form>
    </div>
  `;
}
