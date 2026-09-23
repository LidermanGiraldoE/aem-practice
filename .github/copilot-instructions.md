# fundacion Development Guidelines

Auto-generated from all feature plans.

See [AGENTS.md](../AGENTS.md) for full project conventions, structure, and the Skills workflow (`.claude/skills/`, run `.agents/discover-skills` to list them). Start block/script/CSS work with the `content-driven-development` skill.

## Active Technologies
- JavaScript ES6+ (vanilla, no transpile) — Node 18+ for tooling only + AEM Edge Delivery Services runtime (`scripts/aem.js`), Preact 10.x (vendored in `scripts/preact/`), HTM 3.x (vendored in `scripts/htm/`), Tailwind CSS v4 (build tool → `styles/tw.css`) (003-banner-highlights)
- N/A — content is authored in AEM (Universal Editor); block reads DOM rows / `data-aue-prop` attributes at decorate time (003-banner-highlights)
- N/A — content authored in AEM (Universal Editor); block reads DOM rows / `data-aue-prop` attributes at decorate time (004-banner-blog)
- N/A — content is authored in AEM (Universal Editor); block reads DOM rows and `data-aue-prop` attributes at decorate time. Card images are managed in AEM DAM and rendered via `createOptimizedPicture` from `scripts/aem.js`. (005-blog-block)

- JavaScript ES6+ (vanilla, no transpile) + AEM EDS (`aem.js`), Preact 10.x (vendored), HTM 3.x (vendored), Tailwind CSS v4 (build tool)

## Commands

npm test && npm run lint

## Code Style

JavaScript ES6+ (vanilla, no transpile): Follow standard conventions

## Recent Changes
- 004-banner-blog: Added JavaScript ES6+ (vanilla, no transpile) — Node 18+ for tooling only + AEM Edge Delivery Services runtime (`scripts/aem.js`), Preact 10.x (vendored in `scripts/preact/`), HTM 3.x (vendored in `scripts/htm/`), Tailwind CSS v4 (build tool → `styles/tw.css`)
- 005-blog-block: Added JavaScript ES6+ (vanilla, no transpile) — Node 18+ for tooling only + AEM Edge Delivery Services runtime (`scripts/aem.js`), Preact 10.x (vendored in `scripts/preact/`), HTM 3.x (vendored in `scripts/htm/`), Tailwind CSS v4 (build tool → `styles/tw.css`)
- 003-banner-highlights: Added JavaScript ES6+ (vanilla, no transpile) — Node 18+ for tooling only + AEM Edge Delivery Services runtime (`scripts/aem.js`), Preact 10.x (vendored in `scripts/preact/`), HTM 3.x (vendored in `scripts/htm/`), Tailwind CSS v4 (build tool → `styles/tw.css`)
- 002-fundacion-header-block: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
