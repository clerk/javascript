import { iconImageUrl } from '@clerk/shared/constants';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';

import { getEnterpriseProviderIconId, ProviderIcon } from '../../common';
import { descriptors } from '../../customizables';
import { MONOCHROMATIC_PROVIDER_ICONS, providerIconId, toProviderCard } from '../ConfigureSSO/domain/providers';
import type { EnterpriseConnectionProviderType } from '../ConfigureSSO/types';

type EnterpriseConnectionIconProps = {
  connection: EnterpriseConnectionResource;
  size?: string;
};

export const EnterpriseConnectionIcon = ({ connection, size }: EnterpriseConnectionIconProps): JSX.Element => {
  const iconId = providerIconId(toProviderCard(connection.provider as EnterpriseConnectionProviderType));
  const iconUrl = iconId ? iconImageUrl(iconId) : connection.logoPublicUrl?.trim();
  const isMonochromatic = iconId !== undefined && MONOCHROMATIC_PROVIDER_ICONS.has(iconId);

  return (
    <ProviderIcon
      id={getEnterpriseProviderIconId(connection.provider)}
      iconUrl={iconUrl}
      name={connection.name}
      size={size}
      elementDescriptor={descriptors.organizationProfileSecuritySsoProviderIcon}
      sx={
        isMonochromatic
          ? t => ({
              backgroundImage: 'none',
              backgroundColor: t.colors.$colorForeground,
              maskImage: `url(${iconUrl})`,
              maskSize: 'contain',
              maskPosition: 'center',
              maskRepeat: 'no-repeat',
            })
          : { backgroundSize: 'contain' }
      }
    />
  );
};
