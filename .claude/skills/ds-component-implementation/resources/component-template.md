# Component File Template

Copy-paste skeleton for a new DS component (`{component-name}.js`).  
Replace every `/* placeholder */` and `ComponentName` / `component-name` marker with the real values.

Refer to `resources/compound-variants.md` for the `cva()` function and config shape.

---

## Full Skeleton

```javascript
import { h } from '@dropins/tools/preact.js';
import { useState, useRef, useEffect } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
// Import child DS atoms/molecules (with .js extension):
// import { Icon } from '../../atoms/icon/icon.js';
// import { Button } from '../../atoms/button/button.js';

const html = htm.bind(h);

// ─── cva() resolver ────────────────────────────────────────────────────────
// See resources/compound-variants.md for full documentation.
const cva = (config) => (props = {}) => {
  const resolved = { ...config.defaultVariants, ...props };
  const classes = [config.base];
  for (const [key, options] of Object.entries(config.variants)) {
    const value = resolved[key];
    if (value != null && options[value] != null) {
      classes.push(options[value]);
    }
  }
  for (const cv of config.compoundVariants || []) {
    const { class: cls, ...conditions } = cv;
    const matches = Object.entries(conditions).every(([k, v]) => resolved[k] === v);
    if (matches) classes.push(cls);
  }
  return classes.filter(Boolean).join(' ');
};

// ─── Variant config ─────────────────────────────────────────────────────────
//
// Define ONE config object per component. This is the single source of truth
// for all class resolution. Never use if/else for class selection.
//
// Guidelines:
//   - `base`             → structural/layout classes always applied
//   - `variants`         → one key per prop dimension
//   - `compoundVariants` → classes that only apply for a specific combo
//   - `defaultVariants`  → what to use when the prop is omitted
//
const componentNameVariants = cva({
  base: [
    '/* Required structural classes — layout, display, cursor, transitions */',
    '/* Example: inline-flex items-center justify-center cursor-pointer */',
    '/* Example: transition-colors duration-150 ease-in-out */',
    '/* Example: focus-visible:outline-none */',
  ].join(' '),

  variants: {
    // ── Dimension 1: visual style ──────────────────────────────────────────
    variant: {
      default:   '/* default variant classes */',
      primary:   '/* primary variant classes */',
      secondary: '/* secondary variant classes */',
      // Add more values here — no render logic changes needed
    },

    // ── Dimension 2: size ─────────────────────────────────────────────────
    size: {
      s: '/* small size classes */',
      m: '/* medium size classes */',
      l: '/* large size classes */',
    },

    // ── Dimension 3: element type (add if component renders as <a> or <button>) ──
    // element: {
    //   button: '',
    //   link:   '/* link-specific classes (no :disabled, use aria-disabled) */',
    // },

    // ── Boolean modifier (disabled, loading, etc.) ─────────────────────────
    // Model as string keys 'true' / 'false' — pass JS boolean, JS coerces it
    disabled: {
      true:  '/* disabled appearance classes — opacity, cursor, pointer-events */',
      false: '',
    },
  },

  compoundVariants: [
    // Examples — add entries for specific prop combinations:

    // Secondary + link: different interactive states (no :disabled pseudo-class on <a>)
    // { variant: 'secondary', element: 'link', class: '/* secondary-link classes */' },

    // Disabled modifier per variant (if visual treatment differs per variant):
    // { variant: 'primary',   disabled: true, class: '/* primary disabled extra */' },
    // { variant: 'secondary', disabled: true, class: '/* secondary disabled extra */' },
  ],

  defaultVariants: {
    variant:  'default',
    size:     'm',
    // element:  'button',
    disabled: false,
  },
});

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * ComponentName — brief description of the component and its purpose.
 *
 * ## Props
 * - `variant`: `"default"` (default) | `"primary"` | `"secondary"` – Visual style.
 * - `size`: `"s"` | `"m"` (default) | `"l"` – Component size.
 * - `disabled`: `boolean` – Whether the component is disabled (default: `false`).
 * - `customClassName`: `string` – Additional Tailwind / CSS classes appended after cva result.
 * - `children`: Content rendered inside the component.
 * - `onClick`: `(event: Event) => void` – Click callback.
 * - `...rest`: Any valid HTML attribute passed to the root element.
 *
 * ### Universal Editor (UE) support
 * - `aueAttrs` (Pattern A — single object): spread directly on root element.
 *   OR
 * - `titleAueAttrs`, `descriptionAueAttrs`, etc. (Pattern B — per-field): spread on each field.
 *   Accept per-field attrs with a default of `{}`.
 *
 * @example
 * ```javascript
 * // Basic usage
 * html`<${ComponentName} variant="primary" size="m" onClick=${handleClick}>
 *   Label
 * </${ComponentName}>`
 *
 * // With customClassName
 * html`<${ComponentName} variant="secondary" customClassName="mt-4">
 *   Label
 * </${ComponentName}>`
 * ```
 */
export const ComponentName = ({
  // 1. Variants
  variant = 'default',
  size = 'm',
  // element (derive from href or other prop — see compound-variants.md)

  // 2. Content
  // title = '',
  // subtitle = '',
  // image,
  children,

  // 3. Booleans
  disabled = false,

  // 4. Callbacks
  onClick,
  // onChange,
  // onClose,

  // 5. Accessibility
  // ariaLabel,

  // 6. AEM Universal Editor attrs
  // Pattern A (simple component): aueAttrs = {},
  // Pattern B (per-field): titleAueAttrs = {}, descriptionAueAttrs = {},

  // 7. Extras — always last before ...rest
  customClassName = '',
  // children already destructured above when needed before customClassName

  // ...rest ALWAYS last
  ...rest
}) => {
  // ========== STATE & REFS ==========
  // Only add state that is genuinely needed.
  // Use useRef for DOM access — never useState for DOM element references.
  //
  // const [isOpen, setIsOpen] = useState(false);
  // const componentRef = useRef(null);

  // ========== EFFECTS ==========
  // CRITICAL: always return a cleanup function.
  //
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (e.key === 'Escape' && onClose) onClose();
  //   };
  //   document.addEventListener('keydown', handleKeyDown);
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, [onClose]); // ← all dependencies included

  // ========== EVENT HANDLERS ==========
  // Always check callbacks before calling — they may be undefined.
  //
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  // ========== CLASS RESOLUTION ==========
  // Single cva() call — zero if/else for class selection.
  const classes = [
    componentNameVariants({ variant, size, disabled }),
    customClassName,
  ].filter(Boolean).join(' ');

  // ========== RENDER ==========
  return html`
    <div
      class=${classes}
      data-name="component-name"
      ...${rest}
    >
      ${children}
    </div>
  `;
};

export default ComponentName;
```

---

## Checklist After Filling the Template

- [ ] `ComponentName` → replaced with PascalCase component name in all locations
- [ ] `component-name` → replaced with kebab-case component name in `data-name`
- [ ] `componentNameVariants` → renamed to match the component (e.g., `buttonVariants`)
- [ ] `/* placeholder */` class comments → replaced with real Tailwind classes
- [ ] Commented-out sections (state, effects, element dimension) → uncommented or removed as needed
- [ ] Props destructuring order respected: variants → content → booleans → callbacks → accessibility → aueAttrs → customClassName → children → ...rest
- [ ] `data-name` attribute present on root element
- [ ] `customClassName` appended **after** cva result (not inside config)
- [ ] `...rest` spread on root element
- [ ] File saved as `design-system/{type}/{component-name}/{component-name}.js`
