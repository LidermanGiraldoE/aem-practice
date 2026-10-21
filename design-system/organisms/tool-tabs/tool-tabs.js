import { h } from '@dropins/tools/preact.js';
import { useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import UrlBuilder from '../../molecules/url-builder/url-builder.js';
import ModelBuilder from '../../molecules/model-builder/model-builder.js';
import LaunchChecklist from '../../molecules/launch-checklist/launch-checklist.js';

const html = htm.bind(h);

const TOOLS = {
  'url-builder': UrlBuilder,
  'model-builder': ModelBuilder,
  'launch-checklist': LaunchChecklist,
};

const KEY_STEPS = { ArrowRight: 1, ArrowLeft: -1 };

function Tool({ tool, id, data }) {
  const Component = TOOLS[tool];
  if (!Component) return null;
  return html`<${Component} id=${id} ...${data} />`;
}

/**
 * One tab per tool with a reduced version of it. Each panel's authored notes are
 * moved into [data-tool-notes] after render.
 */
export default function ToolTabs({ id = 'tool-tabs', tabs = [] }) {
  const [active, setActive] = useState(0);
  if (!tabs.length) return null;

  const select = (index, focus = false) => (event) => {
    setActive(index);
    if (focus) event.currentTarget.parentElement.children[index]?.focus();
  };

  const onKeyDown = (index) => (event) => {
    let next = null;
    if (KEY_STEPS[event.key]) next = (index + KEY_STEPS[event.key] + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    select(next, true)(event);
  };

  return html`
    <div class="flex flex-col gap-4" data-reveal="up">
      <div class="flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1" role="tablist" aria-label="Herramientas">
        ${tabs.map((tab, index) => html`
          <button
            key=${index}
            type="button"
            role="tab"
            id=${`${id}-tab-${index}`}
            aria-controls=${`${id}-panel-${index}`}
            aria-selected=${index === active}
            tabindex=${index === active ? 0 : -1}
            class="cursor-pointer whitespace-nowrap rounded-[9px] border-0 px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${index === active ? 'bg-surface-2 text-fg shadow-[0_0_0_1px_var(--ds-line-strong)]' : 'bg-transparent text-fg-3 hover:text-fg'}"
            onClick=${select(index)}
            onKeyDown=${onKeyDown(index)}
          >${tab.title}</button>
        `)}
      </div>
      ${tabs.map((tab, index) => html`
        <div
          key=${index}
          role="tabpanel"
          id=${`${id}-panel-${index}`}
          aria-labelledby=${`${id}-tab-${index}`}
          hidden=${index !== active}
          class="${index === active ? 'grid' : 'hidden'} gap-7 rounded-[20px] border border-line-strong bg-surface-card p-6 shadow-panel lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:p-8"
          data-tool-panel
        >
          <div class="flex flex-col gap-4">
            <div class="tool-tabs-notes flex flex-col gap-3" data-tool-notes></div>
            ${tab.action && html`
              <a class="mt-auto w-fit text-md font-bold text-brand! no-underline! hover:underline!" href=${tab.action.href} title=${tab.action.title || tab.action.label}>${tab.action.label} →</a>
            `}
          </div>
          <div class="min-w-0">
            <${Tool} tool=${tab.tool} id=${`${id}-${index}`} data=${tab.data} />
          </div>
        </div>
      `)}
    </div>
  `;
}
