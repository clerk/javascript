import type { OrganizationResource, UserOrganizationInvitationResource } from '@clerk/shared/types';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';

type Value = {
  acceptedInvitations: {
    invitation: UserOrganizationInvitationResource;
    organization: OrganizationResource;
  }[];
  setAcceptedInvitations: Dispatch<
    SetStateAction<{ invitation: UserOrganizationInvitationResource; organization: OrganizationResource }[]>
  >;
};
const AcceptedInvitations = createContext<Value>({
  acceptedInvitations: [],
  setAcceptedInvitations: () => {},
});

interface InPlaceAcceptedInvitationsProps {
  children: ReactNode;
}

function AcceptedInvitationsProvider({ children }: InPlaceAcceptedInvitationsProps): JSX.Element {
  const [acceptedInvitations, setAcceptedInvitations] = useState<
    {
      invitation: UserOrganizationInvitationResource;
      organization: OrganizationResource;
    }[]
  >([]);
  return (
    <AcceptedInvitations.Provider
      value={{
        acceptedInvitations,
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
