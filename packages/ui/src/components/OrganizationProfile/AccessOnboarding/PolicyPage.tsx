import { useEffect, useState } from 'react';

import { ProfileCard } from '@/ui/elements/ProfileCard';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { Switch } from '@/ui/elements/Switch';

import { Button, Col, descriptors, Flex, Icon, Text } from '../../../customizables';
import { Cog, Plus, Trash } from '../../../icons';
import { DomainEntry } from './DomainProof';
import { useAccessNavigation } from './navigation';
import {
  BackTitle,
  PageFooter,
  RadioOption,
  SettingRow,
  smallSx,
  SubPageHeader,
  TextInput,
  WarningLine,
  xsSx,
} from './parts';
import type {
  PolicyDraft,
  ProtoConnection,
  ProtoEnrollment,
  ProtoMfa,
  ProtoNonDirectoryFallback,
  ProtoPolicyStatus,
} from './prototypeState';
import {
  activationBlocker,
  APP_REVERIFICATION_HOURS,
  DOMAIN_PATTERN,
  draftFromPolicy,
  ENROLLMENT_LABELS,
  formatReverification,
  isProven,
  needsOwnership,
  newDraft,
  NON_DIRECTORY_FALLBACK_LABELS,
  proofFor,
  protoKey,
  REVERIFICATION_OPTIONS,
  simulateRequest,
  useAccessPrototype,
} from './prototypeState';
import { ProviderIcon } from './ProviderMark';

/*
 * Add policy / Manage policy, built to the Oct 2026 "MVP" Figma: Target,
 * Multi-factor authentication, Authentication, Re-verification and
 * Enrollment as one form. The form lives in the store (`draft`) so the SSO
 * and Directory Sync setup pages can add a connection and hand back.
 */
export const PolicyPage = ({ policyId }: { policyId: string }) => {
  const store = useAccessPrototype();
  const policy = store.policies.find(entry => entry.id === policyId);
  const isFresh = store.draft?.policyId === policyId;

  // A draft for another policy (or none) means this visit starts over.
  useEffect(() => {
    if (!isFresh && (policyId === 'new' || policy)) {
      store.setDraft(policy ? draftFromPolicy(policy) : newDraft(store));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policyId, isFresh]);

  if (policy?.isCatchAll) {
    return <DefaultPolicyPage policyId={policy.id} />;
  }
  if (!store.draft || !isFresh) {
    return null;
  }
  return <PolicyForm draft={store.draft} />;
};

const PolicyForm = ({ draft }: { draft: PolicyDraft }) => {
  const store = useAccessPrototype();
  const nav = useAccessNavigation();
  const { access, connections, policies } = store;
  const saved = policies.find(entry => entry.id === draft.policyId);
  const [domainInput, setDomainInput] = useState('');
  const [domainError, setDomainError] = useState<string | null>(null);
  const [saving, setSaving] = useState<ProtoPolicyStatus | null>(null);
  const canManage = access.canManage;

  const set = (patch: Partial<PolicyDraft>) => store.setDraft(previous => ({ ...previous, ...patch }));
  const leave = () => {
    store.setDraft(null);
    nav.toPolicies();
  };

  const isNew = draft.policyId === 'new';
  const isDraft = isNew || saved?.status === 'draft';
  const blocker = activationBlocker(draft, false);
  const isDirty = !saved || JSON.stringify(draftFromPolicy(saved)) !== JSON.stringify(draft);
  const ownershipNeeded = needsOwnership(draft);

  const addDomain = () => {
    const domain = domainInput.trim().toLowerCase();
    if (!DOMAIN_PATTERN.test(domain)) {
      setDomainError('Enter a domain like example.com');
      return;
    }
    const taken = policies.some(entry => entry.id !== draft.policyId && entry.domains.includes(domain));
    if (taken || draft.domains.includes(domain)) {
      setDomainError('Another policy already targets this domain');
      return;
    }
    set({
      domains: [...draft.domains, domain],
      proofs: { ...draft.proofs, [domain]: draft.proofs[domain] ?? proofFor(domain, store.userEmail) },
    });
    setDomainInput('');
    setDomainError(null);
  };

  const save = (status: ProtoPolicyStatus) => {
    setSaving(status);
    void simulateRequest().then(() => {
      store.saveDraft(draft, status);
      setSaving(null);
      nav.toPolicies();
    });
  };

  const ssoConnections = connections.filter(connection => connection.kind === 'sso');
  const directories = connections.filter(connection => connection.kind === 'directory');

  return (
    <ProfileCard.Page sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Col
        elementDescriptor={descriptors.page}
        sx={{ flex: 1 }}
      >
        <BackTitle
          title={isNew ? 'Add policy' : 'Manage policy'}
          onBack={leave}
        />

        {!isDraft ? (
          <SettingRow label='Status'>
            <Switch
              isChecked={draft.status === 'active'}
              isDisabled={!canManage || (draft.status !== 'active' && Boolean(blocker))}
              onChange={checked => set({ status: checked ? 'active' : 'inactive' })}
              label={protoKey(draft.status === 'active' ? 'Active' : 'Inactive')}
            />
          </SettingRow>
        ) : null}

        <SettingRow
          label='Target'
          info='Members whose email address is at one of these domains get this policy.'
        >
          {canManage ? (
            <Col sx={t => ({ gap: t.space.$1 })}>
              <Flex gap={2}>
                <Col sx={{ flex: 1 }}>
                  <TextInput
                    ariaLabel='Domain'
                    value={domainInput}
                    placeholder='example.com'
                    onChange={value => {
                      setDomainInput(value);
                      setDomainError(null);
                    }}
                    onEnter={addDomain}
                  />
                </Col>
                <Button
                  variant='outline'
                  textVariant='buttonSmall'
                  block={false}
                  onClick={addDomain}
                  localizationKey={protoKey('Add')}
                />
              </Flex>
              {domainError ? (
                <Text
                  colorScheme='danger'
                  sx={xsSx}
                >
                  {domainError}
                </Text>
              ) : null}
            </Col>
          ) : null}
          {draft.domains.map(domain => {
            const proof = draft.proofs[domain] ?? proofFor(domain, store.userEmail);
            return (
              <DomainEntry
                key={domain}
                domain={domain}
                proof={proof}
                ownershipNeeded={ownershipNeeded}
                compact={saved?.status === 'active' && isProven(draft, domain)}
                canManage={canManage}
                onVerified={() =>
                  store.setDraft(previous => ({
                    ...previous,
                    proofs: { ...previous.proofs, [domain]: { association: true, ownership: 'verified' } },
                  }))
                }
                onRemove={() =>
                  set({
                    domains: draft.domains.filter(entry => entry !== domain),
                    proofs: Object.fromEntries(Object.entries(draft.proofs).filter(([key]) => key !== domain)),
                  })
                }
              />
            );
          })}
        </SettingRow>

        <SettingRow label='Multi-factor authentication'>
          <MfaControl
            value={draft.mfa}
            onChange={mfa => set({ mfa })}
            isDisabled={!canManage}
          />
        </SettingRow>

        <SettingRow label='Authentication'>
          <RadioOption
            name='authentication'
            checked={draft.signIn === 'default'}
            onSelect={() => set({ signIn: 'default' })}
            isDisabled={!canManage}
            label='Default'
            description="Use the application's existing sign-in methods"
          />
          <RadioOption
            name='authentication'
            checked={draft.signIn === 'sso'}
            onSelect={() => set({ signIn: 'sso' })}
            isDisabled={!canManage || !access.ssoAllowed}
            label='Single sign-on (SSO)'
            description={
              access.ssoAllowed
                ? 'Require members to sign in with an identity provider'
                : access.ssoUnavailableMessage || 'Not available for your organization'
            }
          >
            <ConnectionList
              label='Connections'
              chosen={draft.connectionIds}
              options={ssoConnections}
              canManage={canManage}
              allowMany
              addLabel='Add connection'
              onChange={connectionIds => set({ connectionIds })}
              onCreate={() => nav.toSetup('sso', draft.policyId)}
              onConfigure={id => nav.toConnection(id, draft.policyId)}
            />
          </RadioOption>
        </SettingRow>

        <SettingRow label='Re-verification'>
          <ReverificationSelect
            value={draft.reverificationHours}
            onChange={reverificationHours => set({ reverificationHours })}
          />
        </SettingRow>

        <SettingRow label='Enrollment'>
          {(Object.keys(ENROLLMENT_LABELS) as ProtoEnrollment[])
            .filter(mode => mode !== 'directory_sync' || access.ssoAllowed)
            .map(mode => (
              <RadioOption
                key={mode}
                name='enrollment'
                checked={draft.enrollment === mode}
                onSelect={() => set({ enrollment: mode })}
                isDisabled={!canManage}
                label={ENROLLMENT_LABELS[mode].label}
                description={ENROLLMENT_LABELS[mode].description}
              >
                {mode === 'directory_sync' ? (
                  <Col sx={t => ({ gap: t.space.$4 })}>
                    <ConnectionList
                      label='Directory'
                      chosen={draft.directoryId ? [draft.directoryId] : []}
                      options={directories}
                      canManage={canManage}
                      addLabel='Add directory'
                      onChange={([directoryId]) => set({ directoryId })}
                      onCreate={() => nav.toSetup('directory', draft.policyId)}
                      onConfigure={id => nav.toConnection(id, draft.policyId)}
                    />
                    <Col sx={t => ({ gap: t.space.$3 })}>
                      <Text sx={smallSx}>
                        {`Users with ${draft.domains[0] ? `an @${draft.domains[0]}` : 'a matching'} email who aren’t in the directory:`}
                      </Text>
                      {(Object.keys(NON_DIRECTORY_FALLBACK_LABELS) as ProtoNonDirectoryFallback[]).map(value => (
                        <RadioOption
                          key={value}
                          name='nonDirectoryFallback'
                          checked={draft.nonDirectoryFallback === value}
                          onSelect={() => set({ nonDirectoryFallback: value })}
                          isDisabled={!canManage}
                          label={NON_DIRECTORY_FALLBACK_LABELS[value].label}
                          description={NON_DIRECTORY_FALLBACK_LABELS[value].description}
                        />
                      ))}
                    </Col>
                  </Col>
                ) : null}
              </RadioOption>
            ))}
        </SettingRow>
      </Col>

      {canManage ? (
        <PageFooter
          start={blocker && (isDraft || draft.status === 'active') ? <WarningLine>{blocker}</WarningLine> : null}
        >
          {isDraft ? (
            <>
              <Button
                variant='outline'
                textVariant='buttonSmall'
                block={false}
                isDisabled={draft.domains.length === 0 || saving !== null}
                isLoading={saving === 'draft'}
                onClick={() => save('draft')}
                localizationKey={protoKey('Save as draft')}
              />
              <Button
                textVariant='buttonSmall'
                block={false}
                isDisabled={Boolean(blocker) || saving !== null}
                isLoading={saving === 'active'}
                onClick={() => save('active')}
                localizationKey={protoKey('Activate policy')}
              />
            </>
          ) : (
            <Button
              textVariant='buttonSmall'
              block={false}
              isDisabled={!isDirty || (draft.status === 'active' && Boolean(blocker)) || saving !== null}
              isLoading={saving !== null}
              onClick={() => save(draft.status)}
              localizationKey={protoKey('Save')}
            />
          )}
        </PageFooter>
      ) : null}
    </ProfileCard.Page>
  );
};

/* ------------------------------------------------------------ controls */

const MfaControl = ({
  value,
  onChange,
  isDisabled,
}: {
  value: ProtoMfa;
  onChange: (value: ProtoMfa) => void;
  isDisabled: boolean;
}) => (
  <Col sx={t => ({ gap: t.space.$3 })}>
    <Switch
      isChecked={value !== 'off'}
      isDisabled={isDisabled}
      onChange={checked => onChange(checked ? 'required' : 'off')}
      label={protoKey('Enabled')}
    />
    {value !== 'off' ? (
      <Col sx={t => ({ gap: t.space.$3, paddingInlineStart: t.space.$6 })}>
        <RadioOption
          name='mfa'
          checked={value === 'optional'}
          onSelect={() => onChange('optional')}
          isDisabled={isDisabled}
          label='Optional'
          description='Members can choose to set up MFA'
        />
        <RadioOption
          name='mfa'
          checked={value === 'required'}
          onSelect={() => onChange('required')}
          isDisabled={isDisabled}
          label='Required'
          description='All members must set up MFA'
        />
      </Col>
    ) : null}
  </Col>
);

const NEW_CONNECTION = '__new__';

/*
 * The connections a policy uses: a picker per connection with a gear to
 * manage it (and a bin when there is more than one), then Add. With none
 * chosen yet, a single "Add connection" button starts the setup.
 */
const ConnectionList = ({
  label,
  chosen,
  options,
  canManage,
  allowMany,
  addLabel,
  onChange,
  onCreate,
  onConfigure,
}: {
  label: string;
  chosen: string[];
  options: ProtoConnection[];
  canManage: boolean;
  allowMany?: boolean;
  addLabel: string;
  onChange: (ids: string[]) => void;
  onCreate: () => void;
  onConfigure: (id: string) => void;
}) => {
  const addButton = (text: string) =>
    canManage ? (
      <Button
        variant='outline'
        textVariant='buttonSmall'
        block={false}
        sx={{ alignSelf: 'flex-start' }}
        onClick={() => {
          const unused = options.find(option => !chosen.includes(option.id));
          if (unused && allowMany && chosen.length > 0) {
            onChange([...chosen, unused.id]);
          } else if (unused && chosen.length === 0) {
            onChange([unused.id]);
          } else {
            onCreate();
          }
        }}
      >
        <Icon
          icon={Plus}
          sx={t => ({ width: t.sizes.$3x5, height: t.sizes.$3x5, marginInlineEnd: t.space.$1 })}
        />
        {text}
      </Button>
    ) : null;

  if (chosen.length === 0) {
    return addButton(addLabel);
  }

  return (
    <Col sx={t => ({ gap: t.space.$2 })}>
      <Text
        variant='subtitle'
        sx={xsSx}
      >
        {label}
      </Text>
      {chosen.map((id, index) => {
        const current = options.find(option => option.id === id);
        const selectable = options.filter(option => option.id === id || !chosen.includes(option.id));
        return (
          <Flex
            key={id}
            gap={2}
            align='center'
          >
            <Col sx={{ flex: 1, minWidth: 0 }}>
              <Select
                elementId='role'
                options={[
                  ...selectable.map(option => ({ value: option.id, label: option.name })),
                  ...(canManage ? [{ value: NEW_CONNECTION, label: 'New connection…' }] : []),
                ]}
                value={id}
                onChange={option => {
                  if (option.value === NEW_CONNECTION) {
                    onCreate();
                    return;
                  }
                  onChange(chosen.map((entry, position) => (position === index ? option.value : entry)));
                }}
                renderOption={option => {
                  const connection = options.find(entry => entry.id === option.value);
                  return (
                    <Flex
                      align='center'
                      gap={2}
                      sx={t => ({ padding: `${t.space.$1x5} ${t.space.$3}`, width: '100%' })}
                    >
                      {connection ? <ProviderIcon provider={connection.provider} /> : null}
                      <Text sx={smallSx}>{option.label}</Text>
                    </Flex>
                  );
                }}
              >
                <SelectButton
                  isDisabled={!canManage}
                  sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}
                >
                  <Flex
                    as='span'
                    align='center'
                    gap={2}
                  >
                    {current ? <ProviderIcon provider={current.provider} /> : null}
                    <Text as='span'>{current?.name ?? 'Choose a connection'}</Text>
                  </Flex>
                </SelectButton>
                <SelectOptionList />
              </Select>
            </Col>
            {canManage ? (
              <IconAction
                icon={Cog}
                label={`Manage ${current?.name ?? 'connection'}`}
                onClick={() => onConfigure(id)}
              />
            ) : null}
            {canManage && chosen.length > 1 ? (
              <IconAction
                icon={Trash}
                label={`Remove ${current?.name ?? 'connection'}`}
                onClick={() => onChange(chosen.filter(entry => entry !== id))}
              />
            ) : null}
          </Flex>
        );
      })}
      {allowMany ? addButton('Add') : null}
    </Col>
  );
};

const IconAction = ({ icon, label, onClick }: { icon: React.ComponentType; label: string; onClick: () => void }) => (
  <Button
    variant='outline'
    aria-label={label}
    onClick={onClick}
    sx={t => ({ padding: t.space.$2, width: t.sizes.$8, height: t.sizes.$8, flexShrink: 0 })}
  >
    <Icon
      icon={icon}
      sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, color: t.colors.$colorMutedForeground })}
    />
  </Button>
);

const REVERIFICATION_DEFAULT = 'default';

const ReverificationSelect = ({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) => {
  const options = [
    { value: REVERIFICATION_DEFAULT, label: `${formatReverification(APP_REVERIFICATION_HOURS)} (default)` },
    ...REVERIFICATION_OPTIONS.filter(hours => hours !== APP_REVERIFICATION_HOURS).map(hours => ({
      value: String(hours),
      label: formatReverification(hours),
    })),
  ];
  const current = value === null ? REVERIFICATION_DEFAULT : String(value);
  return (
    <PlainSelect
      options={options}
      value={current}
      onChange={next => onChange(next === REVERIFICATION_DEFAULT ? null : Number(next))}
    />
  );
};

const PlainSelect = ({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <Select
    elementId='role'
    options={options}
    value={value}
    onChange={option => onChange(option.value)}
  >
    <SelectButton sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}>
      <Text as='span'>{options.find(option => option.value === value)?.label}</Text>
    </SelectButton>
    <SelectOptionList />
  </Select>
);

/* ------------------------------------------------------- manage default */

/** The catch-all: who joins and how, for everyone no domain policy covers. */
const DefaultPolicyPage = ({ policyId }: { policyId: string }) => {
  const store = useAccessPrototype();
  const nav = useAccessNavigation();
  const policy = store.policies.find(entry => entry.id === policyId);
  const [mfa, setMfa] = useState<ProtoMfa>(policy?.mfa ?? 'off');
  const [reverificationHours, setReverificationHours] = useState(policy?.reverificationHours ?? null);
  const [enrollment, setEnrollment] = useState<ProtoEnrollment>(policy?.enrollment ?? 'invitation_only');
  const [isSaving, setIsSaving] = useState(false);
  if (!policy) {
    return null;
  }
  const isDirty =
    mfa !== policy.mfa || reverificationHours !== policy.reverificationHours || enrollment !== policy.enrollment;

  const save = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      store.updatePolicy(policy.id, { mfa, reverificationHours, enrollment });
      setIsSaving(false);
      nav.toPolicies();
    });
  };

  return (
    <ProfileCard.Page sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Col
        elementDescriptor={descriptors.page}
        sx={{ flex: 1 }}
      >
        <SubPageHeader
          backLabel='Policies'
          title='Manage default'
          onBack={nav.toPolicies}
        />
        <SettingRow label='Multi-factor authentication'>
          <MfaControl
            value={mfa}
            onChange={setMfa}
            isDisabled={!store.access.canManage}
          />
        </SettingRow>
        <SettingRow label='Re-verification'>
          <ReverificationSelect
            value={reverificationHours}
            onChange={setReverificationHours}
          />
        </SettingRow>
        <SettingRow label='Enrollment'>
          <PlainSelect
            options={(['invitation_only', 'request_access'] as const).map(mode => ({
              value: mode,
              label: ENROLLMENT_LABELS[mode].label,
            }))}
            value={enrollment}
            onChange={value => setEnrollment(value as ProtoEnrollment)}
          />
        </SettingRow>
      </Col>
      {store.access.canManage ? (
        <PageFooter>
          <Button
            textVariant='buttonSmall'
            block={false}
            isDisabled={!isDirty}
            isLoading={isSaving}
            onClick={save}
            localizationKey={protoKey('Save')}
          />
        </PageFooter>
      ) : null}
    </ProfileCard.Page>
  );
};
