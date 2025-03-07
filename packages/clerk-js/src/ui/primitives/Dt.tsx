import React from 'react';

export const Dt = React.forwardRef<
  HTMLDListElement,
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>
>((props, ref) => {
  return (
    <dt
      {...props}
      ref={ref}
    />
  );
});
