import { h } from '@dropins/tools/preact.js';
import { useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import Badge from '../../atoms/badge/badge.js';

const html = htm.bind(h);

const KEYS = 'ABCDEFGH';

// authors mark code with backticks in plain text fields: `imageAlt`
function withCode(text = '') {
  return text.split(/`([^`]+)`/).map((part, index) => (index % 2 ? html`<code>${part}</code>` : part));
}

function optionClass(index, selected, answer) {
  if (selected < 0) return 'border-line-strong hover:border-brand';
  if (index === answer) return 'border-success bg-success/10';
  if (index === selected) return 'border-error bg-error/10';
  return 'border-line-strong opacity-70';
}

/**
 * Single choice question that reveals the right answer once the visitor picks an option.
 * The authored explanation is moved into [data-quiz-feedback] by the caller.
 */
export default function QuizQuestion({
  id = 'quiz-question',
  label = 'Pregunta de ejemplo',
  topic = '',
  question = '',
  options = [],
  answer = 0,
}) {
  const [selected, setSelected] = useState(-1);
  const answered = selected >= 0;

  return html`
    <div class="flex flex-col gap-4 rounded-panel border border-line-strong bg-surface-card p-7 shadow-panel">
      <div class="flex items-center justify-between gap-3 text-sm font-semibold text-fg-3">
        <span>${label}</span>
        <${Badge} tone="violet">${topic}<//>
      </div>
      <p class="m-0! text-[19px] leading-snug font-bold text-fg" id=${id}>${withCode(question)}</p>
      <ul class="m-0! grid list-none gap-2.5 p-0" aria-labelledby=${id}>
        ${options.map((option, index) => html`
          <li key=${index} class="m-0">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-xl border bg-transparent px-4 py-3 text-left text-[15px] text-fg transition-[border-color,background-color] duration-[var(--ds-motion-fast)] enabled:cursor-pointer disabled:cursor-default ${optionClass(index, selected, answer)}"
              disabled=${answered}
              onClick=${() => setSelected(index)}
            >
              <span class="grid size-7 shrink-0 place-items-center rounded-sm border border-line-strong font-mono text-sm font-bold text-fg-3" aria-hidden="true">${KEYS[index]}</span>
              <span>${withCode(option)}</span>
              ${answered && index === answer && html`<span class="sr-only">(respuesta correcta)</span>`}
              ${answered && index === selected && index !== answer && html`<span class="sr-only">(tu respuesta)</span>`}
            </button>
          </li>
        `)}
      </ul>
      <div class="quiz-feedback rounded-xl bg-brand/7 px-4 py-3.5 text-md text-fg-2" role="status" hidden=${!answered}>
        ${answered && html`<strong class="block text-fg">${selected === answer ? '¡Correcto!' : 'No exactamente.'}</strong>`}
        <div class="mt-1" data-quiz-feedback></div>
      </div>
    </div>
  `;
}
