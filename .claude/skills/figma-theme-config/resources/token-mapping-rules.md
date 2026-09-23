# Token Mapping Rules

This document defines the complete rules for classifying Figma variables into token categories and determining which project files and CSS sections to write to.

---

## Classification Table

Apply rules in priority order (top wins). Stop at the first match.

| Priority | `resolvedType` | Collection name contains (case-insensitive) | Variable name contains (case-insensitive) | → `TokenCategory` | Subtype |
|----------|---------------|----------------------------------------------|-------------------------------------------|-------------------|---------|
| 1 | `COLOR` | *(any)* | *(any)* | `colors` | — |
| 2 | *(any)* | `color`, `colours`, `palette`, `brand` | *(any)* | `colors` | — |
| 3 | `STRING` | *(any)* | `font`, `family`, `typeface`, `face` | `typography` | `font-family` |
| 4 | `FLOAT` | *(any)* | `font-size`, `size`, `scale`, `text` | `typography` | `font-size` |
| 5 | `FLOAT` | *(any)* | `weight`, `font-weight` | `typography` | `font-weight` |
| 6 | `FLOAT` | *(any)* | `line-height`, `leading` | `typography` | `line-height` |
| 7 | `FLOAT` | *(any)* | `letter-spacing`, `tracking` | `typography` | `letter-spacing` |
| 8 | *(any)* | `typography`, `font`, `type`, `text` | *(any)* | `typography` | *(see sub-rules below)* |
| 9 | `FLOAT` | *(any)* | `breakpoint`, `viewport`, `screen`, `media` | `breakpoints` | — |
| 10 | `FLOAT` | *(any)* | `tablet`, `desktop`, `mobile` | `breakpoints` | — |
| 11 | *(any)* | `breakpoint`, `viewport`, `screen`, `media` | *(any)* | `breakpoints` | — |
| 12 | `FLOAT` | *(any)* | `radius`, `rounded`, `corner` | `effects` | `border-radius` |
| 13 | `FLOAT` | *(any)* | `shadow`, `elevation`, `drop-shadow`, `blur` | `effects` | `shadow` |
| 14 | `FLOAT` | *(any)* | `duration`, `delay`, `easing`, `animation`, `transition` | `effects` | `animation` |
| 15 | *(any)* | `effect`, `shadow`, `radius`, `elevation` | *(any)* | `effects` | *(see sub-rules below)* |
| 16 | `FLOAT` | *(any)* | `space`, `gap`, `padding`, `margin`, `size`, `height`, `width`, `nav`, `section` | `spacing` | — |
| 17 | *(any)* | `spacing`, `space`, `layout`, `dimension`, `size` | *(any)* | `spacing` | — |
| 18 | `FLOAT` | *(any)* | *(any — catch-all for unmatched FLOATs)* | `spacing` | — |
| — | `BOOLEAN` | *(any)* | *(any)* | **SKIP** | Not written to CSS |
| — | `STRING` | *(any)* | *(any — non-font STRINGs)* | **SKIP** | Not written to CSS |

### Typography sub-type resolution (rule 8)

When collection name matches typography but `resolvedType` is ambiguous, refine subtype from variable name:

| Variable name contains | Subtype |
|------------------------|---------|
| `family`, `font`, `face` | `font-family` |
| `size`, `scale`, `text` | `font-size` |
| `weight` | `font-weight` |
| `leading`, `line-height` | `line-height` |
| `tracking`, `spacing` | `letter-spacing` |
| *(none of the above)* | `font-family` *(default for STRING)*, `font-size` *(default for FLOAT)* |

### Effects sub-type resolution (rule 15)

When collection name matches effects but sub-type is ambiguous:

| Variable name contains | Subtype |
|------------------------|---------|
| `radius`, `rounded`, `corner` | `border-radius` |
| `blur`, `elevation`, `shadow` | `shadow` |
| `duration`, `animation`, `easing` | `animation` |
| *(none of the above)* | `shadow` *(default)* |

---

## Write Target Table

For each category and subtype, the following files and CSS sections receive the token write:

### Colors

| Scope | File | CSS section | Format | Example |
|-------|------|-------------|--------|---------|
| EDS semantic aliases | `styles/styles.css` | `:root { }` (unlayered) | `css-var` | `--link-color: #d50057;` |
| EDS semantic aliases | `styles/tailwind.css` | `@theme { }` | `css-var` | `--color-primary: #d50057;` |
| Full palette | `styles/tailwind.css` | `@theme { }` | `css-var` | `--color-brand-magenta: #d50057;` |
| EDS-consumed palette token | `styles/styles.css` | `:root { }` (unlayered) | `css-var` | `--color-brand-magenta: #d50057;` |

> **Two-file sync rule**: EDS semantic aliases MUST be written to both files in the same operation.

**EDS semantic alias mapping** (authoritative reference):

| Tailwind `@theme` name | CSS `:root` EDS alias | Tailwind utilities generated |
|------------------------|----------------------|------------------------------|
| `--color-primary` | `--link-color` | `bg-primary`, `text-primary`, `border-primary`, `ring-primary` |
| `--color-primary-hover` | `--link-hover-color` | `bg-primary-hover`, etc. |
| `--color-text` | `--text-color` | `text-text` |
| `--color-bg` | `--background-color` | `bg-bg` |
| `--color-light` | `--light-color` | `bg-light` |
| `--color-dark` | `--dark-color` | `text-dark` |

---

### Typography

| Subtype | File | CSS section | Format | Example |
|---------|------|-------------|--------|---------|
| `font-family` | `styles/styles.css` | `:root { }` | `css-var` | `--body-font-family: inter, inter-fallback, sans-serif;` |
| `font-family` | `styles/tailwind.css` | `@theme { }` | `css-var` | `--font-body: inter, inter-fallback, sans-serif;` |
| `font-family` | `styles/fonts.css` | *(document root)* | `font-face-rule` | `@font-face { font-family: inter; ... }` |
| `font-family` | `styles/styles.css` | *(document root, unlayered)* | `font-face-rule` | `@font-face { font-family: inter-fallback; ... }` |
| `font-size` | `styles/tailwind.css` | `@theme { }` | `css-var` | `--text-lg: 1.125rem;` |
| `font-weight` | `styles/tailwind.css` | `@theme { }` | `css-var` | `--font-weight-bold: 700;` |
| `line-height` | `styles/tailwind.css` | `@theme { }` | `css-var` | `--leading-normal: 1.5;` |
| `letter-spacing` | `styles/tailwind.css` | `@theme { }` | `css-var` | `--tracking-wide: 0.025em;` |

**Font family EDS alias mapping** (two-file sync required):

| Tailwind `@theme` name | CSS `:root` EDS alias | Usage |
|------------------------|----------------------|-------|
| `--font-body` | `--body-font-family` | Body text, `<p>`, `<li>`, etc. |
| `--font-display` | `--heading-font-family` | Headings `<h1>`–`<h6>` |

---

### Spacing

| Scope | File | CSS section | Format | Example |
|-------|------|-------------|--------|---------|
| All spacing tokens | `styles/tailwind.css` | `@theme { }` | `css-var` | `--spacing-section: 2.5rem;` |
| EDS-consumed spacing | `styles/styles.css` | `:root { }` | `css-var` | `--nav-height: 4rem;` |

**EDS-consumed spacing tokens** (must also appear in `:root`):

| Tailwind `@theme` name | CSS `:root` EDS alias | Consumed by |
|------------------------|----------------------|-------------|
| `--spacing-nav` | `--nav-height` | `scripts.js` sticky header offset |

> All other spacing tokens go to `@theme` only. The `--spacing-*` namespace **adds to** the Tailwind default spacing scale without replacing it.

---

### Breakpoints

| Scope | File | CSS section | Format | Note |
|-------|------|-------------|--------|------|
| All breakpoints | `styles/tailwind.css` | `@theme { }` | `css-var` | ALL THREE required together |

**Required breakpoints** (always write together — Tailwind v4 replaces defaults):

| CSS name | Value | Tailwind prefix | Range |
|----------|-------|----------------|-------|
| `--breakpoint-md` | 768px | `md:*` | tablet |
| `--breakpoint-lg` | 1240px | `lg:*` | desktop |
| `--breakpoint-xl` | 1440px | `xl:*` | desktop large |

> Do not write breakpoints to `styles/styles.css :root`. Breakpoints are Tailwind-only tokens.

---

### Effects

| Subtype | File | CSS section | Format | Example |
|---------|------|-------------|--------|---------|
| `shadow` | `styles/tailwind.css` | `@theme { }` | `css-var` | `--shadow-lg: 0 10px 15px rgb(0 0 0 / 0.1);` |
| `border-radius` | `styles/tailwind.css` | `@theme { }` | `css-var` | `--radius-2-5xl: 1.25rem;` |
| `border-radius` (EDS-consumed) | `styles/styles.css` | `:root { }` | `css-var` | `--border-radius-card: 0.75rem;` |
| `animation` | `styles/tailwind.css` | `@keyframes { }` + `@utility { }` | `keyframe-rule` + `utility-rule` | see below |

**Animation write pattern** (two blocks in `styles/tailwind.css`):

```css
@keyframes {animate-name} {
  from { {from-styles} }
  to   { {to-styles} }
}

@utility animate-{name} {
  animation: {animate-name} {duration} {easing};
}
```

---

## Summary Matrix

Quick reference — which files does each category touch?

| Category | `styles/styles.css` | `styles/tailwind.css` | `styles/fonts.css` |
|----------|:-------------------:|:---------------------:|:------------------:|
| Colors (semantic) | ✅ `:root` | ✅ `@theme` | — |
| Colors (palette) | ⚠️ `:root` *(only if EDS-consumed)* | ✅ `@theme` | — |
| Typography (families) | ✅ `:root` + `@font-face` fallback | ✅ `@theme` | ✅ `@font-face` |
| Typography (scale) | — | ✅ `@theme` | — |
| Spacing | ⚠️ `:root` *(only if EDS-consumed)* | ✅ `@theme` | — |
| Breakpoints | — | ✅ `@theme` | — |
| Effects – shadows | — | ✅ `@theme` | — |
| Effects – radius | ⚠️ `:root` *(only if EDS-consumed)* | ✅ `@theme` | — |
| Effects – animations | — | ✅ `@keyframes` + `@utility` | — |

Legend: ✅ = always | ⚠️ = conditionally | — = never
