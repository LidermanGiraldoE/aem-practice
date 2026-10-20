import { h } from '@dropins/tools/preact.js';
import { useEffect, useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';

const html = htm.bind(h);
// a heading counts as current once it scrolls above this line (fixed header + breathing room)
const ACTIVE_OFFSET = 120;

export default function TableOfContents({ title = 'En este artículo', items = [] }) {
  const [activeId, setActiveId] = useState(items[0]?.id || '');

  useEffect(() => {
    const targets = items.map((item) => document.getElementById(item.id)).filter(Boolean);
    let frame = 0;
    const update = () => {
      frame = 0;
      const passed = targets.filter((target) => (
        target.getBoundingClientRect().top <= ACTIVE_OFFSET
      ));
      setActiveId((passed[passed.length - 1] || targets[0])?.id || '');
    };
    const onScroll = () => {
      frame ||= window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [items]);

  if (!items.length) return null;

  return html`
    <nav aria-label=${title}>
      <p class="m-0! mb-3! text-xs font-bold uppercase tracking-wider text-fg-3">${title}</p>
      <ol class="m-0! list-none border-l border-line p-0">
        ${items.map((item) => html`
          <li key=${item.id} class="m-0">
            <a
              href=${`#${item.id}`}
              aria-current=${item.id === activeId ? 'true' : null}
              class="-ml-px block border-l-2 border-transparent py-1.5 text-sm leading-snug text-fg-3! no-underline! hover:text-fg! aria-[current=true]:border-brand aria-[current=true]:text-brand! ${item.level === 3 ? 'pl-6.5' : 'pl-3.5'}"
            >${item.text}</a>
          </li>
        `)}
      </ol>
      <div class="mt-6 border-t border-line pt-5 text-sm">
        <button
          type="button"
          class="m-0 cursor-pointer border-0 bg-transparent p-0 font-sans text-sm text-fg-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick=${() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >↑ Volver arriba</button>
      </div>
    </nav>
  `;
}
