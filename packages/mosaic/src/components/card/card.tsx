import { useSafeLayoutEffect } from '@clerk/shared/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useTransition } from '../../primitives/hooks';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { hasMessage, useHeldMessage } from '../../utils/feedback';
import type { BannerRootProps } from '../banner';
import { Banner } from '../banner';
import { Branding } from '../branding';
import { Button } from '../button';
import type { DialogContextValue } from '../dialog';
import { Dialog, DialogContext, isInDialog } from '../dialog';
import { Icon } from '../icon';
import { cardContentMarker, cardFooterMarker } from './card.markers.stylex';
import * as slots from './card.styles';

type CardElevation = 'card' | 'flush' | 'overlay';

export type CardSize = keyof typeof slots.sizes;

const DEFAULT_ELEVATION: CardElevation = 'card';

// The enclosing card and the dialog it was rendered in. Context crosses portals, so a card in a
// dialog opened from inside another card is still the dialog's outermost one.
const CardContext = React.createContext<{ elevation: CardElevation; dialog: DialogContextValue | null } | null>(null);

type CardHeaderAlign = 'start' | 'center';

const CardHeaderAlignContext = React.createContext<CardHeaderAlign>('start');

function CardBranding() {
  return (
    <div {...stylex.props(reset.base, slots.branding.base)}>
      <Branding />
    </div>
  );
}

export interface CardProps extends MosaicComponentProps<'div'> {
  /** Surface treatment applied to the card. @default 'card' */
  elevation?: CardElevation;
  /** The card's width. `lg` is for forms that need the room, like a tag input. @default 'md' */
  size?: CardSize;
  /**
   * Signs the foot of the card with "Secured by Clerk". An instance that has paid the branding off
   * carries none of it, so a connected surface passes `displayConfig.branded` here.
   *
   * @default true
   */
  renderBranding?: boolean;
}

const Root = React.forwardRef<HTMLDivElement, CardProps>(function CardRoot(
  { elevation = DEFAULT_ELEVATION, size = 'md', renderBranding = true, render, xstyle, children, ...rest },
  ref,
) {
  const dialog = React.useContext(DialogContext);
  const enclosing = React.useContext(CardContext);
  const isSurface = (enclosing === null || enclosing.dialog !== dialog) && elevation !== 'flush';
  const context = React.useMemo(() => ({ elevation, dialog }), [elevation, dialog]);
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-root', { elevation, size }),
        stylex.props(
          reset.base,
          slots.root.base,
          slots.root[elevation],
          slots.sizes[size],
          isSurface && slots.surface.root,
          xstyle,
        ),
        rest,
      ),
      children: (
        <>
          {children}
          {renderBranding ? <CardBranding /> : null}
        </>
      ),
    },
  });

  return <CardContext.Provider value={context}>{element}</CardContext.Provider>;
});

/**
 * Dismisses the dialog from inside the header, in flow, so the header reserves the width it takes
 * and a long title cannot run under it. `Dialog.CloseButton` stays the corner affordance, for the
 * `Profile`, which anchors its own.
 */
function HeaderCloseButton() {
  return (
    <Dialog.Close
      aria-label='Close'
      render={props => (
        <Button
          variant='ghost'
          shape='circle'
          size='sm'
          {...props}
        />
      )}
    >
      <Icon name='x' />
    </Dialog.Close>
  );
}

/** Props for the card header, including alignment and native `div` props. */
export interface CardHeaderProps extends MosaicComponentProps<'div'> {
  /**
   * How the header's parts line up. `center` stacks the image, title, and description down the
   * middle, the shape of a sign-in or sign-up card.
   *
   * @default 'start'
   */
  align?: CardHeaderAlign;
}

const Header = React.forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { align = 'start', render, xstyle, children, ...rest },
  ref,
): React.ReactElement {
  const dialog = React.useContext(DialogContext);
  const centered = align === 'center';
  const hasCloseButton = isInDialog(dialog) && dialog.role !== 'alertdialog';
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-header', { align }),
        stylex.props(reset.base, slots.header.base, xstyle),
        rest,
      ),
      children: (
        <>
          {/* First in the DOM, so it is the first tabbable element and takes the dialog's opening
              focus — the same reason `Dialog.CloseButton` is a part rather than a popup flag.
              Not outside a dialog, where there is nothing to close, and not in an alert dialog. */}
          {/* An alert dialog interrupts to ask for a decision, and a corner X is a way out
              without answering one. The cancel action in the footer is the way out. */}
          {hasCloseButton ? <HeaderCloseButton /> : null}
          <div
            {...mergeStyleProps(
              themeProps('card-header-content'),
              stylex.props(
                reset.base,
                slots.header.content,
                centered && slots.header.centered,
                centered && hasCloseButton && slots.header.centeredWithClose,
              ),
            )}
          >
            {children}
          </div>
        </>
      ),
    },
  });

  return <CardHeaderAlignContext.Provider value={align}>{element}</CardHeaderAlignContext.Provider>;
});

/** Props for the application-logo slot and optional home link. */
export interface CardImageProps extends Omit<MosaicComponentProps<'a'>, 'children'> {
  /** The URL of the logo image. */
  src: string;
  /** Names the logo, and so the link when `href` is set. Pass the application name. */
  alt: string;
  /**
   * Makes the logo a link, to the application's home. Renders an `<a>`; pass `render` instead to
   * route through a framework link.
   */
  href?: string;
}

function imageScale(image: HTMLImageElement): number {
  const { naturalWidth, naturalHeight } = image;
  if (!naturalWidth || !naturalHeight) {
    return 1;
  }
  const ratio = naturalWidth / naturalHeight;
  if (ratio <= 1) {
    return 2;
  }
  if (ratio <= 2) {
    return 2 / ratio;
  }
  return 1;
}

/**
 * The application's logo, the first thing in a `Card.Header` of a sign-in or sign-up card. Sized
 * from the image's own proportions: a wide mark sits one line tall, a square or tall mark takes
 * two, and one in between scales to the width of a square. With `href` it is the link home.
 */
const Image = React.forwardRef<HTMLElement, CardImageProps>(function CardImage(
  { src, alt, href, render, xstyle, ...rest },
  ref,
): React.ReactElement | null {
  const [scale, setScale] = React.useState(1);
  const img = React.useRef<HTMLImageElement>(null);
  const interactive = Boolean(href || render);
  const centered = React.useContext(CardHeaderAlignContext) === 'center';

  useSafeLayoutEffect(() => {
    setScale(1);
    if (img.current?.complete) {
      setScale(imageScale(img.current));
    }
  }, [src]);

  return useRender({
    defaultTagName: href ? 'a' : 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-image', { interactive }),
        stylex.props(
          reset.base,
          slots.image.base,
          slots.image.scale(scale),
          centered && slots.image.centered,
          interactive && slots.image.interactive,
          interactive && slots.image.touchTarget,
          interactive && focusOutline.visible,
          xstyle,
        ),
        href ? { href } : undefined,
        rest,
      ),
      children: (
        <img
          ref={img}
          src={src}
          alt={alt}
          draggable={false}
          onLoad={event => setScale(imageScale(event.currentTarget))}
          {...mergeStyleProps(themeProps('card-image-img'), stylex.props(reset.base, slots.image.image))}
        />
      ),
    },
  });
});

/**
 * Names the card. Renders an `<h2>`, and inside a dialog takes the id the popup points
 * `aria-labelledby` at, so the card names the dialog without knowing it is in one.
 */
const Title = React.forwardRef<HTMLHeadingElement, MosaicComponentProps<'h2'>>(function CardTitle(
  { render, xstyle, ...rest },
  ref,
) {
  const dialog = React.useContext(DialogContext);
  return useRender({
    defaultTagName: 'h2',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('card-title'), stylex.props(reset.base, slots.header.title, xstyle), rest),
      // The popup points `aria-labelledby` at this id, so the surface outranks the caller: an id
      // that displaced it would leave the dialog with no accessible name.
      ...(dialog && { id: dialog.labelId }),
    },
  });
});

/** Describes the card. The `aria-describedby` counterpart to {@link Title}. */
const Description = React.forwardRef<HTMLParagraphElement, MosaicComponentProps<'p'>>(function CardDescription(
  { render, xstyle, ...rest },
  ref,
) {
  const dialog = React.useContext(DialogContext);
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-description'),
        stylex.props(reset.base, slots.header.description, xstyle),
        rest,
      ),
      ...(dialog && { id: dialog.descriptionId }),
    },
  });
});

export interface CardBannerProps extends MosaicComponentProps<'div'> {
  /** Semantic color of the banner. @default 'neutral' */
  color?: BannerRootProps['color'];
}

const CardBanner = React.forwardRef<HTMLDivElement, CardBannerProps>(function CardBanner(
  { color, render, xstyle, children, ...rest },
  ref,
) {
  const open = hasMessage(children);
  const element = React.useRef<HTMLElement | null>(null);
  const { mounted, transitionProps } = useTransition({ open, ref: element });
  const message = useHeldMessage(children, open);
  return useRender({
    defaultTagName: 'div',
    render,
    ref: [ref, element],
    props: {
      ...mergeStyleProps(
        themeProps('card-banner'),
        stylex.props(reset.base, slots.banner.collapse, xstyle),
        { ...transitionProps },
        rest,
      ),
      children: (
        <div {...stylex.props(reset.base, slots.banner.clip)}>
          {mounted ? (
            <Banner.Root
              color={color}
              xstyle={slots.banner.surface}
              aria-hidden={open ? undefined : true}
              {...transitionProps}
            >
              <Banner.Label>{message}</Banner.Label>
            </Banner.Root>
          ) : null}
        </div>
      ),
    },
  });
});

const Content = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function CardContent(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-content'),
        stylex.props(reset.base, slots.content.base, cardContentMarker, xstyle),
        rest,
      ),
    },
  });
});

const Footer = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function CardFooter(
  { render, xstyle, ...rest },
  ref,
) {
  const elevation = React.useContext(CardContext)?.elevation ?? DEFAULT_ELEVATION;
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-footer', { elevation }),
        stylex.props(reset.base, slots.footer.base, cardFooterMarker, xstyle),
        rest,
      ),
    },
  });
});

/**
 * A styled surface composed through `Card.Root`, `Card.Header`, `Card.Image`, `Card.Title`,
 * `Card.Description`, `Card.Banner`, `Card.Content`, and `Card.Footer`. Every part accepts the
 * Mosaic `render` prop and forwards its ref.
 *
 * `Card.Image` is the application's mark, placed first in a `Card.Header` above the title.
 *
 * `Card.Banner` is a message slot between the header and the content. It is always rendered, and
 * a `Banner` expands into it while its children hold a message, collapsing again once they are
 * empty, so the slot takes `role='alert'` and stays a live region across both.
 *
 * Rendered as the content of a `Dialog.Popup`, the card reads that surface from `DialogContext`:
 * the title and description take the popup's ARIA ids, and the header carries the dismiss button.
 */
export const Card = { Root, Header, Image, Title, Description, Banner: CardBanner, Content, Footer };
