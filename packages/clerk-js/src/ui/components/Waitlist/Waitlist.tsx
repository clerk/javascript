import { useClerk } from '@clerk/shared/react';
import type { WaitlistModalProps } from '@clerk/types';

import { ComponentContext, useWaitlistContext } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { Card, withCardStateProvider } from '../../elements';
import { Route, VIRTUAL_ROUTER_BASE_PATH } from '../../router';
import { useFormControl } from '../../utils';
import { WaitlistForm } from './WaitlistForm';

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
            <Card.ActionText localizationKey={localizationKeys('waitlist.start.actionText')} />
            <Card.ActionLink
              localizationKey={localizationKeys('waitlist.start.actionLink')}
              to={clerk.buildUrlWithAuth(signInUrl)}
            />
          </Card.Action>
        </Card.Footer>
      </Card.Root>
    </Flow.Root>
  );
};

export const Waitlist = withCardStateProvider(_Waitlist);

export const WaitlistModal = (props: WaitlistModalProps): JSX.Element => {
  const waitlistProps = {
    signInUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/sign-in`,
    ...props,
    routing: 'virtual',
  };

  return (
    <Route path='waitlist'>
      <ComponentContext.Provider value={{ ...waitlistProps, componentName: 'Waitlist', mode: 'modal' }}>
        <div>
          <Waitlist />
        </div>
      </ComponentContext.Provider>
    </Route>
  );
};
