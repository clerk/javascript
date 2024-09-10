import { cva, cx } from 'cva';
import * as React from 'react';

import type { PolymorphicForwardRefExoticComponent, PolymorphicPropsWithoutRef } from '~/types/utils';

import { ClerkLogo } from './clerk-logo';
import { Image } from './image';

const RootDefaultElement = 'div';
type RootOwnProps = {
  children?: React.ReactNode;
  banner?: React.ReactNode;
};

export const Root: PolymorphicForwardRefExoticComponent<RootOwnProps, typeof RootDefaultElement> = React.forwardRef(
  function CardRoot<T extends React.ElementType = typeof RootDefaultElement>(
    { as, banner, children, className, ...props }: PolymorphicPropsWithoutRef<RootOwnProps, T>,
    forwardedRef: React.ForwardedRef<Element>,
  ) {
    const Element: React.ElementType = as || RootDefaultElement;
    return (
      <Element
        ref={forwardedRef}
        data-card-root=''
        {...props}
        className={cx(
          '[--card-banner-height:theme(size.4)]',
          '[--card-body-px:theme(spacing.10)]',
          '[--card-body-py:theme(spacing.8)]',
          '[--card-content-rounded-b:theme(borderRadius.lg)]',
          'bg-gray-2 ring-gray-a3 relative w-full max-w-[25rem] rounded-xl ring-1',
          banner
            ? [
                'mt-[calc(var(--card-banner-height)/2)]',
                'shadow-[0px_-1.5px_0px_0px_theme(colors.warning.DEFAULT),0px_5px_15px_0px_theme(colors.gray.a4),0px_15px_35px_-5px_theme(colors.gray.a4)]',
              ]
            : 'shadow-[0px_5px_15px_0px_theme(colors.gray.a4),0px_15px_35px_-5px_theme(colors.gray.a4)]',
          className,
        )}
      >
        {banner && (
          <div
            data-card-root-banner=''
            className={cx(
              'pointer-events-none absolute inset-x-0 -top-[calc(var(--card-banner-height)/2)] isolate z-[500] flex justify-center',
              className,
            )}
          >
            <p
              className={cx(
                'bg-warning pointer-events-auto inline-flex h-[--card-banner-height] items-center rounded-full px-2 text-[0.6875rem] font-medium tracking-[2%] text-white',
                className,
              )}
              {...props}
            >
              {banner}
            </p>
          </div>
        )}
        {children && (
          <div
            data-card-root-inner=''
            className={cx('overflow-hidden rounded-[inherit]', className)}
          >
            {children}
          </div>
        )}
      </Element>
    );
  },
);

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
        'bg-gray-surface relative flex flex-col gap-8 rounded-b-[--card-content-rounded-b] rounded-t-none px-[--card-body-px] py-[--card-body-py]',
        'ring-gray-a3 shadow-[0px_0px_2px_0px_theme(colors.gray.a4),0px_1px_2px_0px_theme(colors.gray.a3)] ring-1',
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
    src,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    href?: string;
  },
  forwardedRef: React.ForwardedRef<HTMLImageElement>,
) {
  if (!src) {
    return null;
  }

  const img = (
    <Image
      ref={forwardedRef}
      data-card-logo=''
      src={src}
      size={200}
      {...props}
      className={cx('size-full object-contain', className)}
    />
  );
  return (
    <div className='z-1 mb-5 flex h-8 justify-center'>
      {href ? (
        <a
          href={href}
          className='-m-0.5 rounded-sm p-0.5 outline-none focus-visible:ring'
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
      className={cx('pointer-events-none absolute -top-2 isolate z-[500]', className)}
    >
      <p
        ref={forwardedRef}
        className={cx('pointer-events-auto text-sm font-medium text-orange-500', className)}
        {...props}
      >
        {children}
      </p>
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
  const renderFooter = branded || hasPageLinks || children;
  const renderSubFooter = branded || hasPageLinks;
  const hasBrandingAndPageLinks = branded && hasPageLinks;

  return renderFooter ? (
    <div
      ref={forwardedRef}
      data-card-footer=''
      {...props}
      className={cx('grid', className)}
    >
      {children}

      {renderSubFooter ? (
        <div
          className={cx('flex items-center px-6 py-4', hasBrandingAndPageLinks ? 'justify-between' : 'justify-center')}
        >
          {branded ? (
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
                className='-m-0.5 inline-flex items-center rounded-sm p-0.5 outline-none focus-visible:ring'
              >
                <ClerkLogo />
              </a>
            </p>
          ) : null}

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
        className={cx('border-gray-a3 border-b px-6 py-4 last-of-type:border-b-transparent', className)}
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

const footerActionButton = cva({
  base: 'text-accent-a10 text-base font-medium hover:underline rounded-sm outline-none focus-visible:ring -mx-0.5 px-0.5',
});

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
