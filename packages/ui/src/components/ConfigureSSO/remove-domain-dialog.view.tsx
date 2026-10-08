import { Col, descriptors, localizationKeys } from '@/customizables';
import { Card } from '@/elements/Card';
import { Form } from '@/elements/Form';
import { FormButtonContainer } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';

import type { useRemoveDomainDialogController } from './remove-domain-dialog.controller';

export const RemoveDomainDialogContentView = ({
  onClose,
  domain,
  isConnectionActive,
  onSubmit,
}: { onClose: () => void; domain: string; isConnectionActive: boolean } & ReturnType<
  typeof useRemoveDomainDialogController
>): JSX.Element => {
  const subtitle = isConnectionActive
    ? localizationKeys('configureSSO.organizationDomainsStep.removeDomainDialog.subtitle__active', { domain })
    : localizationKeys('configureSSO.organizationDomainsStep.removeDomainDialog.subtitle__inactive', { domain });
  return (
    <Card.Root
      elementDescriptor={descriptors.configureSSORemoveDomainDialog}
      sx={t => ({ borderRadius: t.radii.$md })}
    >
      <Card.Content sx={t => ({ textAlign: 'start', padding: t.sizes.$5 })}>
        <FormContainer
          headerTitle={localizationKeys('configureSSO.organizationDomainsStep.removeDomainDialog.title')}
          headerSubtitle={subtitle}
          sx={t => ({ gap: t.space.$4 })}
        >
          <Form.Root onSubmit={onSubmit}>
            <Col gap={4}>
              <FormButtonContainer>
                <Form.SubmitButton
                  elementDescriptor={descriptors.configureSSORemoveDomainDialogSubmitButton}
                  block={false}
                  colorScheme='danger'
                  localizationKey={localizationKeys(
                    'configureSSO.organizationDomainsStep.removeDomainDialog.removeButton',
                  )}
                />
                <Form.ResetButton
                  elementDescriptor={descriptors.configureSSORemoveDomainDialogCancelButton}
                  block={false}
                  localizationKey={localizationKeys(
                    'configureSSO.organizationDomainsStep.removeDomainDialog.cancelButton',
                  )}
                  onClick={onClose}
                />
              </FormButtonContainer>
            </Col>
          </Form.Root>
        </FormContainer>
      </Card.Content>
    </Card.Root>
  );
};
