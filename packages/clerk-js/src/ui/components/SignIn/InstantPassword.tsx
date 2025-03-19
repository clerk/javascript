import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useEnvironment } from '../../../ui/contexts';
import { localizationKeys } from '../../../ui/localization';
import { useFormControl } from '../../../ui/utils';
import { Form } from '../../elements';

export const InstantPassword = () => {
  const { userSettings } = useEnvironment();

  const instantPasswordField = useFormControl(
    'password',
    '',
    {
      type: 'password',
      label: localizationKeys('formFieldLabel__password'),
      placeholder: localizationKeys('formFieldInputPlaceholder__password') as any,
    },
    'sign-in-start',
  );

  const [autofilled, setAutofilled] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const show = !!(autofilled || instantPasswordField?.value);

  // show password if it's autofilled by the browser
  useLayoutEffect(() => {
    const intervalId = setInterval(() => {
      if (ref?.current) {
        const autofilled =
          window.getComputedStyle(ref.current, ':autofill').animationName === 'onAutoFillStart' ||
          // https://github.com/facebook/react/issues/1159#issuecomment-1025423604
          !!ref.current?.matches('*:-webkit-autofill');
        if (autofilled) {
          setAutofilled(autofilled);
          clearInterval(intervalId);
        }
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    //if the field receives a value, we default to normal behaviour
    if (instantPasswordField?.value && instantPasswordField.value !== '') {
      setAutofilled(false);
    }
  }, [instantPasswordField?.value]);

  if (!userSettings.instanceIsPasswordBased) {
    return null;
  }

  return (
    <Form.ControlRow
      elementId={instantPasswordField.id}
      sx={show ? undefined : { position: 'absolute', opacity: 0, height: 0, pointerEvents: 'none', marginTop: '-1rem' }}
    >
      <Form.PasswordInput
        {...instantPasswordField.props}
        ref={ref}
        tabIndex={show ? undefined : -1}
      />
    </Form.ControlRow>
  );
};
