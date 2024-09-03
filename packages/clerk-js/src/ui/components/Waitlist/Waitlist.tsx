import { useClerk } from '@clerk/shared/react';
import type { __experimental_WaitlistModalProps } from '@clerk/types';

import { ComponentContext, useWaitlistContext } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { Card, withCardStateProvider } from '../../elements';
import type { WaitlistCtx } from '../../types';
import { useFormControl } from '../../utils';
import { WaitlistForm } from './WaitlistForm';

const FieldKeys = ['emailAddress'];

export type FieldKey = (typeof FieldKeys)[number];

export type Field = {
  disabled?: boolean;
  /**
   * Denotes if the corresponding input is required to be filled
   */
  required: boolean;
};

export type Fields = {
  [key in FieldKey]: Field | undefined;
};

const _Waitlist = () => {
  const clerk = useClerk();
  const ctx = useWaitlistContext();
  const { signInUrl } = ctx;

  const formState = {
    emailAddress: useFormControl('emailAddress', '', {
      type: 'email',
      label: localizationKeys('formFieldLabel__emailAddress'),
      placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    }),
  };

  return (
    <Flow.Root flow='waitlist'>
      <Card.Root>
        <Card.Content>
          <WaitlistForm formState={formState} />
        </Card.Content>
        <Card.Footer>
          <Card.Action elementId='waitlist'>
            <Card.ActionText localizationKey={localizationKeys('__experimental_waitlist.start.actionText')} />
            <Card.ActionLink
              localizationKey={localizationKeys('__experimental_waitlist.start.actionLink')}
              to={clerk.buildUrlWithAuth(signInUrl)}
            />
          </Card.Action>
        </Card.Footer>
      </Card.Root>
    </Flow.Root>
  );
};

export const Waitlist = withCardStateProvider(_Waitlist);

export const WaitlistModal = (props: __experimental_WaitlistModalProps): JSX.Element => {
  const waitlistProps: WaitlistCtx = {
    ...props,
    componentName: 'Waitlist',
    mode: 'modal',
  };

  return (
    <ComponentContext.Provider value={waitlistProps}>
      <div>
        <Waitlist />
      </div>
    </ComponentContext.Provider>
  );
};
