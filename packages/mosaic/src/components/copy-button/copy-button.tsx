import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Checkmark } from '../../icons/glyphs/checkmark';
import { Clipboard } from '../../icons/glyphs/clipboard';
import type { ToastSide } from '../../primitives/toast';
import { mergeStyleProps, themeProps } from '../../props';
import type { ButtonProps } from '../button';
import { Button } from '../button';
import { Icon } from '../icon';
import { Tooltip } from '../tooltip';
import { VisuallyHidden } from '../visually-hidden';
import { clearCopied, setCopied, useCopiedId } from './copy-button.store';
import { styles } from './copy-button.styles';

const SIDE_OFFSET = 5;
const TOOLTIP_DELAY = 300;

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
  {
    value,
    label = 'Copy',
    copiedLabel = 'Copied',
    side = 'top',
    resetAfter = 2000,
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
  const id = React.useId();
  const copied = useCopiedId() === id;
  const [hovered, setHovered] = React.useState(false);
  const attempt = React.useRef(0);
  const mounted = React.useRef(true);

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearCopied(id);
    };
  }, [id]);

  const copy = async () => {
    const current = ++attempt.current;
    setCopied(null);
    try {
      await (onCopy ? onCopy(value) : navigator.clipboard.writeText(value));
    } catch (error) {
      if (current === attempt.current) {
        onCopyError?.(error);
      }
      return;
    }
    if (mounted.current && current === attempt.current) {
      setCopied(id, resetAfter);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      void copy();
    }
  };

  return (
    <>
      <Tooltip.Root
        open={hovered || copied}
        onOpenChange={next => {
          setHovered(next);
          if (!next) {
            clearCopied(id);
          }
        }}
        placement={side}
        sideOffset={SIDE_OFFSET}
        delay={TOOLTIP_DELAY}
        closeDelay={TOOLTIP_DELAY}
      >
        <Tooltip.Trigger
          ref={ref}
          render={triggerProps => (
            <Button
              aria-label={label}
              color={color}
              variant={variant}
              size={size}
              shape={shape}
              {...triggerProps}
              {...rest}
              onClick={event => {
                triggerProps.onClick?.(event);
                handleClick(event);
              }}
            >
              <Icon
                glyph={Clipboard}
                size='md'
              />
            </Button>
          )}
        />
        <Tooltip.Popup>
          {copied ? (
            <span
              key='copied'
              {...mergeStyleProps(themeProps('copy-button-copied'), stylex.props(styles.content))}
            >
              {copiedLabel}
              <Icon
                glyph={Checkmark}
                size='md'
                xstyle={styles.check}
              />
            </span>
          ) : (
            <span
              key='copy'
              {...mergeStyleProps(themeProps('copy-button-label'), stylex.props(styles.content))}
            >
              {label}
            </span>
          )}
        </Tooltip.Popup>
      </Tooltip.Root>
      <VisuallyHidden role='status'>{copied ? copiedLabel : ''}</VisuallyHidden>
    </>
  );
});
