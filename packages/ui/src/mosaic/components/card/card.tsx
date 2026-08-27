import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { reset } from '../../utils/reset.styles';
import { Button } from '../button';
import { ClerkLogo } from '../clerk-logo';
import { Dialog, DialogContext } from '../dialog';
import { Icon } from '../icon';
import * as slots from './card.styles';

type CardElevation = 'card' | 'flush' | 'overlay';

const DEFAULT_ELEVATION: CardElevation = 'card';

const CardElevationContext = React.createContext<CardElevation>(DEFAULT_ELEVATION);

function Branding() {
  return (
    <div {...stylex.props(reset.base, slots.branding.base)}>
      <span {...stylex.props(reset.base, slots.branding.text)}>
        Secured by{' '}
        <a
          href='https://go.clerk.com/components'
          target='_blank'
          rel='noopener noreferrer'
          {...stylex.props(reset.base, slots.branding.link, focusOutline.visible)}
        >
          <ClerkLogo height={14} />
        </a>
      </span>
    </div>
  );
}

export interface CardProps extends MosaicComponentProps<'div'> {
  /** Surface treatment applied to the card. @default 'card' */
  elevation?: CardElevation;
  /**
   * Signs the foot of the card with "Secured by Clerk". An instance that has paid the branding off
   * carries none of it, so a connected surface passes `displayConfig.branded` here.
   *
   * @default true
   */
  renderBranding?: boolean;
}

const Root = React.forwardRef<HTMLDivElement, CardProps>(function CardRoot(
  { elevation = DEFAULT_ELEVATION, renderBranding = true, render, className, style, children, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-root', { elevation }),
        stylex.props(reset.base, slots.root.base, slots.root[elevation]),
        className,
        style,
      ),
      ...rest,
      children: (
        <>
          {children}
          {renderBranding ? <Branding /> : null}
        </>
      ),
    },
  });

  return <CardElevationContext.Provider value={elevation}>{element}</CardElevationContext.Provider>;
});

/**
 * Dismisses the dialog from inside the header, in flow, so the header reserves the width it takes
 * and a long title cannot run under it. `Dialog.CloseButton` stays the corner affordance, for
 * dialogs that hold no card.
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
      <Icon name='close' />
    </Dialog.Close>
  );
}

export interface CardHeaderProps extends MosaicComponentProps<'div'> {
  /**
   * Carries the dialog's dismiss affordance, for a card that is the content of a dialog. Has no
   * effect outside one, so the same card composition serves both surfaces. Pass `false` where the
   * dialog already places its own `Dialog.CloseButton`.
   *
   * @default true
   */
  renderCloseButton?: boolean;
}

const Header = React.forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { renderCloseButton = true, render, className, style, children, ...rest },
  ref,
) {
  const dialog = React.useContext(DialogContext);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('card-header'), stylex.props(reset.base, slots.header.base), className, style),
      ...rest,
      children: (
        <>
          {/* First in the DOM, so it is the first tabbable element and takes the dialog's opening
              focus — the same reason `Dialog.CloseButton` is a part rather than a popup flag. */}
          {dialog && renderCloseButton ? <HeaderCloseButton /> : null}
          <div {...mergeStyleProps(themeProps('card-header-content'), stylex.props(reset.base, slots.header.content))}>
            {children}
          </div>
        </>
      ),
    },
  });
});

/**
 * Names the card. Renders an `<h2>`, and inside a dialog takes the id the popup points
 * `aria-labelledby` at, so the card names the dialog without knowing it is in one.
 */
const Title = React.forwardRef<HTMLHeadingElement, MosaicComponentProps<'h2'>>(function CardTitle(
  { render, className, style, ...rest },
  ref,
) {
  const dialog = React.useContext(DialogContext);
  return useRender({
    defaultTagName: 'h2',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('card-title'), stylex.props(reset.base, slots.header.title), className, style),
      id: dialog?.labelId,
      ...rest,
    },
  });
});

/** Describes the card. The `aria-describedby` counterpart to {@link Title}. */
const Description = React.forwardRef<HTMLParagraphElement, MosaicComponentProps<'p'>>(function CardDescription(
  { render, className, style, ...rest },
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
        stylex.props(reset.base, slots.header.description),
        className,
        style,
      ),
      id: dialog?.descriptionId,
      ...rest,
    },
  });
});

const Content = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function CardContent(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('card-content'), stylex.props(reset.base, slots.content.base), className, style),
      ...rest,
    },
  });
});

const Footer = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function CardFooter(
  { render, className, style, ...rest },
  ref,
) {
  const elevation = React.useContext(CardElevationContext);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('card-footer', { elevation }),
        stylex.props(reset.base, slots.footer.base),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/**
 * A styled surface composed through `Card.Root`, `Card.Header`, `Card.Title`, `Card.Description`,
 * `Card.Content`, and `Card.Footer`. Every part accepts the Mosaic `render` prop and forwards its
 * ref.
 *
 * Rendered as the content of a `Dialog.Popup`, the card reads that surface from `DialogContext`:
 * the title and description take the popup's ARIA ids, and the header carries the dismiss button.
 */
export const Card = { Root, Header, Title, Description, Content, Footer };
