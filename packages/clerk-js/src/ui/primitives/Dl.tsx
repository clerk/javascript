import React from 'react';

export const Dl = React.forwardRef<
  HTMLDListElement,
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>
>((props, ref) => {
  return (
    <dl
      {...props}
      ref={ref}
    />
  );
});
