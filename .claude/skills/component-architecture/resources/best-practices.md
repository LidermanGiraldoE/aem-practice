# Best Practices & Validation Checklists

Reference checklists for validating component quality during and after implementation.

---

## Code Patterns

### Props Ordering Convention

Follow a consistent order for component props:

```
1. Variants/types      (variant, size, type)
2. Content             (title, label, children)
3. Booleans            (disabled, loading, active)
4. Callbacks           (onClick, onChange, onClose)
5. Custom class name   (customClassName, className)
6. Rest props          (...rest — ALWAYS last)
```

### Effect Cleanup

Always clean up side effects:

```javascript
// Set up and tear down listeners
useEffect(() => {
  const handler = (e) => { /* ... */ };
  document.addEventListener('click', handler);
  return () => document.removeEventListener('click', handler);
}, []);
```

### Secure External Links

```html
<a href={url} target="_blank" rel="noopener noreferrer">
```

### Lazy Loading Images

```html
<img src={src} alt={alt} width={w} height={h} loading="lazy" />
```

---

## Common Pitfalls

| Pitfall | Wrong | Right |
|---------|-------|-------|
| Missing file extensions in imports | `import { X } from './x'` | `import { X } from './x.js'` |
| No effect cleanup | `useEffect(() => { listen(); }, [])` | `useEffect(() => { listen(); return () => unlisten(); }, [])` |
| State for DOM refs | `const [el, setEl] = useState(null)` | `const el = useRef(null)` |
| Hardcoded values | `color: #d50057` | `color: var(--link-color)` |
| Layout-triggering transitions | `transition: width 0.3s` | `transition: transform 0.3s` |
| Missing img dimensions | `<img src={s} />` | `<img src={s} width={w} height={h} loading="lazy" />` |

---

## Performance Checklist

- [ ] No unnecessary re-renders (stable event handlers)
- [ ] useEffect with complete cleanup
- [ ] Correct dependency arrays (only include what's needed)
- [ ] Images have `loading="lazy"`, `width`, `height`, and `alt`
- [ ] Transitions only on `transform` and `opacity`
- [ ] Expensive events debounced/throttled
- [ ] No layout thrashing (batch DOM reads, then writes)
- [ ] Passive event listeners for scroll/touch events
- [ ] Minimal DOM operations (use variables for complex elements)

---

## Accessibility Checklist

- [ ] Semantic HTML elements (`<button>`, `<nav>`, `<article>`, `<dialog>`, etc.)
- [ ] ARIA attributes where native semantics aren't sufficient
- [ ] Keyboard navigation: Tab, Enter, Space, Escape
- [ ] Focus management: visible focus indicator, focus trap for modals
- [ ] Color contrast: WCAG AA (4.5:1 normal text, 3:1 large text)
- [ ] Descriptive alt text on all informational images
- [ ] Form labels associated with inputs
- [ ] `prefers-reduced-motion` respected for animations
- [ ] Screen reader testing (logical reading order, announced states)

---

## Best Practices Checklist

- [ ] No `console.log` in production code
- [ ] Prop validation (development-time warnings if applicable)
- [ ] External links have `rel="noopener noreferrer"`
- [ ] User input sanitized (XSS prevention)
- [ ] No inline styles for values that can use tokens/variables
- [ ] Component data attribute present (e.g., `data-name`)
- [ ] customClassName / rest props supported for extensibility

---

## Creation Checklist

Use after the component creator phase:

- [ ] Implementation file created (`{component}.js`)
- [ ] Sample file created (`{component}.sample.js`)
- [ ] Correct imports (framework, extensions)
- [ ] Complete JSDoc with all props documented
- [ ] Data attribute present (`data-name`)
- [ ] customClassName and `...rest` supported
- [ ] All required states implemented
- [ ] All required variants implemented
- [ ] Existing components correctly reused
- [ ] No syntax errors (lint passes)

---

## Styling Checklist

Use after the styling phase:

- [ ] Project theme tokens used (no hardcoded values)
- [ ] Layout classes applied correctly
- [ ] No `!important` unless resolving a documented specificity conflict
- [ ] No unnecessary separate CSS files if inline/utility approach is project standard
- [ ] Responsive behavior works at all breakpoints
- [ ] Transitions are smooth (transform, opacity)
- [ ] Hover/focus/active states visually distinct
- [ ] Color contrast meets WCAG AA

---

## Optimization Checklist

Use after the optimization phase:

### Performance
- [ ] No unnecessary re-renders
- [ ] useEffect cleanup implemented
- [ ] Images lazy loaded with dimensions
- [ ] Transitions only on transform/opacity
- [ ] Events debounced/throttled where appropriate

### Accessibility
- [ ] Semantic HTML
- [ ] ARIA labels complete
- [ ] Keyboard navigation functional
- [ ] Focus visible and managed
- [ ] Color contrast WCAG AA

### Best Practices
- [ ] No console.logs
- [ ] Props validated
- [ ] Secure links

### SEO (if applicable)
- [ ] Semantic structure
- [ ] Descriptive alt text
- [ ] Mobile-friendly

---

## Integration Checklist

Use after registering the component in the design system:

- [ ] Registered in DS showcase samples file
- [ ] Appears correctly in design system page
- [ ] Linter passes: `npm run lint`
- [ ] Build passes (if applicable)
- [ ] All sample variants render correctly
- [ ] Documentation complete (or inline JSDoc sufficient)

---

## Lighthouse Targets

When running Lighthouse audits:

| Category | Target |
|----------|--------|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 90 (if applicable) |

### Core Web Vitals

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TBT (Total Blocking Time) | < 300ms |

---

## When Lighthouse Score is Low (< 90)

1. **Diagnose** — Use Chrome DevTools performance trace or Lighthouse detailed report
2. **Identify** — Long tasks, unoptimized images, layout thrashing, excessive re-renders
3. **Fix** — Apply targeted optimizations from the performance checklist
4. **Re-test** — Run Lighthouse again to verify improvement
5. **Iterate** — Repeat until target scores are met

---

## Chrome DevTools MCP Validation Workflow

When Chrome DevTools MCP is available in your agent environment, use this 5-step sequence to validate a component after implementation:

### Step 1: Performance Trace

```
Tool: mcp_io_github_chr_performance_start_trace / mcp_io_github_chr_performance_stop_trace
```

- Start a trace while the component renders or an interaction is triggered
- Stop and analyze: identify long tasks (> 50ms), unnecessary layouts, forced reflows
- **Target**: LCP < 2.5s, TBT < 300ms, CLS < 0.1

### Step 2: Visual Screenshot Comparison

```
Tool: mcp_io_github_chr_screenshot
```

- Capture the rendered component
- Compare visually against Figma design or expected output
- Check: spacing, typography, colors, states (hover/focus/disabled)
- Capture each required state separately if needed

### Step 3: Accessibility Audit

```
Tool: mcp_io_github_chr_run_accessibility_audit (if available) or DevTools a11y panel
```

- Run full accessibility audit on the component
- Check for missing ARIA attributes, low contrast, focus order issues
- **Target**: 0 critical issues, ≥ 95 Lighthouse a11y score

### Step 4: Network Audit

```
Tool: mcp_io_github_chr_list_network_requests
```

- Inspect requests triggered by the component (fonts, images, API calls)
- Check: no unexpected requests, images are lazy-loaded, fonts don't block rendering
- Confirm caching headers on static assets

### Step 5: Console Error Check

```
Tool: mcp_io_github_chr_list_console_messages
```

- Check for JavaScript errors, warnings, or deprecation notices
- **Target**: 0 errors, 0 warnings related to the component

### Fallback (MCP unavailable)

If Chrome DevTools MCP is not available:
1. Open DevTools manually → **Performance** tab → Record an interaction
2. **Lighthouse** tab → Run audit (Mobile, Simulated throttling)
3. **Accessibility** tab → Review the accessibility tree
4. **Network** tab → Filter by component name, check request count
5. **Console** tab → Look for errors after interaction

---

## Special Case Handling

Common scenarios and how to address them:

### Case 1: Component Already Exists

When the audit (Step 3 of the skill) finds a matching component:
1. Present the existing component with its path and a brief description
2. List what it supports (variants, props, states)
3. List what it does NOT support (gaps vs requirements)
4. Present the recommendation table:

| Gap Size | Recommendation |
|----------|----------------|
| 0 gaps | **Reuse directly** — point to existing component |
| 1-2 gaps | **Extend** — add variant/prop to existing without breaking changes |
| 3+ gaps | **Wrap** — create a new DS wrapper; keep original unchanged |
| Incompatible architecture | **Create new** — document why existing can't be used |

5. **Wait for user decision before proceeding**

### Case 2: Multi-Component Composition

When requirements show 3+ sub-components or complex state orchestration:
1. Recommend **Organism** classification
2. List all required sub-components (atoms and molecules)
3. Check if they already exist — audit each one individually
4. Define the composition tree:
   ```
   OrganismName
   ├── MoleculeA (exists at design-system/molecules/molecule-a/)
   ├── AtomB (exists at design-system/atoms/atom-b/)
   └── AtomC (NEW — must create)
   ```
5. Note implementation sequence: create missing sub-components before the organism

### Case 3: Figma Design Available

When Figma MCP is available and a design file exists:
1. Use Figma MCP to extract the exact design frame (see Step 4 of the skill)
2. Map ALL values to project CSS custom properties / theme tokens first
3. Only create new tokens when no existing match is found
4. Capture the complete token mapping in the Architecture Plan
5. Note any design inconsistencies (values not matching the design token system)

### Case 4: Low Lighthouse Score After Implementation

If post-implementation Lighthouse score is below target (< 90 performance):

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| High LCP | Images unoptimized or blocking render | Add `loading="lazy"`, `width`, `height`; defer non-critical JS |
| High CLS | Missing dimensions or late-loading fonts | Reserve space with `aspect-ratio` or fixed `width/height`; add `font-display: swap` |
| High TBT | Long tasks on main thread | Split logic, use `requestIdleCallback` for non-urgent work |
| High FID | Heavy event handlers | Debounce/throttle; move work off main thread |
| A11y < 95 | Missing ARIA, low contrast | Add `aria-label`, fix color tokens, verify focus management |

Use Chrome DevTools MCP workflow above to diagnose, then apply targeted fixes.
