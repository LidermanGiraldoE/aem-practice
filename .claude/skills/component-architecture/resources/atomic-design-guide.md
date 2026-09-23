# Atomic Design Classification Guide

## Classification Rules

### Atom

A component is an **Atom** if it meets ALL these conditions:

- It is indivisible (cannot be split into meaningful sub-components)
- Does not compose other custom components (only native HTML elements)
- Highly reusable and without specific context
- Minimal state (hover, focus, disabled)
- Simple props (5-10 props max)

**Examples:** Button, Input, Checkbox, Radio, Label, Icon, Logo, Chip, Badge, Link, Avatar, Spinner, ProgressBar

---

### Molecule

A component is a **Molecule** if it meets these conditions:

- Composes 1-3 atoms or simple HTML elements
- Has container logic (open/close, show/hide, selection)
- More complex state (useState, useRef, useEffect)
- Renders `children` (acts as a structure/window)
- Moderate props (8-15 props)
- Callbacks for parent communication (onChange, onToggle, onClose)

**Golden Rule:**
> If it is only a basic structure (window, container) that renders `children`, it must be a **molecule**.

**Examples:** Modal, Dropdown, Accordion, Tabs, SearchBar, Card (simple), Toast, Tooltip, Popover, Dialog, Drawer

---

### Organism

A component is an **Organism** if it meets these conditions:

- Composes multiple molecules AND/OR atoms
- Multi-section layout (header, body, footer)
- Complex business logic (calculations, validations, API calls)
- Numerous props (10-20+ props)
- Multiple interconnected states
- Fixed dimensions according to specific design

**Examples:** Header, Footer, Hero, NavigationBar, ProductCard (with price, discount, chips), FormSection, Gallery, Carousel

---

## Decision Tree

```
Does the component compose other custom components?
│
├─ NO → Is it interactive?
│  ├─ YES → ATOM (Button, Input, Toggle)
│  └─ NO  → ATOM (Icon, Logo, Label, Badge)
│
└─ YES → How many child components does it use?
   │
   ├─ 1-3 simple components → Does it render children?
   │  ├─ YES → MOLECULE (Modal, Dropdown, Accordion)
   │  └─ NO  → Does it have business logic?
   │     ├─ YES → ORGANISM
   │     └─ NO  → MOLECULE
   │
   └─ 4+ components → Does it have multiple sections?
      ├─ YES → ORGANISM (Header, Footer, ProductCard)
      └─ NO  → MOLECULE (Card simple, Tabs)
```

---

## Edge Cases

| Scenario | Classification | Reasoning |
|----------|---------------|-----------|
| A form field with label + input + error | **Molecule** | Composes atoms (label, input) into a reusable unit |
| A card with just image + text | **Molecule** | Simple composition, no business logic |
| A card with image + text + price + discount + CTA | **Organism** | Multiple sections, computed data |
| A carousel of images | **Organism** | Complex layout, multiple slides, navigation logic |
| A carousel inside a Hero | Part of **Organism Hero** | Don't create a separate carousel component |
| A thumbnail gallery | **Molecule** | Simple composition, few elements |
| A toggle switch | **Atom** | Single interactive element, no composition |
| A search bar (input + icon + button) | **Molecule** | Composes 2-3 atoms |

---

## Carousel / Slider Components

When a component requires carousel/slider behavior:

1. **Always use the project's shared carousel utility** (e.g., `swiper-utils`) — never install slider libraries directly in a component
2. **Classification depends on context:**
   - Standalone image carousel → Organism
   - Thumbnail gallery → Molecule
   - Carousel inside another component → Part of that component
3. **Required DOM structure:** Follow the carousel library's expected markup (wrapper → slides container → individual slides + optional navigation/pagination)
4. **Initialization:** Use ref callbacks or lifecycle hooks to initialize on mount, always clean up on unmount

---

## Quick Reference

```
Interactive, indivisible  →  ATOM
Composes 1-3 atoms        →  MOLECULE
Renders children           →  MOLECULE
4+ components, sections   →  ORGANISM
Business logic + layout   →  ORGANISM
```
