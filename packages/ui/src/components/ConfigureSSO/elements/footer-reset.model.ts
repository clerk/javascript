import { __internal_useOrganizationBase } from '@clerk/shared/react';

import { localizationKeys } from '@/customizables';

import { useConfigureSSO } from '../ConfigureSSOContext';

export const useFooterResetModel = () => {
  const { ownerKey, canRun, enterpriseConnection, enterpriseConnectionMutations, contentRef } = useConfigureSSO();
  const organization = __internal_useOrganizationBase();

  if (!enterpriseConnection) {
    return { dialog: null };
  }

  return {
    dialog: {
      requestKey: JSON.stringify([ownerKey, enterpriseConnection.id]),
      canRun,
      confirmationValue: organization?.name ?? '',
      subtitle: localizationKeys('configureSSO.resetConnectionDialog.subtitle', { name: enterpriseConnection.name }),
      onDelete: () => enterpriseConnectionMutations.deleteConnection(enterpriseConnection.id),
      contentRef,
    },
  };
};
