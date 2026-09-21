import React from 'react';

import type { ButtonProps } from '../button';
import { Button } from '../button';
import { Icon } from '../icon';
import { Tooltip } from '../tooltip';
import { VisuallyHidden } from '../visually-hidden';

export interface CopyButtonProps extends Omit<ButtonProps, 'children' | 'onCopy'> {
  value: string;
  label?: string;
  copiedLabel?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  resetAfter?: number;
  onCopy?: (value: string) => void | Promise<void>;
}

export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(function MosaicCopyButton(
  {
    value,
    label = 'Copy',
    copiedLabel = 'Copied',
    placement = 'top',
    resetAfter = 2000,
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
  const [copied, setCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timeout.current), []);

  const settle = () => {
    clearTimeout(timeout.current);
    setCopied(false);
  };

  const copy = async () => {
    try {
      await (onCopy ? onCopy(value) : navigator.clipboard.writeText(value));
    } catch {
      // A blocked clipboard leaves the button as it was; there is nothing to report.
      return;
    }

    setCopied(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), resetAfter);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      void copy();
    }
  };

  return (
    <Tooltip.Root
      open={copied}
      placement={placement}
      // Only the close is honoured, so hover cannot open a tooltip this button does not have.
      onOpenChange={next => {
        if (!next) {
          settle();
        }
      }}
    >
      <Tooltip.Trigger
        ref={ref}
        render={
          <Button
            type='button'
            aria-label={label}
            color={color}
            variant={variant}
            size={size}
            shape={shape}
            {...rest}
          />
        }
        onClick={handleClick}
      >
        <Icon
          name='clipboard'
          size='sm'
        />
        <VisuallyHidden render={<span role='status' />}>{copied ? copiedLabel : ''}</VisuallyHidden>
      </Tooltip.Trigger>
      <Tooltip.Popup>
        {copiedLabel}
        <Icon
          name='checkmark'
          size='sm'
          aria-hidden='true'
        />
      </Tooltip.Popup>
    </Tooltip.Root>
  );
});
