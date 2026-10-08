import { useConfigureSSO } from '../../../../ConfigureSSOContext';
import { toIdpCertificateEntries } from '../../../../domain/idpCertificates';
import { buildSamlConfigurationPayload } from './IdentityProviderConfigurationForm';

export const useSamlUrlMetadataModel = () => {
  const {
    enterpriseConnection,
    enterpriseConnectionMutations: { updateConnection },
  } = useConfigureSSO();
  const samlConnection = enterpriseConnection?.samlConnection;
  const hasExistingConfig = Boolean(
    samlConnection?.idpSsoUrl ||
    samlConnection?.idpEntityId ||
    samlConnection?.idpCertificate ||
    samlConnection?.idpMetadataUrl,
  );
  const initialCertificates = toIdpCertificateEntries(samlConnection);

  const submitConfiguration = async (params: Parameters<typeof buildSamlConfigurationPayload>[0]) => {
    if (!enterpriseConnection) {
      return;
    }
    const saml = await buildSamlConfigurationPayload(params);
    await updateConnection(enterpriseConnection.id, { saml });
  };

  return {
    hasConnection: Boolean(enterpriseConnection),
    initialMode: hasExistingConfig ? ('manual' as const) : ('metadataUrl' as const),
    initialCertificates,
    initialValues: {
      metadataUrl: samlConnection?.idpMetadataUrl ?? '',
      signOnUrl: samlConnection?.idpSsoUrl ?? '',
      issuer: samlConnection?.idpEntityId ?? '',
    },
    submitConfiguration,
  };
};
