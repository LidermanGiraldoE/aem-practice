import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import Eyebrow from '../../atoms/eyebrow/eyebrow.js';
import Button from '../../atoms/button/button.js';
import QuizQuestion from '../../molecules/quiz-question/quiz-question.js';

const html = htm.bind(h);

/**
 * Copy with a call to action next to a sample question.
 * The authored copy is moved into [data-quiz-teaser-copy] after render.
 */
export default function QuizTeaser({ eyebrow = '', action = null, question = null }) {
  return html`
    <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div class="flex flex-col items-start gap-4.5" data-reveal="up">
        <${Eyebrow}>${eyebrow}<//>
        <div class="quiz-teaser-copy flex flex-col gap-4.5" data-quiz-teaser-copy></div>
        ${action && html`
          <${Button} ...${action} variant="primary" icon="arrow-right" className="mt-2 gap-2" />
        `}
      </div>
      ${question?.options.length > 0 && html`
        <div data-reveal="scale">
          <${QuizQuestion} ...${question} id="quiz-teaser-question" />
        </div>
      `}
    </div>
  `;
}
