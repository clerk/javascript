import type {
  DialogClosedBy,
  DialogFocusTarget,
  DialogHandle,
  DialogProps as HeadlessDialogProps,
  DialogRole,
} from '@clerk/headless/dialog';
import { Dialog as Primitive, useDialogContext as useHeadlessDialogContext } from '@clerk/headless/dialog';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useAccessibleDescriptionWarning } from '../../hooks/useAccessibleDescriptionWarning';
import { useAccessibleNameWarning } from '../../hooks/useAccessibleNameWarning';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { Button } from '../button';
import { Icon } from '../icon';
import {
  backdropMotion,
  closeInsets,
  compactPlacements,
  popupMotion,
  sizes,
  styles,
  trackCompactPlacements,
  trackSizes,
  viewportSizes,
} from './dialog.styles';
import { acquireKeyboardInset } from './keyboard-inset';

/** Width of the dialog surface, and for `profile` its height too. */
export type DialogSize = keyof typeof sizes;

/**
 * Where the surface sits in the compact band — the dialog viewport under `48rem`. `center`
 * everywhere above it: there is no edge close enough for anchoring to mean anything at those
 * widths.
 */
export type DialogCompactPlacement = keyof typeof compactPlacements;

/**
 * The dialog surface a part is rendered inside, or `null` when there is none.
 *
 * The general answer to "am I in a dialog": a part reads it to take an id, or to adapt to the
 * surface, without branching on where it was rendered. `Card.Title` is the first consumer — it
 * takes `labelId` and so names the dialog, and carries no id at all outside one.
 *
 * Distinct from the headless `DialogContext`, which `Dialog.Root` provides. `Root` also spans the
 * trigger, so a part reading that one reports a dialog while sitting outside the popup, and would
 * claim ids that belong to the surface. This is published by the popup, which is the real boundary.
 *
 * It is also how a dialog learns about the one it renders inside: `Dialog.Popup` reads it before
 * publishing its own, and that is what decides whether two dialogs form a STACK — successive
 * cards — or a nested dialog over a `profile`. The two want opposite backdrops.
 */
export interface DialogContextValue {
  /** Id the popup points `aria-labelledby` at. The part that names the dialog takes it. */
  labelId: string;
  /** Id the popup points `aria-describedby` at. The part that describes the dialog takes it. */
  descriptionId: string;
  /** Width, and for `profile` also height, of the surface. */
  size: DialogSize;
  /**
   * The popup's ARIA role, for a surface that has to adapt to being an interruption: `Card.Header`
   * reads it and withholds its dismiss inside an `alertdialog`, where leaving without answering is
   * the one way out an alert must not offer.
   */
  role: DialogRole;
}

export const DialogContext = React.createContext<DialogContextValue | null>(null);

/**
 * In a dialog, as opposed to standalone. A surface that can be rendered either way — `Card`,
 * `Profile` — reads this to take the dialog's dismiss and its overlay treatment, without knowing
 * where it was rendered.
 */
export function isInDialog(dialog: DialogContextValue | null): dialog is DialogContextValue {
  return dialog !== null;
}

/**
 * The headless parts type their props (and the `render` callback's argument) against
 * the raw tag props, which carry the non-standard HTML `color` attribute typed
 * `string`. Re-typing them through `MosaicComponentProps` drops it, so a `render`
 * callback can spread straight into a Mosaic component whose own `color` is a narrow
 * variant union.
 */
export type DialogTriggerProps<Payload = unknown> = MosaicComponentProps<'button'> & {
  /**
   * Connects this trigger to a root rendered elsewhere in the tree. Create with
   * `Dialog.createHandle()` and pass the same handle to the `Dialog.Root`.
   */
  handle?: DialogHandle<Payload>;
  /**
   * Delivered to the root when this trigger opens it, for per-trigger content: the root's
   * children-as-function receives it as `{ payload }`.
   */
  payload?: Payload;
};
export type DialogCloseProps = MosaicComponentProps<'button'>;
export interface DialogCloseButtonProps extends MosaicComponentProps<'button'> {
  /**
   * Names the button for assistive technology. Defaults to English; pass a localized string
   * once one is available — no other change is needed when localization lands.
   */
  'aria-label'?: string;
}
export interface DialogPopupProps extends MosaicComponentProps<'div'> {
  /** Width, and for `profile` also height, of the dialog surface. @default 'card' */
  size?: DialogSize;
  /**
   * Bottom-anchors the surface in the compact band — the dialog viewport under `48rem` — and
   * slides it up as a sheet, instead of centring it. For a dialog that asks one thing and returns
   * — a confirmation, a single-field form — where the answer belongs within thumb's reach.
   * `card` only. @default 'center'
   */
  compactPlacement?: DialogCompactPlacement;
  /** Where focus moves when the dialog opens. Default: the first tabbable element inside it. */
  initialFocus?: DialogFocusTarget;
  /** Where focus returns when the dialog closes. Default: the trigger. */
  finalFocus?: DialogFocusTarget;
}

type DialogRootBaseProps<Payload> = Omit<HeadlessDialogProps<Payload>, 'role' | 'closedBy'>;

/**
 * Which gestures dismiss the dialog, in one ordered axis rather than a flag per gesture: Escape is
 * the keyboard's equivalent of an outside press, so a dialog that allows the press and refuses the
 * key is not a state worth being able to express.
 *
 * - `any` — an outside press, Escape, or a programmatic close;
 * - `escape` — Escape or a programmatic close, but not an outside press. For anything holding
 *   input, where a stray click would discard what was typed;
 * - `none` — a programmatic close only. For a flow the user has to complete or acknowledge.
 *
 * Maps to the native `<dialog closedby>` values `any` / `closerequest` / `none`.
 */
export type DialogDismissOn = 'any' | 'escape' | 'none';

/** The native `closedby` value each `dismissOn` stands for. */
const CLOSED_BY: Record<DialogDismissOn, DialogClosedBy> = {
  any: 'any',
  escape: 'closerequest',
  none: 'none',
};

/**
 * `role` decides the dismissal policy, so the prop that would contradict it is narrowed away
 * rather than checked at runtime:
 *
 * - `alertdialog` announces as an interruption rather than as a surface the user navigated to;
 * - it cannot be dismissed by an outside press. A dialog asking a question it needs an answer to
 *   must not be answerable by clicking next to it. Escape still closes, which is the keyboard's
 *   equivalent of the cancel button that is always present.
 *
 * It says nothing about the size: an alert is a `Card` like every other dialog.
 */
export type DialogRootProps<Payload = unknown> = DialogRootBaseProps<Payload> &
  (
    | {
        /** The popup's ARIA role. @default 'dialog' */
        role?: 'dialog';
        /** Which gestures dismiss the dialog. @default 'any' */
        dismissOn?: DialogDismissOn;
      }
    | {
        role: 'alertdialog';
        /** An alert dialog never dismisses on an outside press. @default 'escape' */
        dismissOn?: Exclude<DialogDismissOn, 'any'>;
      }
  );

/** Owns the open state and the decisions — role, dismissal — every part reads. */
function Root<Payload = unknown>({ role = 'dialog', dismissOn, children, ...rest }: DialogRootProps<Payload>) {
  return (
    <Primitive.Root<Payload>
      {...rest}
      role={role}
      closedBy={CLOSED_BY[dismissOn ?? (role === 'alertdialog' ? 'escape' : 'any')]}
    >
      {children}
    </Primitive.Root>
  );
}

/** Opens the dialog. Renders a `<button>`; `render` swaps in another element. */
const Trigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(function DialogTrigger(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.Trigger
      ref={ref}
      {...mergeStyleProps(stylex.props(xstyle), rest)}
    />
  );
}) as <Payload = unknown>(
  props: DialogTriggerProps<Payload> & { ref?: React.Ref<HTMLButtonElement> },
) => React.ReactElement;

/** Dismisses the dialog. Renders a `<button>`; `render` swaps in another element. */
const Close = React.forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose({ xstyle, ...rest }, ref) {
  return (
    <Primitive.Close
      ref={ref}
      {...mergeStyleProps(stylex.props(xstyle), rest)}
    />
  );
});

/**
 * Warns when the corner dismiss is rendered inside an alert dialog, where a corner X is a way out
 * without answering the question.
 */
function useCloseButtonWarning(isAlert: boolean) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !isAlert) {
      return;
    }
    console.warn(
      '[clerk] <Dialog.CloseButton> is rendered inside an alert dialog. A corner X is a way out without answering; the cancel action in the surface is the way out.',
    );
  }, [isAlert]);
}

/**
 * The corner dismiss affordance: a ghost circular button holding the close glyph, anchored to
 * the popup's top-inline-end corner.
 *
 * A part rather than a `closeButton` flag on the popup, because where it sits in the DOM decides
 * where it sits in the TAB ORDER — and rendering it first makes it the first tabbable element,
 * which is the focus every dialog opens on until `initialFocus` exists. A boolean would take that
 * choice away from the consumer.
 */
const CloseButton = React.forwardRef<HTMLButtonElement, DialogCloseButtonProps>(function DialogCloseButton(
  { 'aria-label': ariaLabel = 'Close', xstyle, ...rest },
  ref,
) {
  const surface = React.useContext(DialogContext);
  const { role } = useHeadlessDialogContext();
  const size = surface?.size ?? 'card';
  useCloseButtonWarning(role === 'alertdialog');
  return (
    <span {...stylex.props(styles.closeButton, closeInsets[size])}>
      <Primitive.Close
        ref={ref}
        aria-label={ariaLabel}
        render={props => (
          <Button
            variant='ghost'
            shape='circle'
            size='sm'
            {...props}
          />
        )}
        {...mergeStyleProps(themeProps('dialog-close-button'), stylex.props(xstyle), rest)}
      >
        <Icon name='close' />
      </Primitive.Close>
    </span>
  );
});

/**
 * The scrim behind the dialog. Owns no scroll lock or positioning — that is the viewport.
 * Rendered by `Dialog.Popup`, which is also what decides the two things it varies on.
 */
function Backdrop({ size, stacked }: { size: DialogSize; stacked: boolean }) {
  return (
    <Primitive.Backdrop
      {...mergeStyleProps(
        themeProps('dialog-backdrop'),
        // All in one `stylex.props` call so a later `backgroundColor` replaces the one in
        // `backdrop` outright — across two calls both would emit and the cascade would decide.
        stylex.props(reset.base, styles.backdrop, stacked && styles.backdropStacked, backdropMotion[size]),
      )}
    />
  );
}

/**
 * The box the popup is sized against and the query container its bands read, holding the track
 * that centres the popup and carries the inset. Two elements because a container cannot query
 * itself: the width-dependent rules have to sit one level inside the element that is the
 * container. The viewport also locks body scroll and — because the track is what owns the inset —
 * publishes the on-screen keyboard's share of the viewport for the track's bottom padding to
 * consume. See `keyboard-inset.ts`.
 */
function Viewport({
  size,
  compactPlacement,
  children,
}: {
  size: DialogSize;
  compactPlacement: DialogCompactPlacement;
  children: React.ReactNode;
}) {
  React.useEffect(() => acquireKeyboardInset(), []);
  return (
    <Primitive.Viewport
      overlay
      lockScroll
      {...mergeStyleProps(
        themeProps('dialog-viewport', { size }),
        stylex.props(reset.base, styles.viewport, viewportSizes[size]),
      )}
    >
      <div
        {...mergeStyleProps(
          themeProps('dialog-track', { size }),
          stylex.props(reset.base, styles.track, trackSizes[size], trackCompactPlacements[compactPlacement]),
        )}
      >
        {children}
      </div>
    </Primitive.Viewport>
  );
}

/**
 * Warns when a `profile` opens inside another dialog.
 *
 * A `profile` is a root-level surface: it hosts what opens over it and is never the thing that
 * opens. Inside a dialog it renders at a size that assumes it owns the viewport, over a surface it
 * was meant to replace. A `card` — a confirmation, say — is what opens over a profile, and that is
 * fine.
 */
function useNestedSizeWarning(isNestedInDialog: boolean, size: DialogSize) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !isNestedInDialog || size !== 'profile') {
      return;
    }
    console.warn(
      '[clerk] a size="profile" Dialog opened inside another Dialog. A profile is a root-level surface that hosts what opens over it; open a card instead.',
    );
  }, [isNestedInDialog, size]);
}

/**
 * Warns when a compact placement is asked of a `profile`, which ignores it.
 *
 * A profile already fills the compact band — it is the page there, not a surface over one — so
 * there is no room for it to be anchored anywhere else.
 */
function useCompactPlacementWarning(size: DialogSize, placement: DialogCompactPlacement) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' || size !== 'profile' || placement === 'center') {
      return;
    }
    console.warn(
      `[clerk] <Dialog.Popup size="profile" compactPlacement="${placement}"> — a profile fills the compact band and takes no placement. It was ignored.`,
    );
  }, [size, placement]);
}

/**
 * The dialog box: `role="dialog"` (or `alertdialog`, from the root), focus-trapped — and the whole
 * floating tree around it, which is a portal, a scrim and a centering viewport. None of those is a
 * part a consumer composes, so they stay out of the public API.
 */
const Popup = React.forwardRef<HTMLDivElement, DialogPopupProps>(function DialogPopup(
  { size = 'card', compactPlacement: compactPlacementProp = 'center', initialFocus, finalFocus, xstyle, ...rest },
  ref,
) {
  // The dialog this one renders inside, read before this popup publishes its own.
  const host = React.useContext(DialogContext);
  // The headless flag, not the stack check below — the size rule is about opening a dialog inside
  // ANY dialog, which is broader than the card-on-card case the stacking styles cover.
  const { role, isStacked: isNestedInDialog, labelId, descriptionId } = useHeadlessDialogContext();
  const isAlert = role === 'alertdialog';
  // A profile has its own compact-band treatment and takes no placement; the warning says so.
  const compactPlacement: DialogCompactPlacement = size === 'profile' ? 'center' : compactPlacementProp;
  useCompactPlacementWarning(size, compactPlacementProp);
  useNestedSizeWarning(isNestedInDialog, size);

  const surface = React.useMemo(() => ({ labelId, descriptionId, size, role }), [labelId, descriptionId, size, role]);
  // Observed through state rather than a plain ref, because the warnings have to re-run when the
  // node arrives and a ref mutation does not re-render.
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  useAccessibleNameWarning(node, 'Dialog', 'Card.Title');
  // A name alone is enough for an ordinary dialog; an alert is announced as an interruption and
  // its description is what says which decision is being asked for.
  useAccessibleDescriptionWarning(isAlert ? node : null, 'Dialog', 'Card.Description');

  const mergedRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      setNode(element);
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    },
    [ref],
  );

  const popup = (
    <DialogContext.Provider value={surface}>
      <Primitive.Popup
        ref={mergedRef}
        initialFocus={initialFocus}
        finalFocus={finalFocus}
        {...mergeStyleProps(
          themeProps('dialog-popup', { size }),
          stylex.props(
            reset.base,
            styles.popup,
            sizes[size],
            compactPlacements[compactPlacement],
            // One cell per (size, placement) that exists, selected rather than layered: StyleX
            // dedupes by PROPERTY across a `stylex.props` call, so a thin "sheet only" atom would
            // replace the centred cell's `transform` wholesale and take the desktop scale with it.
            compactPlacement === 'sheet' ? popupMotion.cardSheet : popupMotion[size],
            xstyle,
          ),
          rest,
        )}
        // After the spread on purpose: `mergeProps` lets consumer props win, so a `role` passed
        // here would otherwise downgrade the alert back to a plain dialog.
        {...(isAlert ? { role: 'alertdialog' } : null)}
      />
    </DialogContext.Provider>
  );

  return (
    <Primitive.Portal>
      <Backdrop
        size={size}
        // A card stacked on a card paints no scrim of its own — one serves the whole stack.
        // Decided here rather than keyed on `data-stacked`, because whether this is a stack
        // depends on the size of the dialog beneath, which the headless layer has no notion of.
        stacked={isNestedInDialog && host?.size === 'card'}
      />
      <Viewport
        size={size}
        compactPlacement={compactPlacement}
      >
        {popup}
      </Viewport>
    </Primitive.Portal>
  );
});

/**
 * Mosaic `Dialog` — a modal surface built on the `@clerk/headless` dialog primitive, composed
 * via dot syntax:
 *
 * ```tsx
 * <Dialog.Root>
 *   <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
 *   <Dialog.Popup>
 *     <Card.Root elevation='overlay'>
 *       <Card.Header>
 *         <Card.Title>…</Card.Title>
 *         <Card.Description>…</Card.Description>
 *       </Card.Header>
 *     </Card.Root>
 *   </Dialog.Popup>
 * </Dialog.Root>
 * ```
 *
 * The dialog brings the geometry, the motion and the floating tree; the SURFACE comes from what
 * is rendered inside it — a `Card` for a `card`, a `Profile` for a `profile`. Those surfaces read
 * `DialogContext`, so `Card.Title` names the dialog and `Card.Header` carries its dismiss without
 * either knowing it is in one.
 *
 * `Dialog.Popup` renders the portal, the scrim and the centering viewport itself, so those are
 * not parts. `role='alertdialog'` on the root makes it an alert dialog — one that interrupts to
 * ask for a decision and waits for one. `compactPlacement='sheet'` bottom-anchors it in the
 * compact band, and `dismissOn` on the root says which gestures dismiss it.
 *
 * Each styled part spreads `themeProps` + `stylex.props` through `mergeStyleProps`, so it
 * carries the public `.cl-<slot>` class and StyleX atoms while the headless part keeps its focus
 * management, scroll lock, and ARIA wiring.
 */
export const Dialog = {
  Root,
  Trigger,
  Popup,
  Close,
  CloseButton,
  /** Creates a handle linking detached `Dialog.Trigger`s to a `Dialog.Root` anywhere in the tree. */
  createHandle: Primitive.createHandle,
};
