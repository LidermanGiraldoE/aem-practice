import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import SectionHeading from '../../molecules/section-heading/section-heading.js';
import PostCard from '../../molecules/post-card/post-card.js';

const html = htm.bind(h);

export default function RelatedPosts({ posts = [], categories = {} }) {
  if (!posts.length) return null;

  return html`
    <div class="flex flex-col gap-11">
      <${SectionHeading} eyebrow="Sigue leyendo" title="Artículos relacionados" align="left" />
      <ul class="m-0! grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
        ${posts.map((post) => html`
          <li key=${post.path} class="m-0">
            <${PostCard} post=${post} category=${categories[post.category] || {}} />
          </li>
        `)}
      </ul>
    </div>
  `;
}
