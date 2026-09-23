---
name: block-data-modeling
description: Define the data model (`_<name>.json`), row-index mapping, and JavaScript bridge pattern when planning a new AEM Edge Delivery block. Invoked after `content-modeling` and before `building-blocks` in the CDD workflow.
---

# Block Data Modeling

This skill guides you through producing the complete data artifacts needed before writing any block code:

1. A `_<name>.json` model file for Universal Editor
2. A row-index mapping (which DOM row corresponds to which model field)
3. A JavaScript bridge pattern template for the block's `decorate()` function

## Related Skills

- **content-driven-development**: This skill is invoked FROM the CDD workflow at Step 3b (after content-modeling)
- **content-modeling**: Run BEFORE this skill — provides the authoring table structure (rows, columns, semantic formatting)
- **building-blocks**: Run AFTER this skill — consumes the model JSON and row-index mapping to write block JS/CSS

## When to Use This Skill

✅ **Use this skill when**:
- Creating a new block (every time, without exception)
- Modifying a block in ways that add/remove/reorder fields in the UE model
- Debugging Universal Editor editability issues caused by incorrect field mapping

❌ **Skip this skill when**:
- Only changing CSS styles or block visual layout (no model changes)
- Making JS changes that don't affect field reading order
- Block already has a valid `_<name>.json` and you're only patching behavior

## Inputs Required

| Input | Source | Description |
|-------|--------|-------------|
| Block name | User/CDD | kebab-case (e.g., `split-banner`) |
| Block purpose | User/CDD | What the block displays (1-2 sentences) |
| Content fields | `content-modeling` output | List of content elements (title, image, CTA, etc.) |
| Rendering approach | User/CDD or inferred | `preact` if block uses DS organisms; `native` otherwise |

## Outputs Produced

| Output | Description |
|--------|-------------|
| `blocks/<name>/_<name>.json` | Complete model JSON for Universal Editor |
| Row-index mapping | Markdown table: field → DOM row index → read pattern |
| Bridge pattern | JS code template for `decorate()` |

## Checklist

- [ ] Step 1: Classify the block type
- [ ] Step 2: Define the `definitions` array
- [ ] Step 3: Define model fields
- [ ] Step 4: Define filters
- [ ] Step 5: Build and verify the model JSON
- [ ] Step 6: Generate the row-index mapping
- [ ] Step 7: Apply CONFIG_ROW_COUNT (if applicable)
- [ ] Step 8: Generate the bridge pattern
- [ ] Step 9: Validate the model

---

## Step 1: Classify the Block Type

Before writing any JSON, classify the block into one of three types. This determines the `definitions` structure, whether you need a `filter`, and which bridge pattern to use.

**Ask yourself:**

> "Does this block have repeating sub-items that the author can add/remove individually in Universal Editor (e.g., cards, steps, slides)?"

| Block Type | Description | Decision Rule | Examples |
|------------|-------------|---------------|----------|
| **simple** | One editable entity. The block itself has all fields | No repeating sub-items | Hero, Image-Link, Banner |
| **container-items** | Container + repeating items. Items have the fields; container only holds them | Sub-items with IDENTICAL fields, container has NO own fields | Cards, Testimonials, Brand Grid |
| **config-items** | Container with its own config fields PLUS repeating items | Sub-items with identical fields, AND container has editable fields of its own | Split Banner, Calculator, Wizard |

> **Second question for config-items**: Does the container have some rows that are container-level config (variant, title, image, mode…) and some rows that are per-item data?

Also decide:

| Rendering Approach | When | Implication |
|-------------------|------|-------------|
| `native` | Block uses vanilla DOM manipulation, no DS organisms | Use `moveInstrumentation` + `replaceChildren` pattern |
| `preact` | Block renders a DS organism via Preact/HTM | Use `getAueAttrs` capture → hide rows → render into child container |

Record:
```
blockType: simple | container-items | config-items
renderingApproach: native | preact
```

---

## Step 2: Define the `definitions` Array

The `definitions` entry registers the block (and its item type, if applicable) in Universal Editor.

### 2a. Simple Block

```json
{
  "definitions": [
    {
      "title": "Block Title",
      "id": "block-name",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": {
              "name": "Block Title",
              "model": "block-name"
            }
          }
        }
      }
    }
  ]
}
```

- Use `"model": "block-name"` — the container has editable fields.
- No `"filter"` needed (the block doesn't contain child item types).

### 2b. Container + Items Block

```json
{
  "definitions": [
    {
      "title": "Block Title",
      "id": "block-name",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": {
              "name": "Block Title",
              "filter": "block-name"
            }
          }
        }
      }
    },
    {
      "title": "Block Item",
      "id": "block-name-item",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block/item",
            "template": {
              "name": "Block Item",
              "model": "block-name-item"
            }
          }
        }
      }
    }
  ]
}
```

- Container uses `"filter"` (defines what can go inside it) — NO `"model"` for the container itself.
- Item uses `"model"` (defines the item's editable fields).
- `resourceType` for items ends in `/block/item`.

### 2c. Config + Items Block

```json
{
  "definitions": [
    {
      "title": "Block Title",
      "id": "block-name",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": {
              "name": "Block Title",
              "model": "block-name",
              "filter": "block-name"
            }
          }
        }
      }
    },
    {
      "title": "Block Item",
      "id": "block-name-item",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block/item",
            "template": {
              "name": "Block Item",
              "model": "block-name-item"
            }
          }
        }
      }
    }
  ]
}
```

- Container has BOTH `"model"` (its own config fields) AND `"filter"` (allows child items).
- Item has `"model"` only.

### 2d. Nesting Limit

> ⚠️ Maximum 2 levels of nesting in `definitions`. A container-items block may have an item that is itself a container (with its own `filter`), but you cannot go deeper. Never nest a `multi: true` container inside another `multi: true` container in the model.

---

## Step 3: Define Model Fields

For each editable entity (the block itself for `simple`; the item for `container-items`; both container and item for `config-items`), define the fields array.

> **Full field type reference**: See `resources/field-types-reference.md` for all 17 Adobe UE component types with `valueType`, DOM row generation, required sub-properties, and project-specific conventions.

### 3a. Field Selection Rules

| If you need… | Use |
|--------------|-----|
| Short text (title, label, CTA text) | `text` + `valueType: "string"` |
| Multi-line plain text (description snippet) | `textarea` + `valueType: "string"` |
| Formatted HTML (rich descriptions, body copy) | `richtext` + `valueType: "string"` |
| Image / video / PDF from DAM | `reference` + `valueType: "string"` |
| Link to an AEM page or content fragment | `aem-content` + `valueType: "string"` |
| True/false toggle | `boolean` + `valueType: "boolean"` — NEVER set `"value"` |
| Enum from a fixed list | `select` + `valueType: "string"` + `options` array |
| Numeric value | `number` + `valueType: "number"` |

### 3b. Critical Constraints

| Constraint | Rule |
|------------|------|
| No `"value"` on editables | Setting a default `"value"` on any editable field causes UE to re-render the block on every save. Apply defaults in JS instead: `const t = field.textContent \|\| 'Default'` |
| No `_` in field names | The xwalk plugin does not support underscores in `name`. Use camelCase: `showTitle`, not `show_title` |
| `boolean` needs `valueType: "boolean"` | Not `"string"`. |
| `date-time` needs `valueType: "date"` | Not `"string"`. |
| `checkbox-group` produces `string[]` | `valueType: "string[]"` |
| Alt text baking | If you add a `text` field named `${refName}Alt` immediately after a `reference` field (e.g., `image` + `imageAlt`), AEM bakes the alt directly into `<img alt>`. **No separate DOM row is generated for the alt field.** |

### 3c. Tab Organization

If a model has more than **5 fields**, group them into tabs for author usability. Each `tab` component is a panel separator — it does **not** generate a DOM row. The tab applies to all fields below it until the next `tab`.

```json
{ "component": "tab", "label": "General", "name": "tabGeneral" },
{ "component": "text", "name": "title", "label": "Título", "valueType": "string" },
{ "component": "select", "name": "variant", "label": "Variante", "valueType": "string", "options": [...] },

{ "component": "tab", "label": "Media", "name": "tabMedia" },
{ "component": "reference", "name": "image", "label": "Imagen", "valueType": "string" },
{ "component": "text", "name": "imageAlt", "label": "Alt text", "valueType": "string" },

{ "component": "tab", "label": "CTA", "name": "tabCta" },
{ "component": "text", "name": "ctaLabel", "label": "Botón — Texto", "valueType": "string" },
{ "component": "aem-content", "name": "ctaHref", "label": "Botón — Enlace", "valueType": "string" }
```

### 3d. Conditional Fields

Use JSONLogic `condition` to show/hide fields based on other field values:

```json
{
  "component": "text",
  "name": "customHeight",
  "label": "Altura personalizada",
  "valueType": "string",
  "condition": { "===": [{ "var": "variant" }, "custom"] }
}
```

---

## Step 4: Define Filters

The `filters` array declares what child component types a container block accepts.

### Simple Block

```json
{ "filters": [] }
```

### Container + Items or Config + Items Block

```json
{
  "filters": [
    {
      "id": "block-name",
      "components": ["block-name-item"]
    }
  ]
}
```

- `id` matches the `"filter"` reference in the container's definition.
- `components` lists allowed child `id` values (from `definitions`).
- If items can themselves contain nested items (e.g., a card with buttons), add a second filter entry for the child container.

### Register in `_section.json`

After defining the block's `_<name>.json`, add the block's `id` to `models/_section.json` so it appears in the UE section toolbar:

```json
{
  "id": "section",
  "components": [
    "...",
    "block-name"
  ]
}
```

---

## Step 5: Build and Verify

After writing `blocks/<name>/_<name>.json`, run the model build:

```bash
npm run build:json
```

This compiles all `_*.json` files into the three root JSON files using `merge-json-cli`:

```
models/_component-definition.json  \
models/_component-filters.json      }→ compiled by merge-json-cli → component-*.json
models/_component-models.json      /
blocks/*/_*.json  ← automatically included via glob (no manual registration needed)
```

> ⚠️ **NEVER manually edit `component-definition.json`, `component-models.json`, or `component-filters.json`.**
> These are **generated files** — any manual change will be overwritten on the next `npm run build:json`.
> All block-level definitions, models, and filters go in `blocks/<name>/_<name>.json` only.
> All shared/global models go in the `models/` directory only.

**Verify**:
1. The command exits with code `0` (no errors)
2. Open `component-definition.json` and confirm your block's `id` appears
3. Open `component-models.json` and confirm your model's `id` and fields appear
4. Open `component-filters.json` and confirm your filter (if any) appears

**Common build errors**:
- `duplicate id` — another block already uses that `id`. Choose a more specific name.
- `JSON parse error` — trailing comma, missing quote, or wrong bracket. Check with a JSON linter.
- Model field `name` contains `_` — rename to camelCase.

---

## Step 6: Generate the Row-Index Mapping

The row-index mapping is a table that shows which DOM row (`block.children[n]`) corresponds to each model field. Build it by walking fields in definition order and applying these rules:

| Field Component | DOM Row? | Rule |
|----------------|----------|------|
| `text` | ✅ Yes | Increments row index |
| `textarea` | ✅ Yes | Increments row index |
| `number` | ✅ Yes | Increments row index |
| `select` | ✅ Yes | Increments row index |
| `multiselect` | ✅ Yes | Increments row index |
| `radio-group` | ✅ Yes | Increments row index |
| `checkbox-group` | ✅ Yes | Increments row index |
| `boolean` | ✅ Yes | Increments row index |
| `reference` | ✅ Yes | Increments row index |
| `richtext` | ✅ Yes | Increments row index |
| `aem-content` | ✅ Yes | Increments row index |
| `aem-tag` | ✅ Yes | Increments row index |
| `date-time` | ✅ Yes | Increments row index |
| `aem-content-fragment` | ✅ Yes | Increments row index |
| `aem-experience-fragment` | ✅ Yes | Increments row index |
| `tab` | ❌ No | Panel separator only — skip, do NOT increment |
| `${refName}Alt` text field | ❌ No | Baked into `<img alt>` — skip, do NOT increment |

**Output format** (produce this table for the agent consuming this skill):

```markdown
| Field | Component | Row | Read Pattern |
|-------|-----------|-----|--------------|
| tabGeneral | tab | — | No row |
| variant | select | 0 | `rows[0].children[0].textContent.trim()` |
| tabMedia | tab | — | No row |
| image | reference | 1 | `rows[1].querySelector('img')` |
| imageAlt | text (baked) | — | `rows[1].querySelector('img').alt` |
| tabCta | tab | — | No row |
| ctaLabel | text | 2 | `rows[2].children[0].textContent.trim()` |
| ctaHref | aem-content | 3 | `rows[3].querySelector('a')?.href` |
```

**Access patterns by field type**:

| Component | Access Pattern |
|-----------|----------------|
| `text`, `textarea` | `row.children[0].textContent.trim()` |
| `number` | `parseFloat(row.children[0].textContent.trim())` |
| `boolean` | `row.children[0].textContent.trim() === 'true'` |
| `select`, `multiselect`, `radio-group` | `row.children[0].textContent.trim()` |
| `reference` (image) | `row.querySelector('img')` → `img.src`, `img.alt` |
| `reference` (video) | `row.querySelector('a')?.href` |
| `aem-content` | `row.querySelector('a')?.href \|\| row.children[0].textContent.trim()` |
| `richtext` | `row.querySelector('[data-aue-type="richtext"]')?.innerHTML \|\| row.children[0].innerHTML` |
| `date-time` | `row.children[0].textContent.trim()` (ISO string) |
| `${refName}Alt` | `row.querySelector('img').alt` on the preceding `reference` row |

---

## Step 7: Apply CONFIG_ROW_COUNT (Config-Items Blocks Only)

> Skip this step if `blockType === 'simple'` or `blockType === 'container-items'`.

For `config-items` blocks, the block DOM has **config rows first**, followed by **item rows**. You must calculate `CONFIG_ROW_COUNT` to slice them correctly in JS.

**Calculate CONFIG_ROW_COUNT**:

```
CONFIG_ROW_COUNT = (number of data fields in the container model)
                  EXCLUDING tabs (no DOM row)
                  EXCLUDING ${refName}Alt fields (baked, no DOM row)
```

Example — container model has: `tabGeneral`, `variant`, `title`, `tabMedia`, `image`, `imageAlt`, `tabCta`, `ctaLabel`:
- Tabs excluded: `tabGeneral`, `tabMedia`, `tabCta` → −3
- Baked alt excluded: `imageAlt` → −1
- Total data fields: `variant`, `title`, `image`, `ctaLabel` = **4**
- `CONFIG_ROW_COUNT = 4`

**Slicing pattern in JS**:

```javascript
const CONFIG_ROW_COUNT = 4; // calculated above
const rows = [...block.children];
const configRows = rows.slice(0, CONFIG_ROW_COUNT);
const itemRows = rows.slice(CONFIG_ROW_COUNT);
```

Document `CONFIG_ROW_COUNT` and its breakdown in the row-index mapping table so the `building-blocks` implementation step can use it directly.

---

## Step 8: Generate the Bridge Pattern

Select the bridge pattern based on `renderingApproach` and `blockType`. Full code templates are in `resources/bridge-patterns.md`.

### Step 8a: Native DOM Bridge (`renderingApproach === 'native'`)

**When to use**: Block uses vanilla DOM manipulation. No Preact.

**What to produce**: A `decorate(block)` function that:
1. Imports `createOptimizedPicture` from `../../scripts/aem.js` and `moveInstrumentation` from `../../scripts/scripts.js`
2. Reads config rows with `readBlockConfig(block)` (for `config-items`) or processes rows directly
3. Creates new DOM elements for each item row
4. Calls `moveInstrumentation(originalNode, newNode)` on every replaced element
5. Calls `block.replaceChildren(newList)` for `simple` or `container-items` blocks
6. For `config-items`: slices rows with `CONFIG_ROW_COUNT`, processes config rows separately, iterates item rows

**Key rule**: Never replace a node without calling `moveInstrumentation` first. This preserves Universal Editor's `data-aue-*` attributes on the new node.  

See `resources/bridge-patterns.md` → **Section 1: Native DOM Patterns** for copy-pasteable templates.

### Step 8b: Preact Bridge (`renderingApproach === 'preact'`)

**When to use**: Block renders a DS organism via Preact/HTM.

**Mandatory order**:
```
1. Capture getAueAttrs() from ALL editable nodes  ← DOM exists
2. Extract all data (text, images, hrefs)          ← DOM exists
3. Hide rows OR call render()                      ← DOM transformation
4. Spread field-level AUE attrs in Preact JSX      ← after render
```

**What to produce**: A `decorate(block)` function that:
1. Imports `render` from `../../scripts/preact/index.js` and `html` from `../../scripts/htm/index.js` and the DS organism
2. Calls `parseConfig(block)` and/or `parseItems(block)` — these functions capture `getAueAttrs` BEFORE render
3. For `container-items` blocks: hides rows (`block.children.forEach(row => row.style.display='none')`) and creates a child container for Preact
4. For `simple` blocks: can call `render(html\`<Organism />\`, block)` directly
5. Renders the organism into the block (or child container)

**Key rules**:
- `getAueAttrs(el)` must be called on the **specific element** that has `data-aue-prop`, never on a parent/ancestor
- For richtext fields: strip the UE wrapper via `row.querySelector('[data-aue-type="richtext"]')?.innerHTML`
- **DO NOT spread item-level attrs** (`data-aue-resource`, `data-aue-type="component"`) in Preact JSX — the hidden row already carries them
- **DO spread field-level attrs** (`data-aue-prop`, `data-aue-type="text|richtext|media"`) in the Preact elements that render each field

See `resources/bridge-patterns.md` → **Section 2: Preact Patterns** for complete templates.

---

## Step 9: Validate the Model

Before handing off to `building-blocks`, run the validation checklist in `resources/model-validation.md`. The checklist covers 8 rules (V-001 through V-008).

**Quick summary**:
- V-001: No `"value"` on editable fields
- V-002: No `_` in field `name`
- V-003: Correct `valueType` per component
- V-004: `filter` present on container definitions
- V-005: Field count matches expected DOM row count
- V-006: Block `id` registered in `models/_section.json`
- V-007: Tab grouping applied if > 5 fields
- V-008: No more than 2 levels of definition nesting

Report PASS/FAIL for each. **Do not proceed to `building-blocks` if any rule FAILS.**

See `resources/model-validation.md` for detailed rule descriptions, detection guidance, and examples.
