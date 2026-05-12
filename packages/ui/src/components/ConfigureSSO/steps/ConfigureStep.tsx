import { useReverification, useUser } from '@clerk/shared/react';
import type { UpdateMeEnterpriseConnectionParams } from '@clerk/shared/types';

import { descriptors, Flow, localizationKeys } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { handleError } from '@/utils/errorHandler';
import { useFormControl } from '@/utils/useFormControl';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';

export const ConfigureStep = (): JSX.Element => {
  const card = useCardState();
  const { user } = useUser();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();

  const updateEnterpriseConnection = useReverification(
    (enterpriseConnectionId: string, params: UpdateMeEnterpriseConnectionParams) =>
      user?.updateEnterpriseConnection(enterpriseConnectionId, params),
  );

  const metadataUrlField = useFormControl('idpMetadataUrl', '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.metadataUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.metadataUrl.placeholder'),
    infoText: localizationKeys('configureSSO.configureStep.metadataUrl.description'),
    isRequired: true,
  });

  const trimmedMetadataUrl = metadataUrlField.value.trim();
  const canSubmit = trimmedMetadataUrl.length > 0 && !card.isLoading;

  const handleContinue = async () => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      await updateEnterpriseConnection(enterpriseConnection.id, {
        saml: { idpMetadataUrl: trimmedMetadataUrl },
      });
      void goNext();
    } catch (err) {
      handleError(err as Error, [metadataUrlField], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <Flow.Part part='configureCreateApp'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('configure')}
      >
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.title')}
          description={localizationKeys('configureSSO.configureStep.subtitle')}
        />

        <Step.Body>
          <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
            <Form.ControlRow elementId={metadataUrlField.id}>
              <Form.PlainInput {...metadataUrlField.props} />
            </Form.ControlRow>
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
      </Step>
    </Flow.Part>
  );
};
