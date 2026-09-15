import { descriptors, localizationKeys } from '@/customizables';
import { Alert } from '@/ui/elements/Alert';

import { useConfigureSSO } from './ConfigureSSOContext';

export const ConnectionScopeBanner = (): JSX.Element | null => {
  const { enterpriseConnections, enterpriseConnection } = useConfigureSSO();

  if (enterpriseConnections.length <= 1) {
    return null;
  }

  const count = enterpriseConnections.length;

  return (
    <Alert
      elementDescriptor={[descriptors.alert, descriptors.configureSSOConnectionScopeBanner]}
      variant='warning'
      title={
        enterpriseConnection
          ? localizationKeys('configureSSO.connectionScopeBanner.title__editing', { name: enterpriseConnection.name })
          : localizationKeys('configureSSO.connectionScopeBanner.title__adding')
      }
      subtitle={
        enterpriseConnection
          ? localizationKeys('configureSSO.connectionScopeBanner.subtitle__editing', { count })
          : localizationKeys('configureSSO.connectionScopeBanner.subtitle__adding', { count })
      }
      sx={t => ({ marginInline: t.space.$5, marginBlockStart: t.space.$5 })}
    />
  );
};
