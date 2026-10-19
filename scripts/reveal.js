const STAGGER_MS = 70;
const MAX_STAGGER_MS = 350;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Universal Editor pages carry data-aue-* attributes; authors must always see the content
const inEditor = document.querySelector('[data-aue-resource]') !== null;
const enabled = !reduceMotion && !inEditor && 'IntersectionObserver' in window;

// hidden states in styles.css only apply under this class, so content stays visible without JS
if (enabled) document.documentElement.classList.add('motion-ready');

let observer;

function getObserver() {
  observer ||= new IntersectionObserver((entries, io) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      node.classList.add('is-visible');
      if (node.matches('[data-reveal-group]')) {
        node.querySelectorAll('[data-reveal-item]').forEach((item) => item.classList.add('is-visible'));
      }
      io.unobserve(node);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  return observer;
}

/**
 * Reveals [data-reveal] elements and staggers [data-reveal-item] children of
 * [data-reveal-group] as they scroll into view.
 * @param {Element} root Container to scan, usually a decorated block
 */
export default function observeReveal(root) {
  if (!enabled) return;

  root.querySelectorAll('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll('[data-reveal-item]').forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index * STAGGER_MS, MAX_STAGGER_MS)}ms`);
    });
    getObserver().observe(group);
  });

  root.querySelectorAll('[data-reveal]').forEach((node) => {
    const delay = Number(node.dataset.revealDelay) || 0;
    if (delay) node.style.setProperty('--reveal-delay', `${delay}ms`);
    getObserver().observe(node);
  });
}
