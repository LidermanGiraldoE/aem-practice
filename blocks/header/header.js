import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 1240px)');

function closeOnEscape(e) {
  if (e.code !== 'Escape' || isDesktop.matches) return;
  const nav = document.getElementById('nav');
  const button = nav?.querySelector('.nav-hamburger button');
  if (nav?.getAttribute('aria-expanded') === 'true') {
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, false);
    button?.focus();
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  // eslint-disable-next-line no-use-before-define
  if (!isDesktop.matches && !nav.contains(e.relatedTarget)) toggleMenu(nav, false);
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded === null
    ? nav.getAttribute('aria-expanded') !== 'true'
    : forceExpanded;
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', String(expanded));
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
  button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  button.setAttribute('aria-expanded', String(expanded));

  if (expanded && !isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('div');
  nav.id = 'nav';
  nav.className = 'container nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const brandWrapper = nav.querySelector('.header-brand-wrapper');
  if (brandWrapper) brand.append(brandWrapper);

  const navLinks = document.createElement('nav');
  navLinks.className = 'nav-links nav-sections';
  navLinks.setAttribute('aria-label', 'Primary navigation');
  const itemsWrapper = nav.querySelector('.header-items-wrapper');
  if (itemsWrapper) navLinks.append(itemsWrapper);

  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  ['search', 'theme', 'language'].forEach((name) => {
    const wrapper = nav.querySelector(`.header-${name}-wrapper`);
    if (wrapper) tools.append(wrapper);
  });

  const menu = document.createElement('div');
  menu.className = 'nav-menu';
  menu.append(navLinks, tools);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  const hamburgerButton = document.createElement('button');
  hamburgerButton.type = 'button';
  hamburgerButton.setAttribute('aria-controls', 'nav');
  hamburgerButton.setAttribute('aria-label', 'Open navigation');
  const hamburgerIcon = document.createElement('span');
  hamburgerIcon.className = 'nav-hamburger-icon';
  hamburgerIcon.setAttribute('aria-hidden', 'true');
  hamburgerButton.append(hamburgerIcon);
  hamburger.append(hamburgerButton);
  hamburgerButton.addEventListener('click', () => toggleMenu(nav));
  nav.replaceChildren(brand, hamburger, menu);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, false);
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
