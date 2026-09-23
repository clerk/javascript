import { useMemo, useState } from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import { Field } from '@/ui/elements/FieldControl';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { Switch } from '@/ui/elements/Switch';
import { Tab, TabPanel, TabPanels, Tabs, TabsList } from '@/ui/elements/Tabs';
import { TagInput } from '@/ui/elements/TagInput';
import { useFormControl } from '@/ui/utils/useFormControl';

import { Badge, Box, Button, Col, descriptors, Flex, Text } from '../../../customizables';
import { useRouter } from '../../../router';
import { DomainProof, ProofLine, smallSx, WarningLine } from './DomainProof';
import { DirectorySyncTab, SsoTab } from './PolicyTabs';
import type {
  ProtoConnection,
  ProtoEnrollment,
  ProtoNonDirectoryFallback,
  ProtoPolicy,
  ProtoSignIn,
} from './prototypeState';
import {
  APP_REVERIFICATION_HOURS,
  connectionFor,
  ENROLLMENT_LABELS,
  formatReverification,
  needsOwnership,
  NON_DIRECTORY_FALLBACK_LABELS,
  policyTarget,
  protoFieldId,
  protoKey,
  REVERIFICATION_OPTIONS,
  simulateRequest,
  useAccessPrototype,
} from './prototypeState';
import { ProviderMark } from './ProviderMark';

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

  // Every domain policy shows all three tabs. SSO and Directory Sync are
  // self-contained: each asks for what it needs (ownership, a provider, a
  // test) in order, so nobody has to bounce back to Overview to finish.
  const tabs: TabKey[] = useMemo(
    () => (!policy || policy.isCatchAll ? ['overview'] : ['overview', 'sso', 'directory']),
    [policy],
  );

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
                  ) : key === 'sso' ? (
                    <SsoTab
                      policy={policy}
                      connection={connection}
                      onDone={backToPolicies}
                      onContinueToDirectory={
                        policy.enrollment === 'directory_sync' && !policy.directory?.configured
                          ? () => goToTab('directory')
                          : undefined
                      }
                    />
                  ) : policy.signIn === 'sso' && connection?.status === 'active' ? (
                    <DirectorySyncTab
                      policy={policy}
                      provider={policy.directory?.provider ?? connection.provider}
                      onContinue={backToPolicies}
                    />
                  ) : (
                    <Col sx={t => ({ gap: t.space.$3, paddingTop: t.space.$4, alignItems: 'flex-start' })}>
                      <Text
                        colorScheme='secondary'
                        sx={smallSx}
                      >
                        Directory sync needs single sign-on. Finish setting up SSO first.
                      </Text>
                      <Button
                        variant='outline'
                        textVariant='buttonSmall'
                        block={false}
                        onClick={() => goToTab('sso')}
                        localizationKey={protoKey('Go to SSO')}
                      />
                    </Col>
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
};
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
    });
    const [isSaving, setIsSaving] = useState(false);
    const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
      setDraft(previous => ({ ...previous, [key]: value }));

    const isCatchAll = Boolean(policy.isCatchAll);
    const ownershipNeeded = needsOwnership(draft);
    // Overview only gates on affiliation: ownership is asked for on the tab
    // that needs it (SSO), so choosing SSO here never blocks on a DNS record.
    const affiliationProven = draft.domains.every(domain => {
      const proof = policy.proofs[domain];
      return Boolean(proof && (proof.affiliation || proof.ownership === 'verified' || proof.ownership === 'waived'));
    });
    const activeConnection = policy.connectionId
      ? connections.find(entry => entry.id === policy.connectionId && entry.status === 'active')
      : undefined;
    const needsSetup =
      (draft.signIn === 'sso' && !activeConnection) ||
      (draft.enrollment === 'directory_sync' && !policy.directory?.configured);

    const isDirty =
      draft.domains.join() !== policy.domains.join() ||
      draft.signIn !== policy.signIn ||
      draft.mfaRequired !== policy.mfaRequired ||
      draft.reverificationHours !== policy.reverificationHours ||
      draft.enrollment !== policy.enrollment ||
      draft.nonDirectoryFallback !== policy.nonDirectoryFallback;

    const save = () => {
      setIsSaving(true);
      void simulateRequest().then(() => {
        // Sign-in only becomes SSO through Activate on the SSO tab. Choosing
        // SSO here saves everything else and keeps the current method, so a
        // policy is never half-way: it is on its previous sign-in until the
        // connection is live. Choosing Default always applies.
        const signIn: ProtoSignIn = draft.signIn === 'default' ? 'default' : activeConnection ? 'sso' : policy.signIn;
        store.updatePolicy(policy.id, current => ({
          domains: draft.domains,
          signIn,
          mfaRequired: signIn === 'default' ? draft.mfaRequired : false,
          reverificationHours: draft.reverificationHours,
          enrollment: draft.enrollment,
          nonDirectoryFallback: draft.nonDirectoryFallback,
          // A domain added on this page starts with no proof.
          proofs: Object.fromEntries(
            draft.domains.map(domain => [
              domain,
              current.proofs[domain] ?? { affiliation: false, ownership: 'unverified' },
            ]),
          ),
        }));
        setIsSaving(false);
        // Save & configure: the next thing that needs setting up, else the table.
        if (draft.signIn === 'sso' && !activeConnection) {
          onContinue('sso');
        } else if (draft.enrollment === 'directory_sync' && !policy.directory?.configured) {
          onContinue('directory');
        } else {
          onDone();
        }
      });
    };

    return (
      <Col sx={t => ({ paddingTop: t.space.$2, width: '100%' })}>
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
            activeConnection={activeConnection}
            onManageSso={() => onContinue('sso')}
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
            ) : ownershipNeeded ? (
              // Ownership is proven on the SSO tab, where it is needed. Here
              // it is a fact per domain, never a form.
              <Col sx={t => ({ gap: t.space.$2 })}>
                {draft.domains.map(domain => {
                  const proof = policy.proofs[domain];
                  const owned = proof?.ownership === 'verified' || proof?.ownership === 'waived';
                  return (
                    <ProofLine
                      key={domain}
                      domain={domain}
                    >
                      {proof?.ownership === 'waived' ? (
                        <Badge colorScheme='secondary'>Pre-approved</Badge>
                      ) : owned ? (
                        <Badge colorScheme='success'>Ownership verified</Badge>
                      ) : (
                        <Badge colorScheme='warning'>Ownership required</Badge>
                      )}
                    </ProofLine>
                  );
                })}
                {draft.domains.some(domain => {
                  const proof = policy.proofs[domain];
                  return !(proof?.ownership === 'verified' || proof?.ownership === 'waived');
                }) ? (
                  <Text
                    colorScheme='secondary'
                    sx={t => ({ fontSize: t.fontSizes.$xs })}
                  >
                    Single sign-on needs proof you own the domain. You’ll add a DNS record on the SSO tab.
                  </Text>
                ) : null}
              </Col>
            ) : (
              <Col sx={t => ({ gap: t.space.$4 })}>
                {draft.domains.map(domain => (
                  <DomainProof
                    key={domain}
                    policy={policy}
                    domain={domain}
                    ownershipNeeded={false}
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
              !access.canManage ||
              (!isDirty && !needsSetup) ||
              (!isCatchAll && (draft.domains.length === 0 || (!ownershipNeeded && !affiliationProven)))
            }
            isLoading={isSaving}
            onClick={save}
            localizationKey={protoKey(needsSetup ? 'Save & configure' : 'Save changes')}
          />
        </FormButtonContainer>
      </Col>
    );
  },
);

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

/* --------------------------------------------------------------- sign in */

const SignInOptions = ({
  draft,
  set,
  isCatchAll,
  ssoAllowed,
  ssoUnavailableMessage,
  activeConnection,
  onManageSso,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  isCatchAll: boolean;
  ssoAllowed: boolean;
  ssoUnavailableMessage: string;
  activeConnection?: ProtoConnection;
  onManageSso: () => void;
}) => {
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

  return (
    <Col sx={t => ({ gap: t.space.$3 })}>
      {/*
        Drawn option by option rather than with Form.RadioGroup so the
        multi-factor switch can sit inside the Default option: it is only
        supported for default sign-in, so it belongs under that choice and
        nowhere else.
      */}
      <Field.Root
        {...field.props}
        value={draft.signIn}
        onChange={event => set('signIn', (event.target as HTMLInputElement).value as ProtoSignIn)}
      >
        <Col gap={3}>
          {field.props.radioOptions?.map(option => (
            <Col
              key={option.value}
              sx={t => ({
                gap: t.space.$2,
                borderWidth: t.borderWidths.$normal,
                borderStyle: t.borderStyles.$solid,
                borderColor: t.colors.$borderAlpha100,
                borderRadius: t.radii.$md,
                padding: t.space.$2,
              })}
            >
              <Field.RadioItem
                value={option.value}
                label={option.label}
                description={option.description}
              />
              {option.value === 'default' && draft.signIn === 'default' ? (
                <Box sx={t => ({ paddingInlineStart: t.space.$6, paddingBottom: t.space.$1 })}>
                  <Switch
                    isChecked={draft.mfaRequired}
                    onChange={checked => set('mfaRequired', checked)}
                    label={protoKey('Require multi-factor verification')}
                  />
                </Box>
              ) : null}
            </Col>
          ))}
        </Col>
      </Field.Root>

      {draft.signIn === 'sso' && activeConnection ? (
        <Flex
          align='center'
          gap={2}
          sx={t => ({ paddingInlineStart: t.space.$6 })}
        >
          <ProviderMark
            provider={activeConnection.provider}
            name={activeConnection.name}
          />
          <Badge colorScheme='success'>Active</Badge>
          <Button
            variant='link'
            textVariant='buttonSmall'
            block={false}
            onClick={onManageSso}
            localizationKey={protoKey('Manage on the SSO tab')}
          />
        </Flex>
      ) : draft.signIn === 'sso' ? (
        <Text
          colorScheme='secondary'
          sx={t => ({ fontSize: t.fontSizes.$xs, paddingInlineStart: t.space.$6 })}
        >
          Sign in stays as it is today until single sign-on is set up and activated on the SSO tab.
        </Text>
      ) : null}

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
