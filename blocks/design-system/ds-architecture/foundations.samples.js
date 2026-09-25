import { h } from '@dropins/tools/preact.js';
import htm from 'htm';
import { ColorSample } from '../../../design-system/foundations/color/color.sample.js';
import { TypographySample } from '../../../design-system/foundations/typography/typography.sample.js';
import { ShapeSample } from '../../../design-system/foundations/shape/shape.sample.js';
import { LayoutSample } from '../../../design-system/foundations/layout/layout.sample.js';
import { MotionSample } from '../../../design-system/foundations/motion/motion.sample.js';

const html = htm.bind(h);

export const FoundationsSamples = () => html`
  <div>
    <${ColorSample} />
    <${TypographySample} />
    <${ShapeSample} />
    <${LayoutSample} />
    <${MotionSample} />
  </div>
`;

export default FoundationsSamples;
