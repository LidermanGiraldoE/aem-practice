import { h, render } from '@dropins/tools/preact.js';
import CodeBlock from '../design-system/molecules/code-block/code-block.js';
import { detectLanguage } from '../design-system/molecules/code-block/highlight.js';
// eslint-disable-next-line import/no-cycle
import { moveInstrumentation } from './scripts.js';

const EXTENSIONS = {
  js: 'js', mjs: 'js', json: 'json', css: 'css', html: 'html', sh: 'bash', yaml: 'yaml', yml: 'yaml',
};

// a first line like "// blocks/hero/hero.js" or "# helix-query.yaml" names the file
const FILENAME_LINE = /^\s*(?:\/\/|#|\/\*|<!--)\s*([\w./-]+\.(\w+))\s*(?:\*\/|-->)?\s*$/;

function readSnippet(pre) {
  const code = pre.querySelector('code') || pre;
  const lines = code.textContent.replace(/\n$/, '').split('\n');
  const [, filename, extension] = lines[0].match(FILENAME_LINE) || [];
  const text = (filename ? lines.slice(1) : lines).join('\n');
  const language = EXTENSIONS[extension] || detectLanguage(text, code.className);
  return { code: text, language, filename: filename || '' };
}

/**
 * Renders authored <pre> snippets as highlighted code blocks with a copy button.
 * @param {Element} main The container element
 */
export default function decorateCodeBlocks(main) {
  main.querySelectorAll('.default-content-wrapper pre').forEach((pre) => {
    if (pre.closest('.code-block')) return;
    const container = document.createElement('div');
    container.className = 'code-block';
    moveInstrumentation(pre, container);
    pre.replaceWith(container);
    render(h(CodeBlock, readSnippet(pre)), container);
  });
}
