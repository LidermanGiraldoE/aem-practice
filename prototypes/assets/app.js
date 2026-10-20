(() => {
  const THEME_KEY = 'aem-forge-theme';
  const root = document.documentElement;

  /* Tema claro / oscuro (misma clave que el sitio) */
  function setTheme(theme) {
    root.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch { /* almacenamiento no disponible */ }
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
      button.textContent = theme === 'dark' ? '☀' : '☾';
    });
  }

  setTheme(root.dataset.theme || 'dark');
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  });

  /* Menú móvil */
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  menuToggle?.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  /* Buscador ⌘K con índice estático */
  const PAGES = [
    { title: 'Blog', path: 'blog.html', section: 'Publicaciones' },
    { title: 'Cómo pensar un bloque antes de escribir código', path: 'blog-post.html', section: 'Artículo' },
    { title: 'Universal Editor: modelos de componentes', path: 'docs.html', section: 'Documentación' },
    { title: 'Crea tu primer bloque en Edge Delivery', path: 'guide.html', section: 'Guía' },
    { title: 'Rutas de aprendizaje', path: 'paths.html', section: 'Rutas' },
    { title: 'Ruta para desarrolladores', path: 'path-detail.html', section: 'Ruta' },
    { title: 'Content Fragments con GraphQL', path: 'docs.html#graphql', section: 'Documentación' },
    { title: 'Block options y variantes', path: 'docs.html#variantes', section: 'Documentación' },
    { title: 'Performance-first en EDS', path: 'blog.html', section: 'Publicaciones' },
  ];

  const search = document.getElementById('search');
  if (search) {
    const input = search.querySelector('.search__input');
    const results = search.querySelector('.search__results');
    const empty = search.querySelector('.search__empty');

    const renderResults = (term) => {
      const query = term.trim().toLowerCase();
      const matches = PAGES.filter((page) => !query
        || `${page.title} ${page.section}`.toLowerCase().includes(query));
      results.replaceChildren(...matches.map((page) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        const meta = document.createElement('small');
        link.href = page.path;
        link.textContent = page.title;
        meta.textContent = page.section;
        link.append(meta);
        item.append(link);
        return item;
      }));
      empty.hidden = matches.length > 0;
    };

    const openSearch = () => {
      renderResults('');
      input.value = '';
      search.showModal();
      input.focus();
    };

    document.querySelectorAll('[data-search-open]').forEach((button) => button.addEventListener('click', openSearch));
    input.addEventListener('input', () => renderResults(input.value));
    search.addEventListener('click', (event) => {
      if (event.target === search) search.close();
    });
    document.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (search.open) search.close();
        else openSearch();
      }
    });
  }

  /* Copiar bloques de código */
  document.querySelectorAll('.copy-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const code = button.closest('.code')?.querySelector('pre')?.innerText || '';
      try {
        await navigator.clipboard.writeText(code.replace(/^\$ /gm, ''));
        button.textContent = 'Copiado ✓';
      } catch {
        button.textContent = 'No disponible';
      }
      setTimeout(() => { button.textContent = 'Copiar'; }, 1600);
    });
  });

  /* Scroll spy para índices: [data-spy] contiene enlaces a #ids */
  document.querySelectorAll('[data-spy]').forEach((nav) => {
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const targets = links
      .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
      .filter(Boolean);
    if (!targets.length || !('IntersectionObserver' in window)) return;

    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      const current = targets.find((target) => visible.has(target.id));
      if (!current) return;
      links.forEach((link) => {
        if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-90px 0px -60% 0px' });
    targets.forEach((target) => observer.observe(target));
  });

  /* Barra de progreso de lectura */
  const progress = document.querySelector('.reading-progress');
  const article = document.querySelector('[data-article]');
  if (progress && article) {
    const update = () => {
      const { top, height } = article.getBoundingClientRect();
      const ratio = Math.min(Math.max(-top / (height - window.innerHeight), 0), 1);
      progress.style.transform = `scaleX(${ratio})`;
    };
    document.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* Filtros por chips + búsqueda de texto */
  document.querySelectorAll('[data-filter]').forEach((scope) => {
    const chips = [...scope.querySelectorAll('[data-filter-value]')];
    const textInput = scope.querySelector('[data-filter-search]');
    const items = [...scope.querySelectorAll('[data-tags]')];
    const empty = scope.querySelector('.empty-state');
    const count = scope.querySelector('[data-filter-count]');
    let active = 'all';

    const apply = () => {
      const term = (textInput?.value || '').trim().toLowerCase();
      let shown = 0;
      items.forEach((item) => {
        const matchesTag = active === 'all' || item.dataset.tags.split(' ').includes(active);
        const matchesText = !term || item.textContent.toLowerCase().includes(term);
        item.hidden = !(matchesTag && matchesText);
        if (!item.hidden) shown += 1;
      });
      if (empty) empty.hidden = shown > 0;
      if (count) count.textContent = `${shown} ${shown === 1 ? 'resultado' : 'resultados'}`;
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        active = chip.dataset.filterValue;
        chips.forEach((other) => other.setAttribute('aria-pressed', String(other === chip)));
        apply();
      });
    });
    textInput?.addEventListener('input', apply);
    apply();
  });

  /* Pestañas accesibles */
  document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const select = (tab) => {
      tabs.forEach((other) => {
        const selected = other === tab;
        other.setAttribute('aria-selected', String(selected));
        other.tabIndex = selected ? 0 : -1;
        document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (event) => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
        if (!step) return;
        const next = tabs[(index + step + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });
  });

  /* Sidebar de documentación en móvil */
  const closeDocs = () => document.body.classList.remove('docs-open');
  document.querySelectorAll('[data-docs-open]').forEach((button) => {
    button.addEventListener('click', () => document.body.classList.add('docs-open'));
  });
  document.querySelectorAll('[data-docs-close]').forEach((button) => button.addEventListener('click', closeDocs));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDocs();
  });

  /* Filtro de temas en la navegación lateral */
  document.querySelectorAll('[data-nav-filter]').forEach((input) => {
    const groups = [...input.closest('aside').querySelectorAll('.side-group')];
    input.addEventListener('input', () => {
      const term = input.value.trim().toLowerCase();
      groups.forEach((group) => {
        const items = [...group.querySelectorAll('li')];
        items.forEach((item) => {
          item.hidden = Boolean(term) && !item.textContent.toLowerCase().includes(term);
        });
        group.hidden = items.every((item) => item.hidden);
        if (term) group.open = true;
      });
    });
  });

  /* ¿Te sirvió esta página? */
  document.querySelectorAll('[data-feedback]').forEach((box) => {
    box.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const message = document.createElement('p');
        message.setAttribute('role', 'status');
        message.textContent = button.dataset.answer === 'yes'
          ? '¡Gracias! Nos alegra que te haya servido.'
          : 'Gracias. Usaremos tu respuesta para mejorar esta página.';
        box.replaceChildren(message);
      });
    });
  });

  /* Guía: marcar pasos como completados (persistente) */
  const guide = document.querySelector('[data-guide]');
  if (guide) {
    const storageKey = `guide:${guide.dataset.guide}`;
    const steps = [...guide.querySelectorAll('.step')];
    const bar = document.querySelector('[data-guide-bar]');
    const label = document.querySelector('[data-guide-label]');
    const doneCard = document.querySelector('.done-card');
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch { /* estado inválido */ }

    const render = () => {
      const done = steps.filter((step) => step.querySelector('[data-step-check]').checked);
      steps.forEach((step) => {
        const isDone = done.includes(step);
        step.classList.toggle('is-done', isDone);
        document.querySelector(`[data-stepper] a[href="#${step.id}"]`)?.classList.toggle('is-done', isDone);
      });
      const percent = Math.round((done.length / steps.length) * 100);
      bar?.style.setProperty('--value', `${percent}%`);
      if (label) label.textContent = `${done.length} de ${steps.length} pasos · ${percent}%`;
      if (doneCard) doneCard.hidden = done.length !== steps.length;
      try {
        localStorage.setItem(storageKey, JSON.stringify(done.map((step) => step.id)));
      } catch { /* almacenamiento no disponible */ }
    };

    steps.forEach((step) => {
      const check = step.querySelector('[data-step-check]');
      check.checked = saved.includes(step.id);
      check.addEventListener('change', render);
    });
    document.querySelector('[data-guide-reset]')?.addEventListener('click', () => {
      steps.forEach((step) => { step.querySelector('[data-step-check]').checked = false; });
      render();
    });
    render();
  }

  /* Formularios de demostración */
  document.querySelectorAll('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const note = form.querySelector('.form-note');
      if (note) note.textContent = '¡Listo! Revisa tu correo para confirmar la suscripción.';
      form.reset();
    });
  });
})();
