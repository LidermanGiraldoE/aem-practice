import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import { ButtonSample } from '../../../design-system/atoms/button/button.sample.js';

const html = htm.bind(h);

export const AtomsSamples = () => html`
  <div>
    <${ButtonSample} />
  </div>
`;

export default AtomsSamples;
