import { OrganizationProvider } from '@clerk/shared/react';
import { useOrganization, useOrganizationList, useOrganizations } from '@clerk/shared/react/hooks';

export const CoreOrganizationProvider = OrganizationProvider;
export const useCoreOrganization = useOrganization;
export const useCoreOrganizationList = useOrganizationList;
export const useCoreOrganizations = useOrganizations;
