import { Button, Col, Text } from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Checkmark, Clipboard } from '@/icons';
import { Alert } from '@/ui/elements/Alert';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { usePrototype } from '../prototype';

const SCIM_ENDPOINT_URL = 'https://clerk.acme.com/scim/v2/org_2f9XkQ';

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
  const { providerMeta, tokenGeneration, regenerateToken } = usePrototype();

  const fakeToken = `scim_tok_${String(tokenGeneration).padStart(2, '0')}Kx9mP4vQ7nR2wT8yB3cD6f`;

  return (
    <>
      <Step.Header
        title='Connect your directory'
        description={`Create a provisioning integration in ${providerMeta.name} using the values below.`}
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

          {!providerMeta.supportsScim && (
            <Alert
              variant='warning'
              title={`${providerMeta.name} does not support outbound SCIM provisioning`}
              subtitle='Google Workspace cannot push users to a SCIM endpoint natively. Options to discuss: a Google Directory API integration on our side, a third-party bridge, or documenting this as unsupported.'
            />
          )}

          <LabeledClipboardField
            label='SCIM endpoint URL'
            value={SCIM_ENDPOINT_URL}
          />

          <Col sx={t => ({ gap: t.space.$2 })}>
            <LabeledClipboardField
              label='Bearer token'
              value={fakeToken}
            />

            <Alert
              variant='info'
              title='This token is shown only once. If you lose it, generate a new one and update your identity provider.'
            />

            <Button
              variant='ghost'
              size='sm'
              onClick={() => regenerateToken()}
              sx={{ alignSelf: 'start' }}
            >
              Generate new token
            </Button>
          </Col>

          {providerMeta.instructions.length > 0 && (
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
