import { useClerk, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/shared/types';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useRef, useState } from 'react';

type Value = {
  acceptedInvitations: {
    invitationId: string;
    organization: OrganizationResource;
  }[];
  canUpdate?: () => boolean;
  setAcceptedInvitations: Dispatch<SetStateAction<{ invitationId: string; organization: OrganizationResource }[]>>;
};
const AcceptedInvitations = createContext<Value>({
  acceptedInvitations: [],
  setAcceptedInvitations: () => {},
});

interface InPlaceAcceptedInvitationsProps {
  children: ReactNode;
}

function AcceptedInvitationsProvider({ children }: InPlaceAcceptedInvitationsProps): JSX.Element {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  return (
    <ScopedAcceptedInvitationsProvider key={JSON.stringify([user?.id, session?.id, clerk.client?.id])}>
      {children}
    </ScopedAcceptedInvitationsProvider>
  );
}

function ScopedAcceptedInvitationsProvider({ children }: InPlaceAcceptedInvitationsProps): JSX.Element {
  const mounted = useRef(true);
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [acceptedInvitations, setAcceptedInvitations] = useState<
    {
      invitationId: string;
      organization: OrganizationResource;
    }[]
  >([]);
  return (
    <AcceptedInvitations.Provider
      value={{
        acceptedInvitations,
        canUpdate: () => mounted.current,
        setAcceptedInvitations,
      }}
    >
      {children}
    </AcceptedInvitations.Provider>
  );
}

function useAcceptedInvitations(): Value {
  return useContext(AcceptedInvitations);
}

export { AcceptedInvitationsProvider, useAcceptedInvitations };
