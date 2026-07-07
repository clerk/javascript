import { inertProps } from '@clerk/shared/inert';
import React from 'react';

import { Box, Flex, Input } from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import { Close } from '../icons';
import { common, type PropsOfComponent } from '../styledSystem';
import { mergeRefs } from '../utils/mergeRefs';
import { IconButton } from './IconButton';

type InputWithIcon = PropsOfComponent<typeof Input> & {
  leftIcon?: React.ReactElement;
  /**
   * When provided, renders a clear button anchored to the trailing edge of the input. The button
   * stays mounted (fading via opacity + `inert`) to avoid layout shift, and calls `onClear` on
   * activation — the parent is responsible for resetting `value`. Keyboard activation returns focus
   * to the input.
   */
  onClear?: () => void;
  clearButtonLabel?: string;
  clearButtonElementDescriptor?: ElementDescriptor;
};

export const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIcon>((props, ref) => {
  const { leftIcon, sx, onClear, clearButtonLabel, clearButtonElementDescriptor, ...rest } = props;
  const internalRef = React.useRef<HTMLInputElement>(null);

  const hasClearButton = Boolean(onClear);
  const hasValue = rest.value != null && rest.value !== '';

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClear?.();
    // Keyboard activation produces a synthetic click with detail === 0. The button is about to go
    // inert and drop out of the tab order, so return focus to the input. A pointer click leaves
    // focus alone.
    if (event.detail === 0) {
      internalRef.current?.focus();
    }
  };

  return (
    <Flex
      center
      sx={{
        width: '100%',
        position: 'relative',
      }}
    >
      {leftIcon ? (
        <Box
          sx={theme => [
            {
              position: 'absolute',
              insetInlineStart: theme.space.$3x5,
              width: theme.sizes.$3x5,
              height: theme.sizes.$3x5,
              pointerEvents: 'none',
              display: 'grid',
              placeContent: 'center',
              '& svg': {
                position: 'absolute',
                width: '100%',
                height: '100%',
              },
            },
          ]}
        >
          {leftIcon}
        </Box>
      ) : null}
      <Input
        {...rest}
        sx={[
          theme => ({
            width: '100%',
            paddingInlineStart: theme.space.$10,
          }),
          hasClearButton
            ? theme => ({
                paddingInlineEnd: theme.space.$10,
                '::-webkit-search-cancel-button': {
                  display: 'none',
                },
              })
            : undefined,
          sx,
        ]}
        // @ts-expect-error Type mismatch between ForwardRef and RefObject due to null
        ref={hasClearButton ? mergeRefs(ref, internalRef) : ref}
      />
      {hasClearButton ? (
        <IconButton
          icon={Close}
          aria-label={clearButtonLabel ?? 'Clear'}
          variant='ghost'
          size='xs'
          onClick={handleClear}
          {...inertProps(!hasValue)}
          elementDescriptor={clearButtonElementDescriptor}
          sx={theme => ({
            ...common.inputTrailingButton(theme),
            opacity: hasValue ? 1 : 0,
            transition: `opacity ${theme.transitionDuration.$fast} ${theme.transitionTiming.$common}`,
          })}
        />
      ) : null}
    </Flex>
  );
});
