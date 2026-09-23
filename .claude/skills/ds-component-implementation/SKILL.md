---
name: ds-component-implementation
description: Implement DS components correctly following the project's established patterns - Preact/HTM, Tailwind, compoundVariants (cva), AEM Universal Editor integration, and accessibility. Use for ALL new DS components AND modifications to existing ones.
when_to_use:
  - Creating a new atom, molecule, or organism in design-system/
  - Adding a variant, size, or state to an existing DS component
  - Adding Universal Editor (aueAttrs) support to a DS component
  - Any JavaScript/CSS work inside design-system/
when_not_to_use:
  - AEM block development (use building-blocks skill instead)
  - Page import/migration (use page-import skill)
  - General EDS scripts.js changes (use content-driven-development skill)
---

# DS Component Implementation Skill

## Prerequisites

Before starting, read these resource files in order:

1. `resources/compound-variants.md` — the `cva()` function, CVAConfig shape, behavioral contract
2. `resources/component-template.md` — copy-paste component skeleton
3. `resources/sample-template.md` — copy-paste sample file skeleton

---

## 7-Step Workflow

### Step 1 — Determine Atomic Level

Classify the component before writing any code:

| Level | Rule |
|---|---|
| **Atom** | No DS component imports. HTML-only. Highly reusable. Single purpose (button, icon, chip, badge, label). |
| **Molecule** | Imports atoms. Container logic (`useState`, open/close, selection). Renders `children` or a list of items. |
| **Organism** | Imports molecules AND atoms. Multi-section layout. May have business logic. Fixed-dimension designs. |

```
design-system/
  atoms/
    {component-name}/
      {component-name}.js
      {component-name}.sample.js
  molecules/
    {component-name}/
      ...
  organisms/
    {component-name}/
      ...
```

Naming rules:
- **Folders and files**: `kebab-case`
- **Exports**: `PascalCase` – `export const MyComponent`
- **Sample exports**: `PascalCase + Sample` – `export const MyComponentSample`

---

### Step 2 — Create File Structure

```
design-system/{type}/{component-name}/
  {component-name}.js          ← Component implementation
  {component-name}.sample.js   ← Usage showcase
```

No CSS files. All styles via Tailwind utilities or CSS variables inline.

---

### Step 3 — Define the cva Config

Open `resources/compound-variants.md`. Copy the `cva()` function into your component file. Then define the config object:

1. **`base`** — structural classes that apply regardless of props (layout, cursor, transitions, focus rings)
2. **`variants`** — one key per prop dimension (`variant`, `size`, `element`, `disabled`, etc.)
3. **`compoundVariants`** — class entries for specific prop combinations (e.g., secondary + link, primary + disabled)
4. **`defaultVariants`** — what to use when the caller omits a prop

Rules:
- Never use `if/else` chains to select classes — put everything in the config
- Model boolean props (`disabled`, `hasBorder`) as variant dimensions with `true`/`false` string keys
- `customClassName` is **always appended after** the cva result — never inside the config
- Responsive overrides (`mdSize`, `lgSize`) stay outside `cva()` — use `prefixClasses()` separately

**Config placement**: module level, after the `cva()` function, before the component.

```javascript
const componentVariants = cva({
  base: '/* Always-on structural classes */',
  variants: {
    variant: {
      default:   '/* ... */',
      primary:   '/* ... */',
    },
    size: {
      s: '/* ... */',
      m: '/* ... */',
      l: '/* ... */',
    },
    disabled: {
      true:  '/* disabled appearance: opacity, cursor, pointer-events */',
      false: '',
    },
  },
  compoundVariants: [
    // Only add entries when a combination needs DIFFERENT classes than
    // what the individual dimensions would produce:
    // { variant: 'secondary', element: 'link', class: '/* ... */' },
  ],
  defaultVariants: {
    variant:  'default',
    size:     'm',
    disabled: false,
  },
});
```

---

### Step 4 — Implement the Component

Use `resources/component-template.md` as the starting skeleton. Key rules while filling it in:

#### Imports
```javascript
// ✅ Always Preact — never React
import { h } from '@dropins/tools/preact.js';
import { useState, useRef, useEffect } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';

// ✅ Always include .js extension
import { Icon } from '../../atoms/icon/icon.js';
```

#### Props Destructuring Order
Always follow this order — never deviate:

```javascript
export const ComponentName = ({
  // 1. Variants
  variant = 'default',
  size = 'm',

  // 2. Content
  title = '',
  children,

  // 3. Booleans
  disabled = false,

  // 4. Callbacks
  onClick,

  // 5. Accessibility
  ariaLabel,

  // 6. AEM UE attrs (Pattern A or B — see Step 5)
  aueAttrs = {},

  // 7. Extras — customClassName before children when both present, ...rest last
  customClassName = '',

  // 8. ...rest ALWAYS last
  ...rest
}) => {
```

#### Class Resolution — Single cva() Call
```javascript
// ✅ One call — no if/else
const classes = [
  componentVariants({ variant, size, disabled }),
  customClassName,
].filter(Boolean).join(' ');
```

#### Render Root Element
```javascript
return html`
  <div
    class=${classes}
    data-name="component-name"   ← kebab-case, always present
    ...${rest}
  >
    ${children}
  </div>
`;
```

#### State and Refs
- `useState` — for component internal state (open/close, selection, active index)
- `useRef` — for DOM element references **only** (never for state)
- Never use `useState` to track hover/focus — use Tailwind pseudo-utilities (`hover:`, `focus-visible:`) for CSS-native interactive states

#### Effects — Always Clean Up
```javascript
useEffect(() => {
  const handleKeyDown = (e) => { /* ... */ };
  document.addEventListener('keydown', handleKeyDown);
  // ✅ Required cleanup
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}, [/* all dependencies */]);
```

#### Callbacks — Always Check Before Calling
```javascript
// ✅ Guard before calling
if (onClick) onClick(e);
```

#### Icon Usage
```javascript
import { Icon } from '../../atoms/icon/icon.js';

// In render — pass color="currentColor" to inherit button/link text color
html`<${Icon} icon="base/arrow-right" size="m" color="currentColor" />`

// Predefined sizes: xs=8 xsm=10 sm=12 s=16 m=20 xl=24 2xl=32 l=40
// Custom size: html`<${Icon} icon="base/home" customSize=${48} />`
// With label: html`<${Icon} icon="base/phone" ariaLabel="Llamar" />`
// Decorative: html`<${Icon} icon="base/check" />`  ← aria-hidden="true" auto-applied
```

#### Image Handling
```javascript
// Use createOptimizedPicture for author-uploaded images in blocks
// createOptimizedPicture is available from scripts/aem.js

// For static assets in design-system/: reference via window.hlx.codeBasePath
const assetPath = `${window.hlx?.codeBasePath || ''}/icons/base/example.svg`;
```

---

### Step 5 — AEM Universal Editor Integration

When the component is used inside an AEM block that supports UE inline editing.

#### Pattern A — Single `aueAttrs` Object (Simple Components)
Use when the whole component is the editable unit:

```javascript
export const BannerTitle = ({
  title = '',
  aueAttrs = {},     // ← spread on root
  ...rest
}) => html`
  <div ...${aueAttrs} ...${rest}>
    <h2>${title}</h2>
  </div>
`;
```

#### Pattern B — Per-Field `aueAttrs` (Multiple Editable Fields)
Use when each field needs its own inline-edit handle:

```javascript
export const MyOrganism = ({
  title = '',
  description = '',
  titleAueAttrs = {},        // ← spread on the <h2>
  descriptionAueAttrs = {},  // ← spread on the <p>
  ...rest
}) => html`
  <div data-name="my-organism" ...${rest}>
    <h2 ...${titleAueAttrs}>${title}</h2>
    <p  ...${descriptionAueAttrs}>${description}</p>
  </div>
`;
```

Rules:
1. Accept per-field attrs with a default of `{}` — never skip the default
2. Spread on the **specific rendered element** — the `<h2>` for title, not a wrapper
3. Never spread on `<a>` or `<button>` — use a wrapper `<span>` or `<div>`
4. Never spread item-level attrs (`data-aue-resource`) on Preact elements when the original DOM row is still present
5. Document in JSDoc which props receive UE attrs

---

### Step 6 — Create the Sample File

Use `resources/sample-template.md` as the skeleton. Required sections:

| Section | Content |
|---|---|
| **Variants** | One instance per value in `variants.variant` |
| **Sizes** | One instance per value in `variants.size` |
| **States** | Normal + Disabled + any other stateful behavior |
| **Interactive** | Only if component uses `useState`; remove otherwise |
| **Use Cases** | ≥ 2 realistic examples matching design specs |

No CSS file for samples. Inline styles for layout scaffolding only (padding, margin, display, grid, gap). Use Tailwind classes on the component itself.

---

### Step 7 — Register in ds-arquitecture

After creating both files, import and render the sample in the corresponding registry file:

```javascript
// blocks/design-system-block/ds-arquitecture/atoms.samples.js
import { ComponentNameSample } from '../../../design-system/atoms/component-name/component-name.sample.js';

export const AtomsSamples = () => html`
  <div>
    <h2>Atoms samples</h2>
    /* ... existing samples ... */
    <${ComponentNameSample} />   ← add at the end
  </div>
`;
```

Registry files by type:
- Atoms → `blocks/design-system-block/ds-arquitecture/atoms.samples.js`
- Molecules → `blocks/design-system-block/ds-arquitecture/molecules.samples.js`
- Organisms → `blocks/design-system-block/ds-arquitecture/organisms.samples.js`

Import path pattern:
```
../../../design-system/{type}/{component-name}/{component-name}.sample.js
```

---

## Interactive Patterns Reference

Use these patterns for components that require interactivity beyond Tailwind pseudo-utilities.

### Click Outside (Dropdowns, Popovers)
```javascript
const dropdownRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
      if (onClose) onClose();
    }
  };
  if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isOpen, onClose]);
```

### Keyboard Navigation
```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && onClose) onClose();
    if (e.key === 'Enter' || e.key === ' ') { /* activate */ }
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [onClose]);
```

### Body Scroll Prevention (Modals)
```javascript
useEffect(() => {
  document.body.style.overflow = isOpen ? 'hidden' : '';
  return () => { document.body.style.overflow = ''; };
}, [isOpen]);
```

### Focus Management (Modals, Dialogs)
```javascript
const firstFocusableRef = useRef(null);

useEffect(() => {
  if (isOpen && firstFocusableRef.current) {
    firstFocusableRef.current.focus();
  }
}, [isOpen]);
```

---

## compoundVariants — Practical Examples

### Example: Button-Like Component (variant × size × element × disabled)

This shows a realistic multi-dimension scenario. Four independent dimensions interact through `compoundVariants` so that each combination produces the right classes without touching render logic.

```javascript
const buttonVariants = cva({
  base: [
    'inline-flex items-center justify-center whitespace-nowrap',
    'cursor-pointer select-none',
    'transition-colors duration-150 ease-in-out',
    'focus-visible:outline-none',
  ].join(' '),

  variants: {
    // Dimension 1: Visual style
    variant: {
      primary:   '/* primary base: bg + text + hover + active + focus ring */',
      secondary: '/* secondary base: outline bg + text + hover + active */',
    },

    // Dimension 2: Size — padding + text scale
    size: {
      s: '/* small: px + py + type-ui-m */',
      m: '/* medium: px + py + type-ui-m */',
      l: '/* large: px + py + type-ui-l */',
    },

    // Dimension 3: Element type (button vs <a>)
    // <a> cannot use CSS :disabled — needs aria-disabled approach instead
    element: {
      button: '',
      link:   'no-underline',  // link-specific base
    },

    // Dimension 4: Disabled — boolean modifier
    // Model boolean as string keys 'true' / 'false'
    disabled: {
      true:  'opacity-70 cursor-not-allowed',
      false: '',
    },
  },

  compoundVariants: [
    // ── element=link overrides ──────────────────────────────────────────
    // <a> can't use :disabled — uses aria-disabled instead
    // Primary + link: same colours, aria-disabled guards
    {
      variant: 'primary',
      element: 'link',
      class: '/* primary-link: hover/active without :not-disabled guard; aria-disabled colours */',
    },
    // Secondary + link: different interactive classes than secondary + button
    {
      variant: 'secondary',
      element: 'link',
      class: '/* secondary-link: hover/active without :not-disabled guard; aria-disabled colours */',
    },

    // ── disabled=true modifier per variant ──────────────────────────────
    // If both variants share the same disabled appearance, handle in `disabled.true`.
    // Only add compoundVariants entries when the disabled look DIFFERS per variant:
    // { variant: 'primary',   disabled: true, class: '/* primary-specific disabled extra */' },
    // { variant: 'secondary', disabled: true, class: '/* secondary-specific disabled extra */' },
  ],

  defaultVariants: {
    variant:  'primary',
    size:     'm',
    element:  'button',
    disabled: false,
  },
});
```

**Component body — single call, no class if/else:**

```javascript
export const MyButton = ({
  variant = 'primary',
  size = 'm',
  href,
  disabled = false,
  customClassName = '',
  children,
  ...rest
}) => {
  const element = href ? 'link' : 'button';
  const Tag = href ? 'a' : 'button';

  // ✅ One call — all combinations handled declaratively
  const classes = [
    buttonVariants({ variant, size, element, disabled }),
    customClassName,
  ].filter(Boolean).join(' ');

  return html`
    <${Tag}
      class=${classes}
      data-name="my-button"
      disabled=${Tag === 'button' ? disabled : undefined}
      aria-disabled=${Tag === 'a' && disabled ? 'true' : undefined}
      tabIndex=${Tag === 'a' && disabled ? -1 : undefined}
      href=${href}
      ...${rest}
    >
      ${children}
    </${Tag}>
  `;
};
```

---

### Adding a New Variant Value — Config Only

To add a `"danger"` variant:

```javascript
// ✅ Only change: add entry to variants.variant
variants: {
  variant: {
    primary:   '/* unchanged */',
    secondary: '/* unchanged */',
    danger:    '/* danger: red bg, white text, danger hover/active/focus */',
    //         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //         Done. No changes to component body, props, or render logic.
  },
},

// Add compound rules ONLY if danger+link or danger+disabled needs special treatment:
compoundVariants: [
  /* existing entries unchanged */
  { variant: 'danger', element: 'link', class: '/* danger-link */' },
  // { variant: 'danger', disabled: true, class: '/* danger-disabled extra */' },
],

defaultVariants: {
  variant: 'primary',  // ← unchanged, danger is opt-in
  // ...
},
```

**Sample file update** — add one entry to the Variants section:
```javascript
// In ComponentNameSample — Variants section:
html`<${MyButton} variant="danger">Danger</${MyButton}>`
```

---

### Adding a New Dimension (e.g., `hasBorder`)

```javascript
// Step 1: add to variants
variants: {
  // existing dimensions unchanged...
  hasBorder: {
    true:  '/* inset box-shadow or border classes */',
    false: '',
  },
},

// Step 2: add compound entries if hasBorder+something needs a special combo
// compoundVariants: [
//   { variant: 'secondary', hasBorder: true, class: '/* secondary+border specific */' },
// ],

// Step 3: add to defaultVariants
defaultVariants: {
  // existing...
  hasBorder: true,  // if bordered by default
},
```

**Component body** — add `hasBorder` to the destructured props and the resolver call:
```javascript
export const MyButton = ({
  // ...existing props...
  hasBorder = true,   // ← add
  // ...
}) => {
  const classes = buttonVariants({ variant, size, element, disabled, hasBorder });
  // ...
};
```

---

### Responsive Size Overrides (Outside cva)

Responsive breakpoint classes are generated with `prefixClasses()` and joined separately — they are not part of the `cva()` config because they depend on a breakpoint prefix, not on a variant value.

```javascript
// Placed at module level (near SIZE_CONFIG or cva())
const prefixClasses = (classString, bp) => classString
  .split(' ')
  .filter(Boolean)
  .map((c) => `${bp}:${c}`)
  .join(' ');

// In component body:
export const MyComponent = ({
  size = 'm',
  mdSize,   // override at ≥768px
  lgSize,   // override at ≥1240px
  // ...
}) => {
  const baseCls = componentVariants({ size, /* ... */ });

  // Responsive classes use the same SIZE_CONFIG or lookup table
  const responsiveCls = [
    mdSize ? prefixClasses(sizeClasses[mdSize], 'md') : '',
    lgSize ? prefixClasses(sizeClasses[lgSize], 'lg') : '',
  ].filter(Boolean).join(' ');

  const classes = [baseCls, responsiveCls, customClassName].filter(Boolean).join(' ');
  // ...
};
```

---

## Modifying Existing Components

### Step-by-Step Modification Workflow

1. **Read the existing component** — understand the current `cva()` config and which props it exposes
2. **Identify the change point** — is it:
   - Adding a new **variant value** (new entry in `variants.{dimension}`)
   - Adding a new **dimension** (new key in `variants` + entry in `defaultVariants`)
   - Adding a **compound override** (new entry in `compoundVariants`)
   - Changing **behaviour** (event handler, effect, render tree)
3. **Make the targeted change** — see guidance below per change type
4. **Update the sample file** — add a showcase for the new value/state
5. **Validate** — run lint + Tailwind build + check existing variants still render

### Adding a New Variant Value

Only modify the config — zero render logic changes:

```javascript
// Before
variants: {
  variant: {
    default:   '/* ... */',
    primary:   '/* ... */',
  },
},

// After — only added 'danger' entry
variants: {
  variant: {
    default:   '/* unchanged */',
    primary:   '/* unchanged */',
    danger:    '/* new classes */',   // ← only change
  },
},
```

Rule: If you find yourself changing anything outside `config.variants.{dimension}`, question whether it's really a simple variant addition.

### Adding a New Dimension

```javascript
// Step 1: add to variants (new key)
variants: {
  // existing dimensions unchanged
  loading: {
    true:  'opacity-70 pointer-events-none',
    false: '',
  },
},

// Step 2: add to defaultVariants
defaultVariants: {
  // existing unchanged
  loading: false,
},

// Step 3: add to component props destructuring
export const MyComponent = ({
  loading = false,  // ← add
  // ...
}) => {
  // Step 4: add to cva() call
  const classes = componentVariants({ /* existing */, loading });
  // ...
};
```

### Adding a Compound Override

```javascript
compoundVariants: [
  // existing entries PRESERVED — never remove or modify existing entries
  { variant: 'secondary', element: 'link', class: '/* existing */' },

  // New entry — append at the end
  { variant: 'danger', element: 'link', class: '/* danger-link */' },
],
```

### Adding to the Sample File

**Preserve all existing sections** when adding new ones:

```javascript
// In ComponentNameSample — Variants section only gets a new entry:
html`
  <${ComponentName} variant="default">Default</${ComponentName}>
  <${ComponentName} variant="primary">Primary</${ComponentName}>
  <${ComponentName} variant="secondary">Secondary</${ComponentName}>
  <${ComponentName} variant="danger">Danger</${ComponentName}>   ← add at end
`
```

Warning: **Do not restructure or remove existing sample items** when adding new ones. Other agents and reviewers use the sample file to verify unchanged variants still work.

### When No Render Logic Change Is Needed

If you're only adding a variant value, you should NOT need to change:
- The `return html\`...\`` render tree
- Any `if/else` condition in the component body
- Any event handler
- Any `useEffect`

If you find yourself needing to change these for what feels like a variant addition, the change is likely a **new behaviour** (not a variant) — reconsider the design.

---

## Anti-Patterns Table

| # | Forbidden | Correct |
|---|---|---|
| 1 | `"double quotes"` | `'single quotes'` |
| 2 | `condition1 ? val1 : condition2 ? val2 : val3` | `if/else if/else` block |
| 3 | `import { X } from './file'` | `import { X } from './file.js'` |
| 4 | Separate `.css` file for DS component | Tailwind classes inline |
| 5 | `import { useState } from 'react'` | `import { useState } from '@dropins/tools/preact-hooks.js'` |
| 6 | `useEffect(() => { ... }, [])` without cleanup | `return () => { /* cleanup */ }` inside every `useEffect` that adds listeners |
| 7 | `onClick()` without guard | `if (onClick) onClick()` |
| 8 | `const [el, setEl] = useState(null)` for DOM refs | `const el = useRef(null)` |
| 9 | `useEffect(..., [dep1])` missing deps | Include all referenced values in the dependency array |
| 10 | `if (variant === 'primary') { cls = '...' } else if ...` | Put classes in `cva()` config |
| 11 | `const [isHovered, setIsHovered] = useState(false)` for CSS states | Use Tailwind pseudo-utilities `hover:`, `focus-visible:`, `active:` |

---

## Pre-Commit Validation Checklist

Run through this checklist before every `git commit` on a DS component.

### File Structure
- [ ] `design-system/{type}/{component-name}/{component-name}.js` exists
- [ ] `design-system/{type}/{component-name}/{component-name}.sample.js` exists
- [ ] Component registered in `blocks/design-system-block/ds-arquitecture/{type}.samples.js`
- [ ] Folder and file names are `kebab-case`
- [ ] No `.css` file in the component directory

### Code Conventions
- [ ] All strings use single quotes
- [ ] All imports include `.js` extension
- [ ] Preact imported from `@dropins/tools/preact.js` (not `preact` or `react`)
- [ ] Hooks imported from `@dropins/tools/preact-hooks.js`
- [ ] HTM imported from `htm`
- [ ] JSDoc block present with all props documented
- [ ] `data-name` attribute present on root element
- [ ] `customClassName` and `...rest` props supported
- [ ] Props in correct destructuring order (variants → content → booleans → callbacks → accessibility → aueAttrs → customClassName → children → ...rest)

### Anti-Pattern Scan
- [ ] No nested ternaries
- [ ] No separate `.css` file
- [ ] No React imports
- [ ] No `useState` / `setState` for DOM element references
- [ ] No `useEffect` without cleanup return
- [ ] No unchecked callback calls (`onClick()` without `if (onClick)` guard)
- [ ] No incomplete dependency arrays in `useEffect`

### cva Config Validation
- [ ] All keys in `defaultVariants` exist as dimensions in `variants`
- [ ] All condition keys in each `compoundVariants` entry exist as dimensions in `variants`
- [ ] Boolean dimensions (disabled, loading, hasBorder) use string keys `'true'` / `'false'` in the config — not JS booleans
- [ ] No `if/else` chain used to select classes (use config instead)
- [ ] `customClassName` appended after `cva()` result, not inside the config
- [ ] `compoundVariants` conditions reference only dimensions that exist in `variants`
- [ ] `defaultVariants` provides a value for every dimension declared in `variants`

### Sample File Completeness
- [ ] All values in `variants.variant` are showcased
- [ ] All values in `variants.size` are showcased
- [ ] Disabled state is showcased
- [ ] Any `compoundVariant` combinations are demonstrated in Use Cases or States section
- [ ] No CSS file imported in the sample
- [ ] No hardcoded color/spacing values (Tailwind classes or CSS vars only)
- [ ] `ComponentNameSample` default export present (required for ds-arquitecture registration)

### Registration Verification
- [ ] Import added to `blocks/design-system-block/ds-arquitecture/{type}.samples.js`
- [ ] `<${ComponentNameSample} />` rendered inside the `{Type}Samples` component
- [ ] Import path follows pattern `../../../design-system/{type}/{name}/{name}.sample.js`

### Commands

```bash
# 1. Fix auto-fixable lint issues
npm run lint:fix

# 2. Compile Tailwind (always run after JS changes that add new Tailwind classes)
npm run tw:build

# 3. Verify no remaining lint errors
npm run lint
```

**Interpret errors:**
- `no-nested-ternary` → replace with `if/else` block
- `import/extensions` → add `.js` to import path
- `react/...` or JSX-related → you imported from the wrong runtime (`react` instead of `@dropins/tools/preact.js`)
- Tailwind class not generated → run `npm run tw:build` and check class is spelled correctly
