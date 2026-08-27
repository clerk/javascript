import { Button, Col, Text } from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { useCardState } from '@/elements/contexts';
import { Checkmark, Clipboard } from '@/icons';
import { Alert } from '@/ui/elements/Alert';
import { handleError } from '@/utils/errorHandler';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';

const LabeledClipboardField = ({ label, value }: { label: string; value: string }): JSX.Element => (
  <Col sx={t => ({ gap: t.space.$1x5 })}>
    <Text
      as='span'
      sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
    >
      {label}
    </Text>
    <ClipboardInput
      value={value}
      readOnly
      copyIcon={Clipboard}
      copiedIcon={Checkmark}
    />
  </Col>
);

export const EndpointTokenStep = (): JSX.Element => {
  const { goNext, goPrev } = useWizard();
  const { directory, providerMeta, revealedToken, rotateToken } = useConfigureDirectorySync();
  const card = useCardState();

  const handleRotate = async (): Promise<void> => {
    if (card.isLoading) {
      return;
    }
    card.setError(undefined);
    card.setLoading();
    try {
      await rotateToken();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <>
      <Step.Header
        title='Connect your directory'
        description={`Create a provisioning integration in ${providerMeta?.name ?? 'your identity provider'} using the values below.`}
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          <Text
            as='p'
            colorScheme='secondary'
          >
            Clerk hosts a SCIM 2.0 endpoint for your organization. Your identity provider pushes user changes to this
            endpoint as they happen.
          </Text>

          <LabeledClipboardField
            label='SCIM endpoint URL'
            value={directory?.endpointUrl ?? ''}
          />

          <Col sx={t => ({ gap: t.space.$2 })}>
            {revealedToken ? (
              <>
                <LabeledClipboardField
                  label='Bearer token'
                  value={revealedToken}
                />
                <Alert
                  variant='info'
                  title='This token is shown only once. If you lose it, generate a new one and update your identity provider.'
                />
              </>
            ) : (
              <Alert
                variant='info'
                title='The bearer token is only shown when it is generated'
                subtitle='Generate a new token to view one now, then update it in your identity provider. The previous token stops working shortly after.'
              />
            )}

            {card.error && (
              <Alert
                variant='danger'
                title={card.error}
              />
            )}

            <Button
              variant='ghost'
              size='sm'
              isLoading={card.isLoading}
              onClick={() => void handleRotate()}
              sx={{ alignSelf: 'start' }}
            >
              Generate new token
            </Button>
          </Col>

          {providerMeta && providerMeta.instructions.length > 0 && (
            <Col sx={t => ({ gap: t.space.$2 })}>
              <Text
                as='p'
                sx={t => ({ fontWeight: t.fontWeights.$medium })}
              >
                In {providerMeta.name}:
              </Text>
              <Col
                as='ol'
                sx={t => ({ gap: t.space.$1x5, paddingInlineStart: t.space.$5, listStyle: 'decimal' })}
              >
                {providerMeta.instructions.map(instruction => (
                  <Text
                    key={instruction}
                    as='li'
                    colorScheme='secondary'
                  >
                    {instruction}
                  </Text>
                ))}
              </Col>
            </Col>
          )}
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Previous onClick={() => goPrev()} />
        <Step.Footer.Continue onClick={() => goNext()} />
      </Step.Footer>
    </>
  );
};
