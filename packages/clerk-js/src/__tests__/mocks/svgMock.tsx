import React from 'react';

// A simple span component to mock SVG imports in Vitest
const SvgMock = React.forwardRef<HTMLSpanElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <span
    ref={ref}
    {...props}
  />
));

export const ReactComponent = SvgMock;
export default SvgMock;
