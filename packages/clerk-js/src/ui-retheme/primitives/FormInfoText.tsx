import { forwardRef } from 'react';

import type { FormTextProps } from './FormSuccessText';
import { applyVariants } from './FormSuccessText';
import { useFormControl } from './hooks';
import { Text } from './Text';

export const FormInfoText = forwardRef<HTMLElement, FormTextProps>((props, ref) => {
  const { hasError, errorMessageId } = useFormControl() || {};

  if (!hasError && !props.children) {
    return null;
  }

  return (
    <Text
      ref={ref}
      variant='smallRegular'
      colorScheme='neutral'
      aria-live='polite'
      id={errorMessageId}
      {...props}
      css={applyVariants(props)}
    />
  );
});
