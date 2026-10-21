/*
 * Sample answers for the assistant prototype: chosen by keyword, no AI and no network.
 * Replace `findSampleAnswer` with a call to the real service when it exists;
 * the block only expects a promise that resolves to an answer with this same shape.
 */

// shown under the assistant name while answers come from this file
export const SAMPLE_NOTE = 'Beta · respuestas de ejemplo';

const DOCS = { label: 'Documentación', href: '/learn/docs' };
const TUTORIAL = { label: 'Tu primer sitio', href: '/learn/docs/tutorial' };

const ANSWERS = [
  {
    keywords: ['campo', 'modelo', 'universal editor', 'component-models'],
    text: ['Agrega el campo en el modelo del bloque, dentro de `blocks/{nombre}/_{nombre}.json`, y después regenera los JSON agregados.'],
    code: {
      language: 'json',
      filename: '_hero-banner.json',
      code: '{\n  "component": "text",\n  "valueType": "string",\n  "name": "subtitle",\n  "label": "Subtítulo"\n}',
    },
    outro: ['Luego ejecuta `npm run build:json`. El orden de los campos define el orden de las filas que recibe `decorate(block)`.'],
    sources: [DOCS],
  },
  {
    keywords: ['bloque', 'block', 'decorate'],
    text: ['Un bloque es una carpeta en `blocks/` con su JS y su CSS. El JS exporta `decorate(block)`, que transforma el markup que entrega AEM.'],
    code: {
      language: 'js',
      filename: 'blocks/callout/callout.js',
      code: "export default function decorate(block) {\n  const [title, body] = [...block.children];\n  // maneja celdas vacías sin romper el bloque\n  if (!body) return;\n  block.classList.add('is-ready');\n}",
    },
    outro: ['Para probarlo sin contenido publicado, crea un fixture en `drafts/`.'],
    sources: [TUTORIAL, DOCS],
  },
  {
    keywords: ['local', 'aem up', 'servidor', '3000', 'cli', 'levanto'],
    text: ['Instala las dependencias y levanta el servidor con la CLI de AEM. Sirve tu copia de trabajo y trae el contenido desde la preview.'],
    code: {
      language: 'bash',
      code: 'npm install\nnpx -y @adobe/aem-cli up --no-open --forward-browser-logs',
    },
    outro: ['El sitio queda en `http://localhost:3000`.'],
    sources: [TUTORIAL],
  },
  {
    keywords: ['content fragment', 'fragment', 'graphql'],
    text: ['Usa una consulta persistida de GraphQL y llámala desde el bloque con `fetch`, así la respuesta se puede cachear en la CDN.'],
    code: {
      language: 'js',
      filename: 'data-table.js',
      code: "const response = await fetch('/graphql/execute.json/proyecto/articulos');\nconst { data } = await response.json();",
    },
    sources: [DOCS],
  },
  {
    keywords: [' alt', 'collapse', 'imagen', 'image'],
    text: ['Es el field collapse: si un modelo tiene `image` e `imageAlt`, AEM los combina en una sola imagen con su texto alternativo. Funciona igual con los sufijos `Text`, `Title` y `Type`.'],
    sources: [DOCS],
  },
];

const FALLBACK = {
  text: ['Todavía no tengo una respuesta para eso. Por ahora respondo sobre bloques, modelos de Universal Editor, desarrollo local, Content Fragments y field collapse.'],
  sources: [DOCS],
};

const DELAY_MS = 700;

export default function findSampleAnswer(question) {
  const text = question.toLowerCase();
  const answer = ANSWERS.find((item) => item.keywords.some((word) => text.includes(word)));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return new Promise((resolve) => {
    setTimeout(() => resolve(answer || FALLBACK), reducedMotion ? 0 : DELAY_MS);
  });
}
