import React from 'react';

import type { PropsOfComponent } from '../../styledSystem';
import { Alert } from '../Alert';
import { Collapsible } from '../Collapsible';

export const CardAlert = React.memo((props: PropsOfComponent<typeof Alert>) => {
  const hasContent = Boolean(props.children);

  return (
    <Collapsible open={hasContent}>
      <Alert
        variant='danger'
        {...props}
      />
    </Collapsible>
  );
});
