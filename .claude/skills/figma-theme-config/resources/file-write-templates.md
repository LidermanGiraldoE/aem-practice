# File Write Templates

CSS block templates for all 5 token categories. Each template shows the **exact insertion location**, **CSS property name format**, and **placeholder syntax** for writes to `styles/styles.css`, `styles/tailwind.css`, and `styles/fonts.css`.

---

> **⚠️ CRITICAL: ALL VALUES MUST COME FROM FIGMA**
>
> Every value placeholder in this file uses `{{DESCRIPTION}}` syntax.
> These are **NOT default values** — they are instructions telling you what to extract from Figma.
>
> **NEVER** copy a placeholder literally into CSS. **NEVER** invent values.
> Every single value written to a CSS file MUST be resolved from Figma variables
> extracted in Phase A of the skill.
>
> If Figma does not provide a token for a given property, **omit it entirely** —
> do not guess or fill in a "reasonable" default.

---

## How to Use These Templates

1. Locate the target section in the project file (search for the comment anchor).
2. If the section does not exist, insert the entire block at the indicated location.
3. If the section exists, merge new tokens into it — add new entries, update changed values.
4. Never remove tokens not targeted by the current run without explicit `confirmDelete: true`.
5. **Replace every `{{...}}` placeholder with the actual value extracted from Figma.** If no Figma value exists for a property, omit that line entirely.

### Unit Conversion: Figma px → CSS rem

Figma stores all dimension values in **px**. Convert to **rem** using a base of `16px`:

```
rem_value = figma_px_value / 16
```

| Property type | Unit to use | Example (Figma → CSS) |
|---------------|-------------|------------------------|
| Font sizes | `rem` | `16px → 1rem`, `14px → 0.875rem`, `20px → 1.25rem` |
| Spacing | `rem` | `8px → 0.5rem`, `24px → 1.5rem`, `40px → 2.5rem` |
| Border radius | `rem` | `4px → 0.25rem`, `8px → 0.5rem`, `12px → 0.75rem` |
| Breakpoints | `px` | Keep as-is — media queries use px |
| Shadows (offsets, blur) | `px` | Keep as-is — shadows don't scale with font size |
| Font weight | _(unitless)_ | `400`, `700` — no unit |
| Line height | _(unitless)_ | `1.5`, `1.25` — unitless ratio |
| Letter spacing | `em` | Already relative to font size |

> **Always simplify** rem values: use `1rem` not `1.000rem`, `0.5rem` not `0.500rem`.

---

## Category: Colors

### `styles/styles.css` — EDS Semantic Aliases

**Location**: Inside the `:root { }` block (unlayered, at document root). Search for `--link-color` to find the existing anchor. If it doesn't exist yet, insert after the last existing CSS custom property in `:root`.

```css
/* === Design Tokens: Colors — EDS semantic aliases === */
--link-color: {{figma:color-primary}};              /* from Figma primary color token */
--link-hover-color: {{figma:color-primary-hover}};   /* from Figma primary hover token */
--text-color: {{figma:color-text}};                  /* from Figma text color token */
--background-color: {{figma:color-bg}};              /* from Figma background color token */
--light-color: {{figma:color-light}};                /* from Figma light surface token */
--dark-color: {{figma:color-dark}};                  /* from Figma dark surface token */
```

### `styles/tailwind.css` — Semantic + Full Palette

**Location**: Inside `@theme { }`. Search for `--color-primary` to find the existing anchor. If `@theme {}` doesn't exist yet, add it as the first block in the file (before any `@source` or `@utility` directives).

```css
/* === Design Tokens: Colors — semantic === */
--color-primary: {{figma:color-primary}};              /* from Figma primary color */
--color-primary-hover: {{figma:color-primary-hover}};  /* from Figma primary hover */
--color-text: {{figma:color-text}};                    /* from Figma text color */
--color-bg: {{figma:color-bg}};                        /* from Figma background */
--color-light: {{figma:color-light}};                  /* from Figma light surface */
--color-dark: {{figma:color-dark}};                    /* from Figma dark surface */

/* === Design Tokens: Colors — full palette === */
/* One entry per Figma color variable, using normalized name. Examples of NAME format: */
--color-{{normalized-name}}: {{figma:resolved-hex-value}};
--color-{{normalized-name}}: {{figma:resolved-hex-value}};
/* ... one line per extracted Figma color token ... */
```

**Full file structure reference** (`styles/tailwind.css`):

```css
@import "tailwindcss";

@theme {
  /* === Design Tokens: Colors — semantic === */
  --color-primary: {{figma:value}};   /* ALL values from Figma */
  /* ... */

  /* === Design Tokens: Colors — full palette === */
  --color-{{name}}: {{figma:value}};  /* ALL values from Figma */
  /* ... */

  /* === Design Tokens: Typography === */
  /* (see Typography template below) */

  /* === Design Tokens: Spacing === */
  /* (see Spacing template below) */

  /* === Design Tokens: Breakpoints === */
  /* (see Breakpoints template below) */

  /* === Design Tokens: Effects — Shadows === */
  /* (see Effects template below) */

  /* === Design Tokens: Effects — Border Radius === */
  /* (see Effects template below) */
}
```

---

## Category: Typography

### `styles/styles.css` — Font Families (`:root`) + Fallback `@font-face`

**Location for `:root` additions**: Inside the existing `:root { }` block, in the font family section. Search for `--body-font-family`.

```css
/* === Design Tokens: Typography — font families === */
--body-font-family: {{figma:body-font}}, {{body-font}}-fallback, sans-serif;
--heading-font-family: {{figma:heading-font}}, {{heading-font}}-fallback, serif;
```

**Location for fallback `@font-face`**: At document root level, **outside** any `@layer` block. These fallbacks must be unlayered to be globally available. Insert after all `@layer` and `@import` declarations but before block-level styles.

```css
/* CLS fallback font — tune size-adjust to reduce cumulative layout shift */
@font-face {
  font-family: {{figma:body-font}}-fallback;
  size-adjust: {{calculate-from-font-metrics}}%;   /* adjust until text metrics match the real body font */
  src: local('Arial');  /* choose a system font with similar metrics */
}

@font-face {
  font-family: {{figma:heading-font}}-fallback;
  size-adjust: {{calculate-from-font-metrics}}%;   /* adjust until text metrics match the real heading font */
  src: local('Georgia');  /* choose a system font with similar metrics */
}
```

### `styles/tailwind.css` — Font Families + Type Scale

**Location**: Inside `@theme { }`, in the typography section.

```css
/* === Design Tokens: Typography — font families === */
--font-body: {{figma:body-font}}, {{body-font}}-fallback, sans-serif;
--font-display: {{figma:heading-font}}, {{heading-font}}-fallback, serif;

/* === Design Tokens: Typography — type scale === */
/* One entry per Figma font-size variable. Property name from normalization. */
/* Convert Figma px → rem: value / 16 */
--text-{{normalized-size-name}}: {{figma:font-size-value / 16}}rem;
--text-{{normalized-size-name}}: {{figma:font-size-value / 16}}rem;
/* ... one line per extracted Figma font-size token ... */

/* === Design Tokens: Typography — weights === */
/* One entry per Figma font-weight variable */
--font-weight-{{normalized-weight-name}}: {{figma:weight-value}};
/* ... one line per extracted Figma font-weight token ... */

/* === Design Tokens: Typography — line heights === */
/* One entry per Figma line-height variable */
--leading-{{normalized-name}}: {{figma:line-height-value}};
/* ... one line per extracted Figma line-height token ... */

/* === Design Tokens: Typography — letter spacing === */
/* One entry per Figma letter-spacing variable */
--tracking-{{normalized-name}}: {{figma:letter-spacing-value}}em;
/* ... one line per extracted Figma letter-spacing token ... */
```

For composite type styles (size + weight + line-height combined), use `@utility` blocks **after** `@theme {}` in `styles/tailwind.css`:

```css
@utility type-{{figma:composite-style-name}} {
  font-size: {{figma:size-value / 16}}rem;   /* convert Figma px → rem */
  font-weight: {{figma:weight-value}};
  line-height: {{figma:line-height-value}};   /* unitless ratio */
}

/* Repeat for each composite type style found in Figma */
```

### `styles/fonts.css` — Production `@font-face`

**Location**: Append to the end of `styles/fonts.css`. One block per weight variant.

```css
/* {{figma:font-family-name}} — Regular */
@font-face {
  font-family: {{figma:font-family-name}};
  font-style: normal;
  font-weight: {{figma:weight-value}};  /* e.g. 400 */
  font-display: swap;
  src: url('../fonts/{{font-filename}}-{{weight-label}}.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}

/* Repeat one @font-face block per weight variant found in Figma.
   Common weight-label mappings:
     100=thin, 200=extralight, 300=light, 400=regular,
     500=medium, 600=semibold, 700=bold, 800=extrabold, 900=black
*/
```

> **Reminder**: Place the `.woff2` files in `fonts/` manually. The skill generates the rules — it does NOT download font files.

---

## Category: Spacing

### `styles/tailwind.css` — `@theme {}`

**Location**: Inside `@theme { }`, in the spacing section.

```css
/* === Design Tokens: Spacing === */
/* These ADD to the Tailwind default spacing scale (do not replace it) */
/* One entry per Figma spacing variable. Convert Figma px → rem: value / 16 */
--spacing-{{normalized-name}}: {{figma:spacing-value / 16}}rem;   /* generates: mt-{{name}}, h-{{name}}, pt-{{name}}, etc. */
/* ... one line per extracted Figma spacing token ... */
```

### `styles/styles.css` — `:root {}` (EDS-consumed tokens only)

**Location**: Inside `:root { }`. Only add tokens that are read by EDS JavaScript (`scripts.js` or `aem.js`).

```css
/* === Design Tokens: Spacing — EDS consumed === */
--nav-height: {{figma:nav-spacing-value / 16}}rem;   /* read by scripts.js for sticky header / scroll offset */
```

Do NOT add all spacing tokens to `:root` — only the ones explicitly consumed by JS code.

---

## Category: Breakpoints

### `styles/tailwind.css` — `@theme {}`

**Location**: Inside `@theme { }`, in the breakpoints section.

> ⚠️ **Critical**: Tailwind v4 replaces the entire default breakpoint set when any `--breakpoint-*` token is defined in `@theme`. Always write ALL THREE breakpoints together. Never write a partial set.

```css
/* === Design Tokens: Breakpoints === */
/* ⚠ Tailwind v4: these REPLACE the default breakpoints — keep all three together */
--breakpoint-md: {{figma:tablet-breakpoint}}px;    /* tablet  — md:* utilities */
--breakpoint-lg: {{figma:desktop-breakpoint}}px;   /* desktop — lg:* utilities */
--breakpoint-xl: {{figma:large-breakpoint}}px;     /* desktop large — xl:* utilities */
```

Do **not** write breakpoints to `styles/styles.css`. If a layout change at a new breakpoint requires a `@media` rule in base styles, the developer adds it to `@layer base {}` in `styles/styles.css` manually.

---

## Category: Effects

### `styles/tailwind.css` — Shadows (`@theme {}`)

**Location**: Inside `@theme { }`, in the effects section.

```css
/* === Design Tokens: Effects — Shadows === */
/* One entry per Figma shadow effect variable. Convert Figma shadow properties:
   x-offset, y-offset, blur, spread, color → CSS box-shadow value */
--shadow-{{normalized-name}}: {{figma:x}}px {{figma:y}}px {{figma:blur}}px {{figma:color-with-alpha}};
/* For multi-layer shadows, comma-separate the values:
   --shadow-{{name}}: {{layer1}}, {{layer2}}; */
/* ... one line per extracted Figma shadow token ... */
```

Tailwind auto-generates utilities from `--shadow-*` names: `shadow-{{name}}`.

### `styles/tailwind.css` — Border Radius (`@theme {}`)

**Location**: Inside `@theme { }`, in the effects section, after shadows.

```css
/* === Design Tokens: Effects — Border Radius === */
/* Note: dots in names replaced with dashes (e.g. 2.5xl → 2-5xl) */
/* One entry per Figma border-radius variable. Convert Figma px → rem: value / 16 */
--radius-{{normalized-name}}: {{figma:radius-value / 16}}rem;   /* generates: rounded-{{name}} */
/* ... one line per extracted Figma border-radius token ... */
```

### `styles/tailwind.css` — Animations (`@keyframes` + `@utility`)

**Location**: After the closing `}` of `@theme {}` in `styles/tailwind.css`.

```css
/* === Design Tokens: Effects — Animations === */
/* Generate one @keyframes + @utility pair per Figma animation/transition token.
   Extract duration, easing, and transform type from Figma variables. */

@keyframes {{figma:animation-name}} {
  from {
    opacity: 0;
    transform: {{figma:transform-from}};  /* e.g. translateY(8px), scale(0.95) */
  }
  to {
    opacity: 1;
    transform: {{figma:transform-to}};    /* e.g. translateY(0), scale(1) */
  }
}

@utility animate-{{figma:animation-name}} {
  animation: {{figma:animation-name}} {{figma:duration}}s {{figma:easing}} both;
}

/* Repeat for each animation token found in Figma */
```

---

## Complete `styles/tailwind.css` Structure Example

This shows the canonical top-to-bottom ordering for a fully-configured file:

```css
@import "tailwindcss";

@source "../blocks/**/*.js";
@source "../scripts/**/*.js";
@source "../design-system/**/*.js";

@theme {
  /* === Design Tokens: Colors — semantic === */
  --color-primary: {{figma:color-primary}};           /* ALL from Figma */
  --color-primary-hover: {{figma:color-primary-hover}};
  --color-text: {{figma:color-text}};
  --color-bg: {{figma:color-bg}};
  --color-light: {{figma:color-light}};
  --color-dark: {{figma:color-dark}};

  /* === Design Tokens: Colors — full palette === */
  --color-{{normalized-name}}: {{figma:value}};       /* ALL from Figma */
  /* ... */

  /* === Design Tokens: Typography — font families === */
  --font-body: {{figma:body-font}}, {{body-font}}-fallback, sans-serif;
  --font-display: {{figma:heading-font}}, {{heading-font}}-fallback, serif;

  /* === Design Tokens: Typography — type scale === */
  --text-{{name}}: {{figma:size / 16}}rem;            /* ALL from Figma, convert px→rem */
  /* ... */

  /* === Design Tokens: Spacing === */
  --spacing-{{name}}: {{figma:value / 16}}rem;        /* ALL from Figma, convert px→rem */
  /* ... */

  /* === Design Tokens: Breakpoints === */
  --breakpoint-md: {{figma:tablet-breakpoint}}px;
  --breakpoint-lg: {{figma:desktop-breakpoint}}px;
  --breakpoint-xl: {{figma:large-breakpoint}}px;

  /* === Design Tokens: Effects — Shadows === */
  --shadow-{{name}}: {{figma:shadow-value}};          /* ALL from Figma */
  /* ... */

  /* === Design Tokens: Effects — Border Radius === */
  --radius-{{name}}: {{figma:radius-value / 16}}rem;  /* ALL from Figma, convert px→rem */
  /* ... */
}

/* === Design Tokens: Effects — Animations === */
@keyframes {{figma:animation-name}} {
  from { opacity: 0; transform: {{figma:transform-from}}; }
  to   { opacity: 1; transform: {{figma:transform-to}}; }
}

@utility animate-{{figma:animation-name}} {
  animation: {{figma:animation-name}} {{figma:duration}}s {{figma:easing}} both;
}

/* (additional @keyframes and @utility blocks from Figma) */
```

---

## Complete `styles/styles.css` Structure Example

Canonical ordering for `:root` design tokens section:

```css
/* unlayered — global custom properties (always available) */
:root {
  /* === Design Tokens: Colors — EDS semantic aliases === */
  --link-color: {{figma:color-primary}};              /* ALL from Figma */
  --link-hover-color: {{figma:color-primary-hover}};
  --text-color: {{figma:color-text}};
  --background-color: {{figma:color-bg}};
  --light-color: {{figma:color-light}};
  --dark-color: {{figma:color-dark}};

  /* === Design Tokens: Typography — font families === */
  --body-font-family: {{figma:body-font}}, {{body-font}}-fallback, sans-serif;
  --heading-font-family: {{figma:heading-font}}, {{heading-font}}-fallback, serif;

  /* === Design Tokens: Spacing — EDS consumed === */
  --nav-height: {{figma:nav-spacing-value / 16}}rem;
}

/* unlayered — CLS fallback font faces */
@font-face {
  font-family: {{figma:body-font}}-fallback;
  size-adjust: {{calculate-from-font-metrics}}%;
  src: local('Arial');  /* choose a system font with similar metrics */
}

@font-face {
  font-family: {{figma:heading-font}}-fallback;
  size-adjust: {{calculate-from-font-metrics}}%;
  src: local('Georgia');  /* choose a system font with similar metrics */
}

/* Cascade layers — declared in order so utilities always win over base */
@layer base {
  /* EDS element + section styles here */
  body { ... }
  h1, h2, h3, h4, h5, h6 { ... }
  a { color: var(--link-color); }
  /* ... */
}
```
