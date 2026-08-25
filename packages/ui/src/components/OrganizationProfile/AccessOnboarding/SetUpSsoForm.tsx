import { iconImageUrl } from '@clerk/shared/constants';
import { useState } from 'react';

import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import { useWizard, Wizard } from '../../../common';
import { Badge, Box, Button, Col, Flex, Icon, RadioInput, Span, Text } from '../../../customizables';
import { Checkmark, Clipboard, RotateLeftRight } from '../../../icons';
import { common } from '../../../styledSystem';
import type { ProtoDomain, ProtoProvider } from './prototypeState';
import { hasOwnership, protoKey, PROVIDER_LABELS, simulateRequest, useAccessOnboarding } from './prototypeState';

const MONOCHROMATIC_PROVIDER_ICONS: ReadonlySet<string> = new Set(['okta', 'saml']);

type SetUpSsoFormProps = {
  domain: ProtoDomain;
  onClose: () => void;
};

/*
 * The self-serve SSO path. Forcing SSO touches sign-in, so this is where the
 * ownership gate lives: prove control of the domain with a DNS TXT record
 * (or arrive with it already proven/waived), then pick a provider and paste
 * the service-provider values into the IdP. The rule lands as "Setting up"
 * until the first successful sign-in.
 */
export const SetUpSsoForm = withCardStateProvider(({ domain, onClose }: SetUpSsoFormProps) => {
  const { dispatch } = useAccessOnboarding();
  const wizard = useWizard({ defaultStep: hasOwnership(domain) ? 1 : 0 });
  const [provider, setProvider] = useState<ProtoProvider>(
    domain.authentication.mode === 'sso' ? domain.authentication.provider : 'saml_okta',
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const onVerifyAgain = () => {
    setIsVerifying(true);
    // Prototype: the record never lands on its own; use "Simulate verified".
    void simulateRequest().then(() => setIsVerifying(false));
  };

  const onSimulateVerified = () => {
    dispatch({ type: 'markOwnershipVerified', id: domain.id });
    wizard.nextStep();
  };

  const onPickProvider = () => {
    dispatch({ type: 'setSsoProvider', id: domain.id, provider });
    wizard.nextStep();
  };

  const onFinish = () => {
    setIsFinishing(true);
    void simulateRequest().then(() => {
      dispatch({ type: 'completeSsoSetup', id: domain.id });
      setIsFinishing(false);
      onClose();
    });
  };

  const acsUrl = `https://clerk.${domain.name.split('.').slice(-2).join('.')}/v1/saml/acs/samlc_${domain.id.slice(-6)}`;
  const spEntityId = `https://clerk.${domain.name.split('.').slice(-2).join('.')}/saml/samlc_${domain.id.slice(-6)}`;

  return (
    <Wizard {...wizard.props}>
      <FormContainer
        headerTitle={protoKey('Verify you own this domain')}
        headerSubtitle={protoKey(
          `Single sign-on changes how everyone at ${domain.name} signs in, so you first need to prove you control the domain.`,
        )}
      >
        <Col
          sx={t => ({
            gap: t.space.$3,
            padding: t.space.$4,
            ...common.borderVariants(t).normal,
          })}
        >
          <Text
            as='p'
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
          >
            {"Add this TXT record to your DNS provider. We'll verify automatically once the record is live."}
          </Text>
          <Flex
            wrap='wrap'
            sx={t => ({ gap: t.space.$6 })}
          >
            <RecordEntry
              label='Type'
              value='TXT'
            />
            <RecordEntry
              label='Host / Name'
              value={domain.txtRecordName}
            />
          </Flex>
          <Flex
            align='center'
            sx={t => ({ gap: t.space.$2, minWidth: 0 })}
          >
            <Text
              as='span'
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$sm, flexShrink: 0 })}
            >
              Value
            </Text>
            <ClipboardInput
              value={domain.txtRecordValue}
              copyIcon={Clipboard}
              copiedIcon={Checkmark}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Flex>
          <Flex
            align='center'
            sx={t => ({ gap: t.space.$2 })}
          >
            <Button
              variant='bordered'
              colorScheme='secondary'
              size='xs'
              isLoading={isVerifying}
              onClick={onVerifyAgain}
              sx={t => ({ alignSelf: 'flex-start', gap: t.space.$1x5 })}
            >
              <Icon
                icon={RotateLeftRight}
                size='sm'
                colorScheme='neutral'
              />
              <Text as='span'>Verify again</Text>
            </Button>
            <Button
              variant='ghost'
              size='xs'
              onClick={onSimulateVerified}
              localizationKey={protoKey('Simulate verified (prototype)')}
            />
          </Flex>
        </Col>
        <FormButtonContainer>
          <Button
            block={false}
            variant='ghost'
            textVariant='buttonSmall'
            onClick={onClose}
            localizationKey={protoKey('Cancel')}
          />
        </FormButtonContainer>
      </FormContainer>

      <FormContainer
        headerTitle={protoKey('Choose your identity provider')}
        headerSubtitle={protoKey(`People at ${domain.name} will sign in through this provider.`)}
      >
        <Col
          role='radiogroup'
          aria-label='Identity provider'
          sx={t => ({ gap: t.space.$2 })}
        >
          {(Object.keys(PROVIDER_LABELS) as ProtoProvider[]).map(key => {
            const { label, iconId } = PROVIDER_LABELS[key];
            const isChecked = provider === key;
            const isMonochromatic = MONOCHROMATIC_PROVIDER_ICONS.has(iconId);
            return (
              <Box
                key={key}
                as='label'
                isActive={isChecked}
                sx={t => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.space.$3,
                  padding: t.space.$3,
                  cursor: 'pointer',
                  ...common.borderVariants(t).normal,
                  '&:has(input:focus-visible)': {
                    ...common.focusRingStyles(t),
                    borderColor: t.colors.$borderAlpha300,
                  },
                  '&:hover': {
                    backgroundColor: t.colors.$neutralAlpha50,
                  },
                  '&:has(input:checked)': {
                    backgroundColor: t.colors.$neutralAlpha50,
                  },
                })}
              >
                <RadioInput
                  name='protoSsoProvider'
                  value={key}
                  checked={isChecked}
                  onChange={() => setProvider(key)}
                />
                <Span
                  aria-hidden
                  sx={t => {
                    const baseSize = { width: t.sizes.$5, height: t.sizes.$5 };
                    if (isMonochromatic) {
                      return {
                        ...baseSize,
                        backgroundColor: t.colors.$colorForeground,
                        maskImage: `url(${iconImageUrl(iconId)})`,
                        maskSize: 'contain',
                        maskPosition: 'center',
                        maskRepeat: 'no-repeat',
                      };
                    }
                    return {
                      ...baseSize,
                      backgroundImage: `url(${iconImageUrl(iconId)})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    };
                  }}
                />
                <Text as='span'>{label}</Text>
              </Box>
            );
          })}
        </Col>
        <FormButtonContainer>
          <Button
            block={false}
            onClick={onPickProvider}
            localizationKey={protoKey('Continue')}
          />
          <Button
            block={false}
            variant='ghost'
            textVariant='buttonSmall'
            onClick={onClose}
            localizationKey={protoKey('Cancel')}
          />
        </FormButtonContainer>
      </FormContainer>

      <FormContainer
        headerTitle={protoKey(`Connect ${PROVIDER_LABELS[provider].label}`)}
        headerSubtitle={protoKey(
          'Paste these values into your identity provider, then continue. Sign-in stays unchanged until the connection completes its first successful sign-in.',
        )}
      >
        <Col sx={t => ({ gap: t.space.$4 })}>
          <SpValue
            label='ACS URL'
            value={acsUrl}
          />
          <SpValue
            label='Entity ID'
            value={spEntityId}
          />
        </Col>
        <FormButtonContainer>
          <Button
            block={false}
            isLoading={isFinishing}
            onClick={onFinish}
            localizationKey={protoKey('Done')}
          />
          <Button
            block={false}
            variant='ghost'
            textVariant='buttonSmall'
            onClick={onClose}
            localizationKey={protoKey('Cancel')}
          />
        </FormButtonContainer>
      </FormContainer>
    </Wizard>
  );
});

const RecordEntry = ({ label, value }: { label: string; value: string }) => (
  <Flex
    align='center'
    sx={t => ({ gap: t.space.$2, minWidth: 0 })}
  >
    <Text
      as='span'
      colorScheme='secondary'
      sx={t => ({ fontSize: t.fontSizes.$sm, flexShrink: 0 })}
    >
      {label}
    </Text>
    <Badge
      colorScheme='primary'
      sx={t => ({ fontFamily: t.fonts.$buttons })}
    >
      {value}
    </Badge>
  </Flex>
);

const SpValue = ({ label, value }: { label: string; value: string }) => (
  <Col sx={t => ({ gap: t.space.$1 })}>
    <Text
      as='span'
      colorScheme='secondary'
      sx={t => ({ fontSize: t.fontSizes.$sm })}
    >
      {label}
    </Text>
    <ClipboardInput
      value={value}
      copyIcon={Clipboard}
      copiedIcon={Checkmark}
      sx={{ minWidth: 0 }}
    />
  </Col>
);
