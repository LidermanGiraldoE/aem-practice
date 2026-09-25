export default async function decorate(block) {
  try {
    const [{ h, render }, { DsArchitecture }] = await Promise.all([
      import('@dropins/tools/preact.js'),
      import('./ds-architecture/ds-architecture.js'),
    ]);

    render(h('div', { className: 'design-system-demo' }, h(DsArchitecture, {})), block);
  } catch (error) {
    const wrapper = document.createElement('div');
    wrapper.className = 'design-system-error';

    const title = document.createElement('h2');
    title.textContent = 'Error cargando Design System';

    const msg = document.createElement('p');
    msg.textContent = error.message;

    wrapper.append(title, msg);
    block.replaceChildren(wrapper);
  }
}
