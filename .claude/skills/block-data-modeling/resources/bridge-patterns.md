# Bridge Patterns — AEM Edge Delivery Block `decorate()` Templates

Use these templates as the starting point for a block's `decorate()` function.  
Select the pattern based on:

- **Section 1** — Native DOM patterns (vanilla JS, no Preact)
  - 1a. Simple block (all fields on the block itself)
  - 1b. Container + items block (repeating items, no config rows)
  - 1c. Config + items block (config rows + repeating item rows)
- **Section 2** — Preact patterns (block renders a DS organism via Preact/HTM)
  - 2a. Simple Preact block
  - 2b. Container + items Preact block (items hide + render in child container)
  - 2c. Config + items Preact block (config rows + items, all hidden + render in child container)

---

## Section 1: Native DOM Patterns

### 1a. Native — Simple Block

Use when: `blockType === 'simple'`, `renderingApproach === 'native'`.  
The block has its own fields. Replace the block's children with the decorated structure.

```javascript
import {
  createOptimizedPicture,
  // add other aem.js imports as needed
} from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Decorates the <Name> block.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];

  // ── Read fields from rows (use your row-index mapping) ──────────────────
  // Row 0: title (text field)
  const title = rows[0]?.children[0]?.textContent.trim() || '';

  // Row 1: image (reference field)
  const imgEl = rows[1]?.querySelector('img');
  const picture = imgEl
    ? createOptimizedPicture(imgEl.src, imgEl.alt || '', true, [
      { media: '(min-width: 600px)', width: '1200' },
      { width: '750' },
    ])
    : null;
  if (imgEl && picture) {
    moveInstrumentation(imgEl, picture.querySelector('img'));
  }

  // Row 2: CTA link (aem-content field)
  const ctaLink = rows[2]?.querySelector('a');

  // ── Build new structure ─────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.className = '<name>-inner';

  if (picture) {
    const mediaEl = document.createElement('div');
    mediaEl.className = '<name>-media';
    mediaEl.append(picture);
    moveInstrumentation(rows[1], mediaEl);
    wrapper.append(mediaEl);
  }

  const content = document.createElement('div');
  content.className = '<name>-content';

  if (title) {
    const h2 = document.createElement('h2');
    h2.textContent = title;
    moveInstrumentation(rows[0], h2);
    content.append(h2);
  }

  if (ctaLink) {
    const btnWrap = document.createElement('div');
    btnWrap.className = '<name>-cta';
    btnWrap.append(ctaLink.cloneNode(true));
    moveInstrumentation(rows[2], btnWrap);
    content.append(btnWrap);
  }

  wrapper.append(content);

  // ── Replace block children (UE keeps block root attributes) ─────────────
  block.replaceChildren(wrapper);
}
```

**Key rules**:
- Call `moveInstrumentation(original, replacement)` on EVERY replaced node so UE's `data-aue-*` attrs follow the new element.
- `block.replaceChildren()` is safe here because `blockType === 'simple'` — the block has no child containers that UE tracks as editable items.

---

### 1b. Native — Container + Items Block

Use when: `blockType === 'container-items'`, `renderingApproach === 'native'`.  
Each row is an independent item. No config rows.

```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Decorates the <Name> block.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li); // transfer item-level UE attrs

    const cells = [...row.children];

    // Cell 0: image (reference field)
    const imgEl = cells[0]?.querySelector('img');
    if (imgEl) {
      const picture = createOptimizedPicture(imgEl.src, imgEl.alt || '', false, [
        { media: '(min-width: 600px)', width: '800' },
        { width: '400' },
      ]);
      moveInstrumentation(imgEl, picture.querySelector('img'));
      imgEl.closest('picture').replaceWith(picture);

      const imageWrap = document.createElement('div');
      imageWrap.className = '<name>-image';
      imageWrap.append(picture);
      li.append(imageWrap);
    }

    // Cell 1: body content (headings, paragraphs, buttons already decorated)
    if (cells[1]) {
      const body = document.createElement('div');
      body.className = '<name>-body';
      body.append(...cells[1].childNodes);
      li.append(body);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
```

**Key rules**:
- `moveInstrumentation(row, li)` transfers item-level `data-aue-resource` to the `<li>` so UE can add/remove/reorder items.
- `block.replaceChildren(ul)` is safe here. Container-items blocks do NOT have a `model` on the container definition — only a `filter`. There are no container-level config fields for UE to lose.

---

### 1c. Native — Config + Items Block

Use when: `blockType === 'config-items'`, `renderingApproach === 'native'`.  
First N rows are config (container fields); remaining rows are items.

```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Number of config rows = data fields in container model
// (excluding tabs and ${refName}Alt baked fields — see row-index mapping)
const CONFIG_ROW_COUNT = 3; // ← replace with your calculated value

/**
 * Decorates the <Name> block.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const configRows = rows.slice(0, CONFIG_ROW_COUNT);
  const itemRows = rows.slice(CONFIG_ROW_COUNT);

  // ── Read config fields (from your row-index mapping) ────────────────────
  const variant = configRows[0]?.children[0]?.textContent.trim() || 'default';
  const title = configRows[1]?.children[0]?.textContent.trim() || '';
  const imgEl = configRows[2]?.querySelector('img');

  // ── Build items ─────────────────────────────────────────────────────────
  const ul = document.createElement('ul');

  itemRows.forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cells = [...row.children];

    // Item Cell 0: image
    const itemImg = cells[0]?.querySelector('img');
    if (itemImg) {
      const picture = createOptimizedPicture(itemImg.src, itemImg.alt || '', false, [
        { media: '(min-width: 600px)', width: '800' },
        { width: '400' },
      ]);
      moveInstrumentation(itemImg, picture.querySelector('img'));
      itemImg.closest('picture').replaceWith(picture);
      li.append(picture);
    }

    // Item Cell 1: text content
    if (cells[1]) {
      const body = document.createElement('div');
      body.className = '<name>-item-body';
      body.append(...cells[1].childNodes);
      li.append(body);
    }

    ul.append(li);
  });

  // ── Assemble final structure ─────────────────────────────────────────────
  const container = document.createElement('div');
  container.className = `<name>-container ${variant}`;

  if (title) {
    const heading = document.createElement('h2');
    heading.textContent = title;
    container.append(heading);
  }

  container.append(ul);

  // ⚠️ DO NOT use block.replaceChildren() for config-items blocks if the
  // container definition has a `filter`. Use replaceChildren only if the
  // container definition has ONLY a `model` (no filter).
  // If it has both model AND filter, use the Preact hide pattern instead.
  block.replaceChildren(container);
}
```

---

## Section 2: Preact Patterns

### Helper: `getAueAttrs`

Include this helper in every Preact block. It captures UE attributes BEFORE Preact renders and destroys the original DOM.

```javascript
/**
 * Captures data-aue-* and data-richtext-* attributes from a specific element
 * to preserve Universal Editor editability after Preact renders.
 *
 * ⚠️ ALWAYS call BEFORE render().
 * ⚠️ ALWAYS call on the SPECIFIC element with data-aue-prop (not its ancestor).
 *
 * @param {Element} el
 * @returns {Record<string, string>}
 */
function getAueAttrs(el) {
  if (!el) return {};
  return [...el.attributes]
    .filter(({ name }) => name.startsWith('data-aue-') || name.startsWith('data-richtext-'))
    .reduce((acc, { name, value }) => { acc[name] = value; return acc; }, {});
}
```

**Critical rules**:
```javascript
// ❌ BAD — .closest() returns the item container (data-aue-resource), not the field
const attrs = getAueAttrs(imgEl.closest('[data-aue-resource]'));

// ✅ GOOD — target the element that has data-aue-prop="fieldName"
const attrs = getAueAttrs(block.querySelector('[data-aue-prop="image"]'));

// ❌ BAD — cells[n] is a <div> wrapper WITHOUT data-aue-* attrs
const attrs = getAueAttrs(row.children[1]);

// ✅ GOOD — the <p> or element inside the cell has the attrs
const attrs = getAueAttrs(row.querySelector('[data-aue-prop="title"]'));
```

### Helper: Richtext content extraction

```javascript
/**
 * Extracts the inner HTML of a richtext field, stripping the UE wrapper.
 * Reading .innerHTML directly includes <div data-aue-type="richtext">...</div>
 * which would be injected into dangerouslySetInnerHTML and cause markup issues.
 *
 * @param {Element} row - The block row containing the richtext field
 * @returns {string} Raw HTML content without UE wrapper
 */
function getRichtextHTML(row) {
  const rt = row?.querySelector('[data-aue-type="richtext"]');
  return rt ? rt.innerHTML.trim() : row?.children[0]?.innerHTML || '';
}
```

---

### 2a. Preact — Simple Block

Use when: `blockType === 'simple'`, `renderingApproach === 'preact'`.  
All fields are on the block itself. Render directly into `block`.

```javascript
import { render } from '../../scripts/preact/index.js';
import { html } from '../../scripts/htm/index.js';
import { MyOrganism } from '../../design-system/organisms/my-organism/my-organism.js';

function getAueAttrs(el) {
  if (!el) return {};
  return [...el.attributes]
    .filter(({ name }) => name.startsWith('data-aue-') || name.startsWith('data-richtext-'))
    .reduce((acc, { name, value }) => { acc[name] = value; return acc; }, {});
}

function getRichtextHTML(row) {
  const rt = row?.querySelector('[data-aue-type="richtext"]');
  return rt ? rt.innerHTML.trim() : row?.children[0]?.innerHTML || '';
}

/**
 * Decorates the <Name> block.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];

  // ── Step 1: Capture all AUE attrs and data BEFORE render() ──────────────
  const titleAueAttrs = getAueAttrs(block.querySelector('[data-aue-prop="title"]'));
  const descAueAttrs = getAueAttrs(block.querySelector('[data-aue-prop="description"]'));
  const imageAueAttrs = getAueAttrs(block.querySelector('[data-aue-prop="image"]'));

  const title = rows[0]?.children[0]?.textContent.trim() || '';
  const descriptionHtml = getRichtextHTML(rows[1]);
  const imgEl = rows[2]?.querySelector('img');
  const image = imgEl ? { src: imgEl.src, alt: imgEl.alt || '' } : null;

  // ── Step 2: Render into block (replaces children, block root attrs preserved)
  render(
    html`<${MyOrganism}
      title=${title}
      titleAueAttrs=${titleAueAttrs}
      descriptionHtml=${descriptionHtml}
      descAueAttrs=${descAueAttrs}
      image=${image}
      imageAueAttrs=${imageAueAttrs}
    />`,
    block,
  );
}
```

---

### 2b. Preact — Container + Items Block

Use when: `blockType === 'container-items'`, `renderingApproach === 'preact'`.  
Items must remain in the DOM (hidden) for UE to track them. Render into a new child container.

```javascript
import { render } from '../../scripts/preact/index.js';
import { html } from '../../scripts/htm/index.js';
import { MyOrganism } from '../../design-system/organisms/my-organism/my-organism.js';

function getAueAttrs(el) {
  if (!el) return {};
  return [...el.attributes]
    .filter(({ name }) => name.startsWith('data-aue-') || name.startsWith('data-richtext-'))
    .reduce((acc, { name, value }) => { acc[name] = value; return acc; }, {});
}

function getRichtextHTML(row) {
  const rt = row?.querySelector('[data-aue-type="richtext"]');
  return rt ? rt.innerHTML.trim() : row?.children[0]?.innerHTML || '';
}

/**
 * Parses item rows BEFORE they are hidden.
 * Captures field-level AUE attrs for inline editing in Preact.
 * Does NOT capture item-level AUE attrs (the hidden row already has them).
 *
 * @param {Element} block
 * @returns {Array}
 */
function parseItems(block) {
  return [...block.children].map((row) => {
    const cells = [...row.children];

    // Field-level attrs (spread in Preact for inline editing)
    // ⚠️ DO NOT capture row-level (item-level) attrs — the hidden row has them
    const titleAueAttrs = getAueAttrs(row.querySelector('[data-aue-prop="title"]'));
    const bodyAueAttrs = getAueAttrs(row.querySelector('[data-aue-prop="body"]'));
    const imageAueAttrs = getAueAttrs(row.querySelector('[data-aue-prop="image"]'));

    // Data extraction
    const imgEl = cells[0]?.querySelector('img');
    const bodyHtml = getRichtextHTML(cells[1]);
    const title = cells[2]?.children[0]?.textContent.trim() || '';

    return {
      // Data
      image: imgEl ? { src: imgEl.src, alt: imgEl.alt || '' } : null,
      bodyHtml,
      title,
      // Field-level attrs only (spread in Preact JSX)
      aueAttrs: { title: titleAueAttrs, body: bodyAueAttrs, image: imageAueAttrs },
    };
  });
}

/**
 * Decorates the <Name> block.
 * @param {Element} block
 */
export default function decorate(block) {
  // ── Step 1: Parse ALL data and capture AUE attrs BEFORE any DOM change ──
  const items = parseItems(block);

  // ── Step 2: Hide original rows (UE reads them for add/remove/reorder) ───
  [...block.children].forEach((row) => {
    row.style.display = 'none';
  });

  // ── Step 3: Render into a NEW child container ────────────────────────────
  // Never render into `block` directly — that would destroy the hidden rows.
  const container = document.createElement('div');
  block.appendChild(container);

  render(
    html`<${MyOrganism} items=${items} />`,
    container,
  );
}
```

**In the organism (`MyOrganism`)** — which attrs to spread:

```javascript
// ✅ Spread field-level attrs (inline editing works)
html`<h2 ...${item.aueAttrs.title}>${item.title}</h2>`
html`<div ...${item.aueAttrs.body} dangerouslySetInnerHTML=${{ __html: item.bodyHtml }} />`

// ❌ DO NOT spread item-level (data-aue-resource) attrs on Preact nodes
// The hidden row already has them. Spreading duplicates the UE item.
```

---

### 2c. Preact — Config + Items Block

Use when: `blockType === 'config-items'`, `renderingApproach === 'preact'`.  
Container has its own config fields AND repeating item rows. Both must stay hidden for UE.

```javascript
import { render } from '../../scripts/preact/index.js';
import { html } from '../../scripts/htm/index.js';
import { MyOrganism } from '../../design-system/organisms/my-organism/my-organism.js';

// Calculated from the row-index mapping:
// = number of data fields on the container model (excluding tabs and baked alt fields)
const CONFIG_ROW_COUNT = 4; // ← replace with your calculated value

function getAueAttrs(el) {
  if (!el) return {};
  return [...el.attributes]
    .filter(({ name }) => name.startsWith('data-aue-') || name.startsWith('data-richtext-'))
    .reduce((acc, { name, value }) => { acc[name] = value; return acc; }, {});
}

function getRichtextHTML(row) {
  const rt = row?.querySelector('[data-aue-type="richtext"]');
  return rt ? rt.innerHTML.trim() : row?.children[0]?.innerHTML || '';
}

/**
 * Parses container-level config fields from the first CONFIG_ROW_COUNT rows.
 * ⚠️ Use block.querySelector('[data-aue-prop="fieldName"]') for AUE attrs —
 * NEVER configRows[n] directly (cells don't have data-aue-* attrs).
 *
 * @param {Element} block
 * @returns {Object}
 */
function parseConfig(block) {
  const rows = [...block.children];
  const configRows = rows.slice(0, CONFIG_ROW_COUNT);

  return {
    // Data fields (from your row-index mapping)
    variant: configRows[0]?.children[0]?.textContent.trim() || 'default',
    title: configRows[1]?.children[0]?.textContent.trim() || '',
    descriptionHtml: getRichtextHTML(configRows[2]),
    image: (() => {
      const img = configRows[3]?.querySelector('img');
      return img ? { src: img.src, alt: img.alt || '' } : null;
    })(),

    // Config field-level AUE attrs (spread in Preact for inline editing)
    aueAttrs: {
      variant: getAueAttrs(block.querySelector('[data-aue-prop="variant"]')),
      title: getAueAttrs(block.querySelector('[data-aue-prop="title"]')),
      description: getAueAttrs(block.querySelector('[data-aue-prop="description"]')),
      image: getAueAttrs(block.querySelector('[data-aue-prop="image"]')),
    },
  };
}

/**
 * Parses repeating item rows starting after CONFIG_ROW_COUNT.
 *
 * @param {Element} block
 * @returns {Array}
 */
function parseItems(block) {
  const rows = [...block.children];
  const itemRows = rows.slice(CONFIG_ROW_COUNT);

  return itemRows.map((row) => {
    const cells = [...row.children];

    return {
      // Data
      title: cells[0]?.textContent.trim() || '',
      bodyHtml: getRichtextHTML(cells[1]),

      // Item-level AUE attrs: captured but NOT spread in Preact
      // The hidden row already has data-aue-resource → UE tracks the item
      aueAttrs: getAueAttrs(row),

      // Field-level AUE attrs: spread in Preact for inline editing
      titleAueAttrs: getAueAttrs(row.querySelector('[data-aue-prop="title"]')),
      bodyAueAttrs: getAueAttrs(row.querySelector('[data-aue-prop="body"]')),
    };
  });
}

/**
 * Decorates the <Name> block.
 * @param {Element} block
 */
export default function decorate(block) {
  // ── Step 1: Capture all data and AUE attrs BEFORE any DOM change ─────────
  const config = parseConfig(block);
  const items = parseItems(block);

  // ── Step 2: Hide ALL rows (config rows + item rows) ──────────────────────
  // UE reads hidden rows to populate the properties panel and manage items.
  [...block.children].forEach((row) => {
    row.style.display = 'none';
  });

  // ── Step 3: Mount Preact in a NEW child container ─────────────────────────
  // The block root element (div.block) keeps its data-aue-resource attr intact.
  const container = document.createElement('div');
  block.appendChild(container);

  render(
    html`<${MyOrganism}
      config=${config}
      items=${items}
    />`,
    container,
  );
}
```

**In the organism — which attrs to spread**:

```javascript
// ✅ Config field-level attrs → spread for inline editing of config fields
html`<h2 ...${config.aueAttrs.title}>${config.title}</h2>`
html`<div ...${config.aueAttrs.description}
  dangerouslySetInnerHTML=${{ __html: config.descriptionHtml }} />`

// ✅ Item field-level attrs → spread for inline editing of each item's fields
html`<p ...${item.titleAueAttrs}>${item.title}</p>`
html`<div ...${item.bodyAueAttrs}
  dangerouslySetInnerHTML=${{ __html: item.bodyHtml }} />`

// ❌ Item-level attrs → DO NOT spread (data-aue-resource)
// html`<div ...${item.aueAttrs}>...</div>` ← wrong, duplicates UE item
```

---

## Anti-Patterns to Avoid

### ❌ Anti-pattern: Hide block, insert sibling

```javascript
// NEVER do this — breaks Universal Editor completely
block.style.display = 'none';
block.parentNode.insertBefore(container, block.nextSibling);
```

Why it breaks UE:
1. The block's `data-aue-resource` is on the hidden element → UE renders it without styles (shows raw AEM table DOM)
2. The sibling container has no UE attributes → UE cannot find it, fields don't appear
3. Leaves stray DOM: the hidden block + the detached visual container

**Always render INSIDE the block element.**

### ❌ Anti-pattern: `getAueAttrs` after `render()`

```javascript
render(html`<Organism />`, block); // ← destroys DOM children
const attrs = getAueAttrs(block.querySelector('[data-aue-prop="title"]')); // ← returns {}
```

Always capture ALL AUE attrs BEFORE any render or DOM mutation.

### ❌ Anti-pattern: `block.replaceChildren()` on a container-items block

```javascript
// Only safe for simple blocks.
// For container-items or config-items, this destroys the data-aue-resource
// child rows that UE tracks for add/remove/reorder.
block.replaceChildren(newContent);
```

Use `block.replaceChildren()` ONLY for `simple` blocks or `container-items` native blocks where the items are reconstructed as new elements (with `moveInstrumentation` applied).
