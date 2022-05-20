import React from 'react';

import { AsProp, PrimitiveProps, staticCss } from '../styledSystem';

const baseStyle = staticCss({
  boxSizing: 'border-box',
});

type BoxProps = PrimitiveProps<'div'> & AsProp;

const Box = React.forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  const { as: As = 'div', css, ...rest } = props;
  return (
    <As
      {...rest}
      css={[baseStyle, css]}
      ref={ref}
    />
  );
});

export { Box };
