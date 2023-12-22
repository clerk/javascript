import type { OrganizationResource, UserOrganizationInvitationResource } from '@clerk/types';
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
const InPlaceAcceptedInvitations = createContext<Value>({
  acceptedInvitations: [],
  setAcceptedInvitations: () => {},
});

interface InPlaceAcceptedInvitationsProps {
  children: ReactNode;
}

function InPlaceAcceptedInvitationsProvider({ children }: InPlaceAcceptedInvitationsProps): JSX.Element {
  const [acceptedInvitations, setAcceptedInvitations] = useState<
    {
      invitation: UserOrganizationInvitationResource;
      organization: OrganizationResource;
    }[]
  >([]);
  return (
    <InPlaceAcceptedInvitations.Provider
      value={{
        acceptedInvitations,
        setAcceptedInvitations,
      }}
    >
      {children}
    </InPlaceAcceptedInvitations.Provider>
  );
}

function useInPlaceAcceptedInvitations(): Value {
  const context = useContext(InPlaceAcceptedInvitations);
  return context;
}

export { InPlaceAcceptedInvitationsProvider, useInPlaceAcceptedInvitations };
