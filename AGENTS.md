# Project instructions

This repository is an Adobe Experience Manager Edge Delivery Services site based on the AEM boilerplate with Universal Editor support. Keep changes small, author-friendly, accessible, and aligned with the hybrid vanilla JavaScript, Tailwind CSS, and Preact architecture planned for this repository.

## Skills

Reusable workflows live under `.claude/skills/`. For block, script, style, model, or other implementation work, start with `content-driven-development` and use the more specific skills it points to. Use `page-import` only for importing an external webpage into EDS content.

## Technology and structure

- Vanilla ES6+ JavaScript remains the runtime for AEM blocks.
- Tailwind CSS is used for the design-system styling layer.
- Preact is used for design-system components where component composition is needed.
- Package dependencies, vendors, and build scripts are managed separately and are not assumed to be installed by these instructions.
- HTML is authored in AEM and decorated in the browser.
- `blocks/` contains self-contained block JavaScript, CSS, and optional Universal Editor partials.
- `design-system/` contains reusable Preact components and their Tailwind styling sources.
- `models/` contains shared Universal Editor definitions, models, filters, and page/section configuration.
- `scripts/aem.js` is the shared AEM library and must not be modified unless explicitly required.
- `scripts/scripts.js` is the page decoration entry point; `scripts/delayed.js` contains deferred behavior.
- `styles/styles.css`, `styles/lazy-styles.css`, and `styles/fonts.css` contain global styles.

## Development commands

Install dependencies with `npm install`.

Run validation with:

```bash
npm run lint
npm run build:json
```

After editing a model partial under `models/` or a block partial such as `blocks/{name}/_{name}.json`, run `npm run build:json` and include the generated aggregate files in the change when they differ.

Run the local site with:

```bash
npx -y @adobe/aem-cli up --no-open --forward-browser-logs
```

The default local URL is `http://localhost:3000`.

## Implementation guidelines

- A block exports a default `decorate(block)` function and handles missing or optional authored fields gracefully.
- Keep CSS selectors scoped to the block and use mobile-first media queries at the existing project breakpoints.
- Preserve the AEM markup contract and Universal Editor model structure when changing a block.
- Use semantic HTML, accessible names, correct heading hierarchy, keyboard-accessible controls, and meaningful image alt text.
- Prefer existing helpers and conventions over new abstractions.
- Do not add secrets, install dependencies, modify vendor files, or introduce unrelated refactors unless explicitly requested.

## Content and testing

Use a `drafts/` fixture when no authored page exists, following the EDS section and block markup conventions. Validate changed behavior locally, inspect the browser console, and run linting before considering the work complete.

## Deployment references

The local server serves the working tree. Production preview and live URLs follow the repository's AEM Code Sync configuration; determine the current owner, repository, and branch with `git remote -v` and `git branch --show-current` instead of hardcoding another project's values.
