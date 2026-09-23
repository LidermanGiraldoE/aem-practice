---
name: component-architecture
description: Plan the implementation architecture for design system components. Determines Atomic Design classification, audits existing components for reuse, integrates with Figma MCP for design specs, and produces a structured architecture plan. Use before writing any component code.
---

# Component Architecture

Plan HOW a component will be implemented before writing code. This skill analyzes requirements, classifies the component in Atomic Design, audits existing components, integrates design specs, and produces an architecture plan.

## When to Use This Skill

**Invoked by:** `speckit.specify` (step 4b — New Block / Block Variant tasks), `speckit.plan`, `content-driven-development`, or directly when planning DS component work

Use this skill when:
- Creating a new design system component
- Adding a significant variant to an existing component
- Composing multiple components into a new one
- Migrating or wrapping a third-party component
- Unsure about classification (atom vs molecule vs organism)

Do NOT use for:
- CSS-only tweaks to existing components
- Bug fixes that don't change architecture
- Documentation-only changes

## Prerequisites

- Requirements are understood (from `analyze-and-plan` skill or `speckit.specify`)
- Visual materials gathered (if available)

## Workflow

Follow these steps in order:

### Step 1: Requirements Analysis

**Understand the component's purpose:**

1. **What problem does it solve?** — User need, UI pattern, interaction model
2. **What interactions does it have?** — click, hover, keyboard, drag, resize, scroll
3. **What data does it need?** — Props, state, external data
4. **What states must it support?** — Default, hover, active, focus, disabled, loading, error, empty
5. **What variants are needed?** — visual (primary/secondary), size (sm/md/lg), contextual
6. **Does it compose other components?** — Which ones, how
7. **Responsive behavior?** — Mobile, tablet, desktop differences
8. **Accessibility requirements?** — ARIA roles, keyboard navigation, focus management

#### Complexity Threshold Decision

After gathering requirements, apply this rule to determine the implementation path:

**→ Simple Block path** (if ALL of the following are true):
- ≤ 1 interactive state beyond hover/focus (e.g., only active/pressed)
- Does NOT compose other Design System components
- No complex data flow, no managed state, no external data
- CSS styling is straightforward (no dynamic state-driven token switching)

**Implementation:** AEM block (`blocks/{blockname}/`) with:
- `{blockname}.js` — DOM decoration logic (`decorate(block)` function)
- `{blockname}.css` — **empty by design** (all styles via global tokens or inline)
- No `design-system/` directory needed

**→ DS Component path** (if ANY of the following is true):
- ≥ 2 interactive states beyond hover/focus (e.g., loading + error + disabled)
- Composes other DS components (atoms, molecules, organisms)
- Manages complex state, async data, or cross-component communication
- Requires a reusable component contract (props API, JSDoc, samples)

**Implementation:** Full Atomic Design structure:
- `blocks/{blockname}/` — AEM block acts as **container only**: reads authored content/props, renders the organism wrapper
- `design-system/{atoms|molecules|organisms}/{name}/` — component logic, styles, sample

> **Present this threshold analysis to the user and confirm the path before continuing.**

**Output:** Clear understanding of component scope, requirements, and confirmed implementation path (Simple Block or DS Component)

---

### Step 2: Atomic Design Classification

**Use the decision tree and classification rules to determine the component type.**

See `resources/atomic-design-guide.md` for:
- Classification rules (Atom, Molecule, Organism)
- Decision tree
- Examples and edge cases
- Golden rules

**What to do:**
1. Apply the decision tree to your component
2. Verify against classification rules
3. Document the classification and reasoning

**Output:** Component type (atom/molecule/organism) with justification

---

### Step 3: Existing Component Audit

**Before creating anything new, check what already exists.**

#### A. Scan Local Design System

```bash
# List all existing components
ls design-system/atoms/ design-system/molecules/ design-system/organisms/ 2>/dev/null
```

- Does a component with similar purpose already exist?
- Can an existing component be extended with a new variant?
- Are there sub-components that can be reused?

#### B. Check Vendored/Third-Party Components

Review any vendored component libraries in the project:
- Check `scripts/__dropins__/` or equivalent vendor directories
- List available components and their capabilities
- Determine if any meet the requirements

#### C. Apply the Reuse Decision Matrix

| Scenario | Action |
|----------|--------|
| Component exists locally AND meets 100% of requirements | **Reuse directly** |
| Component exists locally BUT needs a new variant | **Extend** — add variant to existing component |
| Component exists in vendor lib AND meets requirements | **Import** — use vendor component, document in DS |
| Component exists in vendor lib BUT needs customization | **Wrap** — create DS wrapper around vendor component |
| Component does NOT exist anywhere | **Create** — build from scratch |
| Complex component that combines existing ones | **Compose** — assemble from existing components |

**Present findings to user:**
- List what was found (with paths)
- Recommend reuse vs create
- **Let the user decide** — don't proceed without confirmation

**Output:** Audit results + user-confirmed approach (reuse/extend/wrap/create/compose)

---

### Step 4: Design Specs Integration

**If Figma MCP is available:**

1. **Get design context** — Extract node details, design specs (colors, spacing, typography), assets, states, variants
2. **Generate screenshot** — Visual reference for implementation
3. **Get design variables** — Map Figma tokens to project's CSS custom properties or theme tokens
4. **Get code connect mapping** — Map Figma components to existing code

**If Figma MCP is NOT available:**

1. Ask the user for design specifications
2. Use existing CSS custom properties and theme tokens from `styles/styles.css`
3. Follow existing component patterns in the project
4. Document design decisions as comments

**Token mapping approach:**
- Always map Figma values to existing project tokens/variables first
- Only create new tokens when no existing match exists
- Document the mapping for the styler phase

**Output:** Design specifications mapped to project tokens

---

### Step 5: Architecture Plan

**Generate the component architecture plan using the template.**

See `resources/architecture-plan-template.md` for the full template.

**Fill in:**
1. **Classification** — Type, location, files
2. **Reuse analysis** — Existing components to use, new components required
3. **Design specifications** — Props, states, variants, responsive behavior
4. **Planned styles** — Layout approach, token usage, responsive strategy
5. **Planned optimizations** — Performance, accessibility, best practices
6. **Registration** — Where to register in the DS showcase/samples
7. **Implementation sequence** — What to build first, dependencies

**Output:** Completed architecture plan

---

### Step 6: Validation Strategy

**Define how the component will be validated after implementation.**

See `resources/best-practices.md` for:
- Performance checklist
- Accessibility checklist
- Best practices checklist
- Common pitfalls to avoid

**What to define:**
1. **Functional validation** — Does it work as specified?
2. **Visual validation** — Does it match the design?
3. **Performance validation** — Lighthouse targets, Core Web Vitals
4. **Accessibility validation** — WCAG AA, keyboard nav, screen reader
5. **Regression check** — What must NOT break?

**If Chrome DevTools MCP is available:**
- Performance trace (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Screenshot comparison with Figma
- Accessibility audit
- Network inspection
- Console error check

**Output:** Validation checklist specific to this component

---

## Success Criteria

- ✅ Component classified in Atomic Design with justification
- ✅ Existing components audited for reuse
- ✅ User confirmed approach (reuse/extend/create)
- ✅ Design specs mapped to project tokens
- ✅ Architecture plan completed
- ✅ Validation strategy defined

## Output

This skill produces a structured architecture plan that feeds into the implementation phase. The plan is incorporated directly into the calling context (spec, CDD workflow, or used by sub-agents like `ds-component-creator`, `ds-component-styler`, `ds-component-optimizer`).

No separate file is generated — findings flow into the next phase.
