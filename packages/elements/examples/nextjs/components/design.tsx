import type { ComponentPropsWithoutRef } from 'react';

export const H1 = (props: ComponentPropsWithoutRef<'h1'>) => (
  <h1 // eslint-disable-line jsx-a11y/heading-has-content
    className='mb-6 text-2xl'
    {...props}
  />
);

export const H2 = (props: ComponentPropsWithoutRef<'h2'>) => (
  <h2 // eslint-disable-line jsx-a11y/heading-has-content
    className='mb-4 text-xl'
    {...props}
  />
);

export const H3 = (props: ComponentPropsWithoutRef<'h3'>) => (
  <h3 // eslint-disable-line jsx-a11y/heading-has-content
    className='mb-3 text-lg'
    {...props}
  />
);

export const P = (props: ComponentPropsWithoutRef<'p'>) => (
  <p
    className='text-base'
    {...props}
  />
);

export const HR = (props: ComponentPropsWithoutRef<'hr'>) => (
  <hr
    className='border-foreground w-full opacity-10'
    {...props}
  />
);

export function Button(props: React.ComponentProps<'button'>) {
  return (
    <button
      className='b-1 rounded-md bg-blue-950 bg-opacity-20 px-4 py-2 transition hover:bg-opacity-10 active:bg-opacity-5 dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50'
      type='button'
      {...props}
    />
  );
}
