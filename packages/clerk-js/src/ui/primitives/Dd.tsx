import React from 'react';

export const Dd = React.forwardRef<
  HTMLDListElement,
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>
>((props, ref) => {
  return (
    <dd
      {...props}
      ref={ref}
    />
  );
});
