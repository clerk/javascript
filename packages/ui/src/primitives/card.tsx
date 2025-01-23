import { cx } from 'cva';
import * as React from 'react';

import { useAppearance } from '~/contexts';
import { mergeDescriptors, type ParsedElementsFragment } from '~/contexts/AppearanceContext';
import type { PolymorphicForwardRefExoticComponent, PolymorphicPropsWithoutRef } from '~/types/utils';
import { applyDescriptors } from '~/utils/dva';

import { ClerkLogo } from './clerk-logo';
import { Image } from './image';

////////////////////////////////////////////////////////////////////////////////

/**
 * CardRoot
 */
const RootDefaultElement = 'div';
type RootOwnProps = {
  children?: React.ReactNode;
  banner?: React.ReactNode;
};

const cardRootLayoutStyle = {
  cardRoot: {
    className: [
      '[--card-banner-height:theme(size.4)]',
      '[--card-body-px:theme(spacing.10)]',
      '[--card-body-py:theme(spacing.8)]',
      '[--card-content-rounded-b:theme(borderRadius.lg)]',
      'relative w-full max-w-[25rem]',
    ].join(' '),
  },
};
const cardRootVisualStyle = {
  cardRoot: {
    className: 'bg-gray-2 ring-gray-a3 rounded-xl ring-1',
  },
  cardRootDefault: {
    className: 'shadow-[0px_5px_15px_0px_theme(colors.gray.a4),0px_15px_35px_-5px_theme(colors.gray.a4)]',
  },
  cardRootInner: {
    className: 'overflow-hidden rounded-[inherit]',
  },
};

export const Root: PolymorphicForwardRefExoticComponent<RootOwnProps, typeof RootDefaultElement> = React.forwardRef(
  function CardRoot<T extends React.ElementType = typeof RootDefaultElement>(
    { as, banner, children, ...props }: PolymorphicPropsWithoutRef<RootOwnProps, T>,
    forwardedRef: React.ForwardedRef<Element>,
  ) {
    const { elements } = useAppearance().parsedAppearance;
    const Element: React.ElementType = as || RootDefaultElement;
    const cardRootDescriptors = applyDescriptors(elements, 'cardRoot');
    const cardRootDefaultDescriptors = applyDescriptors(elements, 'cardRootDefault');
    return (
      <Element
        ref={forwardedRef}
        {...props}
        className={cx(
          cardRootDescriptors.className,
          banner
            ? [
                'mt-[calc(var(--card-banner-height)/2)]',
                'shadow-[0px_-1.5px_0px_0px_theme(colors.warning.DEFAULT),0px_5px_15px_0px_theme(colors.gray.a4),0px_15px_35px_-5px_theme(colors.gray.a4)]',
              ]
            : cardRootDefaultDescriptors.className,
        )}
      >
        {banner && (
          <div
            className={cx(
              'pointer-events-none absolute inset-x-0 -top-[calc(var(--card-banner-height)/2)] isolate z-[500] flex justify-center',
            )}
          >
            <p
              className={cx(
                'bg-warning pointer-events-auto inline-flex h-[--card-banner-height] items-center rounded-full px-2 text-[0.6875rem] font-medium tracking-[2%] text-white',
              )}
              {...props}
            >
              {banner}
            </p>
          </div>
        )}
        {children && <div {...mergeDescriptors(elements.cardRootInner)}>{children}</div>}
      </Element>
    );
  },
);

////////////////////////////////////////////////////////////////////////////////

/**
 * CardContent
 */
const cardContentLayoutStyle = {
  cardContent: {
    className: 'relative flex flex-col gap-8 px-[--card-body-px] py-[--card-body-py]',
  },
} satisfies ParsedElementsFragment;
const cardContentVisualStyle = {
  cardContent: {
    className: [
      'bg-gray-surface  rounded-b-[--card-content-rounded-b] rounded-t-none',
      'ring-gray-a3 shadow-[0px_0px_2px_0px_theme(colors.gray.a4),0px_1px_2px_0px_theme(colors.gray.a3)] ring-1',
    ].join(' '),
  },
} satisfies ParsedElementsFragment;

export const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardContent(
  { children, className, ...props },
  forwardedRef,
) {
  const { elements } = useAppearance().parsedAppearance;
  return (
    <div
      ref={forwardedRef}
      {...props}
      {...mergeDescriptors(elements.cardContent)}
    >
      {children}
    </div>
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * CardHeader
 */
const cardHeaderLayoutStyle = {
  cardHeader: {
    className: 'z-1 flex flex-col items-center gap-1 text-center',
  },
} satisfies ParsedElementsFragment;

// Purposefully left blank to prevent confusion.
const cardHeaderVisualStyle = {} satisfies ParsedElementsFragment;

export const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardHeader(
  { children, className, ...props },
  forwardedRef,
) {
  const { elements } = useAppearance().parsedAppearance;
  return (
    <div
      ref={forwardedRef}
      {...props}
      {...mergeDescriptors(elements.cardHeader)}
    >
      {children}
    </div>
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * CardLogo
 */
const cardLogoLayoutStyle = {
  cardLogoBox: {
    className: 'z-1 mb-5 flex h-8 justify-center',
  },
  cardLogoLink: {
    className: '-m-0.5 rounded-sm p-0.5 outline-none focus-visible:ring',
  },
  cardLogoImage: {
    className: 'size-full object-contain',
  },
} satisfies ParsedElementsFragment;

// Purposefully left blank to prevent confusion.
const cardLogoVisualStyle = {} satisfies ParsedElementsFragment;

export const Logo = React.forwardRef(function CardLogo(
  {
    href,
    src,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    href?: string;
  },
  forwardedRef: React.ForwardedRef<HTMLImageElement>,
) {
  const { elements } = useAppearance().parsedAppearance;
  if (!src) {
    return null;
  }

  const img = (
    <Image
      ref={forwardedRef}
      src={src}
      size={200}
      {...props}
      {...mergeDescriptors(elements.cardLogoImage)}
    />
  );
  return (
    <div {...mergeDescriptors(elements.cardLogoBox)}>
      {href ? (
        <a
          href={href}
          {...mergeDescriptors(elements.cardLogoLink)}
        >
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * CardTitle
 */
// Purposefully left blank to prevent confusion.
const cardTitleLayoutStyle = {} satisfies ParsedElementsFragment;
const cardTitleVisualStyle = {
  cardTitle: {
    className: 'leading-medium text-gray-12 text-lg font-bold',
  },
} satisfies ParsedElementsFragment;

export const Title = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function CardTitle(
  { children, className, ...props },
  forwardedRef,
) {
  const { elements } = useAppearance().parsedAppearance;
  return (
    <h2
      ref={forwardedRef}
      {...props}
      {...mergeDescriptors(elements.cardTitle)}
    >
      {children}
    </h2>
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * CardDescription
 */
// Purposefully left blank to prevent confusion.
const cardDescriptionLayoutStyle = {} satisfies ParsedElementsFragment;
const cardDescriptionVisualStyle = {
  cardDescription: {
    className: 'text-gray-a11 text-base',
  },
} satisfies ParsedElementsFragment;

export const Description = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardDescription({ children, className, ...props }, forwardedRef) {
    const { elements } = useAppearance().parsedAppearance;
    return (
      <p
        ref={forwardedRef}
        {...props}
        {...mergeDescriptors(elements.cardDescription)}
      >
        {children}
      </p>
    );
  },
);

////////////////////////////////////////////////////////////////////////////////

/**
 * CardBody
 */
const cardBodyLayoutStyle = {
  cardBody: {
    className: 'z-1 flex flex-col gap-6',
  },
} satisfies ParsedElementsFragment;

// Purposefully left blank to prevent confusion.
const cardBodyVisualStyle = {} satisfies ParsedElementsFragment;

export const Body = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardBody(
  { children, className, ...props },
  forwardedRef,
) {
  const { elements } = useAppearance().parsedAppearance;

  return (
    <div
      ref={forwardedRef}
      {...props}
      {...mergeDescriptors(elements.cardBody)}
    >
      {children}
    </div>
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * CardActions
 */
const cardActionsLayoutStyle = {
  cardActions: {
    className: [
      'z-1 flex flex-col gap-6',
      // Note:
      // Prevents underline interractions triggering outside of the link text
      // https://linear.app/clerk/issue/SDKI-192/#comment-ebf943b0
      '[&_[data-link]]:self-center',
    ].join(' '),
  },
} satisfies ParsedElementsFragment;

// Purposefully left blank to prevent confusion.
const cardActionsVisualStyle = {} satisfies ParsedElementsFragment;

export const Actions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardActions(
  { children, className, ...props },
  forwardedRef,
) {
  const { elements } = useAppearance().parsedAppearance;

  return (
    <div
      ref={forwardedRef}
      {...props}
      {...mergeDescriptors(elements.cardActions)}
    >
      {children}
    </div>
  );
});

////////////////////////////////////////////////////////////////////////////////

/**
 * CardFooter
 */
const cardFooterLayoutStyle = {
  cardFooter: {
    className: 'grid',
  },
  cardFooterAction: {
    className: 'px-6 py-4',
  },
} satisfies ParsedElementsFragment;
const cardFooterVisualStyle = {
  cardFooterAction: {
    className: 'border-gray-a3 border-b last-of-type:border-b-transparent',
  },
  cardFooterActionText: {
    className: 'text-gray-a11 text-center text-base',
  },
  cardFooterActionLink: {
    className:
      'text-accent-a10 text-base font-medium hover:underline rounded-sm outline-none focus-visible:ring -mx-0.5 px-0.5',
  },
  cardFooterActionButton: {
    className:
      'text-accent-a10 text-base font-medium hover:underline rounded-sm outline-none focus-visible:ring -mx-0.5 px-0.5',
  },
  cardFooterActionPageLink: {
    className: 'text-gray-a11 text-base font-medium hover:underline',
  },
} satisfies ParsedElementsFragment;

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
  const { elements } = useAppearance().parsedAppearance;
  const hasPageLinks = helpPageUrl || privacyPageUrl || termsPageUrl;
  const renderFooter = branded || hasPageLinks || children;
  const renderSubFooter = branded || hasPageLinks;
  const hasBrandingAndPageLinks = branded && hasPageLinks;

  return renderFooter ? (
    <div
      ref={forwardedRef}
      {...props}
      {...mergeDescriptors(elements.cardFooter)}
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
                rel='noopener noreferrer'
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
    const { elements } = useAppearance().parsedAppearance;
    return (
      <div
        ref={forwardedRef}
        {...props}
        {...mergeDescriptors(elements.cardFooterAction)}
      >
        {children}
      </div>
    );
  },
);

export const FooterActionText = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function CardFooterActionText({ children, className, ...props }, forwardedRef) {
    const { elements } = useAppearance().parsedAppearance;
    return (
      <p
        ref={forwardedRef}
        {...props}
        {...mergeDescriptors(elements.cardFooterActionText)}
      >
        {children}
      </p>
    );
  },
);

export const FooterActionButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function CardFooterActionButton({ children, className, type = 'button', ...props }, forwardedRef) {
    const { elements } = useAppearance().parsedAppearance;
    return (
      <button
        ref={forwardedRef}
        // eslint-disable-next-line react/button-has-type
        type={type}
        {...props}
        {...mergeDescriptors(elements.cardFooterActionButton)}
      >
        {children}
      </button>
    );
  },
);

export const FooterActionLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function CardFooterActionLink({ children, className, ...props }, forwardedRef) {
    const { elements } = useAppearance().parsedAppearance;
    return (
      <a
        ref={forwardedRef}
        {...props}
        {...mergeDescriptors(elements.cardFooterActionLink)}
      >
        {children}
      </a>
    );
  },
);

const FooterPageLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function CardFooterPageLink({ children, className, ...props }, forwardedRef) {
    const { elements } = useAppearance().parsedAppearance;
    return (
      <a
        ref={forwardedRef}
        {...props}
        target='_blank'
        rel='noopener'
        {...mergeDescriptors(elements.cardFooterActionPageLink)}
      >
        {children}
      </a>
    );
  },
);

export const layoutStyle = {
  ...cardRootLayoutStyle,
  ...cardHeaderLayoutStyle,
  ...cardContentLayoutStyle,
  ...cardTitleLayoutStyle,
  ...cardDescriptionLayoutStyle,
  ...cardBodyLayoutStyle,
  ...cardActionsLayoutStyle,
  ...cardFooterLayoutStyle,
  ...cardLogoLayoutStyle,
} satisfies ParsedElementsFragment;

export const visualStyle = {
  ...cardRootVisualStyle,
  ...cardHeaderVisualStyle,
  ...cardContentVisualStyle,
  ...cardTitleVisualStyle,
  ...cardDescriptionVisualStyle,
  ...cardBodyVisualStyle,
  ...cardActionsVisualStyle,
  ...cardFooterVisualStyle,
  ...cardLogoVisualStyle,
} satisfies ParsedElementsFragment;
