# Name Normalization Algorithm

> **⚠️ CRITICAL**: All variable names in this document (`"Brand Primary/Magenta"`, `"Font/Body"`, `"Shadow/Small"`, etc.) are **FICTITIOUS EXAMPLES** that demonstrate how the algorithm works. **NEVER use these names in output.** The actual variable names MUST come from the Figma API response (`mcp_figma_get_local_variables` / `mcp_figma_get_published_variables`). Apply this algorithm to the **real** names returned by Figma.

This document defines the deterministic algorithm for converting Figma variable names into valid CSS custom property names.

---

## The 6-Step Algorithm

Given a Figma variable with:
- `collectionName`: the name of the variable collection (e.g. `"Colors"`)
- `variableName`: the slash-separated path (e.g. `"Brand Primary/Magenta"`)
- `category`: the resolved `TokenCategory`

Apply these steps in order:

### Step 1 — Split into path segments

Split `variableName` on `/` to produce an array of segments:

```
"Brand Primary/Magenta"       → ["Brand Primary", "Magenta"]
"Semantic/Link/Hover"         → ["Semantic", "Link", "Hover"]
"md"                          → ["md"]
"Font/Body Regular"           → ["Font", "Body Regular"]
```

### Step 2 — Drop collection prefix if redundant

If the first segment matches `collectionName` (case-insensitive, trimmed), drop it:

```
collection: "Colors",     segments: ["Colors", "Brand", "Magenta"]  → ["Brand", "Magenta"]
collection: "Typography", segments: ["Typography", "Font", "Body"]  → ["Font", "Body"]
collection: "Spacing",    segments: ["Spacing", "Section"]          → ["Section"]
collection: "Colors",     segments: ["Brand", "Magenta"]            → ["Brand", "Magenta"]  (no drop)
```

### Step 3 — Join and sanitize

Join the remaining segments with a single `/`, then:
- Replace all non-alphanumeric characters (spaces, `/`, `.`, `(`, `)`, `_`, `—`, `–`) with `-`

```
["Brand", "Magenta"]         → "Brand/Magenta"     → "Brand-Magenta"
["Section", "Vertical Gap"]  → "Section/Vertical Gap" → "Section-Vertical-Gap"
["2.5xl"]                    → "2.5xl"              → "2-5xl"
["md"]                       → "md"                 → "md"
```

### Step 4 — Collapse and trim dashes

Collapse consecutive `-` characters into a single `-`. Remove any leading or trailing `-`:

```
"Brand--Magenta"   → "Brand-Magenta"
"-Section-"        → "Section"
"Link--Hover--"    → "Link-Hover"
```

### Step 5 — Lowercase

Convert the entire string to lowercase:

```
"Brand-Magenta"         → "brand-magenta"
"Section-Vertical-Gap"  → "section-vertical-gap"
"2-5xl"                 → "2-5xl"
"MD"                    → "md"
```

### Step 6 — Prepend category prefix

Apply the prefix for the token's category:

| Category | Subtype | Prefix pattern | Example output |
|----------|---------|---------------|---------------|
| `colors` | — | `--color-{name}` | `--color-brand-magenta` |
| `spacing` | — | `--spacing-{name}` | `--spacing-section-vertical-gap` |
| `typography` | font-family | `--font-{name}` | `--font-body` |
| `typography` | font-size | `--text-{name}` | `--text-lg` |
| `typography` | font-weight | `--font-weight-{name}` | `--font-weight-bold` |
| `typography` | line-height | `--leading-{name}` | `--leading-relaxed` |
| `typography` | letter-spacing | `--tracking-{name}` | `--tracking-wide` |
| `breakpoints` | — | `--breakpoint-{name}` | `--breakpoint-md` |
| `effects` | shadow | `--shadow-{name}` | `--shadow-lg` |
| `effects` | border-radius | `--radius-{name}` | `--radius-2-5xl` |
| `effects` | animation | `--animate-{name}` | `--animate-fade-in` |

**Final validation**: The resulting name must match `^--[a-z][a-z0-9-]*$`. If it doesn't, log a `ReportError` and skip the token.

---

## Worked Examples

> **Reminder**: The variable names below are **fictitious**. They exist only to demonstrate the normalization steps. When using this skill, replace them with the actual variable names from Figma.

### Colors

| Collection | Figma variable name | Step 1 | Step 2 | Steps 3–5 | Final CSS name |
|------------|--------------------|----|----|----|---|
| Colors | `Brand Primary/Magenta` | `["Brand Primary", "Magenta"]` | no drop | `brand-primary-magenta` | `--color-brand-primary-magenta` |
| Colors | `Semantic/Primary` | `["Semantic", "Primary"]` | no drop | `semantic-primary` | `--color-semantic-primary` |
| Colors | `Colors/Accent/Orange` | `["Colors", "Accent", "Orange"]` | drop `Colors` → `["Accent", "Orange"]` | `accent-orange` | `--color-accent-orange` |
| Colors | `Background/Default` | `["Background", "Default"]` | no drop | `background-default` | `--color-background-default` |
| Colors | `Surface/Light` | `["Surface", "Light"]` | no drop | `surface-light` | `--color-surface-light` |

### Typography

| Collection | Figma variable name | Subtype | Final CSS name |
|------------|--------------------|----|---|
| Typography | `Font/Body` | font-family | `--font-body` |
| Typography | `Font/Display` | font-family | `--font-display` |
| Typography | `Scale/Large` | font-size | `--text-scale-large` |
| Typography | `Weight/Bold` | font-weight | `--font-weight-bold` |
| Typography | `Typography/Font/Body` | font-family | `--font-body` *(collection prefix dropped)* |

### Spacing

| Collection | Figma variable name | Final CSS name |
|------------|--------------------|----|
| Spacing | `Nav/Height` | `--spacing-nav-height` |
| Spacing | `Section/Vertical` | `--spacing-section-vertical` |
| Spacing | `Spacing/Page/Horizontal` | `--spacing-page-horizontal` *(prefix dropped)* |
| Spacing | `Gap/Small` | `--spacing-gap-small` |

### Breakpoints

| Collection | Figma variable name | Final CSS name |
|------------|--------------------|----|
| Breakpoints | `md` | `--breakpoint-md` |
| Breakpoints | `Tablet` | `--breakpoint-tablet` → mapped to `--breakpoint-md` |
| Breakpoints | `Desktop` | `--breakpoint-desktop` → mapped to `--breakpoint-lg` |
| Breakpoints | `Breakpoints/xl` | `--breakpoint-xl` *(prefix dropped)* |

> **Note**: After normalization, apply the breakpoint canonical alias mapping (see Phase F in SKILL.md) to consolidate non-standard names to `--breakpoint-md/lg/xl`.

### Effects

| Collection | Figma variable name | Subtype | Final CSS name |
|------------|--------------------|----|---|
| Effects | `Shadow/Small` | shadow | `--shadow-small` |
| Effects | `Shadow/2XL` | shadow | `--shadow-2xl` |
| Effects | `Radius/2.5xl` | border-radius | `--radius-2-5xl` *(`.` → `-`)* |
| Effects | `Animation/Fade In` | animation | `--animate-fade-in` |
| Effects | `Elevation/Card` | shadow | `--shadow-elevation-card` |

---

## Edge Cases

> All examples below use fictitious names for illustration.

| Situation | Handling |
|-----------|---------|
| Variable name is a single word with no `/` | Use as-is after lowercasing. E.g. `"Magenta"` → `--color-magenta` |
| Variable name starts with a number | Prepend category prefix first — the prefix makes it valid. `"2xl"` → `--radius-2xl` ✓ |
| Variable name contains Unicode or emoji | Strip non-ASCII characters, replace with `-`, then normalize |
| Two variables produce the same CSS name | Log a `ReportError` for the second one. First occurrence wins. |
| Variable name is empty after normalization | Log a `ReportError` and skip the token |
