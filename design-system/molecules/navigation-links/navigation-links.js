import { h } from '@dropins/tools/preact.js';
import {
  useEffect, useId, useRef, useState,
} from '@dropins/tools/preact-hooks.js';
import htm from 'htm';

const html = htm.bind(h);

// submenu columns share the panel width equally; extra items wrap to a new row
const MAX_COLUMNS = 4;

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';
const controlClass = `inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-fg-2 !no-underline transition-colors hover:bg-surface-overlay hover:text-fg focus-visible:text-fg ${focusClass}`;
const buttonClass = `${controlClass} cursor-pointer bg-transparent [font:inherit]`;
const currentClass = '!text-fg relative after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand';

function normalizePath(pathname) {
  return pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
}

// a top-level link is current on its own page and on every page below it
function isCurrentSection(href, currentPath) {
  if (!href || href.startsWith('#')) return false;
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  const linkPath = normalizePath(url.pathname);
  if (linkPath === '/') return currentPath === '/';
  return currentPath === linkPath || currentPath.startsWith(`${linkPath}/`);
}

function Chevron({ open }) {
  return html`
    <span
      aria-hidden="true"
      class="inline-block size-1.5 border-r-[1.5px] border-b-[1.5px] border-current transition-transform duration-300 motion-reduce:transition-none ${open ? 'translate-y-0.5 -rotate-135' : '-translate-y-0.5 rotate-45'}"
    ></span>
  `;
}

function DeepLinks({ items }) {
  return html`
    <ul class="m-0 mb-1 ml-[3px] flex list-none flex-col gap-0.5 border-l border-line p-0 pl-3">
      ${items.map((item) => html`
        <li key=${item.index} data-nav-index=${item.index}>
          ${item.href
    ? html`<a href=${item.href} title=${item.title || null} class="-mx-2 flex rounded-md px-2 py-1.5 text-sm !text-fg-3 !no-underline transition-colors hover:bg-surface-overlay hover:!text-fg ${focusClass}">${item.label}</a>`
    : html`<span class="flex py-1.5 text-sm font-semibold text-fg-2">${item.label}</span>`}
          ${item.children.length ? html`<${DeepLinks} items=${item.children} />` : null}
        </li>
      `)}
    </ul>
  `;
}

function SubLinks({ items }) {
  return html`
    <ul class="m-0 mt-4 flex list-none flex-col gap-0.5 p-0">
      ${items.map((item) => html`
        <li key=${item.index} data-nav-index=${item.index}>
          ${item.href
    ? html`
              <a href=${item.href} title=${item.title || null} class="group/link -mx-2 flex items-center gap-2.5 rounded-md px-2 py-1.5 text-md font-medium !text-fg-2 !no-underline transition-colors hover:bg-surface-overlay hover:!text-fg ${focusClass}">
                <span aria-hidden="true" class="size-1.5 shrink-0 rounded-full bg-brand"></span>
                <span class="flex-1">${item.label}</span>
                <span aria-hidden="true" class="-translate-x-1 text-fg-3 opacity-0 transition motion-reduce:transition-none group-hover/link:translate-x-0 group-hover/link:opacity-100">→</span>
              </a>`
    : html`<span class="flex pt-2 pb-1 text-xs font-semibold tracking-wider text-fg-3 uppercase">${item.label}</span>`}
          ${item.children.length ? html`<${DeepLinks} items=${item.children} />` : null}
        </li>
      `)}
    </ul>
  `;
}

function Column({ item }) {
  return html`
    <li data-nav-index=${item.index} class="border-t border-line pt-4">
      ${item.href
    ? html`<a href=${item.href} title=${item.title || null} class="rounded-sm text-lg font-bold !text-fg !no-underline transition-colors hover:!text-brand ${focusClass}">${item.label}</a>`
    : html`<span class="text-lg font-bold text-fg">${item.label}</span>`}
      ${item.description ? html`<p class="m-0 mt-2 text-sm leading-relaxed text-fg-3">${item.description}</p>` : null}
      ${item.children.length ? html`<${SubLinks} items=${item.children} />` : null}
    </li>
  `;
}

function MenuItem({
  item, open, instant, current, onToggle, onClose,
}) {
  const panelId = useId();
  const itemRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!itemRef.current?.contains(event.target)) onClose();
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [open]);

  if (!item.children.length) {
    const linkClass = `${controlClass} ${current ? currentClass : ''}`;
    return html`
      <li data-nav-index=${item.index}>
        ${item.href
    ? html`<a href=${item.href} title=${item.title || null} class=${linkClass} aria-current=${current ? 'page' : null}>${item.label}</a>`
    : html`<span class=${controlClass}>${item.label}</span>`}
      </li>
    `;
  }

  const onKeyDown = (event) => {
    if (event.key !== 'Escape' || !open) return;
    event.stopPropagation();
    onClose();
    toggleRef.current?.focus();
  };

  const onFocusOut = (event) => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) onClose();
  };

  // the parent link lives in the panel's intro card, so the trigger only toggles the panel;
  // the panel sits below the header border and its wrapper clips only the top edge,
  // so it slides out from under the header
  return html`
    <li
      ref=${itemRef}
      data-nav-index=${item.index}
      onFocusOut=${onFocusOut}
      onKeyDown=${onKeyDown}
    >
      <button
        ref=${toggleRef}
        type="button"
        class="${buttonClass} ${open ? '!text-fg' : ''} ${current ? currentClass : ''}"
        aria-expanded=${open}
        aria-controls=${panelId}
        onClick=${onToggle}
      >${item.label}<${Chevron} open=${open} /></button>
      <div
        id=${panelId}
        class="lg:absolute lg:inset-x-0 lg:top-[calc(100%+1px)] lg:[clip-path:inset(0_-100vw_-100vh)] lg:transition-[visibility] lg:duration-500 motion-reduce:transition-none ${open ? 'visible' : 'max-lg:hidden lg:invisible'} ${instant ? 'lg:transition-none' : ''}"
      >
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-dvh bg-black/50 transition-opacity duration-300 max-lg:hidden motion-reduce:transition-none ${open ? 'opacity-100' : 'opacity-0'}"
        ></div>
        <div
          class="lg:border-b lg:border-line lg:bg-bg lg:shadow-panel lg:transition-transform lg:duration-500 lg:ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${open ? 'lg:translate-y-0' : 'lg:-translate-y-full'}"
        >
          <div
            class="mx-auto grid gap-8 py-4 pl-3 transition duration-300 motion-reduce:transition-none lg:w-[min(calc(100%-var(--spacing-gutter)*2),var(--container-site))] lg:grid-cols-[16rem_minmax(0,1fr)] lg:py-10 lg:pl-0 ${open ? 'translate-y-0 opacity-100 lg:delay-200' : 'lg:-translate-y-2 lg:opacity-0'}"
          >
            ${item.href || item.description ? html`
              <div class="flex flex-col gap-2 self-start rounded-card border border-line bg-surface-raised p-5">
                ${item.href
    ? html`<a href=${item.href} title=${item.title || null} class="rounded-sm text-lg font-bold !text-fg !no-underline hover:!text-brand ${focusClass}" aria-current=${current ? 'page' : null}>${item.label} →</a>`
    : html`<span class="text-lg font-bold text-fg">${item.label}</span>`}
                ${item.description ? html`<p class="m-0 text-sm leading-relaxed text-fg-3">${item.description}</p>` : null}
              </div>
            ` : html`<div class="max-lg:hidden"></div>`}
            <ul
              class="m-0 grid list-none gap-6 p-0 lg:grid-cols-[repeat(var(--nav-columns),minmax(0,1fr))] lg:gap-8"
              style=${{ '--nav-columns': Math.min(item.children.length, MAX_COLUMNS) }}
            >
              ${item.children.map((child) => html`<${Column} key=${child.index} item=${child} />`)}
            </ul>
          </div>
        </div>
      </div>
    </li>
  `;
}

export default function NavigationLinks({ items, className = '' }) {
  const [openIndex, setOpenIndex] = useState(null);
  const close = () => setOpenIndex(null);
  const currentPath = normalizePath(window.location.pathname);

  return html`
    <ul class="m-0 flex list-none flex-col gap-5 p-0 text-base md:justify-center md:gap-6 md:text-md lg:flex-row ${className}">
      ${items.map((item, i) => html`
        <${MenuItem}
          key=${item.index ?? i}
          item=${{ children: [], ...item }}
          open=${openIndex === i}
          instant=${openIndex !== null && openIndex !== i}
          current=${isCurrentSection(item.href, currentPath)}
          onToggle=${() => setOpenIndex(openIndex === i ? null : i)}
          onClose=${close}
        />
      `)}
    </ul>
  `;
}
