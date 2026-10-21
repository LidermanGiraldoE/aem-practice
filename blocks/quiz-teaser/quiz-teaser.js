import { h, render } from '@dropins/tools/preact.js';
import QuizTeaser from '../../design-system/organisms/quiz-teaser/quiz-teaser.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import observeReveal from '../../scripts/reveal.js';

const ANSWERS = 'abcdef';

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

// grouped question cell: topic, question, options list and the answer letter, in that order
function parseQuestion(cell) {
  const list = cell?.querySelector('ul, ol');
  if (!list) return null;
  const paragraphs = [...cell.querySelectorAll(':scope > p')].map(getText).filter(Boolean);
  const answerText = paragraphs.at(-1)?.toLowerCase();
  const answer = answerText?.length === 1 ? ANSWERS.indexOf(answerText) : -1;
  if (answer >= 0) paragraphs.pop();
  const [topic, question] = paragraphs.length >= 2 ? paragraphs : ['', ...paragraphs];
  const options = [...list.querySelectorAll(':scope > li')].map(getText).filter(Boolean)
    .slice(0, ANSWERS.length);
  if (!question || !options.length) return null;
  return {
    topic, question, options, answer: Math.min(Math.max(answer, 0), options.length - 1),
  };
}

// rows: grouped copy (eyebrow + rich text), grouped CTA, grouped question, explanation
export default function decorate(block) {
  const [copyRow, ctaRow, questionRow, explanationRow] = [...block.children];
  const copyCell = copyRow?.firstElementChild;
  const heading = copyCell?.querySelector('h1, h2, h3, h4');
  const firstChild = copyCell?.firstElementChild;
  const eyebrow = heading && firstChild?.tagName === 'P' ? firstChild : null;
  const explanationCell = explanationRow?.firstElementChild;

  const props = {
    eyebrow: getText(eyebrow),
    action: parseAction(ctaRow),
    question: parseQuestion(questionRow?.firstElementChild),
  };
  eyebrow?.remove();

  block.replaceChildren();
  render(h(QuizTeaser, props), block);
  observeReveal(block);

  const copySlot = block.querySelector('[data-quiz-teaser-copy]');
  if (copyCell) {
    moveInstrumentation(copyCell, copySlot);
    copySlot.append(...copyCell.childNodes);
  }
  const feedbackSlot = block.querySelector('[data-quiz-feedback]');
  if (feedbackSlot && explanationCell) {
    moveInstrumentation(explanationCell, feedbackSlot);
    feedbackSlot.append(...explanationCell.childNodes);
  }
}
