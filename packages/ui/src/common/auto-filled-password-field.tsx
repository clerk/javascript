import { cx } from 'cva';
import * as React from 'react';

import { useLocalizations } from '~/hooks/use-localizations';

import { PasswordField } from './password-field';

export function AutoFillPasswordField() {
  const { t } = useLocalizations();
  const [isAutoFilled, setIsAutoFilled] = React.useState(false);

  const handleAutofill = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value && !isAutoFilled) {
      setIsAutoFilled(true);
    }
  };

  return (
    <PasswordField
      label={t('formFieldLabel__password')}
      fieldClassName={cx(!isAutoFilled && 'absolute [clip-path:polygon(0px_0px,_0px_0px,_0px_0px,_0px_0px)]')}
      tabIndex={isAutoFilled ? undefined : -1}
      onChange={handleAutofill}
    />
  );
}
