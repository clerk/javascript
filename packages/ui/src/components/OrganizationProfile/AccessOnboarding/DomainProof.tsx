import { useState } from 'react';

import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { useFieldOTP } from '@/ui/elements/CodeControl';
import { Form } from '@/ui/elements/Form';
import { useFormControl } from '@/ui/utils/useFormControl';

import { Badge, Box, Button, Col, Flex, Icon, Text } from '../../../customizables';
import { ExclamationTriangle } from '../../../icons';
import type { ProtoPolicy } from './prototypeState';
import { protoKey, simulateRequest, txtRecordFor, useAccessPrototype } from './prototypeState';

/*
 * Domain verification, shared by the tabs that need it. Affiliation (an
 * email code) is asked where enrollment is chosen, on Overview. Ownership
 * (a DNS record) is asked where single sign-on or directory sync is set
 * up. Both write to the same proof on the policy, so the tabs never
 * disagree about a domain's state.
 */

export const smallSx = (t: { fontSizes: { $sm: string } }) => ({ fontSize: t.fontSizes.$sm });

export const WarningLine = ({ children }: { children: string }) => (
  <Flex
    align='center'
    gap={1}
    sx={t => ({ color: t.colors.$colorMutedForeground })}
  >
    <Icon
      icon={ExclamationTriangle}
      sx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
    />
    <Text
      colorScheme='secondary'
      sx={t => ({ fontSize: t.fontSizes.$xs })}
    >
      {children}
    </Text>
  </Flex>
);

/* ------------------------------------------------------------------ proof */

/*
 * One domain's verification, driven by what the draft needs: ownership
 * (DNS) when sign-in is SSO or enrollment syncs from a directory, otherwise
 * affiliation (an email code). A domain the application owner vouched for
 * is pre-approved and asks for nothing.
 */
export const DomainProof = ({
  policy,
  domain,
  ownershipNeeded,
}: {
  policy: ProtoPolicy;
  domain: string;
  ownershipNeeded: boolean;
}) => {
  const proof = policy.proofs[domain] ?? { affiliation: false, ownership: 'unverified' as const };

  if (proof.ownership === 'waived') {
    return (
      <ProofLine domain={domain}>
        <Badge colorScheme='secondary'>Pre-approved</Badge>
      </ProofLine>
    );
  }
  if (proof.ownership === 'verified' || (!ownershipNeeded && proof.affiliation)) {
    return (
      <ProofLine domain={domain}>
        <Badge colorScheme='success'>Verified</Badge>
      </ProofLine>
    );
  }
  return ownershipNeeded ? (
    <DnsProof
      policy={policy}
      domain={domain}
    />
  ) : (
    <AffiliationProof
      policy={policy}
      domain={domain}
    />
  );
};

export const ProofLine = ({ domain, children }: { domain: string; children: React.ReactNode }) => (
  <Flex
    align='center'
    gap={2}
  >
    <Text sx={smallSx}>{domain}</Text>
    {children}
  </Flex>
);

export const DnsProof = ({ policy, domain }: { policy: ProtoPolicy; domain: string }) => {
  const { updatePolicy } = useAccessPrototype();
  const [isChecking, setIsChecking] = useState(false);
  const record = txtRecordFor(domain);

  const check = () => {
    setIsChecking(true);
    void simulateRequest(900).then(() => {
      updatePolicy(policy.id, current => ({
        proofs: {
          ...current.proofs,
          [domain]: { ...current.proofs[domain], affiliation: true, ownership: 'verified' },
        },
      }));
      setIsChecking(false);
    });
  };

  return (
    <Col sx={t => ({ gap: t.space.$2 })}>
      <ProofLine domain={domain}>
        <Badge colorScheme='warning'>Unverified</Badge>
      </ProofLine>
      <Text
        colorScheme='secondary'
        sx={t => ({ fontSize: t.fontSizes.$xs })}
      >
        Add this TXT record to your DNS provider. We’ll verify automatically once the record is live.
      </Text>
      <RecordRow
        label='Type'
        value='TXT'
      />
      <RecordRow
        label='Host / Name'
        value={record.name}
      />
      <ClipboardInput
        value={record.value}
        readOnly
      />
      <Button
        variant='link'
        textVariant='buttonSmall'
        sx={{ alignSelf: 'flex-start' }}
        isLoading={isChecking}
        onClick={check}
        localizationKey={protoKey('Check now (prototype: passes)')}
      />
    </Col>
  );
};

const RecordRow = ({ label, value }: { label: string; value: string }) => (
  <Flex
    align='center'
    gap={3}
  >
    <Text
      colorScheme='secondary'
      sx={t => ({ fontSize: t.fontSizes.$xs, width: '5.5rem' })}
    >
      {label}
    </Text>
    <Badge colorScheme='secondary'>{value}</Badge>
  </Flex>
);

export const AffiliationProof = ({ policy, domain }: { policy: ProtoPolicy; domain: string }) => {
  const { updatePolicy } = useAccessPrototype();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isSending, setIsSending] = useState(false);
  const emailField = useFormControl('affiliationEmailAddress', '', {
    type: 'text',
    label: protoKey('Email'),
    placeholder: protoKey('you'),
    isRequired: true,
  });
  const address = `${emailField.value}@${domain}`;

  const otp = useFieldOTP({
    onCodeEntryFinished: (_code, resolve) => {
      // Any six digits pass in the prototype.
      void simulateRequest().then(async () => {
        await resolve();
        updatePolicy(policy.id, current => ({
          proofs: {
            ...current.proofs,
            [domain]: {
              ...current.proofs[domain],
              affiliation: true,
              ownership: 'unverified',
              affiliationEmail: address,
            },
          },
        }));
      });
    },
    onResendCodeClicked: () => {},
  });

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    void simulateRequest().then(() => {
      setIsSending(false);
      setStep('code');
    });
  };

  if (step === 'code') {
    return (
      <Col sx={t => ({ gap: t.space.$2 })}>
        <Text sx={smallSx}>
          Enter the code sent to <strong>{address}</strong>
        </Text>
        <Form.OTPInput
          {...otp}
          label={protoKey('')}
          description={protoKey('')}
          resendButton={protoKey("Didn't receive the code? Resend")}
        />
      </Col>
    );
  }

  return (
    <Form.Root onSubmit={send}>
      <Col sx={t => ({ gap: t.space.$2 })}>
        <Text sx={smallSx}>
          Confirm your domain with an email ending in <strong>{`@${domain}`}</strong>
        </Text>
        <Flex
          align='end'
          gap={2}
        >
          <Box sx={{ flex: 1 }}>
            <Form.ControlRow elementId={emailField.id}>
              <Form.InputGroup
                {...emailField.props}
                groupSuffix={`@${domain}`}
                ignorePasswordManager
              />
            </Form.ControlRow>
          </Box>
          <Button
            type='submit'
            variant='outline'
            textVariant='buttonSmall'
            block={false}
            isDisabled={!emailField.value}
            isLoading={isSending}
            localizationKey={protoKey('Send')}
          />
        </Flex>
      </Col>
    </Form.Root>
  );
};
