import { h } from '@dropins/tools/preact.js';
import { useEffect, useRef, useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import PostCard from '../../molecules/post-card/post-card.js';

const html = htm.bind(h);

const CHIP_CLASS = 'm-0 inline-flex min-h-8.5 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 font-sans text-sm font-semibold text-fg-2 transition-colors duration-[var(--ds-motion-fast)] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-pressed:border-brand/45 aria-pressed:bg-brand/14 aria-pressed:text-brand';
const PAGE_CLASS = 'm-0 grid h-9.5 min-w-9.5 cursor-pointer place-items-center rounded-md border border-line bg-transparent px-2.5 font-sans text-md font-semibold text-fg-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default disabled:opacity-40 aria-[current=page]:border-transparent aria-[current=page]:bg-brand aria-[current=page]:text-brand-ink';

function normalize(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function BlogList({
  posts = [],
  categories = {},
  title = '',
  pageSize = 9,
  initial = {},
  onStateChange,
}) {
  const listRef = useRef(null);
  const [category, setCategory] = useState(categories[initial.category] ? initial.category : 'all');
  const [query, setQuery] = useState(initial.query || '');
  const [page, setPage] = useState(Math.max(Number(initial.page) || 1, 1));

  const term = normalize(query.trim());
  const filtered = posts.filter((post) => {
    const matchesCategory = category === 'all' || post.category === category;
    const text = normalize(`${post.title} ${post.description} ${categories[post.category]?.label || ''}`);
    return matchesCategory && (!term || text.includes(term));
  });
  const pageCount = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const chips = Object.entries(categories)
    .map(([value, meta]) => ({
      value,
      ...meta,
      count: posts.filter((post) => post.category === value).length,
    }))
    .filter((chip) => chip.count > 0);

  useEffect(() => {
    onStateChange?.({ category, query: query.trim(), page: currentPage });
  }, [category, query, currentPage]);

  const selectCategory = (value) => {
    setCategory(value);
    setPage(1);
  };
  const handleSearch = (event) => {
    setQuery(event.currentTarget.value);
    setPage(1);
  };
  const goToPage = (value) => {
    setPage(value);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const content = visible.length
    ? html`
      <ul class="m-0! grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
        ${visible.map((post) => html`
          <li key=${post.path} class="m-0">
            <${PostCard} post=${post} category=${categories[post.category] || {}} />
          </li>
        `)}
      </ul>
    `
    : html`
      <div class="rounded-card border border-dashed border-line-strong px-6 py-12 text-center text-fg-2">
        <p class="m-0! font-bold text-fg">No encontramos artículos con ese filtro.</p>
        <p class="m-0! mt-1! text-fg-3">Prueba otra categoría o busca con menos palabras.</p>
      </div>
    `;

  return html`
    <div ref=${listRef} class="scroll-mt-28">
      <div class="mb-7 flex flex-wrap items-end justify-between gap-3">
        ${title && html`<h2 class="m-0! text-h2! font-extrabold! text-fg">${title}</h2>`}
        <p class="m-0! text-fg-3" aria-live="polite">${filtered.length} ${filtered.length === 1 ? 'artículo' : 'artículos'}</p>
      </div>

      <div class="mb-7 flex flex-wrap items-center justify-between gap-3.5">
        <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          <button type="button" class=${CHIP_CLASS} aria-pressed=${category === 'all'} onClick=${() => selectCategory('all')}>
            Todos <span class="font-medium text-fg-3">${posts.length}</span>
          </button>
          ${chips.map((chip) => html`
            <button key=${chip.value} type="button" class=${CHIP_CLASS} aria-pressed=${category === chip.value} onClick=${() => selectCategory(chip.value)}>
              ${chip.label} <span class="font-medium text-fg-3">${chip.count}</span>
            </button>
          `)}
        </div>
        <input
          type="search"
          value=${query}
          placeholder="Buscar artículos…"
          aria-label="Buscar artículos"
          class="m-0 h-10.5 w-full rounded-md border border-line-strong bg-surface-input px-3.5 font-sans text-md text-fg placeholder:text-fg-3 focus:border-brand focus:shadow-focus-ring focus:outline-none sm:max-w-70"
          onInput=${handleSearch}
        />
      </div>

      ${content}

      ${pageCount > 1 && html`
        <nav class="mt-11 flex justify-center gap-1.5" aria-label="Paginación">
          <button type="button" class=${PAGE_CLASS} aria-label="Página anterior" disabled=${currentPage === 1} onClick=${() => goToPage(currentPage - 1)}>←</button>
          ${Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => html`
            <button
              key=${number}
              type="button"
              class=${PAGE_CLASS}
              aria-label=${`Página ${number}`}
              aria-current=${number === currentPage ? 'page' : null}
              onClick=${() => goToPage(number)}
            >${number}</button>
          `)}
          <button type="button" class=${PAGE_CLASS} aria-label="Página siguiente" disabled=${currentPage === pageCount} onClick=${() => goToPage(currentPage + 1)}>→</button>
        </nav>
      `}
    </div>
  `;
}
