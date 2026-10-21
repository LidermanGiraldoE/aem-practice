// Minimal regex tokenizer: enough for short snippets in articles, no third-party highlighter.
const TOKEN_CLASS = {
  comment: 'text-terminal-comment italic',
  string: 'text-terminal-success',
  keyword: 'text-terminal-command',
  number: 'text-terminal-prompt',
  key: 'text-terminal-key',
  fn: 'text-terminal-command',
  tag: 'text-terminal-key',
};

const STRING = /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/;
const NUMBER = /\b\d+(?:\.\d+)?(?:px|rem|em|%|ms|s|vw|vh)?\b/;

const GRAMMARS = {
  js: [
    ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
    ['string', STRING],
    ['keyword', /\b(?:const|let|var|function|return|if|else|for|of|in|while|await|async|import|export|default|from|new|class|extends|try|catch|throw|typeof|true|false|null|undefined|this)\b/],
    ['number', NUMBER],
    ['fn', /\b[A-Za-z_$][\w$]*(?=\s*\()/],
  ],
  json: [
    ['key', /"(?:\\.|[^"\\])*"(?=\s*:)/],
    ['string', /"(?:\\.|[^"\\])*"/],
    ['keyword', /\b(?:true|false|null)\b/],
    ['number', NUMBER],
  ],
  css: [
    ['comment', /\/\*[\s\S]*?\*\//],
    ['string', STRING],
    ['keyword', /@[\w-]+|!important/],
    ['key', /--?[\w-]+(?=\s*:)|\b[a-z-]+(?=\s*:[^:])/],
    ['fn', /\b[\w-]+(?=\()/],
    ['number', NUMBER],
  ],
  html: [
    ['comment', /<!--[\s\S]*?-->/],
    ['tag', /<\/?[\w-]+|\/?>/],
    ['key', /\b[\w:-]+(?==)/],
    ['string', /"[^"]*"|'[^']*'/],
  ],
  bash: [
    ['comment', /(?:^|\s)#[^\n]*/],
    ['string', STRING],
    ['keyword', /^\s*\$|(?<=^(?:\s*\$\s+)?)(?:npm|npx|git|curl|cd|aem|node|export)\b/m],
    ['key', /\s--?[\w-]+/],
  ],
  yaml: [
    ['comment', /#[^\n]*/],
    ['key', /^[\t ]*[\w-]+(?=:)/m],
    ['string', STRING],
    ['keyword', /\b(?:true|false|null)\b/],
    ['number', NUMBER],
  ],
};

export const LANGUAGES = {
  js: 'JavaScript', json: 'JSON', css: 'CSS', html: 'HTML', bash: 'Terminal', yaml: 'YAML',
};

const escapeHtml = (text) => text
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

export function detectLanguage(code, hint = '') {
  const declared = hint.match(/language-(\w+)/)?.[1];
  if (declared && GRAMMARS[declared]) return declared;
  const text = code.trim();
  if (/^(?:\$\s|npm |npx |git |curl |cd |aem )/m.test(text)) return 'bash';
  if (/^[[{]/.test(text)) {
    try {
      JSON.parse(text);
      return 'json';
    } catch { /* not json */ }
  }
  if (/^</.test(text)) return 'html';
  if (/^[\w-]+:\s*(?:\S.*)?$/m.test(text) && !/[;{}()]/.test(text)) return 'yaml';
  if (/^[.#:@\w-][^\n=()]*\{\s*$/m.test(text) && !/\b(?:const|let|function|=>)\b/.test(text)) return 'css';
  return 'js';
}

export function highlight(code, language) {
  const grammar = GRAMMARS[language];
  if (!grammar) return escapeHtml(code);

  const pattern = new RegExp(grammar.map(([, re]) => `(${re.source})`).join('|'), 'gm');
  let result = '';
  let last = 0;
  code.replace(pattern, (match, ...groups) => {
    const offset = groups[grammar.length];
    const type = grammar[groups.findIndex((group) => group !== undefined)][0];
    result += `${escapeHtml(code.slice(last, offset))}<span class="${TOKEN_CLASS[type]}">${escapeHtml(match)}</span>`;
    last = offset + match.length;
    return match;
  });
  return result + escapeHtml(code.slice(last));
}
