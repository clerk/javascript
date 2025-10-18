import { useClerk } from '@clerk/shared/react';
import type { WaitlistModalProps } from '@clerk/shared/types';

import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useWaitlistContext, WaitlistContext } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { Route, VIRTUAL_ROUTER_BASE_PATH } from '../../router';
import { WaitlistForm } from './WaitlistForm';

const _Waitlist = () => {
  const clerk = useClerk();
  const ctx = useWaitlistContext();
  const { signInUrl } = ctx;

  const initialValues = ctx.initialValues || {};

  const formState = {
    emailAddress: useFormControl('emailAddress', initialValues.emailAddress || '', {
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
      <WaitlistContext.Provider value={{ ...waitlistProps, componentName: 'Waitlist', mode: 'modal' }}>
        <div>
          <Waitlist />
        </div>
      </WaitlistContext.Provider>
    </Route>
  );
};
