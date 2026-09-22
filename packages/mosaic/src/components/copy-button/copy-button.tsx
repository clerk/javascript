import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { ToastSide } from '../../primitives/toast';
import { Toast } from '../../primitives/toast';
import { mergeStyleProps, themeProps } from '../../props';
import type { ButtonProps } from '../button';
import { Button } from '../button';
import { Icon } from '../icon';
import { styles } from './copy-button.styles';

/** Matches the gap the tooltip keeps from its trigger. */
const SIDE_OFFSET = 4;

export interface CopyButtonProps extends Omit<ButtonProps, 'children' | 'onCopy'> {
  /** Text written to the clipboard. */
  value: string;
  /** Names the button, and the region its confirmation is announced from. @default 'Copy' */
  label?: string;
  /** Shown and announced once the value is on the clipboard. @default 'Copied' */
  copiedLabel?: string;
  /** Which side of the button the confirmation sits on. @default 'top' */
  side?: ToastSide;
  /** How long the confirmation holds, in milliseconds. @default 2000 */
  resetAfter?: number;
  /** Replaces the clipboard write, e.g. to copy something richer than text. */
  onCopy?: (value: string) => void | Promise<void>;
}

/**
 * Puts a value on the clipboard and confirms it in a toast anchored to the button. A toast rather
 * than a tooltip because the confirmation is an event, not a description of the control: it
 * announces itself, `F6` reaches it, `Escape` dismisses it, and the button keeps its own name.
 *
 * @example
 * <CopyButton value={organization.slug} />
 *
 * @example
 * // Named for what it copies, in a row that holds more than one
 * <CopyButton value={apiKey} label='Copy API key' />
 */
export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(function MosaicCopyButton(
  { resetAfter = 2000, ...rest },
  ref,
) {
  return (
    <Toast.Provider
      timeout={resetAfter}
      limit={1}
    >
      <CopyButtonTrigger
        ref={ref}
        {...rest}
      />
    </Toast.Provider>
  );
});

const CopyButtonTrigger = React.forwardRef<HTMLButtonElement, Omit<CopyButtonProps, 'resetAfter'>>(
  function CopyButtonTrigger(
    {
      value,
      label = 'Copy',
      copiedLabel = 'Copied',
      side = 'top',
      onCopy,
      color = 'neutral',
      variant = 'ghost',
      size = 'xs',
      shape = 'square',
      onClick,
      ...rest
    },
    ref,
  ) {
    const manager = Toast.useToastManager();

    const copy = async (anchor: HTMLElement) => {
      try {
        await (onCopy ? onCopy(value) : navigator.clipboard.writeText(value));
      } catch {
        // A blocked clipboard leaves the button as it was; there is nothing to report.
        return;
      }
      manager.add({
        title: copiedLabel,
        positionerProps: { anchor, side, sideOffset: SIDE_OFFSET },
      });
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        void copy(event.currentTarget);
      }
    };

    return (
      <>
        <Button
          ref={ref}
          type='button'
          aria-label={label}
          color={color}
          variant={variant}
          size={size}
          shape={shape}
          onClick={handleClick}
          {...rest}
        >
          <Icon
            name='clipboard'
            size='sm'
          />
        </Button>
        <Toast.Portal>
          <Toast.Viewport aria-label={label}>
            {manager.toasts.map(toast => (
              <Toast.Positioner
                key={toast.id}
                toast={toast}
              >
                <Toast.Root
                  toast={toast}
                  {...mergeStyleProps(themeProps('copy-button-toast'), stylex.props(styles.toast))}
                >
                  <Toast.Title
                    {...mergeStyleProps(themeProps('copy-button-toast-title'), stylex.props(styles.title))}
                  />
                  <Icon
                    name='checkmark'
                    size='sm'
                    aria-hidden='true'
                  />
                </Toast.Root>
              </Toast.Positioner>
            ))}
          </Toast.Viewport>
        </Toast.Portal>
      </>
    );
  },
);
