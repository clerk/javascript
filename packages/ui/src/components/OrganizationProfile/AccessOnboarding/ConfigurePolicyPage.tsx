import { useMemo, useState } from 'react';

import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { useFieldOTP } from '@/ui/elements/CodeControl';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { Switch } from '@/ui/elements/Switch';
import { Tab, TabPanel, TabPanels, Tabs, TabsList } from '@/ui/elements/Tabs';
import { TagInput } from '@/ui/elements/TagInput';
import { useFormControl } from '@/ui/utils/useFormControl';

import { Badge, Box, Button, Col, descriptors, Flex, Icon, Text } from '../../../customizables';
import { ExclamationTriangle } from '../../../icons';
import { useRouter } from '../../../router';
import { DirectorySyncTab, SsoTab } from './PolicyTabs';
import type {
  ProtoEnrollment,
  ProtoNonDirectoryFallback,
  ProtoPolicy,
  ProtoProvider,
  ProtoSignIn,
} from './prototypeState';
import {
  APP_REVERIFICATION_HOURS,
  connectionFor,
  ENROLLMENT_LABELS,
  formatReverification,
  needsOwnership,
  NON_DIRECTORY_FALLBACK_LABELS,
  policiesForConnection,
  policyTarget,
  protoFieldId,
  protoKey,
  PROVIDER_LABELS,
  REVERIFICATION_OPTIONS,
  simulateRequest,
  txtRecordFor,
  useAccessPrototype,
} from './prototypeState';
import { ProviderIcon } from './ProviderMark';

/*
 * The Configure policy page, built to the Sept 2026 Figma: Overview / SSO /
 * Directory Sync tabs. Overview is the "Configure access" form. The SSO
 * tab exists once sign-in is SSO, Directory Sync once enrollment syncs from
 * a directory. The catch-all policy only has Overview, with the options a
 * domain-less rule can hold.
 */

type TabKey = 'overview' | 'sso' | 'directory';

export const ConfigurePolicyPage = ({ policyId }: { policyId: string }) => {
  const store = useAccessPrototype();
  const { navigate, queryParams } = useRouter();
  const policy = store.policies.find(entry => entry.id === policyId);
  const connection = policy ? connectionFor(policy, store.connections) : null;

  const tabs: TabKey[] = useMemo(() => {
    if (!policy || policy.isCatchAll) {
      return ['overview'];
    }
    const keys: TabKey[] = ['overview'];
    if (policy.signIn === 'sso') {
      keys.push('sso');
    }
    if (policy.enrollment === 'directory_sync') {
      keys.push('directory');
    }
    return keys;
  }, [policy]);

  const requested = (queryParams.tab as TabKey | undefined) ?? 'overview';
  const tabIndex = Math.max(0, tabs.indexOf(requested));

  const goToTab = (key: TabKey) =>
    void navigate('../organization-access', {
      searchParams: new URLSearchParams(key === 'overview' ? { policy: policyId } : { policy: policyId, tab: key }),
    });
  const backToPolicies = () => void navigate('../organization-access');

  if (!policy) {
    return (
      <ProfileCard.Page>
        <Col
          elementDescriptor={descriptors.page}
          sx={t => ({ gap: t.space.$4 })}
        >
          <Header.BackLink onClick={backToPolicies}>Policies</Header.BackLink>
          <Text colorScheme='secondary'>This policy no longer exists.</Text>
        </Col>
      </ProfileCard.Page>
    );
  }

  return (
    <ProfileCard.Page>
      <Col
        elementDescriptor={descriptors.page}
        sx={t => ({ gap: t.space.$4 })}
      >
        <Header.BackLink onClick={backToPolicies}>Policies</Header.BackLink>
        <Header.Root>
          <Header.Title
            localizationKey={protoKey('Configure policy')}
            textVariant='h2'
          />
          <Header.Subtitle localizationKey={protoKey(policyTarget(policy, store.policies))} />
        </Header.Root>

        {tabs.length === 1 ? (
          <OverviewTab
            key={policy.id}
            policy={policy}
            onDone={backToPolicies}
            onContinue={goToTab}
          />
        ) : (
          <Tabs
            value={tabIndex}
            onChange={index => goToTab(tabs[index] ?? 'overview')}
          >
            <TabsList sx={t => ({ gap: t.space.$2 })}>
              {tabs.map(key => (
                <Tab
                  key={key}
                  localizationKey={protoKey(TAB_LABELS[key])}
                />
              ))}
            </TabsList>
            <TabPanels>
              {tabs.map(key => (
                <TabPanel
                  key={key}
                  sx={{ width: '100%' }}
                >
                  {key === 'overview' ? (
                    <OverviewTab
                      key={policy.id}
                      policy={policy}
                      onDone={backToPolicies}
                      onContinue={goToTab}
                    />
                  ) : key === 'sso' && connection ? (
                    <SsoTab
                      policy={policy}
                      connection={connection}
                      onContinue={() =>
                        policy.enrollment === 'directory_sync' && !policy.directory?.configured
                          ? goToTab('directory')
                          : backToPolicies()
                      }
                    />
                  ) : key === 'directory' ? (
                    <DirectorySyncTab
                      policy={policy}
                      provider={policy.directory?.provider ?? connection?.provider ?? 'saml_okta'}
                      onContinue={backToPolicies}
                    />
                  ) : (
                    <Text
                      colorScheme='secondary'
                      sx={t => ({ paddingTop: t.space.$4 })}
                    >
                      Choose a connection on the Overview tab first.
                    </Text>
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        )}
      </Col>
    </ProfileCard.Page>
  );
};

const TAB_LABELS: Record<TabKey, string> = { overview: 'Overview', sso: 'SSO', directory: 'Directory Sync' };

/* -------------------------------------------------------------- overview */

type Draft = {
  domains: string[];
  signIn: ProtoSignIn;
  mfaRequired: boolean;
  reverificationHours: number | null;
  enrollment: ProtoEnrollment;
  nonDirectoryFallback: ProtoNonDirectoryFallback;
  /** An existing connection id, or `new:<provider>` for one to create. */
  connection: string;
};

const NEW_PREFIX = 'new:';
const REVERIFICATION_DEFAULT = 'default';

const OverviewTab = withCardStateProvider(
  ({ policy, onDone, onContinue }: { policy: ProtoPolicy; onDone: () => void; onContinue: (tab: TabKey) => void }) => {
    const store = useAccessPrototype();
    const { access, connections } = store;
    const [draft, setDraft] = useState<Draft>({
      domains: policy.domains,
      signIn: policy.signIn,
      mfaRequired: policy.mfaRequired,
      reverificationHours: policy.reverificationHours,
      enrollment: policy.enrollment,
      nonDirectoryFallback: policy.nonDirectoryFallback,
      connection: policy.connectionId ?? `${NEW_PREFIX}saml_okta`,
    });
    const [isSaving, setIsSaving] = useState(false);
    const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
      setDraft(previous => ({ ...previous, [key]: value }));

    const isCatchAll = Boolean(policy.isCatchAll);
    const ownershipNeeded = needsOwnership(draft);
    const domainsProven = draft.domains.every(domain => {
      const proof = policy.proofs[domain];
      if (!proof) {
        return false;
      }
      if (proof.ownership === 'verified' || proof.ownership === 'waived') {
        return true;
      }
      return !ownershipNeeded && proof.affiliation;
    });

    const isDirty =
      draft.domains.join() !== policy.domains.join() ||
      draft.signIn !== policy.signIn ||
      draft.mfaRequired !== policy.mfaRequired ||
      draft.reverificationHours !== policy.reverificationHours ||
      draft.enrollment !== policy.enrollment ||
      draft.nonDirectoryFallback !== policy.nonDirectoryFallback ||
      (draft.signIn === 'sso' && draft.connection !== policy.connectionId);

    const save = () => {
      setIsSaving(true);
      void simulateRequest().then(() => {
        let connectionId = policy.connectionId;
        if (draft.signIn === 'sso') {
          if (draft.connection.startsWith(NEW_PREFIX)) {
            connectionId = store.addConnection(draft.connection.slice(NEW_PREFIX.length) as ProtoProvider).id;
          } else {
            connectionId = draft.connection;
          }
        }
        store.updatePolicy(policy.id, current => ({
          domains: draft.domains,
          signIn: draft.signIn,
          mfaRequired: draft.signIn === 'default' ? draft.mfaRequired : false,
          reverificationHours: draft.reverificationHours,
          enrollment: draft.enrollment,
          nonDirectoryFallback: draft.nonDirectoryFallback,
          connectionId: draft.signIn === 'sso' ? connectionId : undefined,
          // A domain added on this page starts with no proof.
          proofs: Object.fromEntries(
            draft.domains.map(domain => [
              domain,
              current.proofs[domain] ?? { affiliation: false, ownership: 'unverified' },
            ]),
          ),
        }));
        setIsSaving(false);
        // Save & continue: the next thing that needs setting up, else the table.
        const connection = connectionId ? connections.find(entry => entry.id === connectionId) : undefined;
        if (draft.signIn === 'sso' && (!connection || connection.status !== 'active')) {
          onContinue('sso');
        } else if (draft.enrollment === 'directory_sync' && !policy.directory?.configured) {
          onContinue('directory');
        } else {
          onDone();
        }
      });
    };

    return (
      <Col sx={t => ({ paddingTop: t.space.$2 })}>
        {!isCatchAll ? (
          <SettingRow label='Domains'>
            <TagInput
              value={draft.domains.join(',')}
              placeholder={protoKey('acme.com')}
              validate={tag => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(tag)}
              onChange={event =>
                set(
                  'domains',
                  event.target.value
                    .split(',')
                    .map(entry => entry.trim().toLowerCase())
                    .filter(Boolean),
                )
              }
            />
          </SettingRow>
        ) : null}

        <SettingRow label='Sign in'>
          <SignInOptions
            draft={draft}
            set={set}
            isCatchAll={isCatchAll}
            ssoAllowed={access.ssoAllowed}
            ssoUnavailableMessage={access.ssoUnavailableMessage}
          />
        </SettingRow>

        <SettingRow label='Re-verification'>
          <ReverificationSelect
            value={draft.reverificationHours}
            onChange={value => set('reverificationHours', value)}
          />
        </SettingRow>

        <SettingRow label='Enrollment'>
          <EnrollmentSelect
            draft={draft}
            set={set}
            isCatchAll={isCatchAll}
            directoryConfigured={Boolean(policy.directory?.configured)}
          />
        </SettingRow>

        {!isCatchAll ? (
          <SettingRow label='Domain verification'>
            {draft.domains.length === 0 ? (
              <Text
                colorScheme='secondary'
                sx={smallSx}
              >
                Add domain to start verification
              </Text>
            ) : (
              <Col sx={t => ({ gap: t.space.$4 })}>
                {draft.domains.map(domain => (
                  <DomainProof
                    key={domain}
                    policy={policy}
                    domain={domain}
                    ownershipNeeded={ownershipNeeded}
                  />
                ))}
              </Col>
            )}
          </SettingRow>
        ) : null}

        <FormButtonContainer sx={t => ({ paddingTop: t.space.$4 })}>
          <Button
            variant='ghost'
            textVariant='buttonSmall'
            block={false}
            onClick={onDone}
            localizationKey={protoKey('Cancel')}
          />
          <Button
            textVariant='buttonSmall'
            block={false}
            isDisabled={
              !isDirty || !access.canManage || (!isCatchAll && (draft.domains.length === 0 || !domainsProven))
            }
            isLoading={isSaving}
            onClick={save}
            localizationKey={protoKey('Save changes')}
          />
        </FormButtonContainer>
      </Col>
    );
  },
);

const smallSx = (t: { fontSizes: { $sm: string } }) => ({ fontSize: t.fontSizes.$sm });

/** The design's two-column row: label on the left, control on the right. */
const SettingRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Flex
    gap={6}
    sx={t => ({
      alignItems: 'flex-start',
      paddingBlock: t.space.$4,
      borderBottomWidth: t.borderWidths.$normal,
      borderBottomStyle: t.borderStyles.$solid,
      borderBottomColor: t.colors.$borderAlpha100,
    })}
  >
    <Text
      variant='subtitle'
      sx={{ width: '30%', flexShrink: 0 }}
    >
      {label}
    </Text>
    <Col sx={t => ({ gap: t.space.$3, flex: 1, minWidth: 0 })}>{children}</Col>
  </Flex>
);

const WarningLine = ({ children }: { children: string }) => (
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

/* --------------------------------------------------------------- sign in */

const SignInOptions = ({
  draft,
  set,
  isCatchAll,
  ssoAllowed,
  ssoUnavailableMessage,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  isCatchAll: boolean;
  ssoAllowed: boolean;
  ssoUnavailableMessage: string;
}) => {
  const { connections, policies } = useAccessPrototype();
  const canChooseSso = !isCatchAll && ssoAllowed;
  const field = useFormControl(protoFieldId('signIn'), draft.signIn, {
    type: 'radio',
    radioOptions: [
      { value: 'default', label: 'Default', description: "Use your application's existing sign-in methods" },
      ...(canChooseSso
        ? [
            {
              value: 'sso',
              label: 'Single sign-on (SSO)',
              description: 'Require users to sign in with an identity provider',
            },
          ]
        : []),
    ],
  });

  const connectionOptions = [
    ...connections.map(connection => {
      const used = policiesForConnection(connection.id, policies).flatMap(policy => policy.domains);
      return {
        value: connection.id,
        label: connection.name,
        provider: connection.provider,
        hint: used.length ? `Used with ${used.join(', ')}` : 'Not used yet',
      };
    }),
    ...(Object.keys(PROVIDER_LABELS) as ProtoProvider[]).map(provider => ({
      value: `${NEW_PREFIX}${provider}`,
      label: `New ${PROVIDER_LABELS[provider].label} connection`,
      provider,
      hint: '',
    })),
  ];
  const selectedConnection = connectionOptions.find(option => option.value === draft.connection);

  return (
    <Col sx={t => ({ gap: t.space.$3 })}>
      <Form.RadioGroup
        {...field.props}
        value={draft.signIn}
        onChange={event => set('signIn', (event.target as HTMLInputElement).value as ProtoSignIn)}
      />

      {draft.signIn === 'default' ? (
        <Box sx={t => ({ paddingInlineStart: t.space.$6 })}>
          <Switch
            isChecked={draft.mfaRequired}
            onChange={checked => set('mfaRequired', checked)}
            label={protoKey('Require multi-factor verification')}
          />
        </Box>
      ) : (
        <Col sx={t => ({ gap: t.space.$2, paddingInlineStart: t.space.$6 })}>
          <Select
            elementId='role'
            options={connectionOptions}
            value={draft.connection}
            onChange={option => set('connection', option.value)}
            renderOption={option => (
              <Flex
                align='center'
                gap={2}
                sx={t => ({ padding: `${t.space.$1x5} ${t.space.$3}` })}
              >
                <ProviderIcon provider={option.provider} />
                <Col>
                  <Text sx={smallSx}>{option.label}</Text>
                  {option.hint ? (
                    <Text
                      colorScheme='secondary'
                      sx={t => ({ fontSize: t.fontSizes.$xs })}
                    >
                      {option.hint}
                    </Text>
                  ) : null}
                </Col>
              </Flex>
            )}
          >
            <SelectButton sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}>
              {selectedConnection ? (
                <Flex
                  as='span'
                  align='center'
                  gap={2}
                >
                  <ProviderIcon provider={selectedConnection.provider} />
                  <Text as='span'>{selectedConnection.label}</Text>
                </Flex>
              ) : null}
            </SelectButton>
            <SelectOptionList />
          </Select>
          {!selectedConnection || draft.connection.startsWith(NEW_PREFIX) ? (
            <WarningLine>You will configure your provider after saving this policy</WarningLine>
          ) : null}
        </Col>
      )}

      {!isCatchAll && !ssoAllowed ? (
        <Col sx={t => ({ gap: t.space.$0x5 })}>
          <Text
            colorScheme='secondary'
            sx={smallSx}
          >
            Single sign-on (SSO)
          </Text>
          <Text
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$xs })}
          >
            {ssoUnavailableMessage || 'Not available for your organization'}
          </Text>
        </Col>
      ) : null}
    </Col>
  );
};

/* -------------------------------------------------------- re-verification */

const ReverificationSelect = ({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) => {
  const options = [
    { value: REVERIFICATION_DEFAULT, label: `${formatReverification(APP_REVERIFICATION_HOURS)} (application default)` },
    ...REVERIFICATION_OPTIONS.filter(hours => hours !== APP_REVERIFICATION_HOURS).map(hours => ({
      value: String(hours),
      label: formatReverification(hours),
    })),
  ];
  const current = value === null ? REVERIFICATION_DEFAULT : String(value);
  const selected = options.find(option => option.value === current);
  return (
    <Select
      elementId='role'
      options={options}
      value={current}
      onChange={option => onChange(option.value === REVERIFICATION_DEFAULT ? null : Number(option.value))}
    >
      <SelectButton sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}>
        <Text as='span'>{selected?.label}</Text>
      </SelectButton>
      <SelectOptionList />
    </Select>
  );
};

/* -------------------------------------------------------------- enrollment */

const EnrollmentSelect = ({
  draft,
  set,
  isCatchAll,
  directoryConfigured,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  isCatchAll: boolean;
  directoryConfigured: boolean;
}) => {
  const modes: ProtoEnrollment[] = isCatchAll
    ? ['invitation_only', 'request_access']
    : draft.signIn === 'sso'
      ? ['join_automatically', 'directory_sync', 'request_access', 'invitation_only']
      : ['join_automatically', 'request_access', 'invitation_only'];
  const recommended: ProtoEnrollment | null = isCatchAll ? null : 'join_automatically';
  const options = modes.map(mode => ({ value: mode, label: ENROLLMENT_LABELS[mode].label }));
  const selected = ENROLLMENT_LABELS[draft.enrollment];
  const fallbackField = useFormControl(protoFieldId('nonDirectoryFallback'), draft.nonDirectoryFallback, {
    type: 'radio',
    radioOptions: (Object.keys(NON_DIRECTORY_FALLBACK_LABELS) as ProtoNonDirectoryFallback[]).map(value => ({
      value,
      label: NON_DIRECTORY_FALLBACK_LABELS[value].label,
      description: NON_DIRECTORY_FALLBACK_LABELS[value].description,
    })),
  });
  const domainPhrase = draft.domains[0] ? `@${draft.domains[0]}` : 'a matching';

  return (
    <Col sx={t => ({ gap: t.space.$3 })}>
      <Select
        elementId='role'
        options={options}
        value={draft.enrollment}
        onChange={option => set('enrollment', option.value)}
        renderOption={option => (
          <Flex
            align='center'
            justify='between'
            gap={2}
            sx={t => ({ padding: `${t.space.$1x5} ${t.space.$3}`, width: '100%' })}
          >
            <Text sx={smallSx}>{option.label}</Text>
            {option.value === recommended ? <Badge colorScheme='primary'>Recommended</Badge> : null}
          </Flex>
        )}
      >
        <SelectButton sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}>
          <Flex
            as='span'
            align='center'
            gap={2}
          >
            <Text as='span'>{selected.label}</Text>
            {draft.enrollment === recommended ? <Badge colorScheme='primary'>Recommended</Badge> : null}
          </Flex>
        </SelectButton>
        <SelectOptionList />
      </Select>

      {draft.enrollment === 'directory_sync' ? (
        <Col sx={t => ({ gap: t.space.$2 })}>
          <Text sx={smallSx}>{`Users with ${domainPhrase} email who aren’t in the directory:`}</Text>
          <Form.RadioGroup
            {...fallbackField.props}
            value={draft.nonDirectoryFallback}
            onChange={event =>
              set('nonDirectoryFallback', (event.target as HTMLInputElement).value as ProtoNonDirectoryFallback)
            }
          />
          {!directoryConfigured ? (
            <WarningLine>You will configure directory sync after saving this policy</WarningLine>
          ) : null}
        </Col>
      ) : null}
    </Col>
  );
};

/* ------------------------------------------------------------------ proof */

/*
 * One domain's verification, driven by what the draft needs: ownership
 * (DNS) when sign-in is SSO or enrollment syncs from a directory, otherwise
 * affiliation (an email code). A domain the application owner vouched for
 * is pre-approved and asks for nothing.
 */
const DomainProof = ({
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

const ProofLine = ({ domain, children }: { domain: string; children: React.ReactNode }) => (
  <Flex
    align='center'
    gap={2}
  >
    <Text sx={smallSx}>{domain}</Text>
    {children}
  </Flex>
);

const DnsProof = ({ policy, domain }: { policy: ProtoPolicy; domain: string }) => {
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

const AffiliationProof = ({ policy, domain }: { policy: ProtoPolicy; domain: string }) => {
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
