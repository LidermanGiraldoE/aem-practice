# Component Architecture Plan Template

Use this template when creating an architecture plan for a new or significantly modified component.

---

## 1. Classification

- **Component Name**: {ComponentName}
- **Type**: Atom | Molecule | Organism
- **Location**: `design-system/{type}/{component-name}/`
- **Files**:
  - `{component-name}.js` — Implementation
  - `{component-name}.sample.js` — Usage examples
- **Classification Reasoning**: {Why this type was chosen}

---

## 2. Reuse Analysis

### Existing Components to Use
- [ ] {Component1} from `design-system/{path}` — {purpose}
- [ ] {Component2} from vendor — {purpose}

### New Components Required
- [ ] {SubComponent1} — {purpose}
- [ ] {SubComponent2} — {purpose}

### User Decision
- [ ] Reuse existing: {which component}
- [ ] Extend existing: {which component + what to add}
- [ ] Create from scratch
- [ ] Compose from existing components

---

## 3. Design Specifications

### Props API

```
{ComponentName}
  variant    "default" | "primary" | "secondary"
  size       "sm" | "md" | "lg"
  disabled   boolean
  children   content
  className  string — additional CSS classes
  ...rest    HTMLAttributes
  
  // Component-specific props:
  {prop}     {type} — {description}
```

### States
- Default
- Hover
- Active/Pressed
- Focus
- Disabled
- Loading (if applicable)
- Error (if applicable)
- Empty (if applicable)

### Visual Variants
- Variant 1: {description}
- Variant 2: {description}

### Responsive Behavior
- Mobile (< 768px): {behavior}
- Tablet (768px - 1239px): {behavior}
- Desktop (≥ 1240px): {behavior}
- Desktop large (≥ 1440px): {behavior}

---

## 4. Planned Styles

### Layout Approach
- Layout method: Flexbox | Grid | Absolute
- Key layout classes: {describe approach}

### Token Usage
- Colors: {map to project CSS variables or theme tokens}
- Typography: {map to project type tokens}
- Spacing: {map to project spacing scale}
- Shadows: {map to project shadow tokens}
- Border radius: {map to project radius tokens}

### Responsive Strategy
- Mobile-first approach
- Breakpoint changes: {describe what changes at each breakpoint}

---

## 5. Planned Optimizations

### Performance
- [ ] Minimize DOM operations — use variables for complex elements
- [ ] Cleanup effects — always remove listeners on unmount
- [ ] Correct dependency arrays — only include what's needed
- [ ] Use refs for DOM — not state for element references
- [ ] Lazy loading — for images: `loading="lazy"` with width/height
- [ ] Debounce/throttle expensive events
- [ ] Transitions only on transform/opacity (avoid layout-triggering properties)
- [ ] Passive event listeners for scroll/touch

### Accessibility
- [ ] Semantic HTML (`<button>`, `<nav>`, `<article>`, etc.)
- [ ] ARIA labels (aria-label, aria-describedby, role)
- [ ] Keyboard navigation (Tab, Enter, Space, Escape)
- [ ] Focus management (focus trap if modal/dropdown)
- [ ] Color contrast WCAG AA (4.5:1 text, 3:1 large text)
- [ ] Descriptive alt text on images
- [ ] Associated form labels
- [ ] Reduced motion respected (prefers-reduced-motion)

### Best Practices
- [ ] No console.log in production
- [ ] Prop validation (warnings in dev if applicable)
- [ ] Secure links (rel="noopener noreferrer" for external)
- [ ] XSS prevention (sanitize user input)

### SEO (if applicable)
- [ ] Semantic structure (correct heading hierarchy)
- [ ] Descriptive links (no "click here")
- [ ] Image optimization (alt, dimensions)
- [ ] Mobile-friendly

---

## 6. Registration

- Register in DS showcase: `{path to samples file}`
- Import sample component
- Add to appropriate section (atoms/molecules/organisms)

---

## 7. Implementation Sequence

1. {First thing to build — e.g., "Base component structure with default props"}
2. {Second — e.g., "States: hover, focus, disabled"}
3. {Third — e.g., "Variants: primary, secondary"}
4. {Fourth — e.g., "Responsive behavior"}
5. {Fifth — e.g., "Accessibility: ARIA, keyboard nav"}
6. {Sixth — e.g., "Register in DS showcase"}

---

## 8. Notes

{Any relevant information about design decisions, limitations, dependencies, open questions}

---

## 0. Implementation Path (fill this first)

> Determined by the complexity threshold in Step 1 of the skill. Select ONE path and delete the other.

### Path A: Simple Block

- **Use when**: ≤ 1 interactive state (beyond hover/focus), no DS composition, no complex state
- **Files to create**:
  ```
  blocks/{blockname}/
  ├── {blockname}.js   # DOM decoration — decorate(block) function
  └── {blockname}.css  # EMPTY — styles via global tokens only
  ```
- **CSS strategy**: All visual styling through existing project CSS custom properties in `styles/styles.css`. The CSS file is committed empty.
- **Block role**: Full implementation lives here — reads authored DOM, transforms structure, applies ARIA

### Path B: DS Component

- **Use when**: ≥ 2 interactive states, composes DS components, manages complex state/data
- **Files to create**:
  ```
  blocks/{blockname}/
  ├── {blockname}.js    # Container only — reads props, renders organism
  └── {blockname}.css   # EMPTY — component styles live in design-system/
  
  design-system/{atoms|molecules|organisms}/{name}/
  ├── {name}.js         # Component logic (Preact/HTM or vanilla)
  └── {name}.sample.js  # Usage examples
  ```
- **Block role**: Container only — parse authored attributes/content, pass as props to the DS component, mount to DOM
- **Component role**: All logic, states, variants, and styling live in the `design-system/` file
