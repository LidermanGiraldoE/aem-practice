---
name: figma-theme-config
description: Configure or update the full design token theme (colors, typography, spacing, breakpoints, shadows, border-radius, animations) for an AEM Edge Delivery Services project from a Figma Variables source. Writes synchronized tokens to styles/styles.css and styles/tailwind.css.
---

# Figma Theme Configuration Skill

**Skill name**: `figma-theme-config`  
**Version**: 1.0.0  
**Type**: Documentation/instructions consumed by AI agents

## Purpose

Configure or update the full design token theme for an AEM Edge Delivery Services project from a Figma Variables source. Covers colors, typography, spacing, breakpoints, and effects (shadows, border-radius, animations). Produces synchronized writes to `styles/styles.css` and `styles/tailwind.css` in a single atomic operation.

> **⚠️ CRITICAL RULE: ALL values MUST come from Figma extraction.**
> Code examples in this skill and its resource files use `{placeholder}` or `{{placeholder}}` syntax.
> **NEVER** invent, guess, or copy example values. Every CSS value written to a project file
> must be the actual resolved value from the Figma Variables API response.
> If Figma does not provide a value for a token, **omit it** — do not fill in defaults.

> **⚠️ UNIT CONVERSION: Figma px → CSS rem**
> Figma stores all dimension values in **px**. Convert to **rem** (base 16px) for these properties:
> - **Font sizes**: `figma_value / 16` → `rem` (e.g. `16px → 1rem`, `14px → 0.875rem`)
> - **Spacing**: `figma_value / 16` → `rem` (e.g. `8px → 0.5rem`, `24px → 1.5rem`)
> - **Border radius**: `figma_value / 16` → `rem` (e.g. `4px → 0.25rem`, `12px → 0.75rem`)
>
> Keep `px` for: **breakpoints** (media queries) and **shadow offsets/blur** (don't scale).
> Keep unitless: **font-weight**, **line-height**. Keep `em`: **letter-spacing**.

---

## Prerequisites

Before invoking this skill, confirm:

1. **Figma MCP is configured** in your agent environment (provides `mcp_figma_*` tools).
2. You have a **Figma file key or URL** containing published Variables.
3. The project has `npm` available and uses **Tailwind CSS v4** (`npm run tw:build` is configured).
4. Any `.woff2` font files referenced by typography tokens are placed in `fonts/` manually — the skill generates `@font-face` rules but does NOT download font files from Figma.

---

## Invocation Parameters

The developer provides these parameters when invoking the skill (verbally or in a task description):

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `figmaFileKey` | `string` | **required** | Figma file key (e.g. `ABC123`) or full URL (`figma.com/file/ABC123/...` or `figma.com/design/ABC123/...`) |
| `category` | `colors \| typography \| spacing \| breakpoints \| effects \| all` | `all` | Token category to process. Use `all` for full initial setup. |
| `mode` | `write \| audit` | `write` | `audit` = read-only diff report, no files modified. `write` = apply changes. |
| `collectionName` | `string` | _(all collections)_ | Optional: restrict to a single Figma variable collection (e.g. `"Colors"`). |
| `modeLabel` | `string` | `"Default"` | Optional: Figma variable mode to read (e.g. `"Light"`, `"Dark"`, `"Mobile"`). |
| `confirmDelete` | `boolean` | `false` | `true` = delete tokens present in project but absent from Figma. `false` = warn only, no deletion. |

---

## Phase 0: Pre-Flight — Figma Connection Check

> **This phase runs first, every time, before any token extraction.**

### Step 0.1 — Verify Figma MCP availability

Check that the `mcp_figma_get_local_variables` tool is available in the current agent environment.

- **If available** → continue to Step 0.2.
- **If NOT available** → output the following and **STOP**:

```
ERROR: Figma MCP is not configured.

To use this skill, you need the Figma MCP server connected to your agent.

Setup steps:
1. Install the official Figma MCP server: https://github.com/figma/figma-developer-mcp
2. Add your Figma Personal Access Token (Settings → Security → Personal Access Tokens)
   with scope: File content (read)
3. Configure your agent to connect to the Figma MCP server
4. Restart your agent session
5. Re-invoke this skill

If you are using VS Code Copilot: add the Figma MCP entry to .vscode/mcp.json
```

### Step 0.2 — Extract Figma file key

Accept either a full URL or a bare file key:

- URL pattern: `/figma\.com\/(?:file|design)\/([A-Za-z0-9]+)/`  → extract capture group 1
- Bare key (no `/`): use as-is

If no file key is provided or extraction fails:

```
ERROR: No Figma file key provided.

Please provide:
  - A Figma file URL: https://www.figma.com/design/ABC123/Project-Name/...
  - Or a bare file key: ABC123

You can find the file key in the URL bar of your Figma file.
```

**STOP** until a valid key is provided.

### Step 0.3 — Discover available variable collections

Call `mcp_figma_get_local_variables` with `{ fileKey }`. If it returns an error, try `mcp_figma_get_published_variables` with `{ fileKey }`.

On success, list the available collections to the developer:

```
Figma connection confirmed ✓

File: {figmaFileKey}
Available variable collections:
  • Colors        (12 variables, modes: Default)
  • Typography    (8 variables, modes: Default)
  • Spacing       (6 variables, modes: Default)
  • Breakpoints   (3 variables, modes: Default)
  • Effects       (9 variables, modes: Default)

Category filter: {category}
Mode: {mode}
Proceeding to token extraction...
```

If `collectionName` was provided and does not match any collection name (case-insensitive), warn the developer and list available names. Continue with all collections.

---

## Phase A: Token Extraction

### Step A.1 — Fetch variables

Use the response from Phase 0 Step 0.3 (already fetched). Parse:

```
response.meta.variableCollections  → record of collection objects
response.meta.variables            → record of variable objects
```

If `collectionName` is specified, filter `variables` to only those whose `variableCollectionId` matches the collection with that name.

Apply `category` filter (see Phase B for classification).

### Step A.2 — Select mode

For each variable, read its value from `valuesByMode`:

1. If `modeLabel` is specified → find the `modeId` in the collection's `modes` array where `mode.name === modeLabel` (case-insensitive).
2. Otherwise → use the collection's `defaultModeId`.

If the mode is not found for a collection, fall back to `defaultModeId` and log a warning in the SyncReport.

---

## Phase B: Alias Resolution and Category Classification

### Step B.1 — Resolve aliases

For each variable, check if the mode value is a Figma alias:

```json
{ "type": "VARIABLE_ALIAS", "id": "VariableID:1234:56" }
```

If it is an alias, follow the `id` reference to the target variable and fetch that variable's resolved value. Repeat recursively up to **10 levels deep** maximum.

- **Cycle detection**: Track visited variable IDs in the resolution chain. If a cycle is detected (same ID appears twice), log a `ReportError` and skip the token.
- **Cross-collection aliases**: Aliases may reference variables in other collections — this is valid, follow them.

### Step B.2 — Classify token category

Use the following heuristics to assign each variable a `TokenCategory`. Apply collection-name match first, then `resolvedType` + variable name heuristics:

| Priority | `resolvedType` | Collection or variable name contains | → `TokenCategory` |
|----------|---------------|--------------------------------------|-------------------|
| 1 | `COLOR` | any | `colors` |
| 2 | any | collection name = "Colors" (case-insensitive) | `colors` |
| 3 | `STRING` | font, family, typeface | `typography` |
| 4 | any | collection name = "Typography" (case-insensitive) | `typography` |
| 5 | `FLOAT` | breakpoint, viewport, screen | `breakpoints` |
| 6 | any | collection name = "Breakpoints" (case-insensitive) | `breakpoints` |
| 7 | `FLOAT` | radius, rounded | `effects` (subtype: `border-radius`) |
| 8 | `FLOAT` | shadow, elevation, blur | `effects` (subtype: `shadow`) |
| 9 | `FLOAT` | weight, line-height, letter-spacing | `typography` |
| 10 | `FLOAT` | any | `spacing` (default for unmatched FLOATs) |

Skip `BOOLEAN` typed variables (not used in CSS output).

If `category` parameter is not `all`, discard all tokens whose classified category does not match the requested `category`.

### Step B.3 — Normalize CSS name

For each token, apply the 6-step normalization algorithm from `resources/name-normalization.md` to produce the `cssName`. See that file for the complete algorithm, prefix rules, and worked examples.

---

## Phase C: Colors

> **Two-file sync is mandatory. Always write both files. Never write one without the other.**

### Step C.1 — Semantic EDS alias mapping

Map Figma color tokens to EDS semantic aliases using the project's standard mapping. Consult the Token Naming Index in the data model and make the following writes:

**`styles/styles.css` — inside `:root {}`** (unlayered):

```css
/* === Design Tokens: Colors — EDS semantic aliases === */
--link-color: {color-primary value};
--link-hover-color: {color-primary-hover value};
--text-color: {color-text value};
--background-color: {color-bg value};
--light-color: {color-light value};
--dark-color: {color-dark value};
```

**`styles/tailwind.css` — inside `@theme {}`**:

```css
/* === Design Tokens: Colors — semantic === */
--color-primary: {value};
--color-primary-hover: {value};
--color-text: {value};
--color-bg: {value};
--color-light: {value};
--color-dark: {value};
```

The semantic mapping follows the project's bidirectional alias table (see `data-model.md` Token Naming Index).

### Step C.2 — Full palette

Write all remaining `--color-*` palette tokens to **`styles/tailwind.css` `@theme {}`** only (unless any palette token is explicitly consumed by EDS JavaScript, in which case also write `--color-{name}` to `:root` in `styles/styles.css`).

See `resources/file-write-templates.md` for the exact CSS block templates and insertion locations.

### Step C.3 — Color value format

Serialize color values as follows (from research decision D-005):

- **Fully opaque** (alpha = 1): `#rrggbb` (6-digit hex, lowercase)
- **Semi-transparent** (alpha < 1): `rgb(R G B / A)` where R/G/B are 0–255 integers and A is a decimal (e.g. `rgb(244 247 247 / 0.5)`)

Formula:
```
r8 = Math.round(r * 255)   // r from Figma is 0–1
g8 = Math.round(g * 255)
b8 = Math.round(b * 255)
if a === 1 → #rrggbb
else → rgb(r8 g8 b8 / Math.round(a * 100) / 100)
```

---

## Phase D: Typography

> **Font families** → two-file sync required (`:root` + `@theme`).
> **Type scale** → `styles/styles.css :root {}` as the single source of truth.
> **`@utility type-*`** → `styles/tailwind.css`, referencing `:root` variables via `var()`.
> **Font face rules** → `styles/fonts.css` (production) + `styles/styles.css` (fallback).
>
> **⚠️ CRITICAL RULES:**
> 1. **Variable naming MUST mirror Figma style names exactly.** Use `--display-{size}-*` and
>    `--text-{size}-*` (NOT `--heading-font-size-xxl` or similar invented names).
> 2. **NO font-weight variables.** Font weights are simple integers (400, 500, 600, 700) —
>    hardcode them directly on element rules. Variables add indirection with zero benefit.
> 3. **NEVER modify block CSS files** (header, footer, cards, etc.) during typography config.
>    Only write to `styles/styles.css`, `styles/tailwind.css`, and `styles/fonts.css`.
> 4. **Two-step approach:** First define ALL raw type-scale sizes (Step D.2), then define
>    element-specific responsive variables that reference them (Step D.3).

### Step D.1 — Font families

Write font family tokens to **both** files simultaneously:

**`styles/styles.css` — inside `:root {}`**:

```css
/* fonts */
--body-font-family: {body-font}, {body-font-fallback}, sans-serif;
--heading-font-family: {display-font}, {display-font-fallback}, serif;
```

**`styles/tailwind.css` — inside `@theme {}`**:

```css
--font-body: {body-font}, {body-font-fallback}, sans-serif;
--font-display: {display-font}, {display-font-fallback}, serif;
```

### Step D.2 — Raw type scale (sizes only, no weights)

> This step defines the **complete palette of available sizes** from Figma.
> These are raw building blocks — they do NOT map to any specific HTML element yet.
> Variable naming MUST match Figma style names exactly.

**Write to `styles/styles.css :root {}`**:

```css
/* ─── Typography — Figma type scale (node {figma:node-id}) ─────────────
 *  Variable naming mirrors Figma style names exactly:
 *    Display 2xl … Display xs  → --display-{size}-*
 *    Text xl … Text xs         → --text-{size}-*
 *    Overline                   → --overline-*
 * ──────────────────────────────────────────────────────────────── */

/* ─── Display scale — font size ──────────────────────────────────── */
--display-2xl-font-size: {figma:value / 16}rem;      /* {figma:value}px */
--display-xl-font-size:  {figma:value / 16}rem;      /* {figma:value}px */
--display-lg-font-size:  {figma:value / 16}rem;      /* {figma:value}px */
--display-md-font-size:  {figma:value / 16}rem;      /* {figma:value}px */
--display-sm-font-size:  {figma:value / 16}rem;      /* {figma:value}px */
--display-xs-font-size:  {figma:value / 16}rem;      /* {figma:value}px */

/* ─── Display scale — line height ────────────────────────────────── */
--display-2xl-line-height: {figma:value / 16}rem;    /* {figma:value}px */
--display-xl-line-height:  {figma:value / 16}rem;    /* {figma:value}px */
--display-lg-line-height:  {figma:value / 16}rem;    /* {figma:value}px */
--display-md-line-height:  {figma:value / 16}rem;    /* {figma:value}px */
--display-sm-line-height:  {figma:value / 16}rem;    /* {figma:value}px */
--display-xs-line-height:  {figma:value / 16}rem;    /* {figma:value}px */

/* ─── Display scale — letter spacing ─────────────────────────────── */
--display-letter-spacing: {figma:value}em;            /* Display 2xl–md: −2% */

/* ─── Text scale — font size ─────────────────────────────────────── */
--text-xl-font-size: {figma:value / 16}rem;           /* {figma:value}px */
--text-lg-font-size: {figma:value / 16}rem;           /* {figma:value}px */
--text-md-font-size: {figma:value / 16}rem;           /* {figma:value}px */
--text-sm-font-size: {figma:value / 16}rem;           /* {figma:value}px */
--text-xs-font-size: {figma:value / 16}rem;           /* {figma:value}px */

/* ─── Text scale — line height ───────────────────────────────────── */
--text-xl-line-height: {figma:value / 16}rem;         /* {figma:value}px */
--text-lg-line-height: {figma:value / 16}rem;         /* {figma:value}px */
--text-md-line-height: {figma:value / 16}rem;         /* {figma:value}px */
--text-sm-line-height: {figma:value / 16}rem;         /* {figma:value}px */
--text-xs-line-height: {figma:value / 16}rem;         /* {figma:value}px */

/* ─── Overline ───────────────────────────────────────────────────── */
--overline-font-size:   {figma:value / 16}rem;        /* {figma:value}px */
--overline-line-height: {figma:value / 16}rem;        /* {figma:value}px */
```

> Include `/* {figma:value}px */` comments on every line for quick reference.

**AEM legacy aliases** — After the raw scale, add backward-compatible aliases that
reference the new tokens. These keep existing EDS code working without modification:

```css
/* body sizes — AEM aliases */
--body-font-size-m: var(--text-md-font-size);    /* 16px */
--body-font-size-s: var(--text-sm-font-size);    /* 14px */
--body-font-size-xs: var(--text-xs-font-size);   /* 12px */

/* heading sizes — AEM aliases */
--heading-font-size-xxl: var(--display-2xl-font-size); /* 72px */
--heading-font-size-xl: var(--display-xl-font-size);   /* 60px */
--heading-font-size-l: var(--display-lg-font-size);    /* 48px */
--heading-font-size-m: var(--display-md-font-size);    /* 36px */
--heading-font-size-s: var(--display-sm-font-size);    /* 30px */
--heading-font-size-xs: var(--display-xs-font-size);   /* 24px */
```

**Write `@utility type-*` blocks to `styles/tailwind.css`** — each utility references
the raw scale variables via `var()`. **NEVER hardcode literal rem/px values**:

```css
@utility type-display-2xl {
  font-size: var(--display-2xl-font-size);
  line-height: var(--display-2xl-line-height);
  letter-spacing: var(--display-letter-spacing);
}
/* … repeat for each scale step … */

@utility type-text-md {
  font-size: var(--text-md-font-size);
  line-height: var(--text-md-line-height);
}
/* … repeat for each text step … */
```

Font-weight is applied separately via Tailwind `font-{weight}` utilities — NOT inside
`@utility type-*` blocks.

### Step D.3 — Element-specific responsive variables

> This step creates **composite variables** for HTML elements (h1-h6, body, link, overline)
> that reference the raw scale from Step D.2. These variables switch sizes between
> mobile and desktop via a `@media` query. They also define the font-weight per element.

**Mobile defaults — write to `styles/styles.css :root {}`**:

```css
/* ─── Element typography — mobile defaults (Figma node {figma:mobile-node-id}) ───
 *  Composite variables that reference the type-scale tokens above
 *  and switch to larger steps on desktop via a media query below.
 * ─────────────────────────────────────────────────────────────────── */

/* H1 — mobile: Display lg (48px), Bold 700 */
--h1-font-size: var(--display-lg-font-size);
--h1-line-height: var(--display-lg-line-height);
--h1-letter-spacing: var(--display-letter-spacing);

/* H2 — mobile: Display md (36px), Semibold 600 */
--h2-font-size: var(--display-md-font-size);
--h2-line-height: var(--display-md-line-height);
--h2-letter-spacing: var(--display-letter-spacing);

/* H3 — mobile: Display sm (30px), Medium 500 */
--h3-font-size: var(--display-sm-font-size);
--h3-line-height: var(--display-sm-line-height);
--h3-letter-spacing: normal;

/* … continue for H4–H6 … */

/* Body LG — mobile: Text md (16px), Regular 400 */
--body-lg-font-size: var(--text-md-font-size);
--body-lg-line-height: var(--text-md-line-height);
--body-lg-font-weight: 400;

/* Body MD, Body SM, Link — same pattern … */
```

> Include `/* mobile: {scale-step} ({size}px), {Weight} {value} */` comments for clarity.

**Desktop overrides — write to `styles/styles.css` AFTER `:root {}`**:

```css
/* ─── Element typography — desktop overrides (Figma node {figma:desktop-node-id}) ─── */
@media (width >= {figma:desktop-breakpoint}px) {
  :root {
    /* H1 → Display 2xl (72px) */
    --h1-font-size: var(--display-2xl-font-size);
    --h1-line-height: var(--display-2xl-line-height);

    /* H2 → Display xl (60px) */
    --h2-font-size: var(--display-xl-font-size);
    --h2-line-height: var(--display-xl-line-height);

    /* H3 → Display lg (48px) — gains letter-spacing on desktop */
    --h3-font-size: var(--display-lg-font-size);
    --h3-line-height: var(--display-lg-line-height);
    --h3-letter-spacing: var(--display-letter-spacing);

    /* … continue for H4–H6, Body LG/MD/SM, Link … */
  }
}
```

> Only reassign variables that **change** between mobile and desktop. If a variable
> (e.g. `--overline-font-size`) stays the same, do NOT include it in the media query.

**Heading element rules** — write AFTER the media query, using the element variables.
Font-weight is hardcoded as an integer — **NO variables for weights**:

```css
h1 {
  font-size: var(--h1-font-size);
  line-height: var(--h1-line-height);
  letter-spacing: var(--h1-letter-spacing);
  font-weight: 700;
}

h2 {
  font-size: var(--h2-font-size);
  line-height: var(--h2-line-height);
  letter-spacing: var(--h2-letter-spacing);
  font-weight: 600;
}
/* … continue for h3–h6 … */
```

**Element-level `@utility` blocks** — optionally write to `styles/tailwind.css` for
elements that need responsive switching in Tailwind contexts:

```css
@utility type-h1 {
  font-size: var(--h1-font-size);
  line-height: var(--h1-line-height);
  letter-spacing: var(--h1-letter-spacing);
  font-weight: 700;
}
/* … repeat for type-h2 through type-h6, type-body-lg/md/sm, type-link, type-overline … */
```

These element utilities include font-weight because they represent a fully-composed
typographic style (unlike raw `type-display-*` utilities which are weight-agnostic).

### Step D.4 — Font face rules

For each **unique font family** found in Figma token values, generate the following placeholders:

**`styles/fonts.css`** — production `@font-face` rule (one per weight variant):

```css
@font-face {
  font-family: {font-name};
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/{font-name}-regular.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}
```

**`styles/styles.css`** — CLS fallback `@font-face` (unlayered, outside any layer):

```css
@font-face {
  font-family: {font-name}-fallback;
  size-adjust: 100%; /* tune this value to match the real font metrics and reduce CLS */
  src: local('Arial');
}
```

> **IMPORTANT**: The skill generates these rules as placeholders. It does **NOT** download `.woff2` files. The developer must:
> 1. Download the font files from Figma's asset panel or the type foundry.
> 2. Place them in `fonts/` using the filename convention `{font-name}-{weight}.woff2`.
> 3. Adjust `size-adjust` in the fallback rule to match the real font's metrics.

---

## Phase E: Spacing

> Spacing tokens go to **`styles/tailwind.css` `@theme {}`** (the `--spacing-*` namespace).  
> Only write to `styles/styles.css :root {}` when the value is explicitly consumed by EDS JavaScript (e.g. `--nav-height` is read by `scripts.js`).

### Step E.1 — Identify EDS-consumed spacing tokens

The following spacing tokens are special — they are read by EDS JavaScript and must also appear in `:root`:

| Token name | EDS alias | Notes |
|------------|-----------|-------|
| `--spacing-nav` | `--nav-height` | Read by `scripts.js` for sticky header offset |

For any other spacing token, write to `@theme` only.

### Step E.2 — Write spacing tokens

**`styles/tailwind.css` — inside `@theme {}`**:

```css
/* === Design Tokens: Spacing === */
--spacing-{name}: {figma:value / 16}rem;  /* convert Figma px → rem */
/* ... one line per extracted Figma spacing token ... */
```

**`styles/styles.css` — inside `:root {}`** (only for EDS-consumed tokens):

```css
/* === Design Tokens: Spacing — EDS consumed === */
--nav-height: {figma:nav-spacing-value / 16}rem;  /* convert Figma px → rem */
```

Tailwind auto-generates utilities from every `--spacing-*` token: `mt-nav`, `h-nav`, `pt-section`, etc. The `--spacing-*` namespace adds to the default Tailwind scale — it does not replace it.

---

## Phase F: Breakpoints

> **Completeness constraint**: All three project breakpoints MUST be written together in a single operation. Never write breakpoints partially.

### Step F.1 — Required breakpoints

The project uses exactly three breakpoints. After a breakpoints category run, ALL of these must be present in `@theme`:

| Token | Value | Tailwind prefix | Viewport range |
|-------|-------|----------------|---------------|
| `--breakpoint-md` | {figma:value}px | `md:*` | tablet |
| `--breakpoint-lg` | {figma:value}px | `lg:*` | desktop |
| `--breakpoint-xl` | {figma:value}px | `xl:*` | desktop large |

> In Tailwind v4, defining any breakpoint in `@theme` **replaces the entire default breakpoint set** (it does not extend). Therefore, all breakpoints must always be defined together.

### Step F.2 — Map Figma breakpoints

Map Figma FLOAT variables classified as `breakpoints` to the required names:

- Accept: `md`, `tablet`, `medium` → `--breakpoint-md: {figma:value}px`
- Accept: `lg`, `desktop`, `large` → `--breakpoint-lg: {figma:value}px`
- Accept: `xl`, `desktop-large`, `x-large` → `--breakpoint-xl: {figma:value}px`

If Figma only provides one or two breakpoints, ask the developer for the missing values — do NOT guess defaults. Log a warning in the SyncReport.

### Step F.3 — Write breakpoints

**`styles/tailwind.css` — inside `@theme {}`** (all three together):

```css
/* === Design Tokens: Breakpoints === */
/* ⚠ Tailwind v4: these REPLACE the default breakpoints — keep all three together */
--breakpoint-md: {figma:tablet-breakpoint}px;
--breakpoint-lg: {figma:desktop-breakpoint}px;
--breakpoint-xl: {figma:large-breakpoint}px;
```

Do **not** write breakpoint tokens to `styles/styles.css :root {}`. Breakpoints are Tailwind-only tokens. If a structural layout change requires a new `@media` rule, add it manually inside `@layer base {}` in `styles/styles.css` — the skill does not generate `@media` rules automatically.

---

## Phase G: Effects

> **Shadows** → `@theme { --shadow-* }` in `styles/tailwind.css`.  
> **Border-radius** → `@theme { --radius-* }` in `styles/tailwind.css` (+ `:root` only if consumed by EDS JS).  
> **Animations** → `@keyframes { }` + `@utility animate-* { }` in `styles/tailwind.css`.

### Step G.1 — Shadows

Write shadow effect tokens to **`styles/tailwind.css` `@theme {}`**:

```css
/* === Design Tokens: Effects — Shadows === */
--shadow-{name}: {figma:x}px {figma:y}px {figma:blur}px {figma:color-with-alpha};
/* For multi-layer shadows: --shadow-{name}: {layer1}, {layer2}; */
/* ... one line per extracted Figma shadow token ... */
```

Tailwind auto-generates the `shadow-xs`, `shadow-sm`, etc. utilities.

### Step G.2 — Border-radius

Write border-radius tokens to **`styles/tailwind.css` `@theme {}`**:

```css
/* === Design Tokens: Effects — Border Radius === */
/* One line per Figma border-radius token. Dots in names replaced with dashes. */
--radius-{name}: {figma:value / 16}rem;  /* convert Figma px → rem */
/* ... one line per extracted Figma border-radius token ... */
```

> **Note on naming**: Tailwind v4 does not support `.` in CSS variable names. Normalize `2.5xl` → `2-5xl` (replace `.` with `-`). The utility class `rounded-2-5xl` is generated.

If any radius token is also directly consumed by EDS JavaScript, additionally write `--border-radius-{name}: {value / 16}rem` to `:root` in `styles/styles.css`.

### Step G.3 — Animations

For animation tokens from Figma (duration, easing), generate both a `@keyframes` block and an `@utility`:

```css
/* === Design Tokens: Effects — Animations === */
/* Generate one @keyframes + @utility pair per Figma animation token */
@keyframes {figma:animation-name} {
  from { opacity: 0; transform: {figma:transform-from}; }
  to   { opacity: 1; transform: {figma:transform-to}; }
}

@utility animate-{figma:animation-name} {
  animation: {figma:animation-name} {figma:duration}s {figma:easing};
}

/* Repeat for each animation token found in Figma */
```

Place these blocks after the `@theme {}` block in `styles/tailwind.css`.

---

## Phase H: Post-Write Validation

After writing all targeted category files, run these checks before reporting success.

### Step H.1 — Two-file sync validation

For every token in the EDS semantic alias table (colors and typography), verify that:

- `styles/styles.css :root` contains the CSS alias (e.g. `--link-color`, `--body-font-family`)
- `styles/tailwind.css @theme` contains the corresponding Tailwind token (e.g. `--color-primary`, `--font-body`)

If any alias is missing from either file, add it to `SyncReport.errors` with severity `ERROR` and **halt** — do not run `tw:build` until the sync is complete.

### Step H.2 — Breakpoint completeness

If the `breakpoints` category was included in this run, confirm all three required tokens are present in `@theme`: `--breakpoint-md`, `--breakpoint-lg`, `--breakpoint-xl`. If any are missing, add them from defaults and log a warning.

### Step H.3 — CSS property name validation

Every written custom property name must match `^--[a-z][a-z0-9-]*$`. Log any violations in `SyncReport.errors` and skip the offending token.

---

## Phase I: Tailwind Build

After a successful validation, rebuild the Tailwind output:

```bash
npm run tw:build
```

- **Exit code 0** → success. Continue to Phase J (SyncReport).
- **Non-zero exit code** → Build failed. Output the full build error. Do not mark the run as successful. Suggest:
  - Check for CSS syntax errors in the tokens you just wrote (malformed values, missing semicolons).
  - Run `npm run tw:build` manually and inspect the error.
  - Roll back the last write operation if the error cannot be resolved.
- **Never commit or declare success until `tw:build` exits 0**.

---

## Phase J: SyncReport Output

After every run (write or audit), output a structured summary report.

> **Note**: The hex values below (e.g. `#f97316`) are **report format examples only** — they
> illustrate the report layout. In actual output, these will be the real values extracted from Figma.

```
╔══════════════════════════════════════════════════╗
║         Figma Theme Sync Report                  ║
╠══════════════════════════════════════════════════╣
║ Mode:       write                                ║
║ File:       ABC123                               ║
║ Category:   colors                               ║
║ Date:       2026-04-01T10:00:00Z                 ║
╠══════════════════════════════════════════════════╣
║ Added:      4   (new tokens from Figma)          ║
║ Modified:   2   (value changed in Figma)         ║
║ Unchanged:  10  (already in sync)                ║
║ Removed:    1   (in project, not in Figma)       ║
║ Errors:     0                                    ║
╚══════════════════════════════════════════════════╝

Added tokens:
  + --color-accent-orange: #f97316         → styles/styles.css :root, styles/tailwind.css @theme
  + --color-accent-teal: #14b8a6           → styles/tailwind.css @theme

Modified tokens:
  ~ --color-primary: #d50057 → #e0005c     → styles/styles.css :root, styles/tailwind.css @theme

Removed tokens (not deleted — confirmDelete=false):
  ⚠ --color-deprecated-red: #cc0000       → would remove from styles/tailwind.css @theme

tw:build: ✓ exit 0
```

In **audit mode**, replace the verb to indicate no writes occurred:

```
Mode:  audit (read-only — no files were modified)
```

---

## Selective Mode (US2)

When `category` is set to any value other than `all`, the skill operates in **selective mode**.

### Selective mode rules

1. **Only the targeted category phases execute.** All other category phases (C through G) are skipped entirely.

2. **Preserve all existing tokens.** Before writing, read the current content of both `styles/styles.css` and `styles/tailwind.css`. Parse existing CSS custom properties with:
   ```
   /--[\w-]+:\s*[^;]+;/g
   ```
   Identify which tokens belong to the targeted category (by CSS name prefix). All tokens outside the targeted category are written back unchanged — byte-for-byte identical.

3. **Removal confirmation protocol.** If the diff includes tokens present in the project but absent from Figma:
   - With `confirmDelete: false` (default): Add them to `SyncReport.removed[]`. Log a warning. **Do not delete them.** Continue.
   - With `confirmDelete: true`: Present a list of tokens to be removed and ask for explicit verbal confirmation before deleting. Only delete after confirmed.

4. **Post-selective validation** runs only for the targeted category. Other categories are not re-validated.

### Example: updating only colors

```
skill invocation:
  figmaFileKey: "ABC123"
  category: "colors"
  mode: "write"
```

Execution path:
- Phase 0 → Phase A → Phase B (classify, discard all non-color tokens) → Phase C (colors only) → Phase H (validate colors only) → Phase I (tw:build) → Phase J

Typography, spacing, breakpoints, and effects sections are untouched.

---

## Audit / Dry-Run Mode (US3)

When `mode: "audit"`, the skill runs a **read-only comparison** between Figma tokens and the project's current CSS. No files are modified.

### Audit execution path

Phases 0 → A → B (full extraction and classification) → Diff only (no write) → Phase J report.

### Step: Read current project state

Parse existing CSS custom property values from both project files:

- **`styles/styles.css`**: Extract all `--{name}: {value};` entries from inside `:root { }` blocks.
- **`styles/tailwind.css`**: Extract all `--{name}: {value};` entries from inside `@theme { }` blocks.

Use regex: `/--[\w-]+:\s*[^;]+;/g` applied per block.

### Step: Generate four-group report

Compare Figma-extracted tokens against project CSS and produce:

| Group | Condition |
|-------|-----------|
| **In Sync** | Token exists in Figma and project with identical value |
| **Changed** | Token exists in Figma and project with different value |
| **Only in Figma** | Token in Figma but not in project (would be `added` in a write run) |
| **Only in Project** | Token in project but not in Figma (would be `removed` in a write run) |

### Audit output format

> **Note**: Values below are **report format examples only** — actual output will show real Figma-extracted values.

```
╔══════════════════════════════════════════════════╗
║ Figma Theme Audit Report (READ-ONLY)             ║
╠══════════════════════════════════════════════════╣
║ Mode:    audit — ZERO FILES MODIFIED             ║
║ File:    ABC123                                  ║
║ Date:    2026-04-01T10:00:00Z                    ║
╠══════════════════════════════════════════════════╣
║ In Sync:        10                               ║
║ Changed:         2                               ║
║ Only in Figma:   3 (would be added)              ║
║ Only in Project: 1 (would be removed)            ║
╚══════════════════════════════════════════════════╝

Changed tokens:
  ~ --color-primary: current=#cc0044  figma=#d50057
  ~ --spacing-section: current=2rem   figma=2.5rem

Only in Figma (not yet in project):
  + --color-accent-orange: #f97316
  + --color-accent-teal: #14b8a6
  + --radius-2-5xl: 1.25rem

Only in Project (not in Figma — potential stale tokens):
  ⚠ --color-deprecated-red: #cc0000
```

Confirm explicitly at the end of the audit report:

```
✓ Audit complete. No files were modified. Run with mode: "write" to apply changes.
```

---

## Resources

- [`resources/name-normalization.md`](resources/name-normalization.md) — 6-step CSS name normalization algorithm, category prefix rules, and 10+ worked examples
- [`resources/token-mapping-rules.md`](resources/token-mapping-rules.md) — Full `resolvedType` + collection heuristic → `TokenCategory` → write target table
- [`resources/file-write-templates.md`](resources/file-write-templates.md) — Copy-paste CSS block templates for all 5 token categories with exact insertion locations
