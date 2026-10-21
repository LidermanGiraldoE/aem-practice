import { h } from '@dropins/tools/preact.js';
import { useEffect, useRef, useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import Eyebrow from '../../atoms/eyebrow/eyebrow.js';
import Button from '../../atoms/button/button.js';
import ChatMessage, { ChatAvatar } from '../../molecules/chat-message/chat-message.js';

const html = htm.bind(h);
const MAX_INPUT_HEIGHT = 180;

function Typing() {
  return html`
    <div class="flex gap-3">
      <${ChatAvatar} />
      <div class="flex gap-1.5 pt-3.5" role="status" aria-label="El asistente está escribiendo">
        ${[0, 150, 300].map((delay) => html`
          <span key=${delay} class="size-1.75 rounded-full bg-fg-3 motion-safe:animate-bounce" style=${{ animationDelay: `${delay}ms` }}></span>
        `)}
      </div>
    </div>
  `;
}

function ChatPanel({
  name, note, suggestions, placeholder, getAnswer, id,
}) {
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');
  const log = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    const element = log.current;
    if (element) element.scrollTo({ top: element.scrollHeight });
  }, [messages, busy]);

  const ask = async (question) => {
    const text = question.trim();
    if (!text || busy) return;
    setMessages((current) => [...current, { role: 'user', text }]);
    setBusy(true);
    const answer = await getAnswer(text);
    setMessages((current) => [...current, { role: 'assistant', answer }]);
    setBusy(false);
  };

  const resize = () => {
    const element = input.current;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  };

  const submit = (event) => {
    event.preventDefault();
    ask(draft);
    setDraft('');
    requestAnimationFrame(resize);
  };

  const onKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
    submit(event);
  };

  return html`
    <div class="flex h-140 flex-col overflow-hidden rounded-panel border border-line-strong bg-surface-card shadow-panel">
      <div class="flex items-center gap-3 border-b border-line px-5 py-3">
        <${ChatAvatar} />
        <div class="flex min-w-0 flex-col">
          <p class="m-0! text-md font-bold text-fg">${name}</p>
          ${note && html`<p class="m-0! truncate text-xs text-fg-3">${note}</p>`}
        </div>
      </div>

      <div ref=${log} class="flex flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-5" role="log" aria-live="polite" aria-label="Conversación">
        ${!messages.length && html`
          <div class="my-auto flex flex-col items-center gap-3 text-center">
            <${ChatAvatar} size="lg" />
            ${suggestions.length > 0 && html`
              <p class="m-0! text-md text-fg-3">Prueba con una de estas preguntas</p>
              <div class="flex flex-wrap justify-center gap-2">
                ${suggestions.map((suggestion) => html`
                  <button key=${suggestion} type="button" class="min-h-8.5 cursor-pointer rounded-full border border-line-strong bg-surface px-3.5 text-sm font-semibold text-fg-2 transition-colors hover:border-brand hover:text-fg focus-visible:outline-2 focus-visible:outline-brand" onClick=${() => ask(suggestion)}>${suggestion}</button>
                `)}
              </div>
            `}
          </div>
        `}
        ${messages.map((message, index) => html`<${ChatMessage} key=${index} ...${message} />`)}
        ${busy && html`<${Typing} />`}
      </div>

      <form class="px-4 pb-4" onSubmit=${submit}>
        <div class="flex items-end gap-2.5 rounded-[18px] border border-line-strong bg-surface-input py-2.5 pr-2.5 pl-4 transition-colors focus-within:border-brand">
          <label class="sr-only" for=${`${id}-input`}>Escribe tu pregunta</label>
          <textarea
            ref=${input}
            id=${`${id}-input`}
            rows="1"
            class="max-h-45 min-w-0 flex-1 resize-none border-0 bg-transparent py-2 font-sans text-[15px] leading-normal text-fg placeholder:text-fg-3 focus:outline-none"
            placeholder=${placeholder}
            value=${draft}
            onInput=${(event) => { setDraft(event.currentTarget.value); resize(); }}
            onKeyDown=${onKeyDown}
          ></textarea>
          <button type="submit" class="button primary size-10 min-h-10! shrink-0 p-0! text-lg" aria-label="Enviar" disabled=${busy || !draft.trim()}>↑</button>
        </div>
      </form>
    </div>
  `;
}

/**
 * Copy with a call to action next to a chat panel. The authored copy is moved into
 * [data-assistant-chat-copy] after render. `getAnswer(question)` resolves to an answer object.
 */
export default function AssistantChat({
  id = 'assistant-chat',
  eyebrow = '',
  action = null,
  name = 'Asistente de AEM',
  note = '',
  suggestions = [],
  placeholder = 'Escribe tu pregunta sobre AEM…',
  getAnswer,
}) {
  return html`
    <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div class="flex flex-col items-start gap-4.5" data-reveal="up">
        <${Eyebrow}>${eyebrow}<//>
        <div class="assistant-chat-copy flex flex-col gap-4.5" data-assistant-chat-copy></div>
        ${action && html`
          <${Button} ...${action} variant="secondary" icon="arrow-up-right" className="mt-2 gap-2" />
        `}
      </div>
      <div data-reveal="scale">
        <${ChatPanel}
          id=${id}
          name=${name}
          note=${note}
          suggestions=${suggestions}
          placeholder=${placeholder}
          getAnswer=${getAnswer}
        />
      </div>
    </div>
  `;
}
