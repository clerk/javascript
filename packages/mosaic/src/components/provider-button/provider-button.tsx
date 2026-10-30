import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { SpinDelayOptions } from '../../hooks/use-spin-delay';
import { useSpinDelay } from '../../hooks/use-spin-delay';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { truncationStyles } from '../../styles/typography.styles';
import type { ButtonProps } from '../button';
import { Button } from '../button';
import { ButtonContext } from '../button/button.context';
import { Spinner } from '../spinner';
import { buttonStyles } from './provider-button.styles';

export interface ProviderButtonProps extends Omit<ButtonProps, 'children' | 'shape'> {
  /** The provider's icon. The spinner takes its place while pending. */
  icon: React.ReactNode;
  /** The full call to action, such as `Continue with Google`. Also the button's accessible name. */
  longLabel: string;
  /** The provider's name, shown when two buttons share a row. */
  shortLabel: string;
  /** Marks the action as running: the button goes inert and announces itself busy. */
  isPending?: boolean;
  /** Accessible name for the pending indicator. The default is untranslated. */
  pendingLabel?: string;
  /** Tunes when the spinner appears and how long it stays. */
  spinDelay?: SpinDelayOptions;
}

const spinnerSizes = { xs: 'sm', sm: 'sm', md: 'md', lg: 'md' } as const;

/**
 * A button that starts sign-in with a third-party provider. While pending, a spinner replaces
 * the icon and the labels stay in place.
 *
 * @example
 * <ProviderButton
 *   icon={<GoogleIcon />}
 *   longLabel='Continue with Google'
 *   shortLabel='Google'
 *   isPending={isPending}
 * />
 */
export const ProviderButton = React.forwardRef<HTMLButtonElement, ProviderButtonProps>(function MosaicProviderButton(
  {
    icon,
    longLabel,
    shortLabel,
    isPending = false,
    pendingLabel = 'pending',
    spinDelay,
    size = 'md',
    disabled: disabledProp,
    focusableWhenDisabled = false,
    xstyle,
    ...rest
  },
  ref,
) {
  const defaults = React.useContext(ButtonContext);
  const disabled = defaults.disabled || disabledProp || false;
  const showPending = useSpinDelay(isPending || null, spinDelay) !== null;

  return (
    <Button
      ref={ref}
      type='button'
      color='neutral'
      variant='outline'
      size={size}
      fullWidth
      disabled={disabled || isPending}
      focusableWhenDisabled={focusableWhenDisabled || isPending}
      aria-label={longLabel}
      aria-busy={isPending || undefined}
      data-pending={isPending ? '' : undefined}
      xstyle={[buttonStyles.root, isPending && buttonStyles.rootPending, xstyle]}
      {...rest}
    >
      <span {...stylex.props(reset.base, buttonStyles.iconSlot)}>
        <span {...stylex.props(reset.base, buttonStyles.icon, showPending && buttonStyles.iconPending)}>{icon}</span>
        {isPending || showPending ? (
          <Spinner
            label={pendingLabel}
            size={spinnerSizes[size]}
            xstyle={[buttonStyles.spinner, !showPending && buttonStyles.spinnerHidden]}
          />
        ) : null}
      </span>
      <span
        {...mergeStyleProps(
          themeProps('provider-button-long-label'),
          stylex.props(reset.base, truncationStyles.singleLine, buttonStyles.longLabel),
        )}
      >
        {longLabel}
      </span>
      <span
        {...mergeStyleProps(
          themeProps('provider-button-short-label'),
          stylex.props(reset.base, truncationStyles.singleLine, buttonStyles.shortLabel),
        )}
      >
        {shortLabel}
      </span>
    </Button>
  );
});
