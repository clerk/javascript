'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { X } from '../../icons/glyphs/x';
import { useFlowStepActive } from '../../primitives/flow/flow-step-context';
import { useTransition } from '../../primitives/hooks';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { hasMessage, useHeldMessage } from '../../utils/feedback';
import type { BannerRootProps } from '../banner';
import { Banner } from '../banner';
import { Branding } from '../branding';
import { Button } from '../button';
import { ButtonContext } from '../button/button.context';
import type { DialogContextValue } from '../dialog';
import { Dialog } from '../dialog';
import { DialogContext, isInDialog } from '../dialog/dialog';
import { Icon } from '../icon';
import { InputSizeContext } from '../input/input.context';
import { cardContentMarker, cardFooterMarker, cardLeadMarker } from './card.markers.stylex';
import * as slots from './card.styles';

type CardElevation = 'card' | 'flush' | 'overlay';

export type CardSize = keyof typeof slots.sizes;

export type CardAlign = keyof typeof slots.headerAlign;

export type CardVariant = keyof typeof slots.variants;

/** How `Card.Footer` and the verification blocks lay out a card's actions. */
export type CardActions = 'stacked' | 'end' | 'fill';

const DEFAULT_ELEVATION: CardElevation = 'card';

// The enclosing card and the dialog it was rendered in. Context crosses portals, so a card in a
// dialog opened from inside another card is still the dialog's outermost one.
const CardContext = React.createContext<{
  elevation: CardElevation;
  align: CardAlign;
  actions: CardActions;
  dialog: DialogContextValue | null;
} | null>(null);

function defaultActions(variant: CardVariant, size: CardSize, inDialog: boolean): CardActions {
  if (variant === 'prominent') {
    return 'stacked';
  }
  return inDialog && size === 'lg' ? 'end' : 'fill';
}

/** The layout the enclosing card gives its actions, or `fill` outside a card. */
export function useCardActions(): CardActions {
  return React.useContext(CardContext)?.actions ?? 'fill';
}

/** The alignment of the enclosing card, or `start` outside a card. */
export function useCardAlign(): CardAlign {
  return React.useContext(CardContext)?.align ?? 'start';
}

function CardBranding({ flush }: { flush: boolean }) {
  return (
    <div {...stylex.props(reset.base, slots.branding.base, flush && slots.branding.flush)}>
      <Branding />
    </div>
  );
}

export interface CardProps extends MosaicComponentProps<'div'> {
  /**
   * Surface treatment applied to the card. A card nested in another card takes its elevation, so a
   * card inside a flush one is flush too. @default the enclosing card's, then 'overlay' inside a
   * dialog, otherwise 'card'
   */
  elevation?: CardElevation;
  /** The card's width. `lg` is for forms that need the room, like a tag input. @default 'md' */
  size?: CardSize;
  /** Aligns the content of every `Card.Header` in the card. @default 'start' */
  align?: CardAlign;
  /**
   * `prominent` is for a card that is the whole page, such as sign-in: wider insets, a larger title,
   * and a borderless footer. @default 'default'
   */
  variant?: CardVariant;
  /**
   * How the card lays out its actions: `stacked` puts the primary first at full width with the
   * alternative under it, `end` groups them at the inline end at their natural widths, and `fill`
   * shares the row between them. In a dialog on a phone, `fill` and `end` stack with the primary on top. A card nested in
   * another card inherits its layout, unless it is prominent.
   *
   * @default 'stacked' for a prominent card, 'end' for a large card in a dialog, otherwise 'fill'
   */
  actions?: CardActions;
  /**
   * Signs the foot of the card with "Secured by Clerk". An instance that has paid the branding off
   * carries none of it, so a connected surface passes `displayConfig.branded` here.
   *
   * @default true
   */
  renderBranding?: boolean;
}

const Root = React.forwardRef<HTMLDivElement, CardProps>(function CardRoot(
  {
    elevation: elevationProp,
    size = 'md',
    align = 'start',
    variant = 'default',
    actions: actionsProp,
    renderBranding = true,
    render,
    xstyle,
    children,
    ...rest
  },
  ref,
) {
  const dialog = React.useContext(DialogContext);
  const enclosing = React.useContext(CardContext);
  const nested = enclosing !== null && enclosing.dialog === dialog;
  const elevation =
    elevationProp ?? (nested ? enclosing.elevation : isInDialog(dialog) ? 'overlay' : DEFAULT_ELEVATION);
  const isSurface = !nested && elevation !== 'flush';
  const actions =
    actionsProp ??
    (variant !== 'prominent' && nested ? enclosing.actions : defaultActions(variant, size, isInDialog(dialog)));
  const context = React.useMemo(() => ({ elevation, align, actions, dialog }), [elevation, align, actions, dialog]);
  const parentInputSize = React.useContext(InputSizeContext);
  const inputSize = variant === 'prominent' ? 'lg' : parentInputSize;
  const parentButtonDefaults = React.useContext(ButtonContext);
  const buttonDefaults = React.useMemo(
    () =>
      variant === 'prominent'
        ? { ...parentButtonDefaults, size: parentButtonDefaults.size ?? 'lg' }
        : parentButtonDefaults,
    [parentButtonDefaults, variant],
  );
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-root', { elevation, size, align, variant, actions }),
        stylex.props(
          reset.base,
          slots.root.base,
          slots.root[elevation],
          slots.sizes[size],
          isInDialog(dialog) && slots.placement.inDialog,
          slots.variants[variant],
          elevation === 'flush' && slots.flushInsets.root,
          isSurface && slots.surface.root,
          xstyle,
        ),
        rest,
      ),
      children: (
        <>
          {children}
          {renderBranding ? <CardBranding flush={elevation === 'flush'} /> : null}
        </>
      ),
    },
  });

  return (
    <CardContext.Provider value={context}>
      <InputSizeContext.Provider value={inputSize}>
        <ButtonContext.Provider value={buttonDefaults}>{element}</ButtonContext.Provider>
      </InputSizeContext.Provider>
    </CardContext.Provider>
  );
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
          color='neutral'
          variant='ghost'
          shape='circle'
          size='sm'
          {...props}
        />
      )}
    >
      <Icon glyph={X} />
    </Dialog.Close>
  );
}

const Header = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function CardHeader(
  { render, xstyle, children, ...rest },
  ref,
) {
  const align = React.useContext(CardContext)?.align ?? 'start';
  const dialog = React.useContext(DialogContext);
  const hasCloseButton = isInDialog(dialog) && dialog.showCloseButton;
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('card-header'), stylex.props(reset.base, slots.header.base, xstyle), rest),
      children: (
        <>
          {/* First in the DOM, so it is the first tabbable element and takes the dialog's opening
              focus — the same reason `Dialog.CloseButton` is a part rather than a popup flag.
              Not outside a dialog, where there is nothing to close, and not where the dialog's
              `showCloseButton` is off, which is the default for an alert dialog. */}
          {/* An alert dialog interrupts to ask for a decision, and a corner X is a way out
              without answering one. The cancel action in the footer is the way out. */}
          {hasCloseButton ? <HeaderCloseButton /> : null}
          <div
            {...mergeStyleProps(
              themeProps('card-header-content'),
              stylex.props(
                reset.base,
                slots.header.content,
                slots.headerAlign[align],
                hasCloseButton && align === 'center' && slots.header.contentBesideCloseButton,
              ),
            )}
          >
            {children}
          </div>
        </>
      ),
    },
  });
});

const Media = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function CardMedia(
  { render, xstyle, ...rest },
  ref,
) {
  const align = React.useContext(CardContext)?.align ?? 'start';
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-media'),
        stylex.props(reset.base, slots.header.media, slots.mediaAlign[align], xstyle),
        rest,
      ),
    },
  });
});

/**
 * Media above the header that stays put while the screens of a `Flow` change below it, such as a
 * logo that hands off to the signed-in user's avatar. A direct child of `Card.Root`, before the flow.
 * Each `Card.Header` in the card drops its top padding to sit under it.
 */
const Lead = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function CardLead(
  { render, xstyle, ...rest },
  ref,
) {
  const align = React.useContext(CardContext)?.align ?? 'start';
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-lead'),
        stylex.props(reset.base, slots.lead.base, slots.mediaAlign[align], cardLeadMarker, xstyle),
        rest,
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
  const stepActive = useFlowStepActive();
  return useRender({
    defaultTagName: 'h2',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('card-title'), stylex.props(reset.base, slots.header.title, xstyle), rest),
      // The popup points `aria-labelledby` at this id, so the surface outranks the caller: an id
      // that displaced it would leave the dialog with no accessible name.
      ...(dialog && stepActive && { id: dialog.labelId }),
    },
  });
});

/** Describes the card. The `aria-describedby` counterpart to {@link Title}. */
const Description = React.forwardRef<HTMLParagraphElement, MosaicComponentProps<'p'>>(function CardDescription(
  { render, xstyle, ...rest },
  ref,
) {
  const dialog = React.useContext(DialogContext);
  const stepActive = useFlowStepActive();
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
      ...(dialog && stepActive && { id: dialog.descriptionId }),
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
  { render, xstyle, children, ...rest },
  ref,
) {
  const card = React.useContext(CardContext);
  const elevation = card?.elevation ?? DEFAULT_ELEVATION;
  const actions = card?.actions ?? 'fill';
  const parentButtonDefaults = React.useContext(ButtonContext);
  const buttonDefaults = React.useMemo(
    () => ({ ...parentButtonDefaults, fullWidth: actions === 'stacked' || actions === 'fill' }),
    [parentButtonDefaults, actions],
  );
  const items = React.Children.toArray(children);
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-footer', { elevation, actions }),
        stylex.props(
          reset.base,
          slots.footer.base,
          slots.footerActions[actions],
          (actions === 'fill' || actions === 'end') &&
            isInDialog(card?.dialog ?? null) &&
            slots.footerActions.fillInDialog,
          cardFooterMarker,
          xstyle,
        ),
        rest,
      ),
      children: actions === 'stacked' ? items.reverse() : children,
    },
  });

  return <ButtonContext.Provider value={buttonDefaults}>{element}</ButtonContext.Provider>;
});

export {
  Root as CardRoot,
  Lead as CardLead,
  Header as CardHeader,
  Media as CardMedia,
  Title as CardTitle,
  Description as CardDescription,
  CardBanner,
  Content as CardContent,
  Footer as CardFooter,
};
