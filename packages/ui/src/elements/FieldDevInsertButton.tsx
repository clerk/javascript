import * as React from 'react';

import { Box, Button } from '../customizables';
import { useDevMode } from '../hooks/useDevMode';
import { useFormField } from '../primitives/hooks/useFormField';
import { common } from '../styledSystem';
import type { FieldDevHintValue } from './FieldDevHint';

type FieldDevInsertButtonProps = React.PropsWithChildren<{ hint: FieldDevHintValue }>;

/**
 * Dev-only alternative to the label popover: renders the field's input with a small
 * "insert test credential" button overlaid inside it, right-aligned. The button only
 * appears while the field is focused and empty, and reserves matching padding on the
 * input so text/placeholder never runs beneath it. Renders nothing outside dev mode.
 */
export const FieldDevInsertButton = (props: FieldDevInsertButtonProps) => {
  const { showDevModeNotice } = useDevMode();
  const { value } = useFormField();
  const { action, isTestValue } = props.hint;

  const stringValue = typeof value === 'string' ? value : '';
  const hasValue = stringValue.length > 0;
  // With a predicate, keep offering the button until the value is a real test credential
  // (so it stays visible while the developer types a non-test address). Without one, fall
  // back to hiding as soon as the field has any value.
  const isTestCredential = isTestValue ? isTestValue(stringValue) : hasValue;

  const [isFocused, setIsFocused] = React.useState(false);
  const [buttonWidth, setButtonWidth] = React.useState(0);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const visible = !!action && showDevModeNotice && isFocused && !isTestCredential;

  React.useLayoutEffect(() => {
    if (visible && buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [visible, action?.label]);

  const label = action?.label;

  return (
    <Box
      onFocus={() => setIsFocused(true)}
      // Keep focused while focus moves within the field (e.g. onto the button itself),
      // so the button does not unmount out from under a click.
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocused(false);
        }
      }}
      sx={t => ({
        position: 'relative',
        ...(visible &&
          buttonWidth > 0 && {
            // Reserve room for the button (its width) plus its trailing inset and a small gap.
            '& input': { paddingInlineEnd: `calc(${buttonWidth}px + ${t.space.$2})` },
          }),
      })}
    >
      {props.children}
      {visible && (
        <Button
          ref={buttonRef}
          variant='outline'
          textVariant='buttonSmall'
          localizationKey={typeof label === 'string' ? undefined : label}
          // Prevent the mousedown from blurring the input, so it stays focused through the click.
          onMouseDown={e => e.preventDefault()}
          onClick={() => action?.onInsert()}
          sx={t => ({
            // Reuse the canonical trailing-button geometry (symmetric $1 inset, radius
            // concentric with the input's), then layer on the text-button chrome.
            ...common.inputTrailingButton(t),
            paddingBlock: 0,
            color: t.colors.$neutralAlpha600,
            backgroundColor: t.colors.$colorBackground,
            whiteSpace: 'nowrap',
            // Above the phone input's container, which sets position:relative; z-index:1
            // and would otherwise paint over the button and swallow the click.
            zIndex: 2,
          })}
        >
          {typeof label === 'string' ? label : undefined}
        </Button>
      )}
    </Box>
  );
};
