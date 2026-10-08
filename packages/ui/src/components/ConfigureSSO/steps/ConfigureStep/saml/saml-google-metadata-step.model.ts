import { useConfigureSSO } from '../../../ConfigureSSOContext';
import { toIdpCertificateEntries } from '../../../domain/idpCertificates';
import { buildSamlConfigurationPayload } from './shared/IdentityProviderConfigurationForm';

export const useSamlGoogleMetadataStepModel = () => {
  const {
    enterpriseConnection,
    enterpriseConnectionMutations: { updateConnection },
  } = useConfigureSSO();
  const samlConnection = enterpriseConnection?.samlConnection;
  const hasExistingManualConfig = Boolean(
    samlConnection?.idpSsoUrl || samlConnection?.idpEntityId || samlConnection?.idpCertificate,
  );
  const initialCertificates = toIdpCertificateEntries(samlConnection);
  const existingMetadataPresent = Boolean(samlConnection?.idpMetadata);

  const submitConfiguration = async (params: Parameters<typeof buildSamlConfigurationPayload>[0]) => {
    if (!enterpriseConnection) {
      return;
    }
    const saml = await buildSamlConfigurationPayload(params);
    await updateConnection(enterpriseConnection.id, { saml });
  };

  return {
    hasConnection: Boolean(enterpriseConnection),
    initialMode: hasExistingManualConfig ? ('manual' as const) : ('metadataFile' as const),
    initialCertificates,
    existingMetadataPresent,
    initialValues: {
      signOnUrl: samlConnection?.idpSsoUrl ?? '',
      issuer: samlConnection?.idpEntityId ?? '',
    },
    submitConfiguration,
  };
};
