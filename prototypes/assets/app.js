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
    { title: 'Herramientas', path: 'tools.html', section: 'Herramientas' },
    { title: 'Asistente de AEM', path: 'assistant.html', section: 'Herramientas' },
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

  /* Asistente (prototipo): respuestas de ejemplo elegidas por palabras clave, sin IA ni red */
  const CHAT_ANSWERS = [
    {
      keywords: ['campo', 'modelo', 'universal editor', 'component-models'],
      html: `<p>Agrega el campo en el modelo del bloque, dentro de <code>blocks/{nombre}/_{nombre}.json</code>, y después regenera los JSON agregados.</p>
<div class="code"><div class="code__head"><span>_hero-banner.json</span><button class="copy-btn" type="button">Copiar</button></div><pre>{
  <span class="tk-s">"component"</span>: <span class="tk-s">"text"</span>,
  <span class="tk-s">"name"</span>: <span class="tk-s">"subtitle"</span>,
  <span class="tk-s">"label"</span>: <span class="tk-s">"Subtítulo"</span>,
  <span class="tk-s">"valueType"</span>: <span class="tk-s">"string"</span>
}</pre></div>
<p>Luego ejecuta <code>npm run build:json</code> e incluye en el cambio los archivos <code>component-*.json</code> que se modifiquen. El orden de los campos define el orden de las celdas que recibe <code>decorate()</code>.</p>`,
      sources: [['Universal Editor · modelos', 'docs.html'], ['Crea tu primer bloque', 'guide.html']],
    },
    {
      keywords: ['bloque', 'block', 'decorate'],
      html: `<p>Un bloque es una carpeta en <code>blocks/</code> con su JS y su CSS. El JS exporta una función <code>decorate(block)</code> que transforma el markup que entrega AEM.</p>
<div class="code"><div class="code__head"><span>blocks/callout/callout.js</span><button class="copy-btn" type="button">Copiar</button></div><pre><span class="tk-k">export default function</span> <span class="tk-f">decorate</span>(block) {
  <span class="tk-k">const</span> [title, body] = [...block.children];
  block.classList.<span class="tk-f">add</span>(<span class="tk-s">'is-ready'</span>);
  <span class="tk-c">// maneja celdas vacías sin romper el bloque</span>
  <span class="tk-k">if</span> (!body) <span class="tk-k">return</span>;
}</pre></div>
<p>Escribe el CSS con selectores dentro de <code>.callout</code> y mobile-first. Para probarlo sin contenido publicado, crea un fixture en <code>drafts/</code>.</p>`,
      sources: [['Crea tu primer bloque', 'guide.html'], ['Cómo pensar un bloque', 'blog-post.html']],
    },
    {
      keywords: ['local', 'aem up', 'servidor', '3000', 'cli', 'levanto'],
      html: `<p>Instala las dependencias y levanta el servidor con la CLI de AEM. Sirve los archivos de tu copia de trabajo y el contenido desde la preview.</p>
<div class="code"><div class="code__head"><span>Terminal</span><button class="copy-btn" type="button">Copiar</button></div><pre><span class="tk-p">$</span> <span class="tk-cmd">npm install</span>
<span class="tk-p">$</span> <span class="tk-cmd">npx -y @adobe/aem-cli up --no-open</span>
<span class="tk-ok">✓ AEM dev server up and running: http://localhost:3000/</span></pre></div>
<p>Si ves un 404, revisa que la página exista en la rama de preview o usa un fixture de <code>drafts/</code>.</p>`,
      sources: [['Desarrollo local', 'docs.html']],
    },
    {
      keywords: ['content fragment', 'fragment', 'graphql'],
      html: `<p>Usa una <strong>consulta persistida</strong> de GraphQL y llámala desde el bloque con <code>fetch</code>. Así la respuesta se puede cachear en la CDN.</p>
<div class="code"><div class="code__head"><span>data-table.js</span><button class="copy-btn" type="button">Copiar</button></div><pre><span class="tk-k">const</span> url = <span class="tk-s">'/graphql/execute.json/proyecto/articulos'</span>;
<span class="tk-k">const</span> { data } = <span class="tk-k">await</span> (<span class="tk-k">await</span> <span class="tk-f">fetch</span>(url)).<span class="tk-f">json</span>();</pre></div>
<p>El bloque <code>data-table</code> de este proyecto sigue este patrón.</p>`,
      sources: [['Content Fragments con GraphQL', 'docs.html#graphql']],
    },
    {
      keywords: [' alt', 'collapse', 'imagen', 'image'],
      html: '<p>Es el <strong>field collapse</strong>: si un modelo tiene <code>image</code> e <code>imageAlt</code>, AEM los combina en un solo <code>&lt;picture&gt;</code> con su texto alternativo. Funciona igual con <code>Text</code>, <code>Title</code> y <code>Type</code>.</p>',
      sources: [['Universal Editor · modelos', 'docs.html']],
    },
  ];

  const CHAT_FALLBACK = {
    html: '<p>Todavía no tengo una respuesta de ejemplo para eso. En este prototipo respondo sobre <strong>bloques</strong>, <strong>modelos de Universal Editor</strong>, <strong>desarrollo local</strong>, <strong>Content Fragments</strong> y <strong>field collapse</strong>.</p>',
    sources: [['Documentación', 'docs.html']],
  };

  /*
   * Contrato: [data-chat] contiene [data-chat-log], [data-chat-welcome], [data-chat-form],
   * [data-chat-input] y [data-chat-send]. Opcionales: [data-chat-ask], [data-chat-new] y
   * el atributo data-chat-query para enviar la pregunta que llega en ?q=.
   */
  document.querySelectorAll('[data-chat]').forEach((chat) => {
    const log = chat.querySelector('[data-chat-log]');
    const welcome = chat.querySelector('[data-chat-welcome]');
    const form = chat.querySelector('[data-chat-form]');
    const input = chat.querySelector('[data-chat-input]');
    const send = chat.querySelector('[data-chat-send]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let busy = false;

    const findAnswer = (question) => {
      const text = question.toLowerCase();
      return CHAT_ANSWERS.find((answer) => answer.keywords
        .some((word) => text.includes(word))) || CHAT_FALLBACK;
    };

    const scrollToEnd = () => log.scrollTo({ top: log.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });

    const addUserMessage = (text) => {
      const message = document.createElement('div');
      const bubble = document.createElement('p');
      message.className = 'chat-msg chat-msg--user';
      bubble.className = 'chat-msg__bubble';
      bubble.textContent = text;
      message.append(bubble);
      log.append(message);
    };

    const addTyping = () => {
      const typing = document.createElement('div');
      typing.className = 'chat-msg chat-msg--bot';
      typing.innerHTML = `<span class="chat-avatar" aria-hidden="true">✦</span>
<div class="chat-msg__bubble chat-typing" aria-label="El asistente está escribiendo"><span></span><span></span><span></span></div>`;
      log.append(typing);
      return typing;
    };

    const addBotMessage = ({ html, sources }) => {
      const message = document.createElement('div');
      const links = sources.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
      message.className = 'chat-msg chat-msg--bot';
      message.innerHTML = `<span class="chat-avatar" aria-hidden="true">✦</span>
<div class="chat-msg__bubble">${html}
  <div class="chat-sources"><span>Fuentes</span>${links}</div>
  <div class="chat-feedback" role="group" aria-label="¿Te sirvió esta respuesta?">
    <button class="btn btn--ghost btn--sm" type="button" aria-pressed="false">✓ Me sirvió</button>
    <button class="btn btn--ghost btn--sm" type="button" aria-pressed="false">✕ No me sirvió</button>
  </div>
</div>`;
      log.append(message);
    };

    const ask = (question) => {
      const text = question.trim();
      if (!text || busy) return;
      busy = true;
      send.disabled = true;
      welcome.hidden = true;
      addUserMessage(text);
      const typing = addTyping();
      scrollToEnd();
      setTimeout(() => {
        typing.remove();
        addBotMessage(findAnswer(text));
        busy = false;
        send.disabled = false;
        scrollToEnd();
      }, reducedMotion ? 200 : 900);
    };

    /* la caja de texto crece con el contenido hasta un máximo */
    const resize = () => {
      input.style.height = 'auto';
      input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      ask(input.value);
      input.value = '';
      resize();
    });
    input.addEventListener('input', resize);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        form.requestSubmit();
      }
    });

    chat.querySelectorAll('[data-chat-ask]').forEach((button) => {
      button.addEventListener('click', () => ask(button.dataset.chatAsk));
    });

    /* copiar código y valorar respuestas: los mensajes se crean después de la carga */
    log.addEventListener('click', async (event) => {
      const copy = event.target.closest('.copy-btn');
      if (copy) {
        const code = copy.closest('.code')?.querySelector('pre')?.innerText || '';
        try {
          await navigator.clipboard.writeText(code.replace(/^\$ /gm, ''));
          copy.textContent = 'Copiado ✓';
        } catch {
          copy.textContent = 'No disponible';
        }
        setTimeout(() => { copy.textContent = 'Copiar'; }, 1600);
        return;
      }
      const vote = event.target.closest('.chat-feedback button');
      if (!vote) return;
      vote.parentElement.querySelectorAll('button').forEach((button) => {
        button.setAttribute('aria-pressed', String(button === vote));
      });
    });

    chat.querySelector('[data-chat-new]')?.addEventListener('click', () => {
      log.querySelectorAll('.chat-msg').forEach((message) => message.remove());
      welcome.hidden = false;
      input.focus();
    });

    if (chat.hasAttribute('data-chat-query')) {
      const initial = new URLSearchParams(window.location.search).get('q');
      if (initial) ask(initial);
    }
  });
})();
