import { h } from '@dropins/tools/preact.js';
import { useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import CodeBlock from '../code-block/code-block.js';

const html = htm.bind(h);

// Universal Editor field components offered by the generator and the value type each one stores
export const COMPONENTS = {
  text: 'string',
  richtext: 'string',
  'aem-content': '',
  reference: 'string',
  select: 'string',
  boolean: 'boolean',
  number: 'number',
};

const INPUT_CLASS = 'h-10 w-full min-w-0 rounded-btn border border-line-strong bg-surface-input px-3 font-mono text-sm text-fg placeholder:text-fg-3 focus-visible:border-brand focus-visible:outline-none';

// field and block names: lowercase words joined by hyphens or camelCase, no spaces
function toName(value = '') {
  return value.trim().replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function toLabel(name) {
  const words = name.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function buildModel(blockId, fields) {
  return {
    id: toName(blockId) || 'my-block',
    fields: fields.map(({ name, component }) => ({
      component,
      ...(COMPONENTS[component] && { valueType: COMPONENTS[component] }),
      name,
      label: toLabel(name),
    })),
  };
}

/**
 * Builds the Universal Editor model of a block from a list of fields.
 * `initialFields` comes from the authored list ("name: component").
 */
export default function ModelBuilder({ id = 'model-builder', blockId = 'callout', initialFields = [] }) {
  const [block, setBlock] = useState(blockId);
  const [fields, setFields] = useState(initialFields);
  const [draft, setDraft] = useState({ name: '', component: 'text' });

  const name = toName(draft.name);
  const duplicate = fields.some((field) => field.name === name);

  const add = (event) => {
    event.preventDefault();
    if (!name || duplicate) return;
    setFields([...fields, { name, component: draft.component }]);
    setDraft({ ...draft, name: '' });
  };

  const remove = (index) => setFields(fields.filter((_, position) => position !== index));

  return html`
    <div class="flex flex-col gap-5">
      <label class="flex flex-col gap-1.5 text-sm font-semibold text-fg-2" for=${`${id}-block`}>
        Nombre del bloque
        <input id=${`${id}-block`} class=${INPUT_CLASS} value=${block} spellcheck="false" onInput=${(event) => setBlock(event.currentTarget.value)} />
      </label>

      <ul class="m-0! grid list-none gap-2 p-0" aria-label="Campos del bloque">
        ${fields.map((field, index) => html`
          <li key=${field.name} class="m-0 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-xl border border-line px-3.5 py-2.5 text-md">
            <span class="truncate font-mono text-fg">${field.name}</span>
            <span class="rounded-sm border border-line bg-overlay/4 px-2 py-0.5 text-xs font-semibold text-fg-2">${field.component}</span>
            <button type="button" class="grid size-7 cursor-pointer place-items-center rounded-sm border-0 bg-transparent text-fg-3 hover:text-error" aria-label=${`Quitar ${field.name}`} onClick=${() => remove(index)}>✕</button>
          </li>
        `)}
        ${!fields.length && html`<li class="m-0 rounded-xl border border-dashed border-line-strong px-3.5 py-3 text-md text-fg-3">Agrega el primer campo.</li>`}
      </ul>

      <form class="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]" onSubmit=${add}>
        <label class="sr-only" for=${`${id}-name`}>Nombre del campo</label>
        <input id=${`${id}-name`} class=${INPUT_CLASS} value=${draft.name} placeholder="nombre del campo" spellcheck="false" onInput=${(event) => setDraft({ ...draft, name: event.currentTarget.value })} />
        <label class="sr-only" for=${`${id}-component`}>Tipo de campo</label>
        <select id=${`${id}-component`} class="${INPUT_CLASS} w-auto cursor-pointer font-sans" value=${draft.component} onChange=${(event) => setDraft({ ...draft, component: event.currentTarget.value })}>
          ${Object.keys(COMPONENTS).map((component) => html`<option key=${component} value=${component}>${component}</option>`)}
        </select>
        <button type="submit" class="button secondary col-span-2 min-h-10! sm:col-span-1" disabled=${!name || duplicate}>＋ Agregar</button>
      </form>
      ${duplicate && html`<p class="m-0! text-sm text-error" role="status">Ya existe un campo con ese nombre.</p>`}

      <${CodeBlock} code=${JSON.stringify(buildModel(block, fields), null, 2)} language="json" filename=${`_${toName(block) || 'my-block'}.json · models`} />
    </div>
  `;
}
