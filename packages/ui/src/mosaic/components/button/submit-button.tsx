import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { SpinDelayOptions } from '../../hooks/useSpinDelay';
import { useSpinDelay } from '../../hooks/useSpinDelay';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../reset.styles';
import { Spinner } from '../spinner';
import type { ButtonProps } from './button';
import { Button, withTruncatableLabel } from './button';
import { styles } from './submit-button.styles';

export interface SubmitButtonProps extends ButtonProps {
  /**
   * Marks the action as running: the button goes inert, announces itself busy, and — once the
   * action outlasts a short delay — fades its label and centers a spinner over it. The label
   * stays mounted at zero opacity so the button keeps its width and the form around it does not
   * reflow while the action runs.
   */
  isPending?: boolean;
  /**
   * Accessible name for the pending indicator, announced alongside the button's own label. The
   * default is untranslated, so pass a localized string wherever the surrounding copy is.
   */
  pendingLabel?: string;
  /**
   * Tunes when the spinner appears and how long it stays. `delay` (default `300`) is how long the
   * action has to run before the spinner is drawn at all; `minDuration` (default `200`) is how
   * long it stays once drawn. Neither affects the pending state itself, which always applies
   * immediately. Set `delay: 0` for an action already known to be slow.
   */
  spinDelay?: SpinDelayOptions;
}

// The spinner scale stops at `md`, and a `lg` button's label is only one step up, so both take
// the larger ring rather than `lg` asking for one the spinner cannot render.
const spinnerSizes = { sm: 'sm', md: 'md', lg: 'md' } as const;

// Long enough that a request served from cache or a local mutation never draws a spinner, short
// enough that a press which is going to take a while doesn't sit there looking ignored. Set here
// rather than on `useSpinDelay` itself: a button is pressed and watched, so it wants a tighter
// window than a hook shared with background loads. `minDuration` has no such tension, so it takes
// the hook's default.
const DEFAULT_SPIN_DELAY = 300;

/**
 * A `Button` that submits its form, with a pending affordance. Takes every `Button` prop;
 * `type` defaults to `submit` and can still be overridden.
 *
 * While `isPending`, the button is inert but stays focusable and announced — see the
 * `isPending` prop for what that means for assistive tech.
 *
 * @example
 * <SubmitButton isPending={isSubmitting}>Save</SubmitButton>
 *
 * @example
 * // Pending state on a destructive action
 * <SubmitButton color='negative' isPending={isDeleting}>Delete</SubmitButton>
 */
export const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(function MosaicSubmitButton(
  { isPending = false, pendingLabel = 'pending', size = 'md', spinDelay, className, children, onClick, ...rest },
  ref,
) {
  const { delay = DEFAULT_SPIN_DELAY, minDuration } = spinDelay ?? {};

  // `isPending` drives the semantics, this drives the pixels. The split is deliberate: the button
  // has to go inert and start announcing the moment the action does, or a fast action gets
  // submitted twice and assistive tech misses it — but drawing a spinner that fast only produces
  // a flash, so the visual waits out the delay and then sticks around long enough to be read.
  const showPending = useSpinDelay(isPending || null, { delay, minDuration }) !== null;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isPending) {
      // `aria-disabled` is advisory — it doesn't stop the native submit — so the press is
      // cancelled here instead. The `disabled` attribute would do both, but it drops the button
      // out of the tab order mid-action, taking focus with it just as the spinner is announced.
      //
      // TODO: fold this into the headless button's `focusableWhenDisabled` once it lands
      // (clerk/javascript#9319, #9320), which owns the same behavior one layer down.
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <Button
      ref={ref}
      type='submit'
      size={size}
      aria-busy={isPending || undefined}
      aria-disabled={isPending || undefined}
      data-pending={isPending ? '' : undefined}
      onClick={handleClick}
      {...mergeStyleProps(stylex.props(styles.root, isPending && styles.rootPending), className)}
      {...rest}
    >
      <span
        {...mergeStyleProps(
          themeProps('button-content'),
          stylex.props(reset.base, styles.content, showPending && styles.contentPending),
        )}
      >
        {withTruncatableLabel(children)}
      </span>
      {isPending || showPending ? (
        <Spinner
          // The indicator has to be in the accessibility tree the moment the button goes
          // pending, so it opts out of `Spinner`'s decorative default and carries an
          // indeterminate progressbar role. It is named in its own right rather than folded
          // into the button's name: `progressbar` is a range role, so the name computation
          // takes its value — absent, since it is indeterminate — over its label, and a
          // descendant one contributes nothing to the button above it.
          role='progressbar'
          aria-hidden={undefined}
          aria-label={pendingLabel}
          size={spinnerSizes[size]}
          {...stylex.props(styles.spinner, !showPending && styles.spinnerHidden)}
        />
      ) : null}
    </Button>
  );
});
