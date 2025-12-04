import React from 'react';

export const Span = React.forwardRef<
  HTMLSpanElement,
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
>((props, ref) => {
  return (
    <span
      {...props}
      ref={ref}
    />
  );
});
