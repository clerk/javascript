import { forwardRef } from 'react';

import { Icon } from '../customizables';
import { ExclamationCircle } from '../icons';
import type { FormTextProps } from './FormSuccessText';
import { applyVariants } from './FormSuccessText';
import { Text } from './Text';

export const FormWarningText = forwardRef<HTMLElement, FormTextProps>((props, ref) => {
  const { children, ...rest } = props;

  return (
    <Text
      ref={ref}
      colorScheme='secondary'
      {...rest}
      css={applyVariants(props) as any}
    >
      <Icon
        colorScheme={'warning'}
        icon={ExclamationCircle}
      />
      {children}
    </Text>
  );
});
