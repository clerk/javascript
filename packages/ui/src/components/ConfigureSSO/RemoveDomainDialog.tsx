import { useMemo } from 'react';

import { Col, descriptors, localizationKeys } from '@/customizables';
import { Card } from '@/elements/Card';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { FormButtonContainer } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';
import { Modal } from '@/elements/Modal';
import { handleError } from '@/utils/errorHandler';

type RemoveDomainDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  isConnectionActive: boolean;
  onRemove: () => Promise<unknown>;
  contentRef: React.RefObject<HTMLDivElement>;
};

export const RemoveDomainDialog = (props: RemoveDomainDialogProps): JSX.Element | null => {
  if (!props.isOpen) {
    return null;
  }

  return (
    <Modal
      handleClose={props.onClose}
      canCloseModal={false}
      portalRoot={props.contentRef}
      containerSx={t => ({
        alignItems: 'center',
        position: 'absolute',
        inset: 0,
        width: 'auto',
        height: 'auto',
        backgroundColor: 'inherit',
        backdropFilter: `blur(${t.sizes.$2})`,
      })}
    >
      <RemoveDomainDialogContent {...props} />
    </Modal>
  );
};

const RemoveDomainDialogContent = withCardStateProvider((props: RemoveDomainDialogProps) => {
  const { onClose, onRemove } = props;
  const card = useCardState();

  const subtitle = useMemo(
    () =>
      props.isConnectionActive
        ? localizationKeys('configureSSO.organizationDomainsStep.removeDomainDialog.subtitle__active', {
            domain: props.domain,
          })
        : localizationKeys('configureSSO.organizationDomainsStep.removeDomainDialog.subtitle__inactive', {
            domain: props.domain,
          }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onSubmit = async () => {
    try {
      await onRemove();
      onClose();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    }
  };

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
});
