import { iconImageUrl } from '@clerk/shared/constants';

import { useLocalizations } from '@/customizables';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { PROVIDER_GROUPS, toProviderCard } from '../domain/providers';
import type { ProviderType } from '../types';

export const useSelectProviderStepModel = () => {
  const {
    organizationEnterpriseConnection: connection,
    enterpriseConnection,
    enterpriseConnectionMutations: { createConnection, changeProvider },
    contentRef,
  } = useConfigureSSO();
  const { t } = useLocalizations();

  const providerGroups = PROVIDER_GROUPS.map(group => ({
    id: group.id,
    label: group.label,
    ariaLabel: t(group.label),
    options: group.options.map(option => ({
      id: option.id,
      iconId: option.iconId,
      iconUrl: iconImageUrl(option.iconId),
      labelText: t(option.label),
    })),
  }));

  return {
    currentCard: connection.provider ? toProviderCard(connection.provider) : null,
    hasConnection: connection.hasConnection,
    connectionName: enterpriseConnection?.name ?? '',
    contentRef,
    providerGroups,
    createConnection: async (provider: ProviderType): Promise<void> => {
      await createConnection(provider);
    },
    confirmChange: async (provider: ProviderType): Promise<void> => {
      if (enterpriseConnection) {
        await changeProvider(enterpriseConnection.id, provider);
      } else {
        await createConnection(provider);
      }
    },
  };
};
