import { h } from '@dropins/tools/preact.js';
import { useEffect, useRef, useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';

const html = htm.bind(h);

/* Shared pieces for *.sample.js. Global h/p rules are unlayered, hence the `!` utilities. */

export function useComputed(read) {
  const ref = useRef(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    const update = () => {
      if (ref.current) setValue(read(getComputedStyle(ref.current)));
    };
    update();
    // Global stylesheets may finish loading after the first render
    window.addEventListener('load', update, { once: true });
    return () => window.removeEventListener('load', update);
  }, []);

  return [ref, value];
}

export const TokenValue = ({ cssVar }) => {
  const [ref, value] = useComputed((style) => style.getPropertyValue(cssVar).trim());
  return html`<span ref=${ref} class="break-all font-mono text-micro text-fg-3">${value}</span>`;
};

export const Mono = ({ children }) => html`<span class="font-mono text-xs text-fg">${children}</span>`;

export const SampleSection = ({
  kicker, title, description, children,
}) => html`
  <section class="flex flex-col gap-6 border-t border-line py-10">
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
      <div class="flex flex-col gap-1">
        <span class="text-caption font-extrabold uppercase tracking-widest text-brand-2">${kicker}</span>
        <h3 class="m-0! text-[30px]! tracking-tight!">${title}</h3>
      </div>
      <p class="m-0! text-md text-fg-2 md:max-w-[420px]">${description}</p>
    </div>
    ${children}
  </section>
`;

export const SampleGroup = ({ title, children }) => html`
  <div class="flex flex-col gap-3">
    <h4 class="m-0! text-caption! leading-normal! font-extrabold! uppercase tracking-wider text-fg-3">${title}</h4>
    ${children}
  </div>
`;

export const ThemePanel = ({ theme, children }) => html`
  <div data-theme=${theme} class="flex min-w-0 flex-col gap-6 rounded-card border border-line bg-bg p-5 text-fg">
    <span class="text-caption font-extrabold uppercase tracking-wider text-fg-3">${theme === 'dark' ? 'Dark' : 'Light'}</span>
    ${children}
  </div>
`;

export const ThemeCompare = ({ render }) => html`
  <div class="grid gap-4 lg:grid-cols-2">
    <${ThemePanel} theme="dark">${render()}<//>
    <${ThemePanel} theme="light">${render()}<//>
  </div>
`;

export const SpecTable = ({ headers, rows }) => html`
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr>
          ${headers.map((header) => html`
            <th class="whitespace-nowrap border-b border-line p-3 text-left text-caption font-bold uppercase tracking-wider text-fg-3">${header}</th>
          `)}
        </tr>
      </thead>
      <tbody>
        ${rows.map((cells) => html`
          <tr>
            ${cells.map((cell) => html`<td class="border-b border-line p-3 text-left align-middle text-fg-2">${cell}</td>`)}
          </tr>
        `)}
      </tbody>
    </table>
  </div>
`;
