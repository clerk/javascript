import { cx } from 'cva';
import * as React from 'react';

import { useLocalizations } from '~/hooks/use-localizations';

import { PasswordField } from './password-field';

export function AutoFillPasswordField() {
  const { t } = useLocalizations();
  const [isAutoFilled, setIsAutoFilled] = React.useState(false);
  const fieldRef = React.useRef<HTMLDivElement>(null);

  const handleAutofill = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value && !isAutoFilled) {
      setIsAutoFilled(true);
    }
  };

  React.useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.setAttribute('inert', '');
    }
  }, []);

  React.useEffect(() => {
    if (fieldRef.current && isAutoFilled) {
      fieldRef.current.removeAttribute('inert');
    }
  }, [isAutoFilled]);

  return (
    <PasswordField
      label={t('formFieldLabel__password')}
      fieldRef={fieldRef}
      fieldClassName={cx(!isAutoFilled && 'absolute [clip-path:polygon(0px_0px,_0px_0px,_0px_0px,_0px_0px)]')}
      onChange={handleAutofill}
    />
  );
}
