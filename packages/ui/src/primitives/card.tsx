import cn from 'clsx';
import * as React from 'react';

import { Logo } from './logo';

export const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Root(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn(
        'bg-gray-2 rounded-xl w-96 relative overflow-hidden border border-gray-a6 shadow-xl shadow-gray-a5 bg-clip-padding',
        className,
      )}
    >
      {children}
    </div>
  );
});

export const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Content(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn(
        'bg-gray-surface -mx-px -mt-px shadow-sm shadow-gray-a3 py-8 px-10 space-y-8 relative rounded-[inherit] border border-gray-a6',
        className,
      )}
    >
      {children}
    </div>
  );
});

export const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Header(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn('text-center', className)}
    >
      {children}
    </div>
  );
});

export const Title = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function Title(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <h2
      ref={forwardedRef}
      {...props}
      className={cn('text-lg font-bold text-gray-12', className)}
    >
      {children}
    </h2>
  );
});

export const Description = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function Description({ children, className, ...props }, forwardedRef) {
    return (
      <p
        ref={forwardedRef}
        {...props}
        className={cn('text-base leading-small text-gray-a11', className)}
      >
        {children}
      </p>
    );
  },
);

export const Body = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Body(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn('rounded-lg space-y-6', className)}
    >
      {children}
    </div>
  );
});

export const Footer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Footer(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cn('grid', className)}
    >
      {children}
      <div className='py-4 px-6 border-t border-gray-a6 grid place-content-center'>
        <p className='text-base leading-small inline-flex items-center gap-x-1 text-gray-a11'>
          Secured by{' '}
          <a
            aria-label='Clerk logo'
            href='https://www.clerk.com?utm_source=clerk&amp;utm_medium=components'
            target='_blank'
            rel='noopener'
          >
            <Logo />
          </a>
        </p>
      </div>
    </div>
  );
});

export const FooterAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function FooterAction({ children, className, ...props }, forwardedRef) {
    return (
      <div
        ref={forwardedRef}
        {...props}
        className={cn('px-6 py-4', className)}
      >
        {children}
      </div>
    );
  },
);

export const FooterActionText = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function FooterActionText({ children, className, ...props }, forwardedRef) {
    return (
      <p
        ref={forwardedRef}
        {...props}
        className={cn('text-gray-a11 text-base leading-small text-center', className)}
      >
        {children}
      </p>
    );
  },
);

export const FooterActionLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function FooterActionLink({ children, className, ...props }, forwardedRef) {
    return (
      <a
        ref={forwardedRef}
        {...props}
        className={cn('text-accent-a10 text-base leading-small font-medium hover:underline', className)}
      >
        {children}
      </a>
    );
  },
);
