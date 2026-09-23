# Field Types Reference — AEM Universal Editor

Source: [Adobe documentation](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/field-types) + project conventions.

---

## Complete Field Type Inventory

| Component | `valueType` | DOM Row? | Required Sub-properties | Notes |
|-----------|-------------|----------|------------------------|-------|
| `text` | `string` | ✅ Yes | — | Single-line text. Validations: `minLength`, `maxLength`, `regExp` |
| `textarea` | `string` | ✅ Yes | — | Multi-line plain text |
| `number` | `number` | ✅ Yes | — | ⚠️ Use `"component": "number"` — do NOT use `text` with `"valueType": "number"`. Validations: `numberMin`, `numberMax` |
| `select` | `string` | ✅ Yes | `options` | Single-selection dropdown. Always include an empty placeholder option |
| `multiselect` | `string` | ✅ Yes | `options` | Multi-selection dropdown |
| `radio-group` | `string` | ✅ Yes | `options` | Mutually exclusive radio buttons |
| `checkbox-group` | `string[]` | ✅ Yes | `options` | Multiple checkboxes. Note: `valueType` is `"string[]"` (array), not `"string"` |
| `boolean` | `boolean` | ✅ Yes | — | Toggle on/off. ⚠️ `valueType` must be `"boolean"`. ⚠️ NEVER set `"value"` |
| `reference` | `string` | ✅ Yes | — | DAM asset picker (images, videos, PDFs). Use `"multi": true` for multiple assets |
| `richtext` | `string` | ✅ Yes | — | WYSIWYG HTML editor. ⚠️ NEVER set `"value"` — triggers re-render on every save |
| `aem-content` | `string` | ✅ Yes | — | AEM resource picker (pages, content fragments). Optional: `rootPath` to restrict the picker |
| `aem-tag` | `string` | ✅ Yes | — | AEM taxonomy/tag picker |
| `date-time` | `date` | ✅ Yes | — | Date/time picker. `valueType` must be `"date"`, not `"string"`. Optional: `displayFormat`, `valueFormat` |
| `aem-content-fragment` | `string` | ✅ Yes | — | Content Fragment picker. Optional: `variationName`, `rootPath` |
| `aem-experience-fragment` | `string` | ✅ Yes | — | Experience Fragment picker. Optional: `variationName`, `rootPath` |
| `tab` | — | ❌ **No** | — | Panel separator only. Organizes fields into UE editor tabs. **Never generates a DOM row.** |
| `container` | `string` | Varies | — | Groups fields visually. With `"multi": true` → repeatable multifield. ⚠️ Never nest a `multi` container inside another `multi` container |

---

## Row Generation Rule (Critical for Row-Index Mapping)

> **Only fields that generate DOM rows contribute to the row index.**

- All components with `DOM Row? = ✅ Yes` → **increment row counter**
- `tab` → **skip** (no DOM row; purely a UE UI element)
- `${refName}Alt` convention (see below) → **skip** (baked into `<img alt>`, no separate row)

---

## Project-Specific Conventions

### Convention 1: Alt Text Baking (`${refName}Alt`)

When a `text` field is named `${refName}Alt` — where `refName` is the exact `name` of the preceding `reference` field — AEM bakes the value directly into the `<img alt>` attribute on the CDN-delivered HTML. **No separate DOM row is generated for this alt field.**

**Example**:
```json
{ "component": "reference", "name": "image",    "label": "Image" },
{ "component": "text",      "name": "imageAlt",  "label": "Alt text" }
```
→ `imageAlt` is baked: `<img alt="value the author typed">`. No row at index N+1 for alt.

**Contrast — alt field that does NOT follow the convention** (e.g., `contentAlt` for a `reference` named `image`):
→ Not baked. A separate DOM row IS generated.

**Reading baked alt in JS**:
```javascript
const img = rows[imageRowIndex].querySelector('img');
const altText = img?.getAttribute('alt') || '';
```

### Convention 2: No `"value"` on Editable Fields

Setting a `"value"` default on any field that authors edit causes Universal Editor to re-apply that default value every time the author saves, triggering a full block re-render and losing the author's selection.

```json
// ❌ BAD — triggers UE re-render
{ "component": "text", "name": "title", "label": "Title", "value": "Default title" }

// ✅ GOOD — no default in model; apply default in JS
{ "component": "text", "name": "title", "label": "Title", "valueType": "string" }
```

Apply defaults in JS:
```javascript
const title = rows[0].children[0].textContent.trim() || 'Default title';
```

**Exception**: `select` and `radio-group` may include an empty placeholder option. This is acceptable because the empty string is a valid explicit selection, not a forced default.

### Convention 3: No Underscores in Field Names

The xwalk plugin does not support `_` in field `name` values. Always use camelCase.

```json
// ❌ BAD
{ "name": "show_title" }

// ✅ GOOD
{ "name": "showTitle" }
```

---

## JSON Model Examples

### `text` field
```json
{
  "component": "text",
  "valueType": "string",
  "name": "title",
  "label": "Title"
}
```

### `richtext` field
```json
{
  "component": "richtext",
  "valueType": "string",
  "name": "description",
  "label": "Description"
}
```

### `reference` field (image)
```json
{
  "component": "reference",
  "valueType": "string",
  "name": "image",
  "label": "Image"
}
```

### `reference` field with baked alt
```json
{ "component": "reference", "valueType": "string", "name": "image",    "label": "Image" },
{ "component": "text",      "valueType": "string", "name": "imageAlt", "label": "Image alt text" }
```

### `select` field (with empty placeholder)
```json
{
  "component": "select",
  "valueType": "string",
  "name": "variant",
  "label": "Variant",
  "options": [
    { "name": "— Select —",   "value": "" },
    { "name": "Primary",      "value": "primary" },
    { "name": "Secondary",    "value": "secondary" }
  ]
}
```

### `boolean` field
```json
{
  "component": "boolean",
  "valueType": "boolean",
  "name": "showTitle",
  "label": "Show title"
}
```

### `tab` field (no DOM row)
```json
{
  "component": "tab",
  "label": "Configuration",
  "name": "tabConfig"
}
```

### `aem-content` field (page link)
```json
{
  "component": "aem-content",
  "valueType": "string",
  "name": "ctaHref",
  "label": "CTA link"
}
```

### `number` field
```json
{
  "component": "number",
  "valueType": "number",
  "name": "columns",
  "label": "Columns",
  "numberMin": 1,
  "numberMax": 6
}
```

### `date-time` field
```json
{
  "component": "date-time",
  "valueType": "date",
  "name": "publishDate",
  "label": "Publication date"
}
```

### Conditional field (`condition` with JSONLogic)
```json
{
  "component": "text",
  "valueType": "string",
  "name": "customLabel",
  "label": "Custom label",
  "condition": { "===": [{ "var": "variant" }, "custom"] }
}
```

---

## `options` Array Format (for `select`, `multiselect`, `radio-group`, `checkbox-group`)

```json
"options": [
  { "name": "Label shown to author", "value": "machine-readable-value" },
  { "name": "Other",                  "value": "other" }
]
```

- `name` = label shown in the UE editor
- `value` = the actual value stored in the content and read by JS
