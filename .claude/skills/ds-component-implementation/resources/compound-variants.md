# compoundVariants Pattern — `cva()` Reference

This file is the **single source of truth** for class resolution in DS components.  
All component files (`*.js`) and templates reference this pattern.

---

## The `cva()` Utility Function

Copy this function verbatim into every DS component that needs multi-dimension class resolution.  
Place it **after the imports and `html` binding**, before the class config object.

```javascript
/**
 * Class Variance Authority (CVA) — lightweight variant resolver.
 *
 * Resolves Tailwind classes from a declarative config object.
 * No dependencies. ~30 lines. Same mental model as the CVA npm package.
 *
 * @param {CVAConfig} config
 * @returns {(props?: Record<string, unknown>) => string}
 */
const cva = (config) => (props = {}) => {
  const resolved = { ...config.defaultVariants, ...props };
  const classes = [config.base];

  // 1. Pick the class string for each variant dimension
  for (const [key, options] of Object.entries(config.variants)) {
    const value = resolved[key];
    if (value != null && options[value] != null) {
      classes.push(options[value]);
    }
  }

  // 2. Apply compound overrides — ALL conditions must match
  for (const cv of config.compoundVariants || []) {
    const { class: cls, ...conditions } = cv;
    const matches = Object.entries(conditions).every(
      ([k, v]) => resolved[k] === v,
    );
    if (matches) classes.push(cls);
  }

  return classes.filter(Boolean).join(' ');
};
```

---

## CVAConfig Shape

```typescript
type CVAConfig = {
  /** Classes always applied, regardless of props. */
  base: string;

  /**
   * Variant dimensions.
   * Each key is a prop name; each value maps prop values → class strings.
   */
  variants: {
    [dimension: string]: {
      [value: string]: string;
    };
  };

  /**
   * Compound overrides — applied when ALL listed conditions match.
   * Use for classes that only appear in a specific prop combination.
   * The `class` key holds the classes to add; all other keys are conditions.
   */
  compoundVariants?: Array<{
    class: string;
    [conditionKey: string]: unknown;
  }>;

  /**
   * Default values for each dimension.
   * Used when the prop is omitted from the component call.
   */
  defaultVariants: {
    [dimension: string]: unknown;
  };
};
```

---

## Usage Pattern

### 1. Define the config object (once, at module level)

```javascript
const componentVariants = cva({
  // Always applied
  base: '/* base structural classes */',

  variants: {
    // Dimension 1: visual style
    variant: {
      primary:   '/* primary classes */',
      secondary: '/* secondary classes */',
      ghost:     '/* ghost classes */',
    },

    // Dimension 2: size
    size: {
      s:  '/* small classes */',
      m:  '/* medium classes */',
      l:  '/* large classes */',
    },

    // Dimension 3: element type (renders as <button> or <a>)
    element: {
      button: '',
      link:   '/* link-specific overrides */',
    },

    // Boolean dimensions — model as true/false keys
    disabled: {
      true:  '/* disabled appearance classes */',
      false: '',
    },
  },

  compoundVariants: [
    // Override for a specific combination:
    // secondary + link → different interactive states than secondary + button
    {
      variant: 'secondary',
      element: 'link',
      class: '/* secondary-link-specific classes */',
    },
    // disabled=true modifier on top of any variant
    {
      variant: 'primary',
      disabled: true,
      class: '/* primary disabled additional classes */',
    },
    {
      variant: 'secondary',
      disabled: true,
      class: '/* secondary disabled additional classes */',
    },
  ],

  defaultVariants: {
    variant:  'primary',
    size:     'm',
    element:  'button',
    disabled: false,
  },
});
```

### 2. Call the resolver in the component body

```javascript
export const MyComponent = ({
  variant = 'primary',
  size = 'm',
  href,
  disabled = false,
  customClassName = '',
  children,
  ...rest
}) => {
  const element = href ? 'link' : 'button';

  // ✅ Single call — no if/else for class selection
  const classes = [
    componentVariants({ variant, size, element, disabled }),
    customClassName,
  ].filter(Boolean).join(' ');

  // ...render
};
```

---

## Behavioral Contract

| Scenario | Behavior |
|---|---|
| Prop matches a variant key | That variant's class string is included |
| Prop omitted | `defaultVariants` value is used |
| Prop value not in variant options | Falls through silently — only base classes applied for that dimension |
| Boolean dimension with `disabled={true}` | Pass `disabled: true` directly; config key must be `true` (string) |
| `compoundVariants` — partial match | Only entries where ALL conditions match are applied |
| `customClassName` | Appended **after** cva result — never part of the config |
| Responsive overrides (`mdSize`, `lgSize`) | Handled **outside** `cva()` via `prefixClasses()` — not variant dimensions |

---

## When to Use `compoundVariants` vs Simple Inline Classes

### Use `compoundVariants` when:
- A class combination only makes sense for a **specific set of prop values** (e.g., secondary + link)
- A boolean modifier (disabled, hasBorder) needs **different classes per variant** (e.g., primary disabled looks different from secondary disabled)
- Adding a new variant value would otherwise require adding a new branch to an if/else chain

### Use inline classes (outside cva) when:
- The class is purely structural and does not change with props (include in `base`)
- The class is always appended and never changes (include in `base`)
- The class is from `customClassName` — always append after the cva result

### Use `prefixClasses()` (outside cva) when:
- Applying Tailwind responsive prefixes for size overrides (`mdSize`, `lgSize`)
- The class set depends on a breakpoint prefix, not on a prop value

---

## Adding a New Variant — Change Only the Config

**Before** (if/else approach — requires changing render logic):
```javascript
// Must touch render logic to add a new variant
let variantClasses;
if (variant === 'primary') {
  variantClasses = PRIMARY;
} else if (variant === 'secondary') {
  variantClasses = SECONDARY;
// ← Changing here also needs the constant above AND conditional below
} else if (variant === 'danger') {
  variantClasses = DANGER;
}
```

**After** (cva approach — config only):
```javascript
const componentVariants = cva({
  variants: {
    variant: {
      primary:   '/* primary */',
      secondary: '/* secondary */',
      danger:    '/* ADD: just add an entry here */',
      //         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      //         No changes needed anywhere else
    },
  },
  // ...
});
```

**Adding a compound override for the new variant:**
```javascript
compoundVariants: [
  // existing entries unchanged
  { variant: 'secondary', element: 'link', class: '/* ... */' },
  // ADD: new compound rule
  { variant: 'danger', disabled: true, class: '/* danger disabled */' },
],
```

---

## Edge Cases

### Boolean dimensions
Model boolean props (`disabled`, `hasBorder`, `loading`) as variant dimensions with `true`/`false` string keys:

```javascript
variants: {
  disabled: {
    true:  'opacity-50 cursor-not-allowed pointer-events-none',
    false: '',
  },
},
```

When calling: `componentVariants({ disabled: true })` — pass the JS boolean directly; the `String()` conversion is implicit in object key lookup.

> ⚠️ JS object keys are always strings, so `options[true]` resolves to `options['true']` — this is why the config must use string key `'true'`, not boolean `true`.

### Element type dimension (`<button>` vs `<a>`)
Derive the `element` value from a prop (e.g., `href`), not from the component's tag name:

```javascript
const element = href ? 'link' : 'button';
const classes = componentVariants({ variant, size, element, disabled });

const Tag = href ? 'a' : 'button';
```

### Responsive size overrides (outside cva)
`mdSize` and `lgSize` props use `prefixClasses()` to add Tailwind breakpoint prefixes — keep them separate from `cva()`:

```javascript
// Define prefixClasses near the top of the component file
const prefixClasses = (classString, bp) => classString
  .split(' ')
  .filter(Boolean)
  .map((c) => `${bp}:${c}`)
  .join(' ');

// In the component body:
const responsiveClasses = [
  mdSize ? prefixClasses(sizeConfig[mdSize], 'md') : '',
  lgSize ? prefixClasses(sizeConfig[lgSize], 'lg') : '',
].filter(Boolean).join(' ');

const classes = [
  componentVariants({ variant, size, element, disabled }),
  responsiveClasses,
  customClassName,
].filter(Boolean).join(' ');
```
