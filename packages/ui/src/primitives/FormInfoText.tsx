import { forwardRef } from 'react';

import type { FormTextProps } from './FormSuccessText';
import { applyVariants } from './FormSuccessText';
import { useFormField } from './hooks/useFormField';
import { Text } from './Text';

export const FormInfoText = forwardRef<HTMLElement, FormTextProps>((props, ref) => {
  const { hasError } = useFormField() || {};

  if (!hasError && !props.children) {
    return null;
  }

  return (
    <Text
      ref={ref}
      colorScheme='secondary'
      {...props}
      css={applyVariants(props)}
    />
  );
});
