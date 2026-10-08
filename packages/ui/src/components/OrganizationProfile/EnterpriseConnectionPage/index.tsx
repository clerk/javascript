import { EnterpriseConnectionIcon } from '../EnterpriseConnectionIcon';
import { DomainsSection } from './DomainsSection';
import {
  type EnterpriseConnectionPageProps,
  useEnterpriseConnectionPageModel,
} from './enterprise-connection-page.model';
import { EnterpriseConnectionPageView } from './enterprise-connection-page.view';
import { IdentityProviderSection } from './IdentityProviderSection';
import { NameSection } from './NameSection';
import { OidcServiceProviderSection, SamlServiceProviderSection } from './ServiceProviderSection';
import { SettingsSection } from './SettingsSection';

export type { EnterpriseConnectionPageProps } from './enterprise-connection-page.model';

export const EnterpriseConnectionPage = (props: EnterpriseConnectionPageProps): JSX.Element => {
  const {
    connection,
    enterpriseConnectionMutations: { updateConnection },
    onBack,
  } = props;
  const model = useEnterpriseConnectionPageModel(props);
  return (
    <EnterpriseConnectionPageView
      name={model.name}
      label={model.label}
      badge={model.badge}
      onBack={onBack}
      icon={<EnterpriseConnectionIcon connection={connection} />}
      nameSection={
        <NameSection
          connection={connection}
          updateConnection={updateConnection}
        />
      }
      domainsSection={<DomainsSection connection={connection} />}
      serviceProviderSection={
        model.isOidc ? (
          <OidcServiceProviderSection connection={connection} />
        ) : (
          <SamlServiceProviderSection connection={connection} />
        )
      }
      identityProviderSection={
        <IdentityProviderSection
          connection={connection}
          updateConnection={updateConnection}
        />
      }
      settingsSection={
        <SettingsSection
          connection={connection}
          family={model.isOidc ? 'oidc' : 'saml'}
          updateConnection={updateConnection}
        />
      }
    />
  );
};
