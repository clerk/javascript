import type {
  ActiveSessionResource,
  ClientResource,
  LoadedClerk,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
  OrganizationResource,
  UserResource,
} from '@clerk/types';
import { type Accessor, createContext, useContext } from 'solid-js';

export type ContextOf<T> = Accessor<{ value: T }> | undefined;

export const ClerkInstanceContext = createContext<ContextOf<LoadedClerk>>();

export const useClerkInstanceContext = () => {
  const ctx = useContext(ClerkInstanceContext);
  if (!ctx) {
    throw new Error('ClerkInstanceContext not found');
  }
  return () => ctx().value;
};

export const UserContext = createContext<ContextOf<UserResource | null | undefined>>();
export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('UserContext not found');
  }
  return () => ctx().value;
};

export const ClientContext = createContext<ContextOf<ClientResource | null | undefined>>();
export const useClientContext = () => {
  const ctx = useContext(ClientContext);
  if (!ctx) {
    throw new Error('ClientContext not found');
  }
  return () => ctx().value;
};

export const SessionContext = createContext<ContextOf<ActiveSessionResource | null | undefined>>();
export const useSessionContext = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('SessionContext not found');
  }
  return () => ctx().value;
};

export const OrganizationContext = createContext<
  ContextOf<{
    organization: OrganizationResource | null | undefined;
    lastOrganizationInvitation: OrganizationInvitationResource | null | undefined;
    lastOrganizationMember: OrganizationMembershipResource | null | undefined;
  }>
>();
export const useOrganizationContext = () => {
  const ctx = useContext(OrganizationContext);
  if (!ctx) {
    throw new Error('OrganizationContext not found');
  }
  return () => ctx().value;
};
