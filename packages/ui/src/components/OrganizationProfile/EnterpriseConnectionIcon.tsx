import { iconImageUrl } from '@clerk/shared/constants';

import { getEnterpriseProviderIconId, ProviderIcon } from '../../common';
import { descriptors } from '../../customizables';
import type { SSOConnection } from '../ConfigureSSO/configure-sso.types';
import { providerIconId, toProviderCard } from '../ConfigureSSO/domain/providers';
import type { EnterpriseConnectionProviderType } from '../ConfigureSSO/types';

type EnterpriseConnectionIconProps = {
  connection: Pick<SSOConnection, 'name' | 'provider' | 'logoPublicUrl'>;
  size?: string;
};

export const EnterpriseConnectionIcon = ({ connection, size }: EnterpriseConnectionIconProps): JSX.Element => {
  const iconId = providerIconId(toProviderCard(connection.provider as EnterpriseConnectionProviderType));
  const iconUrl = iconId ? iconImageUrl(iconId) : connection.logoPublicUrl?.trim();

  return (
    <ProviderIcon
      id={getEnterpriseProviderIconId(connection.provider)}
      iconUrl={iconUrl}
      name={connection.name}
      size={size}
      elementDescriptor={descriptors.organizationProfileSecuritySsoProviderIcon}
    />
  );
};
