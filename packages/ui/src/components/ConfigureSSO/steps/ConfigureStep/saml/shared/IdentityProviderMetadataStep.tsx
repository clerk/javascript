import { type JSX } from 'react';

import { descriptors, Heading, type LocalizationKey } from '@/customizables';
import { useCardState } from '@/elements/contexts';

import { useConfigureSSO } from '../../../../ConfigureSSOContext';
import { Step } from '../../../../elements/Step';
import { useWizard } from '../../../../elements/Wizard';
import { IdentityProviderMetadataForm } from './IdentityProviderMetadataForm';
import { useIdentityProviderMetadataForm } from './useIdentityProviderMetadataForm';

type FieldCopy = {
  label: LocalizationKey;
  placeholder: LocalizationKey;
};

/**
 * All copy for the identity-provider-metadata sub-step. The only thing that
 * differs between SAML providers (Okta vs. custom) is the localization keys —
 * the form wiring, submit semantics, and layout are identical, so they live in
 * this shared component.
 */
export type IdentityProviderMetadataStepCopy = {
  modesTitle: LocalizationKey;
  metadataUrl: FieldCopy & { description: LocalizationKey };
  manual: {
    description: LocalizationKey;
    signOnUrl: FieldCopy;
    issuer: FieldCopy;
    signingCertificate: {
      label: LocalizationKey;
      uploadFile: LocalizationKey;
      replaceFile: LocalizationKey;
      removeFile: LocalizationKey;
      fileUploaded: LocalizationKey;
    };
  };
  modes: {
    ariaLabel: LocalizationKey;
    metadataUrlLabel: LocalizationKey;
    manualLabel: LocalizationKey;
  };
};

/**
 * Final SAML configure sub-step: collects the IdP metadata (URL or manual
 * entry + signing certificate), submits it via the reverification-wrapped
 * `updateConnection`, then advances the nested wizard. Shared verbatim by the
 * Okta and custom SAML flows.
 */
export const IdentityProviderMetadataStep = ({ copy }: { copy: IdentityProviderMetadataStepCopy }): JSX.Element => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const {
    enterpriseConnection,
    mutations: { updateConnection },
  } = useConfigureSSO();

  const controller = useIdentityProviderMetadataForm({
    metadataUrl: {
      label: copy.metadataUrl.label,
      placeholder: copy.metadataUrl.placeholder,
    },
    manual: {
      signOnUrl: {
        label: copy.manual.signOnUrl.label,
        placeholder: copy.manual.signOnUrl.placeholder,
      },
      issuer: {
        label: copy.manual.issuer.label,
        placeholder: copy.manual.issuer.placeholder,
      },
      signingCertificateLabel: copy.manual.signingCertificate.label,
    },
  });

  const canSubmit = !card.isLoading && controller.isValid;

  const handleContinue = async (): Promise<void> => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      const saml = await controller.buildSamlPayload();
      await updateConnection(enterpriseConnection.id, { saml });
      void goNext();
    } catch (err) {
      controller.applySubmitError(err, card);
    } finally {
      card.setIdle();
    }
  };

  return (
    <>
      <Step.Body>
        <Step.Section
          fill
          gap={5}
        >
          <Heading
            elementDescriptor={descriptors.configureSSOInstructionsHeading}
            as='h3'
            textVariant='subtitle'
            localizationKey={copy.modesTitle}
          />
          <IdentityProviderMetadataForm
            controller={controller}
            modes={copy.modes}
            metadataUrl={{ description: copy.metadataUrl.description }}
            manual={{
              description: copy.manual.description,
              signingCertificate: copy.manual.signingCertificate,
            }}
          />
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep || card.isLoading}
        />
        <Step.Footer.Continue
          onClick={handleContinue}
          isLoading={card.isLoading}
          isDisabled={!canSubmit}
        />
      </Step.Footer>
    </>
  );
};
