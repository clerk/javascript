import { localizationKeys } from '@/customizables';

import type { useSamlMicrosoftMetadataStepModel } from './saml-microsoft-metadata-step.model';
import { type SamlUrlMetadataLabels, useSamlUrlMetadataController } from './shared/useSamlUrlMetadataController';

const labels: SamlUrlMetadataLabels = {
  metadataUrl: {
    label: localizationKeys('configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.metadataUrl.label'),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.metadataUrl.placeholder',
    ),
    description: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.metadataUrl.description',
    ),
  },
  manual: {
    signOnUrl: {
      label: localizationKeys(
        'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signOnUrl.label',
      ),
      placeholder: localizationKeys(
        'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signOnUrl.placeholder',
      ),
    },
    issuer: {
      label: localizationKeys(
        'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.issuer.label',
      ),
      placeholder: localizationKeys(
        'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.issuer.placeholder',
      ),
    },
    certificate: {
      label: localizationKeys(
        'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signingCertificate.label',
      ),
      uploadFile: localizationKeys(
        'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signingCertificate.uploadFile',
      ),
      replaceFile: localizationKeys(
        'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signingCertificate.replaceFile',
      ),
      removeFile: localizationKeys(
        'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signingCertificate.removeFile',
      ),
      fileUploaded: localizationKeys(
        'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signingCertificate.fileUploaded',
      ),
    },
    description: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.description',
    ),
  },
};

export const useSamlMicrosoftMetadataStepController = (model: ReturnType<typeof useSamlMicrosoftMetadataStepModel>) =>
  useSamlUrlMetadataController(model, labels);
