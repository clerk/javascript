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

export const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardContent(
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

export const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardHeader(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      data-card-header=''
      {...props}
      className={cx('z-1 flex flex-col items-center gap-1 text-center', className)}
    >
      {children}
    </div>
  );
});

export const Logo = React.forwardRef(function CardLogo(
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
      className={cx('size-full object-contain', className)}
    />
  );
  return (
    <div className='z-1 mb-5 flex size-8 justify-center'>
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

export const Title = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function CardTitle(
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
  function CardDescription({ children, className, ...props }, forwardedRef) {
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

export const Body = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardBody(
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

export const Actions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardActions(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      data-card-actions=''
      {...props}
      className={cx(
        'z-1 flex flex-col gap-3',
        // Note:
        // Prevents underline interractions triggering outside of the link text
        // https://linear.app/clerk/issue/SDKI-192/#comment-ebf943b0
        '[&_[data-link]]:self-center',
        className,
      )}
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

export const Footer = React.forwardRef(function CardFooter(
  {
    branded = true,
    helpPageUrl,
    privacyPageUrl,
    termsPageUrl,
    children,
    className,
    ...props
  }: {
    branded?: boolean;
    helpPageUrl?: string;
    privacyPageUrl?: string;
    termsPageUrl?: string;
  } & React.HTMLAttributes<HTMLDivElement>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const hasPageLinks = helpPageUrl || privacyPageUrl || termsPageUrl;
  return branded || children ? (
    <div
      ref={forwardedRef}
      data-card-footer=''
      {...props}
      className={cx('grid', className)}
    >
      {children}
      {branded ? (
        <div
          className={cx(
            'flex items-center justify-center px-6 py-4',
            hasPageLinks ? 'justify-between' : 'justify-center',
          )}
        >
          <p
            // Note:
            // We don't use `items-center` here for a more optical fit
            className='text-gray-a11 inline-flex gap-2 text-sm font-medium'
          >
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

          {hasPageLinks ? (
            <div className='flex gap-2'>
              {helpPageUrl ? <FooterPageLink href={helpPageUrl}>Help</FooterPageLink> : null}
              {privacyPageUrl ? <FooterPageLink href={privacyPageUrl}>Privacy</FooterPageLink> : null}
              {termsPageUrl ? <FooterPageLink href={termsPageUrl}>Terms</FooterPageLink> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  ) : null;
});

export const FooterAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooterAction({ children, className, ...props }, forwardedRef) {
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
  function CardFooterActionText({ children, className, ...props }, forwardedRef) {
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
  function CardFooterActionButton({ children, className, type = 'button', ...props }, forwardedRef) {
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
  function CardFooterActionLink({ children, className, ...props }, forwardedRef) {
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

const FooterPageLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function CardFooterPageLink({ children, className, ...props }, forwardedRef) {
    return (
      <a
        ref={forwardedRef}
        {...props}
        target='_blank'
        rel='noopener'
        className={cx('text-gray-a11 text-sm font-medium hover:underline', className)}
      >
        {children}
      </a>
    );
  },
);
