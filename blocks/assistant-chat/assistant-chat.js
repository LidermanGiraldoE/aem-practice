import { h, render } from '@dropins/tools/preact.js';
import AssistantChat from '../../design-system/organisms/assistant-chat/assistant-chat.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import observeReveal from '../../scripts/reveal.js';
import findSampleAnswer, { SAMPLE_NOTE } from './sample-answers.js';

const MAX_SUGGESTIONS = 4;
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

function parseSuggestions(cell) {
  const items = [...(cell?.querySelectorAll('li') || [])].map(getText);
  // a list is expected; plain paragraphs also work, one question each
  const lines = items.length ? items : [...(cell?.querySelectorAll('p') || [])].map(getText);
  return lines.filter(Boolean).slice(0, MAX_SUGGESTIONS);
}

// rows: grouped copy (eyebrow + rich text), grouped CTA, assistant name, suggested questions
export default function decorate(block) {
  instances += 1;
  const [copyRow, ctaRow, nameRow, suggestionsRow] = [...block.children];
  const copyCell = copyRow?.firstElementChild;
  const heading = copyCell?.querySelector('h1, h2, h3, h4');
  const firstChild = copyCell?.firstElementChild;
  const eyebrow = heading && firstChild?.tagName === 'P' ? firstChild : null;

  const props = {
    id: `assistant-chat-${instances}`,
    eyebrow: getText(eyebrow),
    action: parseAction(ctaRow),
    name: getText(nameRow) || undefined,
    note: SAMPLE_NOTE,
    suggestions: parseSuggestions(suggestionsRow),
    getAnswer: findSampleAnswer,
  };
  eyebrow?.remove();

  block.replaceChildren();
  render(h(AssistantChat, props), block);
  observeReveal(block);

  const copySlot = block.querySelector('[data-assistant-chat-copy]');
  if (copyCell) {
    moveInstrumentation(copyCell, copySlot);
    copySlot.append(...copyCell.childNodes);
  }
}
