import { localizationKeys } from '@/customizables';

import type { useSamlOktaMetadataStepModel } from './saml-okta-metadata-step.model';
import { type SamlUrlMetadataLabels, useSamlUrlMetadataController } from './shared/useSamlUrlMetadataController';

const labels: SamlUrlMetadataLabels = {
  metadataUrl: {
    label: localizationKeys('configureSSO.configureStep.samlOkta.identityProviderMetadataStep.metadataUrl.label'),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.metadataUrl.placeholder',
    ),
    description: localizationKeys(
      'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.metadataUrl.description',
    ),
  },
  manual: {
    signOnUrl: {
      label: localizationKeys(
        'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signOnUrl.label',
      ),
      placeholder: localizationKeys(
        'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signOnUrl.placeholder',
      ),
    },
    issuer: {
      label: localizationKeys('configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.issuer.label'),
      placeholder: localizationKeys(
        'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.issuer.placeholder',
      ),
    },
    certificate: {
      label: localizationKeys(
        'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signingCertificate.label',
      ),
      uploadFile: localizationKeys(
        'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signingCertificate.uploadFile',
      ),
      replaceFile: localizationKeys(
        'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signingCertificate.replaceFile',
      ),
      removeFile: localizationKeys(
        'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signingCertificate.removeFile',
      ),
      fileUploaded: localizationKeys(
        'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signingCertificate.fileUploaded',
      ),
    },
    description: localizationKeys(
      'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.description',
    ),
  },
};

export const useSamlOktaMetadataStepController = (model: ReturnType<typeof useSamlOktaMetadataStepModel>) =>
  useSamlUrlMetadataController(model, labels);
