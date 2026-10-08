import type { SSOConnection } from '../../ConfigureSSO/configure-sso.types';
import { useOidcServiceProviderModel, useSamlServiceProviderModel } from './service-provider-section.model';
import { ServiceProviderSectionView } from './service-provider-section.view';

export const SamlServiceProviderSection = ({ connection }: { connection: SSOConnection }): JSX.Element | null => {
  const model = useSamlServiceProviderModel(connection);
  return <ServiceProviderSectionView values={model} />;
};

export const OidcServiceProviderSection = ({ connection }: { connection: SSOConnection }): JSX.Element | null => {
  const model = useOidcServiceProviderModel(connection);
  return <ServiceProviderSectionView values={model} />;
};
