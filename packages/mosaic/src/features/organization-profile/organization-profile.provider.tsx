import { createContext, type ReactNode, useContext } from 'react';

export interface OrganizationProfileOptions {
  /**
   * Where the user lands after leaving or deleting the organization.
   *
   * @default the instance's `afterLeaveOrganizationUrl`
   */
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
