# Model Validation Checklist

Run this checklist after generating `_<name>.json` (Step 9 of the block-data-modeling skill).  
Report **PASS** or **FAIL** for each rule. **Do not proceed to `building-blocks` if any rule FAILS.**

---

## Validation Rules

### V-001 — No `"value"` on Editable Fields

**What it checks**: No field in `models[*].fields` has a `"value"` key set on an editable field.

**Why it matters**: Setting `"value"` on any editable field causes Universal Editor to re-apply that default every time the author saves any field — triggering a full block re-render and losing the author's in-progress selection.

**How to detect**:
```bash
# Search for "value" keys in the model file
grep -n '"value"' blocks/<name>/_<name>.json
```

If any result points to an editable field (not an options array entry), the rule FAILS.

**Allowed exception**: `options` array entries use `"value"` — this is fine and does NOT trigger re-renders.
```json
// ✅ ALLOWED — value in options array
"options": [{ "name": "Primary", "value": "primary" }]

// ❌ FAILS V-001 — value on editable field
{ "component": "text", "name": "title", "value": "Default Title" }
```

**Fix**: Remove the `"value"` key. Apply the default in the block's JS:
```javascript
const title = rows[0].children[0].textContent.trim() || 'Default Title';
```

---

### V-002 — No Underscores in Field Names

**What it checks**: No field `"name"` in `models[*].fields` contains an underscore character (`_`).

**Why it matters**: The xwalk plugin does not support underscores in field names. Fields with underscores are silently dropped from the UE property panel.

**How to detect**:
```bash
grep -n '"name":' blocks/<name>/_<name>.json | grep '_'
```

Any match with an underscore in the value (not the key) means the rule FAILS.

**Fix**: Rename to camelCase.
```json
// ❌ FAILS V-002
{ "name": "show_title" }

// ✅ PASS
{ "name": "showTitle" }
```

---

### V-003 — Correct `valueType` per Component

**What it checks**: Each field uses the correct `valueType` for its `component`.

**Why it matters**: Wrong `valueType` causes UE to store/retrieve the wrong data type, resulting in JS type errors and incorrect rendering.

**Required mappings**:

| Component | Required `valueType` | Common Mistake |
|-----------|---------------------|----------------|
| `text` | `"string"` | Using `"text"` instead |
| `textarea` | `"string"` | Using `"text"` instead |
| `richtext` | `"string"` | Omitting `valueType` |
| `select` | `"string"` | Using `"text"` instead |
| `multiselect` | `"string"` | Using `"string[]"` instead |
| `radio-group` | `"string"` | Using `"boolean"` for yes/no |
| `checkbox-group` | `"string[]"` | Using `"string"` instead |
| `boolean` | `"boolean"` | Using `"string"` instead |
| `number` | `"number"` | Using `"string"` instead |
| `reference` | `"string"` | Omitting `valueType` |
| `aem-content` | `"string"` | Omitting `valueType` |
| `aem-tag` | `"string"` | Omitting `valueType` |
| `date-time` | `"date"` | Using `"string"` instead |
| `aem-content-fragment` | `"string"` | Omitting `valueType` |
| `aem-experience-fragment` | `"string"` | Omitting `valueType` |
| `tab` | none (omit `valueType`) | Adding `valueType` to a tab |

**How to detect**: Manually review each field's `component` + `valueType` pair against the table above.

**Fix**: Update `valueType` to match the required value for the component.

---

### V-004 — Filter Present on Container Definitions

**What it checks**: Every `definitions` entry with `resourceType` = `core/franklin/components/block/v1/block` that is intended as a container of sub-items has `"filter"` set in its `template`.

**Why it matters**: Without `"filter"`, Universal Editor does not allow the author to add sub-items inside the container. The "Add Component" button will not appear.

**How to detect**: For `container-items` and `config-items` block types, check that the container's definition has `"filter"`.

```json
// ❌ FAILS V-004 — no filter on a container block
{
  "template": {
    "name": "My Block",
    "model": "my-block"
  }
}

// ✅ PASS — filter present
{
  "template": {
    "name": "My Block",
    "model": "my-block",
    "filter": "my-block"
  }
}
```

**Fix**: Add `"filter": "<block-id>"` to the container's template and ensure the `filters` array has a matching entry.

**Exception**: `simple` blocks intentionally have no `"filter"` — this is correct.

---

### V-005 — Field Count Matches Expected DOM Row Count

**What it checks**: The number of model fields that generate DOM rows (all fields except `tab` and `${refName}Alt` baked fields) matches the number of rows you expect the block to have when authored.

**Why it matters**: A mismatch means JS will read the wrong row index — fields will show incorrect data or throw `undefined` errors.

**How to detect**:
1. Count all fields in the model's `fields` array
2. Subtract `tab` fields (no DOM row)
3. Subtract `${refName}Alt` text fields (baked into `<img alt>`, no DOM row)
4. The result is your expected `CONFIG_ROW_COUNT` (for config fields) or item row count
5. Compare against the authored test content row count

**Fix**: Adjust the model to add/remove fields, or update `CONFIG_ROW_COUNT` in the row-index mapping.

---

### V-006 — Block ID Registered in `_section.json`

**What it checks**: The block's `id` appears in `models/_section.json` under the `components` array of the section model.

**Why it matters**: Without this registration, the block will not appear in the UE section toolbar's "Add Component" picker. Authors cannot insert the block into pages.

**How to detect**:
```bash
grep -n '"<block-id>"' models/_section.json
```

If there is no match, the rule FAILS.

**Fix**: Add the block ID to `models/_section.json`:
```json
{
  "id": "section",
  "components": [
    "...",
    "<block-id>"
  ]
}
```

Then run `npm run build:json` to recompile.

---

### V-007 — Tab Grouping Applied for Large Models

**What it checks**: If a model has more than 5 data fields (excluding tabs), they are organized into logical tab groups.

**Why it matters**: More than 5 fields displayed flat in the UE properties panel creates a poor authoring experience and is harder to navigate.

**How to detect**: Count non-tab fields in the model's `fields` array. If the count is > 5 and no `tab` fields are present, the rule FAILS.

**Fix**: Add `tab` fields to group logically related fields:
- General tab: layout/variant/behavior controls
- Content tab: text fields (title, description, body copy)
- Media tab: images, videos, PDFs
- CTA tab: links and action fields

```json
{ "component": "tab", "label": "General", "name": "tabGeneral" },
{ "component": "select", "name": "variant", "label": "Variante", "valueType": "string", "options": [...] },

{ "component": "tab", "label": "Contenido", "name": "tabContent" },
{ "component": "text", "name": "title", "label": "Título", "valueType": "string" },
{ "component": "richtext", "name": "body", "label": "Cuerpo", "valueType": "string" }
```

**Exception**: Models with ≤ 5 fields pass this rule without tabs. Tabs are encouraged but not required for small models.

---

### V-008 — Maximum 2 Levels of Definition Nesting

**What it checks**: The `definitions` array has at most 2 levels of containment: a container definition and an item definition. Items are NOT themselves containers that contain further container types (no 3-level nesting).

**Why it matters**: Universal Editor does not support more than 2 levels of nested containers with `multi: true`. Deeper nesting causes unpredictable UE behavior.

**How to detect**: Review the `filters` structure. If a filter entry's `components` references an item id that is itself in another filter's `components` as a container, you have 3 levels — the rule FAILS.

```json
// ❌ FAILS V-008 — 3 levels: block → card → button (button is a container)
{
  "filters": [
    { "id": "my-block", "components": ["my-block-card"] },
    { "id": "my-block-card", "components": ["my-block-button"] },
    { "id": "my-block-button", "components": ["my-block-button-icon"] }  // 3rd level
  ]
}

// ✅ PASS — 2 levels: block → card → button (button has a model, not a filter)
{
  "filters": [
    { "id": "my-block", "components": ["my-block-card"] },
    { "id": "my-block-card", "components": ["my-block-button"] }
    // my-block-button has "model" only, not "filter" — leaf node
  ]
}
```

**Fix**: Flatten the model. Move the deepest level's fields up to the parent item model, or make the deepest item a non-container (leaf node with `model` only, no `filter`).

---

## Validation Report Template

After running all checks, produce a report in this format:

```
## Model Validation Report: <block-name>

| Rule | Check | Status | Notes |
|------|-------|--------|-------|
| V-001 | No "value" on editable fields | ✅ PASS | |
| V-002 | No underscores in field names | ✅ PASS | |
| V-003 | Correct valueType per component | ✅ PASS | |
| V-004 | Filter present on container | ✅ PASS | |
| V-005 | Field count matches DOM row count | ✅ PASS | Expected 4 data rows |
| V-006 | Block ID in _section.json | ✅ PASS | Found "my-block" at line 12 |
| V-007 | Tab grouping for >5 fields | ✅ PASS | 3 tabs defined |
| V-008 | Max 2 levels of nesting | ✅ PASS | 2 levels (block → item) |

**Overall: ✅ ALL PASS — ready for building-blocks**
```

If any rule FAILS:
```
**Overall: ❌ BLOCKED — fix failures before proceeding to building-blocks**

Action items:
- V-001: Remove "value" from field "title" in model "my-block"
- V-006: Add "my-block" to models/_section.json components array
```
