import { h, render } from '@dropins/tools/preact.js';
import ToolTabs from '../../design-system/organisms/tool-tabs/tool-tabs.js';
import { COMPONENTS } from '../../design-system/molecules/model-builder/model-builder.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import observeReveal from '../../scripts/reveal.js';

let instances = 0;

function getText(element) {
  return element?.textContent?.trim() || '';
}

function parseAction(cell) {
  const link = cell?.querySelector('a');
  const href = link?.getAttribute('href') || '';
  const label = getText(link);
  // a link without its text field is rendered with the URL as the text
  if (!href || !label || label === href) return null;
  return { href, label, title: link.getAttribute('title') || '' };
}

// the first list in the notes feeds the tool; it is removed from the notes shown next to it
function takeListItems(cell) {
  const list = cell?.querySelector('ul, ol');
  if (!list) return [];
  const items = [...list.querySelectorAll(':scope > li')].map(getText).filter(Boolean);
  list.remove();
  return items;
}

// "title: text" → { name: 'title', component: 'text' }; unknown components fall back to text
function parseField(item) {
  const [name, component = 'text'] = item.split(':').map((part) => part.trim());
  return { name, component: component in COMPONENTS ? component : 'text' };
}

function getToolData(tool, notesCell) {
  if (tool === 'launch-checklist') return { items: takeListItems(notesCell) };
  if (tool === 'model-builder') {
    const fields = takeListItems(notesCell).map(parseField).filter((field) => field.name);
    const unique = fields.filter((field, index) => fields
      .findIndex((other) => other.name === field.name) === index);
    return { initialFields: unique };
  }
  return {};
}

// rows: tab label, tool, rich text notes, link (+ link text)
export default function decorate(block) {
  instances += 1;
  // empty rows are kept so newly added tabs stay selectable in Universal Editor
  const rows = [...block.children];
  const tabs = rows.map((row, index) => {
    const [titleCell, toolCell, notesCell, linkCell] = [...row.children];
    const tool = getText(toolCell) || 'url-builder';
    return {
      title: getText(titleCell) || `Herramienta ${index + 1}`,
      tool,
      data: getToolData(tool, notesCell),
      action: parseAction(linkCell),
      notes: notesCell,
    };
  });

  block.replaceChildren();
  render(h(ToolTabs, { id: `tool-tabs-${instances}`, tabs }), block);
  observeReveal(block);

  block.querySelectorAll('[data-tool-panel]').forEach((panel, index) => {
    moveInstrumentation(rows[index], panel);
    const { notes } = tabs[index];
    if (!notes) return;
    const slot = panel.querySelector('[data-tool-notes]');
    moveInstrumentation(notes, slot);
    slot.append(...notes.childNodes);
  });
}
