import { Form } from '@/ui/elements/Form';

import { localizationKeys } from '../../customizables';
import type { useInstantPasswordRowController } from './instant-password-row.controller';

export const InstantPasswordRowView = ({
  field,
  onForgotPasswordClick,
  inputRef,
  show,
}: ReturnType<typeof useInstantPasswordRowController>) => {
  if (!field) {
    return null;
  }

  return (
    <Form.ControlRow
      elementId={field.id}
      aria-hidden={show ? undefined : true}
      sx={
        show
          ? undefined
          : {
              position: 'absolute',
              opacity: 0,
              height: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
              marginTop: '-1rem',
            }
      }
    >
      <Form.PasswordInput
        {...field.props}
        actionLabel={show ? localizationKeys('formFieldAction__forgotPassword') : undefined}
        onActionClicked={show ? onForgotPasswordClick : undefined}
        tabIndex={show ? undefined : -1}
        ref={inputRef}
      />
    </Form.ControlRow>
  );
};
