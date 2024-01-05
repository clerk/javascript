import type { ComponentPropsWithoutRef } from 'react';

export const H1 = (props: ComponentPropsWithoutRef<'h1'>) => (
  <h1 // eslint-disable-line jsx-a11y/heading-has-content
    className='text-xl mb-6 font-mono'
    {...props}
  />
);

export const H2 = (props: ComponentPropsWithoutRef<'h2'>) => (
  <h2 // eslint-disable-line jsx-a11y/heading-has-content
    className='text-l mb-4 font-mono'
    {...props}
  />
);

export const H3 = (props: ComponentPropsWithoutRef<'h3'>) => (
  <h3 // eslint-disable-line jsx-a11y/heading-has-content
    className='text-m mb-3 font-mono'
    {...props}
  />
);

export const P = (props: ComponentPropsWithoutRef<'p'>) => (
  <p
    className='text-sm font-mono'
    {...props}
  />
);

export const HR = (props: ComponentPropsWithoutRef<'hr'>) => (
  <hr
    className='w-full border-foreground opacity-10'
    {...props}
  />
);
