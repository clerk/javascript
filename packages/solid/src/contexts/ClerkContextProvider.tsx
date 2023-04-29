import type { ClientResource, InitialState, Resources } from '@clerk/types';
import type { Accessor, ParentComponent } from 'solid-js';
import { createEffect, createSignal, on, onCleanup, onMount } from 'solid-js';

import IsomorphicClerk from '../isomorphicClerk';
import type { IsomorphicClerkOptions } from '../types';
import { deriveState } from '../utils/deriveState';
import { AuthContext } from './AuthContext';
import { ClientContext } from './ClientContext';
import { IsomorphicClerkContext } from './IsomorphicClerkContext';
import { OrganizationContext } from './OrganizationContext';
import { SessionContext } from './SessionContext';
import { UserContext } from './UserContext';

type ClerkContextProvider = {
  isomorphicClerkOptions: IsomorphicClerkOptions;
  initialState: InitialState | undefined;
};

export type ClerkContextProviderState = Resources;

export const ClerkContextProvider: ParentComponent<ClerkContextProvider> = props => {
  const { isomorphicClerkOptions, initialState } = props;
  const thisClerk = createLoadedIsomorphicClerk(isomorphicClerkOptions);

  const [state, setState] = createSignal<ClerkContextProviderState>({
    client: thisClerk.isomorphicClerk().client as ClientResource,
    session: thisClerk.isomorphicClerk().session,
    user: thisClerk.isomorphicClerk().user,
    organization: thisClerk.isomorphicClerk().organization,
    lastOrganizationInvitation: null,
    lastOrganizationMember: null,
  });

  createEffect(() => {
    const unsub = thisClerk.isomorphicClerk().addListener(e => setState({ ...e }));
    if (typeof unsub === 'function') {
      onCleanup(unsub);
    }
  });

  const derivedState = () => deriveState(thisClerk.loaded(), state(), initialState);
  const clerkCtx = () => ({
    clerkLoaded: thisClerk.loaded(),
    value: thisClerk.isomorphicClerk(),
  });

  const clientCtx = () => ({
    value: state().client,
  });

  const authCtx = () => {
    return { value: derivedState() };
  };

  const userCtx = () => ({ value: state().user });
  const sessionCtx = () => ({ value: state().session });
  const organizationCtx = () => ({
    value: {
      organization: state().organization,
      lastOrganizationInvitation: state().lastOrganizationInvitation,
      lastOrganizationMember: state().lastOrganizationMember,
    },
  });

  return (
    // @ts-expect-error its fine
    <IsomorphicClerkContext.Provider value={clerkCtx}>
      <ClientContext.Provider value={clientCtx}>
        <SessionContext.Provider value={sessionCtx}>
          <OrganizationContext.Provider value={organizationCtx}>
            <AuthContext.Provider value={authCtx}>
              <UserContext.Provider value={userCtx}>{props.children}</UserContext.Provider>
            </AuthContext.Provider>
          </OrganizationContext.Provider>
        </SessionContext.Provider>
      </ClientContext.Provider>
    </IsomorphicClerkContext.Provider>
  );
};

const createLoadedIsomorphicClerk = (_options: IsomorphicClerkOptions | Accessor<IsomorphicClerkOptions>) => {
  const [loaded, setLoaded] = createSignal(false);
  const options = () => (typeof _options === 'function' ? _options() : _options);
  const isomorphicClerk = () => IsomorphicClerk.getOrCreateInstance(options());

  createEffect(
    on(
      () => options().appearance,
      () => {
        isomorphicClerk().__unstable__updateProps({ appearance: options().appearance });
      },
    ),
  );

  createEffect(
    on(
      () => options().localization,
      () => {
        isomorphicClerk().__unstable__updateProps({ options: options() });
      },
    ),
  );

  onMount(() => {
    isomorphicClerk().addOnLoaded(() => setLoaded(true));
  });

  return { isomorphicClerk, loaded };
};
