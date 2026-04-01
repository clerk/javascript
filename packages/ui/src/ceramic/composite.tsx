// eslint-disable-next-line no-restricted-imports
import { type Interpolation, type Theme, jsx } from '@emotion/react';
import * as React from 'react';

import { type StyleRule, style, variants } from './variants';

const compositeStyles = variants({
  base: style(() => ({
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  })),
});

export type RenderProp = React.JSX.Element | ((props: React.HTMLAttributes<HTMLElement>) => React.JSX.Element);

type SxArray = (StyleRule | undefined | null | false)[];

function renderJsx(render: RenderProp | undefined, computedProps: React.HTMLAttributes<HTMLElement>) {
  if (typeof render === 'function') {
    return render(computedProps);
  }
  if (render) {
    return jsx(render.type, { ...render.props, ...computedProps });
  }
  return jsx('div', computedProps);
}

interface CompositeProps {
  render?: RenderProp;
  sx?: StyleRule | SxArray;
}

export const Composite = React.forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & CompositeProps>(
  function Composite(props, forwardedRef) {
    const { render, sx, ...domProps } = props;
    const renderElementProps = render && typeof render !== 'function' ? render.props : {};
    const sxEntries = Array.isArray(sx) ? sx : [sx];

    const computedProps = {
      ...domProps,
      ...renderElementProps,
      ref: forwardedRef,
      css: [compositeStyles({}), ...sxEntries] as Interpolation<Theme>[],
    };

    return renderJsx(render, computedProps);
  },
);
