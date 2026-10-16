import { createContext, type ReactNode, useContext } from 'react';

export interface OrganizationProfileOptions {
  afterLeaveOrganizationUrl?: string;
}

export interface OrganizationProfileProviderProps extends OrganizationProfileOptions {
  children: ReactNode;
}

const OrganizationProfileContext = createContext<OrganizationProfileOptions>({});

export function OrganizationProfileProvider({ afterLeaveOrganizationUrl, children }: OrganizationProfileProviderProps) {
  return (
    <OrganizationProfileContext.Provider value={{ afterLeaveOrganizationUrl }}>
      {children}
    </OrganizationProfileContext.Provider>
  );
}

export function useOrganizationProfileOptions(): OrganizationProfileOptions {
  return useContext(OrganizationProfileContext);
}
