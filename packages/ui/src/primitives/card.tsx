import { cva, cx } from 'cva';
import * as React from 'react';

import { ClerkLogo } from './clerk-logo';

export const Root = React.forwardRef(function CardRoot(
  { children, className, ...props }: React.HTMLAttributes<HTMLDivElement>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={forwardedRef}
      data-card-root=''
      {...props}
      className={cx(
        '[--card-body-padding:theme(spacing.10)]',
        '[--card-content-rounded-b:theme(borderRadius.lg)]',
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
      data-card-content=''
      {...props}
      className={cx(
        'bg-gray-surface shadow-gray-a3 border-gray-a6 relative -m-px flex flex-col gap-8 rounded-[inherit] rounded-b-[--card-content-rounded-b] border p-[--card-body-padding] shadow-sm',
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
      data-card-header=''
      {...props}
      className={cx('z-1 flex flex-col gap-1 text-center', className)}
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
      ref={forwardedRef}
      data-card-logo=''
      crossOrigin='anonymous'
      {...props}
      className={cx('max-h-24 max-w-24 object-contain', className)}
    />
  );
  return (
    <div className='z-1 mb-4 flex justify-center'>
      {href ? (
        <a
          href={href}
          className='outline-none focus-visible:ring'
        >
          {img}
        </a>
      ) : (
        img
      )}
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
      data-card-title=''
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
      data-card-body=''
      {...props}
      className={cx('z-1 flex flex-col gap-6', className)}
    >
      {children}
    </div>
  );
});

export const Banner = React.forwardRef(function CardBanner(
  { children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>,
  forwardedRef: React.ForwardedRef<HTMLParagraphElement>,
) {
  return (
    <div
      data-card-banner=''
      className={cx('absolute inset-0 isolate')}
    >
      <div
        className={cx(
          'pointer-events-none absolute inset-0 w-full',
          // manually nudge the radius by `1px` for a snug fit
          'rounded-b-[calc(var(--card-content-rounded-b)-1px)]',
          '[background-image:repeating-linear-gradient(-45deg,theme(colors.orange.50),theme(colors.orange.50)_6px,theme(colors.orange.100/0.75)_6px,theme(colors.orange.100/0.75)_12px)]',
          '[mask-image:linear-gradient(to_top,black,transparent_128px)]',
        )}
      />
      <div className='absolute inset-x-0 bottom-0 z-10 flex h-[--card-body-padding] w-full items-center justify-center'>
        <p
          ref={forwardedRef}
          className={cx('text-sm font-medium text-orange-500', className)}
          {...props}
        >
          {children}
        </p>
      </div>
    </div>
  );
});

export const Footer = React.forwardRef(function Footer(
  { branded = true, children, className, ...props }: { branded?: boolean } & React.HTMLAttributes<HTMLDivElement>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  return branded || children ? (
    <div
      ref={forwardedRef}
      data-card-footer=''
      {...props}
      className={cx('grid', className)}
    >
      {children}
      {branded ? (
        <div className='grid place-content-center px-6 py-4'>
          <p className='text-gray-a11 inline-flex items-center gap-x-1 text-sm font-medium'>
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
      ) : null}
    </div>
  ) : null;
});

export const FooterAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function FooterAction({ children, className, ...props }, forwardedRef) {
    return (
      <div
        ref={forwardedRef}
        data-card-footer-action=''
        {...props}
        className={cx('border-gray-a6 border-b px-6 py-4 last-of-type:border-b-transparent', className)}
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
        data-card-footer-action-text=''
        {...props}
        className={cx('text-gray-a11 text-center text-base', className)}
      >
        {children}
      </p>
    );
  },
);

const footerActionButton = cva({ base: 'text-accent-a10 text-base font-medium hover:underline' });

export const FooterActionButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function FooterActionButton({ children, className, type = 'button', ...props }, forwardedRef) {
    return (
      <button
        ref={forwardedRef}
        data-card-footer-action-button=''
        // eslint-disable-next-line react/button-has-type
        type={type}
        className={footerActionButton({ className })}
        {...props}
      >
        {children}
      </button>
    );
  },
);

export const FooterActionLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function FooterActionLink({ children, className, ...props }, forwardedRef) {
    return (
      <a
        ref={forwardedRef}
        data-card-footer-action-link=''
        {...props}
        className={footerActionButton({ className })}
      >
        {children}
      </a>
    );
  },
);
