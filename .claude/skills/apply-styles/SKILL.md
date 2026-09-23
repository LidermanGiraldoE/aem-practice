---
name: apply-styles
description: Apply styles correctly when building AEM blocks and DS components. Always use Tailwind utilities — never hardcode values. Typography (Step 1), Colors (Step 2), and Shadows (Step 3) are active; more categories (spacing, etc.) will be added as the project grows. Token values are project-specific but the process is always the same.
---

# Apply Styles

Use this skill whenever you need to add or modify styles in a block or DS component. Styles are always applied via **Tailwind utility classes** — never write vanilla CSS or hardcode values unless the user explicitly requests it.

> **Cardinal rule:** If a Tailwind utility exists for what you need, use it. If one does not exist, ask the user before inventing values.

## When to Use This Skill

- Writing styles for any DS component (`design-system/**/*.js`)
- Writing styles for any AEM block (`blocks/{name}/{name}.js` when decorating with class names, or `blocks/{name}/{name}.css` only on user request)
- Reviewing any file for style violations
- Unsure which utility to apply for a given design spec

---

## Step 1 — Typography

The project defines two tiers of typography utilities in `styles/tailwind.css`. Always pick from these. Token values (sizes, line-heights) live in `styles/styles.css` `:root` — you never set them manually.

### Tier 1 — Raw Scale (size only, no weight, fixed across breakpoints)

Use for decorative text, pull-quotes, stats, labels, overlines — content whose size **must NOT change between mobile and desktop**.

| Figma Style | Utility            | Weight included? | Letter-spacing |
|-------------|-------------------|-----------------|----------------|
| Display 2xl | `type-display-2xl` | ✗               | ✓ `-0.02em`    |
| Display xl  | `type-display-xl`  | ✗               | ✓ `-0.02em`    |
| Display lg  | `type-display-lg`  | ✗               | ✓ `-0.02em`    |
| Display md  | `type-display-md`  | ✗               | ✓ `-0.02em`    |
| Display sm  | `type-display-sm`  | ✗               | —              |
| Display xs  | `type-display-xs`  | ✗               | —              |
| Text xl     | `type-text-xl`     | ✗               | —              |
| Text lg     | `type-text-lg`     | ✗               | —              |
| Text md     | `type-text-md`     | ✗               | —              |
| Text sm     | `type-text-sm`     | ✗               | —              |
| Text xs     | `type-text-xs`     | ✗               | —              |
| Overline    | `type-overline`    | ✓ 500 + uppercase | —            |

Add weight separately with `font-bold` (700), `font-semibold` (600), `font-medium` (500), or `font-normal` (400) — except `type-overline` which includes it.

### Tier 2 — Element (responsive, weight included)

Use for semantic heading and body content whose size **must scale automatically between mobile and desktop**. The variables switch at ≥ 1240 px via `styles/styles.css` — no extra breakpoint needed.

| Element  | Utility        | Weight | Mobile             | Desktop (≥ 1240px)  |
|----------|---------------|--------|--------------------|---------------------|
| H1       | `type-h1`      | 700    | Display lg  (48px) | Display 2xl (72px)  |
| H2       | `type-h2`      | 600    | Display md  (36px) | Display xl  (60px)  |
| H3       | `type-h3`      | 500    | Display sm  (30px) | Display lg  (48px)  |
| H4       | `type-h4`      | 500    | Display xs  (24px) | Display md  (36px)  |
| H5       | `type-h5`      | 500    | Text xl     (20px) | Display sm  (30px)  |
| H6       | `type-h6`      | 500    | Text lg     (18px) | Display xs  (24px)  |
| Body LG  | `type-body-lg` | 400    | Text md     (16px) | Text xl     (20px)  |
| Body MD  | `type-body-md` | 400    | Text sm     (14px) | Text md     (16px)  |
| Body SM  | `type-body-sm` | 400    | Text xs     (12px) | Text sm     (14px)  |
| Link     | `type-link`    | 400    | Text xs     (12px) | Text sm     (14px)  |

### Decision Tree

```
Does the text need to change size between mobile and desktop?
│
├─ YES → Tier 2 (Element)
│         heading content      → type-h1 … type-h6
│         paragraph / body     → type-body-lg / type-body-md / type-body-sm
│         link text            → type-link
│
└─ NO  → Is it an overline (small uppercase label)?
          │
          ├─ YES → type-overline
          │
          └─ NO  → Tier 1 (Raw Scale)
                    large / display content  → type-display-{size}
                    body-size content        → type-text-{size}
                    + add font-weight class separately
```

### Usage Examples

```jsx
// ✅ Responsive heading
<h2 class="type-h2">Section title</h2>

// ✅ Fixed hero stat
<span class="type-display-2xl font-bold">98%</span>

// ✅ Body copy
<p class="type-body-md">Description text here.</p>

// ✅ Overline label (weight + uppercase built in)
<span class="type-overline">Category</span>

// ✅ Fixed label, custom weight
<span class="type-text-sm font-semibold">Tag</span>
```

### Wrong vs Correct

| Scenario | ❌ Wrong | ✓ Correct |
|---|---|---|
| Page heading | `font-size: 72px` | `type-h1` |
| Card subtitle (responsive) | `font-size: 1.5rem` | `type-h4` |
| Hero stat fixed at 72px | `style="font-size:72px"` | `type-display-2xl font-bold` |
| Body paragraph | `font-size: 16px` | `type-body-lg` |
| Caption / meta | `font-size: 12px` | `type-text-xs` |
| Overline | `font-size: 10px; text-transform: uppercase` | `type-overline` |

### Enforcement Rules

**❌ Never:**
- `font-size: <any px/rem/em value>`
- `line-height: <any px/rem value>` (when expressing a typography size)
- `letter-spacing: -0.02em` (use `type-display-*` which includes it)
- Inline `style` attributes for typography

**✅ Always allowed:**
- `font-weight: 700 / 600 / 500 / 400` (hardcoded integers, no variables)
- `font-size: inherit` / `line-height: normal` / `letter-spacing: normal` (resets)
- Tailwind weight classes: `font-bold`, `font-semibold`, `font-medium`, `font-normal`

**⚠️ Excluded from audits** (never edit, never flag):
`scripts/aem.js`, `scripts/dompurify.min.js`, `scripts/preact/**`, `scripts/htm/**`, `scripts/swiper/**`

### Edge Cases

**Size not in the scale** — The DS defines 12 steps (Display 2xl–xs, Text xl–xs, Overline). If a design value doesn't match:
1. Re-check Figma — may be an off-spec mistake
2. Choose the closest step and note it in a comment
3. Never invent a value — escalate: *"The design shows 26px which is not in the DS. Closest is Display xs (24px). Use that, or add a new token?"*

**Heading element already styled globally** — `h1`–`h6` already receive typography from `styles/styles.css`. Do not re-apply `type-h*` to the element itself unless intentionally overriding:
```jsx
// ✅ h2 already has type-h2 globally — only add extras
<h2 class="text-magenta">Already sized correctly</h2>

// ✅ Override when the h2 inside this context is intentionally smaller
<h2 class="type-h4">Smaller heading in a card aside</h2>
```

**Vanilla CSS custom properties (user-requested only)** — If the user explicitly asks for vanilla CSS instead of Tailwind, use the CSS custom properties defined in `styles/styles.css` `:root`. Naming convention: `--display-{size}-font-size`, `--display-{size}-line-height`, `--h{n}-font-size`, `--body-{size}-font-size`, etc. Font-weight is always a hardcoded integer — no weight variables exist.

---

## Step 2 — Colors

Color tokens are defined in `styles/tailwind.css` `@theme` and AEM aliases in `styles/styles.css` `:root`. Always use Tailwind utility classes — never hardcode hex, rgb, or hsl values.

### How to Discover the Project's Color Tokens

**Before writing any color**, read the `@theme` block in `styles/tailwind.css` and look for `--color-*` variables. These are the only colors available. The naming convention follows Figma exactly.

```bash
# List all color tokens available in the project
grep -- '--color-' styles/tailwind.css
```

Tokens are typically organized in groups — the exact groups and names vary per project. Common patterns:

| Group | Purpose | Example tokens |
|-------|---------|----------------|
| Neutro | Black/white base | `--color-neutro-black`, `--color-neutro-white` |
| Gray | Neutral shades | `--color-gray-strong`, `--color-gray-default`, `--color-gray-soft` |
| Primary | Brand colors | `--color-primary-{name}-strong/default/soft/softer` |
| Secondary | Accent / support | `--color-secondary-{name}` |
| Semantic | Status feedback | `--color-success-*`, `--color-warning-*`, `--color-info-*`, `--color-error-*` |

### AEM Aliases (styles.css `:root`)

`styles/styles.css` maps AEM semantic aliases to the Figma tokens via `var()`. These provide short names for common use cases:

```css
/* Example — actual values are project-specific */
--background-color: var(--color-neutro-white);
--text-color:       var(--color-neutro-black);
--link-color:       var(--color-primary-blue-default);
--link-hover-color: var(--color-primary-blue-soft);
--light-color:      var(--color-gray-softer);
--dark-color:       var(--color-gray-default);
```

Tailwind exposes these as short utilities (`bg-bg`, `text-text`, `bg-light`, `text-dark`, `bg-primary`, etc.) — check `@theme` for the full list.

### Using Colors — Tailwind Utilities

Every `--color-{token}` in `@theme` generates Tailwind utilities automatically:

| Property | Utility pattern | Example |
|----------|----------------|---------|
| Text color | `text-{token}` | `text-primary-blue-default` |
| Background | `bg-{token}` | `bg-gray-softer` |
| Border | `border-{token}` | `border-error-default` |
| Ring | `ring-{token}` | `ring-primary-aqua-default` |
| Divide | `divide-{token}` | `divide-gray-soft` |
| Opacity | `{utility}/{opacity}` | `bg-primary-blue-default/50` |

### Decision Tree

```
What kind of color do you need?
│
├─ Background → bg-{token}
├─ Text       → text-{token}
├─ Border     → border-{token}
├─ Ring       → ring-{token}
├─ Divide     → divide-{token}
│
Is there an EDS short alias that fits? (check @theme for aliases)
│
├─ YES → Use the short name (bg-primary, text-text, bg-light…)
└─ NO  → Use the full Figma token name (bg-primary-blue-strong, text-secondary-magenta…)
```

### Usage Examples

```jsx
// ✅ Brand accent background
<div class="bg-primary text-neutro-white">CTA banner</div>

// ✅ Status message using semantic token
<span class="text-error-default">Required field</span>

// ✅ Badge with semantic pair
<span class="bg-success-softer text-success-strong">Active</span>

// ✅ Link with hover — tokens from @theme
<a class="text-primary-blue-default hover:text-primary-blue-soft">Learn more</a>

// ✅ Light section background via alias
<section class="bg-light">Content</section>

// ✅ Border
<div class="border border-gray-soft">Card</div>

// ✅ Opacity modifier (Tailwind v4)
<div class="bg-primary-blue-default/50">Overlay</div>
```

### Wrong vs Correct

| Scenario | ❌ Wrong | ✓ Correct |
|---|---|---|
| Brand accent | `background: #ca005d` | `bg-{token}` from `@theme` |
| Body text | `color: #625a53` | `text-{token}` or `text-text` alias |
| Error text | `color: red` | `text-error-default` |
| Link color | `color: var(--link-color)` in JS | `text-primary-blue-default` (TW class) |
| Light bg | `background-color: #f0efee` | `bg-light` or `bg-{gray-token}` |
| Hover | `color: #4b5aff` | `hover:text-{token}` |
| Border | `border-color: #aea49f` | `border-{token}` |
| Inline | `style="color: #000"` | `text-neutro-black` |

### Enforcement Rules

**❌ Never:**
- `color: #hex` / `color: rgb(…)` / `color: hsl(…)` — use `text-{token}`
- `background-color: #hex` / `background: #hex` — use `bg-{token}`
- `border-color: #hex` — use `border-{token}`
- `style="color:…"` / `style="background:…"` — use utility classes
- `var(--color-*)` in JS/DS component styles — use the Tailwind class instead

**✅ Always allowed:**
- `color: inherit` / `color: currentColor` / `background: transparent` (resets)
- `color: var(--color-*)` in `styles/styles.css` `:root` AEM aliases only
- Opacity modifiers: `bg-{token}/50` (Tailwind v4 syntax)

**⚠️ Excluded from audits** (never edit, never flag):
`scripts/aem.js`, `scripts/dompurify.min.js`, `scripts/preact/**`, `scripts/htm/**`, `scripts/swiper/**`

### Edge Cases

**Color not in the palette** — If a design uses a color not in `@theme`:
1. Re-check Figma — may be an off-spec mistake
2. Never invent a hex value — escalate: *"The design shows #XX which is not in the DS palette. Closest is {token}. Use that, or add a new token to tailwind.css @theme?"*

**Opacity variations** — Use Tailwind v4 modifier syntax: `bg-{token}/50` for 50% opacity. Do not create new tokens for opacity variants.

**Vanilla CSS custom properties (user-requested only)** — If the user explicitly asks for vanilla CSS, use the AEM aliases from `styles/styles.css` `:root` (`--background-color`, `--text-color`, `--link-color`, etc.) or the Figma tokens directly (`var(--color-primary-blue-default)`).

---

## Step 3 — Shadows

Shadow tokens are defined in `styles/tailwind.css` `@theme` as `--shadow-*` variables. Always use Tailwind `shadow-{size}` utilities — never hardcode `box-shadow` values.

### How to Discover the Project's Shadow Tokens

```bash
# List all shadow tokens available in the project
grep -- '--shadow-' styles/tailwind.css
```

Tokens are typically organized by intensity — the exact names and values vary per project. Common pattern:

| Size | Purpose |
|------|---------|
| `xs` | Subtle — inputs, small cards |
| `sm` | Light — cards resting state |
| `md` | Medium — dropdowns, popovers |
| `lg` | Prominent — modals, floating elements |
| `xl` | Heavy — dialogs, overlays |
| `2xl`+ | Maximum elevation — hero overlays |

### Using Shadows — Tailwind Utilities

Every `--shadow-{size}` in `@theme` generates a Tailwind utility automatically:

| Utility | Generates |
|---------|----------|
| `shadow-xs` | `box-shadow: var(--shadow-xs)` |
| `shadow-sm` | `box-shadow: var(--shadow-sm)` |
| `shadow-md` | `box-shadow: var(--shadow-md)` |
| `shadow-lg` | `box-shadow: var(--shadow-lg)` |
| `shadow-xl` | `box-shadow: var(--shadow-xl)` |
| `shadow-2xl` | `box-shadow: var(--shadow-2xl)` |
| `shadow-3xl` | `box-shadow: var(--shadow-3xl)` |
| `shadow-none` | removes shadow |

### Usage Examples

```jsx
// ✅ Card with subtle shadow
<div class="shadow-sm rounded-xs">Card content</div>

// ✅ Dropdown panel
<div class="shadow-lg">Dropdown menu</div>

// ✅ Modal overlay
<div class="shadow-2xl">Modal content</div>

// ✅ Shadow on hover (interactive cards)
<div class="shadow-sm hover:shadow-md transition-shadow">Hover card</div>

// ✅ No shadow
<div class="shadow-none">Flat element</div>
```

### Wrong vs Correct

| Scenario | ❌ Wrong | ✓ Correct |
|---|---|---|
| Card shadow | `box-shadow: 0 1px 3px rgba(0,0,0,0.1)` | `shadow-sm` |
| Dropdown | `box-shadow: 0 4px 6px -1px rgb(20 20 20 / 0.10)` | `shadow-md` |
| Modal | `box-shadow: 0 24px 48px -12px rgba(0,0,0,0.18)` | `shadow-2xl` |
| Inline | `style="box-shadow: …"` | `shadow-{size}` class |
| CSS var in JS | `box-shadow: var(--shadow-lg)` | `shadow-lg` (TW class) |

### Enforcement Rules

**❌ Never:**
- `box-shadow: <raw value>` — use `shadow-{size}`
- `style="box-shadow:…"` inline attribute — use utility class
- `var(--shadow-*)` in block/DS JS styles — use the Tailwind class instead

**✅ Always allowed:**
- `box-shadow: none` / `shadow-none` (resets)
- Custom `@utility` definitions in `tailwind.css` that compose shadows (e.g., `btn-focus-primary`) — these are project-defined utilities, not hardcoded values
- `box-shadow` in `styles/styles.css` `:root` for AEM aliases

**⚠️ Excluded from audits** (never edit, never flag):
`scripts/aem.js`, `scripts/dompurify.min.js`, `scripts/preact/**`, `scripts/htm/**`, `scripts/swiper/**`

### Edge Cases

**Shadow not in the scale** — If a design uses a shadow that doesn't match any `--shadow-*` token:
1. Re-check Figma — may be an off-spec value
2. Choose the closest step
3. Never invent a value — escalate: *"The design shows a shadow not in the DS. Closest is shadow-md. Use that, or add a new token?"*

**Composed shadows (buttons, focus rings, etc.)** — Some components need multi-layer box-shadow (e.g., inset border + outer glow). These are defined as `@utility` blocks in `tailwind.css` (e.g., `btn-focus-primary`, `btn-border`). Use the existing utility — do not re-create the box-shadow inline.

**Vanilla CSS custom properties (user-requested only)** — If the user explicitly asks for vanilla CSS, use `var(--shadow-xs)` … `var(--shadow-3xl)` from `@theme`.

---

## Step 3b — Border Radius

### 3b.1 — Discover available tokens

```bash
grep -- '--radius-' styles/tailwind.css | head -20
```

The project's `@theme` in `tailwind.css` defines the complete radius scale. Each `--radius-{step}` generates a `rounded-{step}` utility class.

### 3b.2 — Token → Utility mapping

| Token | Utility | Typical use |
|---|---|---|
| `--radius-xxs` | `rounded-xxs` | Subtle rounding (badges, tags) |
| `--radius-xs` | `rounded-xs` | Small inputs, chips |
| `--radius-sm` | `rounded-sm` | Buttons (small), cards |
| `--radius-md` | `rounded-md` | Buttons (medium), form fields |
| `--radius-lg` | `rounded-lg` | Cards, dropdowns |
| `--radius-xl` | `rounded-xl` | Modals, large cards |
| `--radius-2xl` | `rounded-2xl` | Media cards, video containers |
| `--radius-3xl` | `rounded-3xl` | Hero elements |
| `--radius-4xl` | `rounded-4xl` | Large decorative elements |
| `--radius-5xl` | `rounded-5xl` | Extra-large decorative elements |
| `--radius-6xl` | `rounded-6xl` | Pill shapes |
| (built-in) | `rounded-full` | Circles, pill buttons |
| (built-in) | `rounded-none` | Sharp corners (reset) |

### 3b.3 — Per-side & per-corner utilities

Tailwind provides directional variants:

| Need | Utility pattern | Example |
|---|---|---|
| Top only | `rounded-t-{step}` | `rounded-t-lg` |
| Bottom only | `rounded-b-{step}` | `rounded-b-lg` |
| Left only | `rounded-l-{step}` | `rounded-l-md` |
| Right only | `rounded-r-{step}` | `rounded-r-md` |
| Top-left corner | `rounded-tl-{step}` | `rounded-tl-xl` |
| Top-right corner | `rounded-tr-{step}` | `rounded-tr-xl` |

### 3b.4 — Wrong vs Correct

```
❌ class="rounded-[8px]"               → arbitrary value
❌ class="rounded-[0.5rem]"            → arbitrary value
❌ style="border-radius: 8px"          → inline CSS
✅ class="rounded-md"                  → token (8px)
✅ class="rounded-t-lg rounded-b-none" → directional tokens
```

### 3b.5 — Enforcement rules

| Pattern | Verdict | Fix |
|---|---|---|
| `rounded-{step}` (from token list) | ✅ Allowed | — |
| `rounded-t/b/l/r/tl/tr/bl/br-{step}` | ✅ Allowed | Directional variant |
| `rounded-full` / `rounded-none` | ✅ Allowed | Built-in |
| `rounded-[<any>]` | ❌ Forbidden | Find closest token |
| `border-radius: <value>` (inline/CSS) | ❌ Forbidden | Use `rounded-{step}` |

### 3b.6 — Edge cases

**Value not in the scale** → Do NOT invent arbitrary values. Escalate: *"The design shows border-radius 10px which isn't in the DS. Closest is rounded-md (8px) or rounded-lg (12px). Which should I use?"*

**Vanilla CSS (user-requested only)** — If the user explicitly asks for vanilla CSS, use `var(--radius-md)` etc. from `@theme`.

---

## Step 4 — Spacing

*(Coming soon — will cover spacing scale utilities and enforcement)*
