import type { WaitlistModalProps } from '@clerk/shared/types';

import { withCardStateProvider } from '@/ui/elements/contexts';

import { WaitlistContext } from '../../contexts';
import { Route, VIRTUAL_ROUTER_BASE_PATH } from '../../router';
import { useWaitlistController } from './waitlist.controller';
import type { WaitlistModel } from './waitlist.model';
import { useWaitlistModel } from './waitlist.model';
import { WaitlistView } from './waitlist.view';

const WaitlistContent = withCardStateProvider(({ model }: { model: WaitlistModel }) => {
  const controller = useWaitlistController(model);

  return (
    <WaitlistView
      {...controller}
      signInHref={model.signInHref}
      hasAfterJoinWaitlistUrl={model.hasAfterJoinWaitlistUrl}
    />
  );
});

export const Waitlist = () => {
  const model = useWaitlistModel();
  return (
    <WaitlistContent
      key={model.requestKey}
      model={model}
    />
  );
};

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
