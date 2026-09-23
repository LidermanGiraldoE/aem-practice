# Sample File Template

Copy-paste skeleton for a new DS component sample (`{component-name}.sample.js`).  
Replace every `ComponentName` / `component-name` marker with the real values.

**Rules:**
- No separate CSS files — use inline styles (layout only) and Tailwind classes
- No hardcoded pixel values — use Tailwind utilities or CSS variables
- Single quotes only — never double quotes
- `.js` extension on all imports
- All cva variant values must appear in at least one sample section

---

## Full Skeleton

```javascript
import { h } from '@dropins/tools/preact.js';
import { useState } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import { ComponentName } from './component-name.js';

const html = htm.bind(h);

/**
 * ComponentNameSample — Showcase of all ComponentName variants, sizes,
 * states, and interactive patterns for Design System documentation.
 */
export const ComponentNameSample = () => {
  // State for interactive examples only — add as needed
  const [isOpen, setIsOpen] = useState(false);
  // const [selectedValue, setSelectedValue] = useState('');

  return html`
    <div style=${{
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>

      <!-- ─── Section 1: Variants ─────────────────────────────────────── -->
      <section style=${{ marginBottom: '48px' }}>
        <h2 style=${{ marginBottom: '24px' }}>Variants</h2>
        <div style=${{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <${ComponentName} variant="default">
            Default
          </${ComponentName}>

          <${ComponentName} variant="primary">
            Primary
          </${ComponentName}>

          <${ComponentName} variant="secondary">
            Secondary
          </${ComponentName}>
        </div>
      </section>

      <!-- ─── Section 2: Sizes ────────────────────────────────────────── -->
      <section style=${{ marginBottom: '48px' }}>
        <h2 style=${{ marginBottom: '24px' }}>Sizes</h2>
        <div style=${{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <${ComponentName} size="s">Small</${ComponentName}>
          <${ComponentName} size="m">Medium</${ComponentName}>
          <${ComponentName} size="l">Large</${ComponentName}>
        </div>
      </section>

      <!-- ─── Section 3: States ───────────────────────────────────────── -->
      <section style=${{ marginBottom: '48px' }}>
        <h2 style=${{ marginBottom: '24px' }}>States</h2>
        <div style=${{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <${ComponentName}>Normal</${ComponentName}>
          <${ComponentName} disabled=${true}>Disabled</${ComponentName}>
          <!-- Add other states: loading, error, selected, etc. -->
        </div>
      </section>

      <!-- ─── Section 4: Interactive Example ─────────────────────────── -->
      <!-- Remove this section if the component has no interactive state -->
      <section style=${{ marginBottom: '48px' }}>
        <h2 style=${{ marginBottom: '24px' }}>Interactive</h2>
        <div>
          <${ComponentName}
            variant="primary"
            onClick=${() => setIsOpen(!isOpen)}
          >
            Toggle: ${isOpen ? 'Open' : 'Closed'}
          </${ComponentName}>

          ${isOpen && html`
            <div style=${{
              marginTop: '16px',
              padding: '16px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
            }}>
              Content shown when open
            </div>
          `}
        </div>
      </section>

      <!-- ─── Section 5: Use Cases ─────────────────────────────────────── -->
      <section style=${{ marginBottom: '48px' }}>
        <h2 style=${{ marginBottom: '24px' }}>Use Cases</h2>
        <div style=${{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
        }}>

          <!-- Use Case 1: most common usage -->
          <${ComponentName}
            variant="primary"
            size="m"
            onClick=${() => console.log('use case 1')}
          >
            Primary Use Case
          </${ComponentName}>

          <!-- Use Case 2: with customClassName -->
          <${ComponentName}
            variant="secondary"
            customClassName="mt-2"
          >
            With customClassName
          </${ComponentName}>

        </div>
      </section>

    </div>
  `;
};

export default ComponentNameSample;
```

---

## Section Checklist

After filling the template, verify each section:

- [ ] **Variants** — All values defined in `componentNameVariants.variants.variant` are shown
- [ ] **Sizes** — All values defined in `componentNameVariants.variants.size` are shown
- [ ] **States** — Normal, disabled, and any other stateful behavior are shown
- [ ] **Interactive** — Only present if the component uses `useState`; removed otherwise
- [ ] **Use Cases** — At least 2 realistic usage examples matching design specs
- [ ] `ComponentNameSample` → renamed in export and JSDoc
- [ ] `component-name.js` import path → corrected to actual file path
- [ ] No CSS files imported
- [ ] No hardcoded color or token values (use Tailwind classes or CSS vars)
- [ ] File saved as `design-system/{type}/{component-name}/{component-name}.sample.js`
