import { cx } from 'cva';
import * as React from 'react';

import { ClerkLogo } from './clerk-logo';

export const Root = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Root(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      {...props}
      className={cx(
        'bg-gray-2 border-gray-a6 shadow-gray-a5 relative w-96 overflow-hidden rounded-xl border bg-clip-padding shadow-xl',
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
      className={cx(
        'bg-gray-surface shadow-gray-a3 border-gray-a6 relative -mx-px -mt-px flex flex-col gap-8 rounded-[inherit] border px-10 py-8 shadow-sm',
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
      className={cx('flex flex-col gap-1 text-center', className)}
    >
      {children}
    </div>
  );
});

export const Logo = React.forwardRef(function Logo(
  {
    className,
    href,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    href?: string;
  },
  forwardedRef: React.ForwardedRef<HTMLImageElement>,
) {
  const img = (
    <img
      crossOrigin='anonymous'
      ref={forwardedRef}
      {...props}
      className={cx('max-h-24 max-w-24 object-contain', className)}
    />
  );
  return <div className='mb-4 flex justify-center'>{href ? <a href={href}>{img}</a> : img}</div>;
});

export const Title = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function Title(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <h2
      ref={forwardedRef}
      {...props}
      className={cx('leading-medium text-gray-12 text-lg font-bold', className)}
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
        className={cx('text-gray-a11 text-base', className)}
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
      className={cx('flex flex-col gap-6 rounded-lg', className)}
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
      className={cx('grid', className)}
    >
      {children}
      <div className='grid place-content-center px-6 py-4'>
        <p className='text-gray-a11 inline-flex items-center gap-x-1 text-sm'>
          Secured by{' '}
          <a
            aria-label='Clerk logo'
            href='https://www.clerk.com?utm_source=clerk&amp;utm_medium=components'
            target='_blank'
            rel='noopener'
          >
            <ClerkLogo />
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
        className={cx('border-gray-a6 border-b px-6 py-4', className)}
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
        className={cx('text-gray-a11 text-center text-base', className)}
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
        className={cx('text-accent-a10 text-base font-medium hover:underline', className)}
      >
        {children}
      </a>
    );
  },
);
