import { toPageHref } from './blog.js';

const STORAGE_KEY = 'aem-learn-progress';

const text = (value) => (typeof value === 'string' ? value.trim() : '');

// only site paths are accepted, so stored data can never inject another scheme or host
const sitePath = (value) => (/^\/(?!\/)/.test(text(value)) ? text(value) : '');

/**
 * The learning path in progress, as saved in this browser, or null for a new visitor.
 * Stored shape: { current: { title, detail, percent, next: { label, href } } }
 */
export default function getCurrentProgress() {
  let current;
  try {
    ({ current } = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
  } catch (error) {
    return null;
  }
  const title = text(current?.title);
  if (!title) return null;

  const nextHref = sitePath(current.next?.href);
  return {
    title,
    detail: text(current.detail),
    percent: Math.min(100, Math.max(0, Math.round(Number(current.percent) || 0))),
    next: nextHref && text(current.next.label)
      ? { label: text(current.next.label), href: toPageHref(nextHref) }
      : null,
  };
}
