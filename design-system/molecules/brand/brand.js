export default function createBrand({
  mark = '',
  name = '',
  descriptor = '',
  href = '/',
}) {
  const link = document.createElement('a');
  link.className = 'ds-brand';
  link.setAttribute('href', href || '/');

  if (mark) {
    const markElement = document.createElement('span');
    markElement.className = 'ds-brand-mark';
    markElement.setAttribute('aria-hidden', 'true');
    markElement.textContent = mark;
    link.append(markElement);
  }

  if (name) {
    const nameElement = document.createElement('strong');
    nameElement.className = 'ds-brand-name';
    nameElement.textContent = name;
    link.append(nameElement);
  }

  if (descriptor) {
    const separator = document.createElement('span');
    separator.className = 'ds-brand-separator';
    separator.setAttribute('aria-hidden', 'true');
    separator.textContent = '/';

    const descriptorElement = document.createElement('span');
    descriptorElement.className = 'ds-brand-descriptor';
    descriptorElement.textContent = descriptor;
    link.append(separator, descriptorElement);
  }

  return link;
}
