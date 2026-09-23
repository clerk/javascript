import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { ToastSide } from '../../primitives/toast';
import { Toast } from '../../primitives/toast';
import { mergeStyleProps, themeProps } from '../../props';
import type { ButtonProps } from '../button';
import { Button } from '../button';
import { Icon } from '../icon';
import { styles } from './copy-button.styles';

const SIDE_OFFSET = 4;

export interface CopyButtonProps extends Omit<ButtonProps, 'children' | 'onCopy'> {
  value: string;
  label?: string;
  copiedLabel?: string;
  side?: ToastSide;
  resetAfter?: number;
  onCopy?: (value: string) => void | Promise<void>;
  onCopyError?: (error: unknown) => void;
}

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
      onCopyError,
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
      } catch (error) {
        // A blocked clipboard confirms nothing; the caller decides whether to say so.
        onCopyError?.(error);
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
