'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';

/** Props for {@link Button}. */
export interface ButtonProps extends ComponentProps<'button'> {
  /**
   * Keeps the button in the tab order while `disabled`. A button that disables itself
   * mid-interaction — while a form submits, say — otherwise drops focus to the body and
   * the user loses their place on the page. The button is marked `aria-disabled` rather
   * than `disabled`, and stays inert to clicks and keyboard activation.
   * @default false
   */
  focusableWhenDisabled?: boolean;
  /**
   * Whether the rendered element is a native `<button>`. Set to `false` alongside a
   * `render` prop returning anything else, so the role, tab order, and Enter/Space
   * activation a `<button>` provides natively are applied instead.
   * @default true
   */
  nativeButton?: boolean;
}

function isLink(element: HTMLElement): boolean {
  return element.tagName === 'A' && element.hasAttribute('href');
}

// Propagation is stopped as well as the default action: a natively disabled control
// dispatches no mouse event at all, so an ancestor handler never sees the press either.
function suppressEvent(event: React.SyntheticEvent): void {
  event.preventDefault();
  event.stopPropagation();
}

// Only the keys that activate a button. Suppressing every key would swallow `Tab` —
// trapping focus on the button `focusableWhenDisabled` exists to keep focusable — along
// with the `Escape` and arrow keys an enclosing dialog or menu listens for.
function suppressActivationKey(event: React.KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ' ') {
    suppressEvent(event);
  }
}

/**
 * A button with the disabled behaviour a native `<button>` cannot express: staying
 * focusable while inert, and behaving like a button on elements that aren't one.
 *
 * @example
 * // Focus survives the button disabling itself while the form submits
 * <Button disabled={submitting} focusableWhenDisabled type='submit'>Save</Button>
 *
 * @example
 * // Button semantics on a link
 * <Button nativeButton={false} render={<a href='/settings' />}>Settings</Button>
 */
// `HTMLElement` rather than `HTMLButtonElement`: `nativeButton={false}` renders an anchor or
// a span, and the ref has to accept one.
export const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(props, ref) {
  const { render, disabled = false, focusableWhenDisabled = false, nativeButton = true, ...otherProps } = props;

  // The `disabled` attribute is what makes a native button inert, but it also takes the
  // button out of the tab order — the one thing `focusableWhenDisabled` exists to avoid.
  const nativelyDisabled = nativeButton && !focusableWhenDisabled;

  const defaultProps: Record<string, unknown> = nativeButton
    ? { type: 'button', disabled: nativelyDisabled ? disabled : undefined }
    : {
        role: 'button',
        // `-1` rather than dropping the attribute: an `<a href>` is tabbable on its own,
        // so omitting it would leave a disabled link in the tab order.
        tabIndex: disabled && !focusableWhenDisabled ? -1 : 0,
        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
          if (event.key === ' ') {
            // Space scrolls the page on anything that is not a native button.
            event.preventDefault();
          } else if (event.key === 'Enter' && !isLink(event.currentTarget)) {
            event.currentTarget.click();
          }
        },
        onKeyUp: (event: React.KeyboardEvent<HTMLElement>) => {
          if (event.key === ' ') {
            event.currentTarget.click();
          }
        },
      };

  if (!nativelyDisabled) {
    defaultProps['aria-disabled'] = disabled || undefined;
  }

  const merged = mergeProps<'button'>(defaultProps, otherProps);

  if (disabled) {
    // Without the `disabled` attribute the element still receives events, so they are
    // suppressed here. These overwrite rather than chain: `mergeProps` runs the consumer's
    // handler after ours, and a disabled button must not run it at all.
    merged.onClick = suppressEvent;
    merged.onKeyDown = suppressActivationKey;
    merged.onKeyUp = suppressActivationKey;
    // Keeps a pointer press from pulling focus off wherever it currently sits, matching
    // what the `disabled` attribute does.
    merged.onMouseDown = suppressEvent;
  }

  return useRender({
    defaultTagName: 'button',
    render,
    ref,
    state: { disabled },
    stateAttributesMapping: {
      disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
    },
    props: merged,
  });
});
