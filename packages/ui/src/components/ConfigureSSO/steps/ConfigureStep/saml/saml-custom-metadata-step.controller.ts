import { localizationKeys } from '@/customizables';

import type { useSamlCustomMetadataStepModel } from './saml-custom-metadata-step.model';
import { type SamlUrlMetadataLabels, useSamlUrlMetadataController } from './shared/useSamlUrlMetadataController';

const labels: SamlUrlMetadataLabels = {
  metadataUrl: {
    label: localizationKeys('configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.label'),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.placeholder',
    ),
    description: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.description',
    ),
  },
  manual: {
    signOnUrl: {
      label: localizationKeys(
        'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signOnUrl.label',
      ),
      placeholder: localizationKeys(
        'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signOnUrl.placeholder',
      ),
    },
    issuer: {
      label: localizationKeys('configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.issuer.label'),
      placeholder: localizationKeys(
        'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.issuer.placeholder',
      ),
    },
    certificate: {
      label: localizationKeys(
        'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signingCertificate.label',
      ),
      uploadFile: localizationKeys(
        'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signingCertificate.uploadFile',
      ),
      replaceFile: localizationKeys(
        'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signingCertificate.replaceFile',
      ),
      removeFile: localizationKeys(
        'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signingCertificate.removeFile',
      ),
      fileUploaded: localizationKeys(
        'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signingCertificate.fileUploaded',
      ),
    },
    description: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.description',
    ),
  },
};

export const useSamlCustomMetadataStepController = (model: ReturnType<typeof useSamlCustomMetadataStepModel>) =>
  useSamlUrlMetadataController(model, labels);
